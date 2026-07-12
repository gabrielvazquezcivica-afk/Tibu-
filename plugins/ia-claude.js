import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const text =
        args.join(' ').trim() ||
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
        ''

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🤖 \`CLAUDE AI\`

✏️ Escribe una consulta para Claude.

Ejemplo:
.claude ¿Quién es Messi?

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🧠',
                key: m.key
            }
        })

        const key = Buffer
            .from('ZWt1c2Fz', 'base64')
            .toString('utf-8')
            .split('')
            .reverse()
            .join('')

        const { data } = await axios.get(
            `https://api.evogb.org/ai/claude?text=${encodeURIComponent(text)}&key=${key}`
        )

        if (!data?.status || !data?.result) {
            throw new Error(
                data?.message || 'Sin respuesta'
            )
        }

        await sock.sendMessage(from, {
            text:
`🤖 *CLAUDE AI*

${data.result}

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('CLAUDE ERROR:', e.response?.data || e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al consultar Claude\`

${e.response?.data?.message || e.message}

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['claude', 'clau']
handler.help = ['claude <texto>']
handler.tags = ['herramientas']
handler.menu = true

export default handler