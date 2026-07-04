import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import config from '../config.js'

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
    const msg = m.message
    const quoted =
        msg?.extendedTextMessage?.contextInfo?.quotedMessage

    const media =
        msg?.imageMessage ||
        msg?.videoMessage ||
        quoted?.imageMessage ||
        quoted?.videoMessage

    if (!media) {
        return sock.sendMessage(from, {
            text: '`Responde una imagen o video`'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🌀', key: m.key }
        })

        const tipo = media.mimetype?.startsWith('video')
            ? 'video'
            : 'image'

        const buffer = await descargar(media, tipo)

        await sock.sendMessage(from, {
            sticker: buffer,
            packname: config.BOT_NAME,
            author: config.OWNER_NAME
        }, { quoted: m })

    } catch (e) {
        console.log('STICKER ERROR:', e)
    }
}

handler.command = ['s']
handler.help = ['s']
handler.tags = ['stickers']
handler.menu = true

export default handler