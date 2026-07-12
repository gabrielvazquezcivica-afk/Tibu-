import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🎥 \`Ingresa un texto para crear el Brat Video\`

Ejemplo:
.bratvid Hola mundo

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🎬',
                key: m.key
            }
        })

        const url =
`https://apiyosoyyo-ofc.onrender.com/api/bratvid?text=${encodeURIComponent(text)}&theme=white&format=mp4&apiKey=yosoyyo_sk_e71au945`

        await sock.sendMessage(from, {
            video: { url },
            mimetype: 'video/mp4',
            caption:
`🎥 *BRAT VIDEO GENERADO*

📝 Texto: ${text}

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('BRATVID ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al generar el Brat Video\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['bratvid']
handler.help = ['bratvid <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler