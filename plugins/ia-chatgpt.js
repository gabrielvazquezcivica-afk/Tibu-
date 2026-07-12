import axios from 'axios'
import config from '../config.js'

const sesiones = {}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🤖 \`TIBU AI\`

💬 Escribe un mensaje para hablar con la IA.

Ejemplo:
.ia Hola, ¿cómo estás?

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '💬',
                key: m.key
            }
        })

        const key = Buffer
            .from('c2FzdWtl', 'base64')
            .toString('utf-8')

        if (!sesiones[sender]) {
            sesiones[sender] = Math.floor(
                10000000 + Math.random() * 90000000
            ).toString()
        }

        const session = sesiones[sender]

        const { data } = await axios.get(
            `https://api.evogb.org/ai/gpt4-session?text=${encodeURIComponent(text)}&session=${session}&key=${key}`
        )

        if (!data?.status || !data?.result) {
            throw new Error('La IA no respondió correctamente')
        }

        await sock.sendMessage(from, {
            text:
`🤖 *TIBU AI*

${data.result}

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '🦈',
                key: m.key
            }
        })

    } catch (e) {

        console.log('IA ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al obtener respuesta de la IA\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['ia', 'chatgpt', 'gpt']
handler.help = ['ia <texto>']
handler.tags = ['herramientas']
handler.menu = true

export default handler