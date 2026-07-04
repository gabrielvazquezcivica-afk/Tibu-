import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { toSticker } from '../lib/sticker-s.js'
import { writeExif } from '../lib/exif.js'
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
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
`🌊 𝐒𝐓𝐈𝐂𝐊𝐄𝐑

⚓ Usa:
.s (respondiendo foto/video)

> Video máximo: 15s`
        }, { quoted: m })
    }

    if (media.seconds && media.seconds > 15) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`⚠️ Máximo 15 segundos`'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🌀', key: m.key }
        })

        const isVideo = !!media.seconds
        const tipo = isVideo ? 'video' : 'image'

        const buffer = await descargar(media, tipo)

        let sticker = await toSticker(buffer, isVideo)

        sticker = await writeExif(
            sticker,
            config.BOT_NAME,
            config.OWNER_NAME
        )

        await sock.sendMessage(from, {
            sticker
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

    } catch (e) {
        console.log('STICKER ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ Error al crear sticker`'
        }, { quoted: m })
    }
}

handler.command = ['s', 'sticker']
handler.help = ['s']
handler.tags = ['sticker']
handler.menu = true

export default handler