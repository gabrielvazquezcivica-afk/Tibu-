import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.imageMessage) {
        return sock.sendMessage(from, {
            text:
`🖼️ \`Responde a una imagen.\`

Ejemplo:
.hd

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

        const media = await sock.downloadMediaMessage({
            message: quoted,
            key: {
                remoteJid: from
            }
        })

        if (!media) {
            throw new Error('No pude descargar la imagen')
        }

        // Aquí debes usar tu uploader
        const imageUrl = await uploadToCatbox(media)

        const { data } = await axios.get(
            `https://api.lempi.lat/tools/upscale?url=${encodeURIComponent(imageUrl)}&multiplier=4&apikey=lem948`
        )

        if (!data?.status) {
            throw new Error(data?.mensaje || 'Error API')
        }

        await sock.sendMessage(from, {
            image: {
                url: data.result || data.url || data.image
            },
            caption:
`🖼️ *IMAGEN MEJORADA*

✨ Escala: x4

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('UPSCALE ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al mejorar la imagen.\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['hd', 'upscale', 'remini']
handler.help = ['hd']
handler.tags = ['herramientas']
handler.menu = true

export default handler