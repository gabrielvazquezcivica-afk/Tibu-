import { downloadContentFromMessage } from '@whiskeysockets/baileys'

async function descargarSticker(sticker) {
    const stream = await downloadContentFromMessage(
        sticker,
        'sticker'
    )

    let buffer = Buffer.from([])

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.stickerMessage) {
        return sock.sendMessage(from, {
            text:
'`🖼️ Responde a un sticker con .img`'
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🦈',
                key: m.key
            }
        })

        const buffer = await descargarSticker(
            quoted.stickerMessage
        )

        await sock.sendMessage(from, {
            image: buffer,
            caption:
'`✅ Sticker convertido a imagen`'
        }, { quoted: m })

    } catch (e) {

        console.log('IMG ERROR:', e)

        await sock.sendMessage(from, {
            text:
'`❌ Error al convertir el sticker`'
        }, { quoted: m })
    }
}

handler.command = ['img', 'toimg']
handler.help = ['img']
handler.tags = ['stickers']
handler.menu = true

export default handler