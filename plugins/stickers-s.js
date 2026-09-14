import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { toSticker } from '../lib/sticker-s.js'

async function descargar(media, tipo) {
    const stream = await downloadContentFromMessage(media, tipo)

    const chunks = []

    for await (const chunk of stream) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}

let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    const mensaje = m.message

    // ==============================
    // BUSCAR MENSAJE RESPONDIDO
    // ==============================

    const contextInfo =
        mensaje?.extendedTextMessage?.contextInfo ||
        mensaje?.imageMessage?.contextInfo ||
        mensaje?.videoMessage?.contextInfo

    const quoted = contextInfo?.quotedMessage

    let media = null
    let tipo = null
    let isVideo = false

    // ==============================
    // 1. IMAGEN EN EL MISMO MENSAJE
    // ==============================

    if (mensaje?.imageMessage) {

        media = mensaje.imageMessage
        tipo = 'image'

    }

    // ==============================
    // 2. VIDEO EN EL MISMO MENSAJE
    // ==============================

    else if (mensaje?.videoMessage) {

        media = mensaje.videoMessage
        tipo = 'video'
        isVideo = true

        const segundos = media.seconds || 0

        if (segundos > 15) {
            return sock.sendMessage(
                from,
                {
                    text: '`🌊 El video no debe pasar de 15 segundos`'
                },
                { quoted: m }
            )
        }
    }

    // ==============================
    // 3. IMAGEN RESPONDIDA
    // ==============================

    else if (quoted?.imageMessage) {

        media = quoted.imageMessage
        tipo = 'image'

    }

    // ==============================
    // 4. VIDEO RESPONDIDO
    // ==============================

    else if (quoted?.videoMessage) {

        media = quoted.videoMessage
        tipo = 'video'
        isVideo = true

        const segundos = media.seconds || 0

        if (segundos > 15) {
            return sock.sendMessage(
                from,
                {
                    text: '`🌊 El video no debe pasar de 15 segundos`'
                },
                { quoted: m }
            )
        }
    }

    // ==============================
    // SIN MEDIA
    // ==============================

    else {

        return sock.sendMessage(
            from,
            {
                text: '`🌊 Envía una foto o video con .s, o responde a uno con .s`'
            },
            { quoted: m }
        )
    }

    // ==============================
    // CREAR STICKER
    // ==============================

    try {

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '💙',
                    key: m.key
                }
            }
        )

        const buffer = await descargar(media, tipo)

        const sticker = await toSticker(buffer, isVideo)

        await sock.sendMessage(
            from,
            {
                sticker
            },
            {
                quoted: m
            }
        )

    } catch (e) {

        console.log('STICKER ERROR:', e)

        await sock.sendMessage(
            from,
            {
                text: '`❌ Error al crear sticker`'
            },
            {
                quoted: m
            }
        )
    }
}

handler.command = ['s', 'sticker']
handler.help = ['s']
handler.tags = ['stickers']
handler.menu = true

export default handler