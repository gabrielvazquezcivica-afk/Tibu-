import fs from 'fs'
import path from 'path'
import os from 'os'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const msg = m.message

    const quoted =
        msg?.extendedTextMessage?.contextInfo?.quotedMessage || null

    const media =
        msg?.imageMessage ||
        msg?.videoMessage ||
        quoted?.imageMessage ||
        quoted?.videoMessage

    if (!media) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
`🌊 𝐒𝐓𝐈𝐂𝐊𝐄𝐑

⚓ Responde o envía una imagen/video

> Video máximo: 15 segundos`
        }, { quoted: m })
    }

    if (media.seconds && media.seconds > 15) {
        await sock.sendMessage(from, {
            react: { text: '⏰', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`⚠️ Máximo 15 segundos`'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🌀', key: m.key }
        })

        const buffer = await sock.downloadMediaMessage({
            key: m.key,
            message: quoted || msg
        })

        await sock.sendMessage(from, {
            sticker: buffer,
            packname: config.BOT_NAME,
            author: config.OWNER_NAME
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

    } catch (e) {
        console.log('STICKER ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        sock.sendMessage(from, {
            text: '`❌ Error creando sticker`'
        }, { quoted: m })
    }
}

handler.command = ['s', 'sticker']
handler.help = ['s']
handler.tags = ['stickers']
handler.menu = true

export default handler