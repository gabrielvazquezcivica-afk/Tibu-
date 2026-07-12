import fs from 'fs'
import { exec } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

async function descargar(media) {
    const stream = await downloadContentFromMessage(
        media,
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
'`🎥 Responde a un sticker animado con .tovideo`'
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🎬',
                key: m.key
            }
        })

        const webp = await descargar(
            quoted.stickerMessage
        )

        const tmpWebp = `${process.cwd()}/tmp/${Date.now()}.webp`
const tmpMp4 = `${process.cwd()}/tmp/${Date.now()}.mp4`

        fs.writeFileSync(
            tmpWebp,
            webp
        )

        await new Promise((resolve, reject) => {

            exec(
                `ffmpeg -i "${tmpWebp}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${tmpMp4}" -y`,
                err => {
                    if (err) reject(err)
                    else resolve()
                }
            )

        })

        const video =
            fs.readFileSync(tmpMp4)

        await sock.sendMessage(from, {
            video,
            gifPlayback: true,
            caption:
'`✅ Sticker convertido a video`'
        }, { quoted: m })

        fs.unlinkSync(tmpWebp)
        fs.unlinkSync(tmpMp4)

    } catch (e) {

        console.log(
            'TOVIDEO ERROR:',
            e
        )

        await sock.sendMessage(from, {
            text:
'`❌ Error al convertir el sticker`'
        }, { quoted: m })
    }
}

handler.command = ['tovideo','mp4']
handler.help = ['tovideo']
handler.tags = ['stickers']
handler.menu = true

export default handler