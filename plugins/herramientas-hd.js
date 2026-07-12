import axios from 'axios'
import FormData from 'form-data'
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

async function uploadToCatbox(buffer) {
    const form = new FormData()

    form.append('reqtype', 'fileupload')
    form.append(
        'fileToUpload',
        buffer,
        `tibu_${Date.now()}.jpg`
    )

    const { data } = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        {
            headers: form.getHeaders(),
            maxBodyLength: Infinity
        }
    )

    return data
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.imageMessage) {
        return sock.sendMessage(from, {
            text:
`🖼️ \`Responde a una imagen con .hd\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🖼️',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`🌊 \`Mejorando imagen...\`

⏳ Subiendo a Catbox...
⏳ Procesando HD x4...

> ${config.BOT_NAME}`
        }, { quoted: m })

        const buffer = await descargar(
            quoted.imageMessage,
            'image'
        )

        const imageUrl =
            await uploadToCatbox(buffer)

console.log('CATBOX URL GENERADA:', imageUrl)

        const { data } = await axios.get(
            `https://api.lempi.lat/tools/upscale?url=${encodeURIComponent(imageUrl)}&multiplier=4&apikey=lem948`
        )

        if (!data?.status) {
            throw new Error(
                data?.mensaje ||
                'Error de la API'
            )
        }

        const resultado =
            data.result ||
            data.url ||
            data.image ||
            data.data

        if (!resultado) {
            throw new Error(
                'No se recibió imagen'
            )
        }

        await sock.sendMessage(from, {
            image: {
                url: resultado
            },
            caption:
`✨ *IMAGEN MEJORADA*

🖼️ Escala: x4
⚡ Calidad optimizada

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

    console.log('━━━━━━━━ HD DEBUG ━━━━━━━━')

    console.log(
        'CATBOX URL:',
        typeof imageUrl !== 'undefined'
            ? imageUrl
            : 'No generada'
    )

    console.log(
        'STATUS:',
        e?.response?.status || 'Sin status'
    )

    console.log(
        'DATA:',
        e?.response?.data || 'Sin data'
    )

    console.log(
        'MESSAGE:',
        e?.message || e
    )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')

    await sock.sendMessage(from, {
        react: {
            text: '❌',
            key: m.key
        }
    })

    let errorText =
        e?.response?.data?.mensaje ||
        e?.response?.data?.message ||
        e?.message ||
        'Error desconocido'

    await sock.sendMessage(from, {
        text:
`❌ \`Error al mejorar la imagen\`

📌 ${errorText}

> ${config.BOT_NAME}`
    }, {
        quoted: m
    })
}

handler.command = ['hd', 'upscale', 'remini']
handler.help = ['hd']
handler.tags = ['herramientas']
handler.menu = true

export default handler