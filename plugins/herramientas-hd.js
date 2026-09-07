import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import config from '../config.js'

const API_URL = 'https://api.lempi.lat/tools/upscaler'
const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

const handler = {}

async function descargar(media, tipo) {
    const stream = await downloadContentFromMessage(media, tipo)

    const chunks = []

    for await (const chunk of stream) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    const image =
        quoted?.imageMessage ||
        m.message?.imageMessage

    if (!image) {
        return await sock.sendMessage(
            from,
            {
                text:
`🖼️ *Responde a una imagen con .hd*

📌 Ejemplo:
Responde a una foto escribiendo:
.hd

> ${config.BOT_NAME}`
            },
            { quoted: m }
        )
    }

    try {
        // Reacción mientras procesa
        await sock.sendMessage(from, {
            react: {
                text: '⏳',
                key: m.key
            }
        })

        // Descargar imagen de WhatsApp
        const buffer = await descargar(image, 'image')

        // Convertir imagen a Base64
        const base64 = buffer.toString('base64')

        // Enviar a la API de Lempi
        const response = await fetch(
            `${API_URL}?multiplier=4&apikey=${encodeURIComponent(API_KEY)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: `data:image/jpeg;base64,${base64}`
                })
            }
        )

        if (!response.ok) {
            throw new Error(`API respondió con HTTP ${response.status}`)
        }

        const data = await response.json()

        console.log('UPSCALER:', {
            status: data?.status,
            fuente: data?.fuente_usada
        })

        if (!data?.status || !data?.resultado?.base64) {
            throw new Error(
                data?.message ||
                'La API no devolvió la imagen mejorada'
            )
        }

        // Obtener Base64 de la respuesta
        let resultadoBase64 = data.resultado.base64

        // Quitar encabezado data:image/...;base64,
        if (resultadoBase64.includes(',')) {
            resultadoBase64 = resultadoBase64.split(',')[1]
        }

        // Convertir Base64 a Buffer
        const resultado = Buffer.from(
            resultadoBase64,
            'base64'
        )

        // Enviar imagen mejorada
        await sock.sendMessage(
            from,
            {
                image: resultado,
                caption:
`✨ *IMAGEN MEJORADA*

🖼️ Calidad optimizada con IA
🔍 Escala: 4×

> ${config.BOT_NAME}`
            },
            { quoted: m }
        )

        // Reacción final
        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (error) {
        console.error('HD ERROR:', error)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
`❌ *Error al mejorar la imagen*

${error.message || error}

> ${config.BOT_NAME}`
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'hd',
    'upscale',
    'remini',
    'mejorar'
]

handler.help = ['hd']
handler.tags = ['herramientas']
handler.menu = true

export default handler