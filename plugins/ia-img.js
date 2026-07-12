import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const prompt = args.join(' ').trim()

    if (!prompt) {
        return sock.sendMessage(from, {
            text:
`🎨 \`GENERADOR IA\`

✏️ Escribe una descripción para generar una imagen.

Ejemplo:
.img Una ciudad cyberpunk de noche

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🧬',
                key: m.key
            }
        })

        const key = 'sasuke'

        const { data } = await axios.get(
            `https://api.evogb.org/ai/nanobanana?prompt=${encodeURIComponent(prompt)}&key=${key}`
        )

        if (!data?.result) {
            throw new Error('La IA no devolvió imagen')
        }

        await sock.sendMessage(from, {
            image: {
                url: data.result
            },
            caption:
`🎨 *IMAGEN GENERADA*

📝 Prompt:
${prompt}

🤖 Modelo: Nanobanana

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✨',
                key: m.key
            }
        })

    } catch (e) {

        console.log('IMG IA ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`No pude generar la imagen\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = [
    'img',
    'iaimg',
    'aiimage',
    'genimg'
]

handler.help = [
    'img <prompt>'
]

handler.tags = ['herramientas']
handler.menu = true

export default handler