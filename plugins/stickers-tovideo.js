import fs from 'fs'
import { exec } from 'child_process'
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
            text: '`🎞️ Responde a un sticker animado con .togif`'
        }, { quoted: m })
    }

    if (!quoted.stickerMessage.isAnimated) {
        return sock.sendMessage(from, {
            text: '`❌ Ese sticker no es animado`'
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🎞️',
                key: m.key
            }
        })

        const buffer = await descargarSticker(
            quoted.stickerMessage
        )

        // Crear carpeta tmp automáticamente
        if (!fs.existsSync('./tmp')) {
            fs.mkdirSync('./tmp', {
                recursive: true
            })
        }

        const id = Date.now()

        const webp = `./tmp/${id}.webp`
        const mp4 = `./tmp/${id}.mp4`

        fs.writeFileSync(webp, buffer)

        exec(
            `ffmpeg -i "${webp}" -movflags faststart -pix_fmt yuv420p "${mp4}" -y`,
            async (err) => {

                try {
                    fs.unlinkSync(webp)
                } catch {}

                if (err) {

                    console.log(
                        'FFMPEG ERROR:',
                        err
                    )

                    return sock.sendMessage(from, {
                        text:
'`❌ Error al convertir el sticker`'
                    }, { quoted: m })
                }

                try {

                    await sock.sendMessage(from, {
                        video: fs.readFileSync(mp4),
                        gifPlayback: true,
                        caption:
'`✅ Sticker convertido a GIF/Video`'
                    }, { quoted: m })

                } catch (e) {

                    console.log(
                        'SEND VIDEO ERROR:',
                        e
                    )

                    await sock.sendMessage(from, {
                        text:
'`❌ Error al enviar el video`'
                    }, { quoted: m })
                }

                try {
                    fs.unlinkSync(mp4)
                } catch {}
            }
        )

    } catch (e) {

        console.log(
            'TOGIF ERROR:',
            e
        )

        await sock.sendMessage(from, {
            text:
'`❌ Error al convertir el sticker`'
        }, { quoted: m })
    }
}

handler.command = ['togif', 'gif']
handler.help = ['togif']
handler.tags = ['stickers']
handler.menu = true

export default handler