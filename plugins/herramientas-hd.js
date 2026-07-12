import fetch from 'node-fetch'
import FormData from 'form-data'
import crypto from 'crypto'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import config from '../config.js'

async function descargar(media, tipo) {
    const stream = await downloadContentFromMessage(media, tipo)

    let buffer = Buffer.from([])

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk)
    }

    return buffer
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    const image =
        quoted?.imageMessage ||
        m.message?.imageMessage

    if (!image) {
        return sock.sendMessage(from, {
            text:
`🖼️ \`Responde a una imagen con .hd\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '⏳',
                key: m.key
            }
        })

        const key = Buffer
            .from('c2FzdWtl', 'base64')
            .toString('utf-8')

        const buffer =
            await descargar(image, 'image')

        const filename =
            'img-' +
            crypto.randomBytes(6).toString('hex') +
            '.jpg'

        const form = new FormData()

        form.append('file', buffer, {
            filename,
            contentType: 'image/jpeg'
        })

        const upload = await fetch(
            `https://api.evogb.org/tools/upload?key=${key}`,
            {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
            }
        )

        const uploadJson =
            await upload.json()

        if (
            !uploadJson?.status ||
            !uploadJson?.url
        ) {
            throw new Error(
                uploadJson?.message ||
                'Error al subir imagen'
            )
        }

        const upscale = await fetch(
            `https://api.evogb.org/tools/upscale?method=url&url=${encodeURIComponent(uploadJson.url)}&key=${key}`
        )

        const type =
            upscale.headers.get('content-type')

        if (
            type &&
            type.includes('application/json')
        ) {

            const error =
                await upscale.json()

            throw new Error(
                error?.message ||
                'Error al mejorar'
            )
        }

        const result =
            Buffer.from(await upscale.arrayBuffer())

        await sock.sendMessage(from, {
            image: result,
            caption:
`✨ *IMAGEN MEJORADA*

🖼️ Calidad optimizada con IA

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('HD ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al mejorar la imagen\`

${e.message || e}

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['hd', 'upscale', 'remini', 'mejorar']
handler.help = ['hd']
handler.tags = ['herramientas']
handler.menu = true

export default handler