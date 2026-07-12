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
            text: '`🎥 Responde a un sticker animado con .tovideo`'
        }, { quoted: m })
    }

    if (!quoted.stickerMessage.isAnimated) {
        return sock.sendMessage(from, {
            text: '`❌ El sticker debe ser animado`'
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

        console.log(
            'BUFFER:',
            webp.length
        )

        const id = Date.now()

        const tmpWebp =
            `${process.cwd()}/tmp/${id}.webp`

        const tmpGif =
            `${process.cwd()}/tmp/${id}.gif`

        const tmpMp4 =
            `${process.cwd()}/tmp/${id}.mp4`

        fs.writeFileSync(
            tmpWebp,
            webp
        )

        await new Promise((resolve, reject) => {

            exec(
                `ffmpeg -y -i "${tmpWebp}" "${tmpGif}"`,
                err => {
                    if (err) reject(err)
                    else resolve()
                }
            )

        })

        await new Promise((resolve, reject) => {

            exec(
                `ffmpeg -y -i "${tmpGif}" -movflags faststart -pix_fmt yuv420p -vf "scale=512:-2,fps=15" "${tmpMp4}"`,
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

        ;[
            tmpWebp,
            tmpGif,
            tmpMp4
        ].forEach(file => {
            if (fs.existsSync(file))
                fs.unlinkSync(file)
        })

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

handler.command = [
    'tovideo',
    'mp4'
]

handler.help = [
    'tovideo'
]

handler.tags = [
    'stickers'
]

handler.menu = true

export default handler