import config from '../config.js'

const API_URL = 'https://api.lempi.lat/ai/deepseek'
const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

const handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return await sock.sendMessage(
            from,
            {
                text:
`🤖 *TIBU AI*

💬 Escribe algo para hablar con la IA.

📌 *Ejemplo:*
.ia Hola, ¿cómo estás?

> ${config.BOT_NAME}`
            },
            { quoted: m }
        )
    }

    try {
        // Reacción mientras procesa
        await sock.sendMessage(from, {
            react: {
                text: '💭',
                key: m.key
            }
        })

        // Consultar DeepSeek
        const url =
            `${API_URL}?q=${encodeURIComponent(text)}` +
            `&apikey=${encodeURIComponent(API_KEY)}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        console.log('DEEPSEEK:', data)

        if (
            !data?.status ||
            !data?.resultado?.respuesta
        ) {
            throw new Error('La API no devolvió una respuesta válida')
        }

        const respuesta = data.resultado.respuesta

        // Enviar respuesta
        await sock.sendMessage(
            from,
            {
                text:
`🤖 *TIBU AI*

${respuesta}

> ${config.BOT_NAME}`
            },
            { quoted: m }
        )

        // Reacción final
        await sock.sendMessage(from, {
            react: {
                text: '🦈',
                key: m.key
            }
        })

    } catch (error) {
        console.error('DEEPSEEK ERROR:', error)

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
`❌ *Error al obtener respuesta*

No pude obtener una respuesta de TIBU AI.

> ${config.BOT_NAME}`
            },
            { quoted: m }
        )
    }
}

handler.command = ['ia', 'chatgpt', 'gpt']
handler.help = ['ia <texto>']
handler.tags = ['herramientas']
handler.menu = true

export default handler