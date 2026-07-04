import fs from 'fs'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { toSticker } from '../lib/sticker-s.js'

async function descargar(media, tipo) {
    const stream = await downloadContentFromMessage(media, tipo)
    let buffer = Buffer.from([])

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    let media = null
    let tipo = null
    let isVideo = false

    if (quoted?.imageMessage) {
        media = quoted.imageMessage
        tipo = 'image'
    }

    else if (quoted?.videoMessage) {
        media = quoted.videoMessage
        tipo = 'video'
        isVideo = true

        const segundos = media.seconds || 0

        if (segundos > 15) {
            return sock.sendMessage(from, {
                text: '`🌊 El video no debe pasar de 15 segundos`'
            }, { quoted: m })
        }
    }

    else {
        return sock.sendMessage(from, {
            text: '`🌊 Responde a una foto o video con .s`'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🦈', key: m.key }
        })

        const buffer = await descargar(media, tipo)
        const sticker = await toSticker(buffer, isVideo)

        await sock.sendMessage(from, {
            sticker
        }, { quoted: m })

    } catch (e) {
        console.log('STICKER ERROR:', e)

        await sock.sendMessage(from, {
            text: '`❌ Error al crear sticker`'
        }, { quoted: m })
    }
}

handler.command = ['s', 'sticker']
handler.help = ['s']
handler.tags = ['stickers']
handler.menu = true

export default handler