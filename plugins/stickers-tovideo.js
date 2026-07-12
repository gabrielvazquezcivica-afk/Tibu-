import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
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

        const form = new FormData()

        form.append(
            'new-image',
            buffer,
            'sticker.webp'
        )

        const { data } = await axios.post(
            'https://s6.ezgif.com/webp-to-mp4',
            form,
            {
                headers: form.getHeaders()
            }
        )

        const file = data.match(
            /value="([^"]+\.webp)"/
        )?.[1]

        if (!file) {
            throw new Error(
                'No pude procesar el sticker'
            )
        }

        const form2 = new FormData()

        form2.append('file', file)
        form2.append('convert', 'Convert WebP to MP4!')

        const { data: data2 } = await axios.post(
            'https://ezgif.com/webp-to-mp4/' + file,
            form2,
            {
                headers: form2.getHeaders()
            }
        )

        const video =
            data2.match(
                /<source src="([^"]+)"/
            )?.[1]

        if (!video) {
            throw new Error(
                'No pude generar el video'
            )
        }

        const url = video.startsWith('http')
            ? video
            : `https:${video}`

        await sock.sendMessage(from, {
            video: {
                url
            },
            gifPlayback: true,
            caption:
'`✅ Sticker convertido a GIF/Video`'
        }, { quoted: m })

    } catch (e) {

        console.log(
            'TOGIF ERROR:',
            e.response?.data || e
        )

        await sock.sendMessage(from, {
            text:
'`❌ No pude convertir ese sticker`'
        }, { quoted: m })
    }
}

handler.command = ['togif', 'gif']
handler.help = ['togif']
handler.tags = ['stickers']
handler.menu = true

export default handler