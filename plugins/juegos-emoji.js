const juegos = [
    {
        emojis: '🐠 🔎 🌊',
        respuestas: ['buscando a nemo', 'buscando nemo']
    },
    {
        emojis: '🦁 👑',
        respuestas: ['el rey leon', 'rey leon']
    },
    {
        emojis: '❄️ 👸 👭',
        respuestas: ['frozen']
    },
    {
        emojis: '🧙‍♂️ ⚡ 👓',
        respuestas: ['harry potter']
    },
    {
        emojis: '🕷️ 🧑 🏙️',
        respuestas: ['spiderman', 'spider man']
    },
    {
        emojis: '🦇 🧑 🏙️',
        respuestas: ['batman']
    },
    {
        emojis: '🔨 ⚡ 🧔',
        respuestas: ['thor']
    },
    {
        emojis: '🤖 🚗 🚓',
        respuestas: ['transformers']
    },
    {
        emojis: '🦖 🏝️ 🚙',
        respuestas: ['jurassic park']
    },
    {
        emojis: '🚢 💔 🌊',
        respuestas: ['titanic']
    },
    {
        emojis: '🏠 🎈 ☁️',
        respuestas: ['up']
    },
    {
        emojis: '🐼 🥋',
        respuestas: ['kung fu panda']
    },
    {
        emojis: '🤠 🚀 🧸',
        respuestas: ['toy story']
    },
    {
        emojis: '🧞‍♂️ 🕌 🪔',
        respuestas: ['aladdin', 'aladino']
    },
    {
        emojis: '🐀 👨‍🍳 🍝',
        respuestas: ['ratatouille']
    },
    {
        emojis: '🐉 👧 ⚔️',
        respuestas: ['mulan', 'mulan']
    },
    {
        emojis: '🧜‍♀️ 🌊 🐚',
        respuestas: ['la sirenita', 'sirenita']
    }
]

global.emojiJuegos =
    global.emojiJuegos || new Map()

function limpiarId(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

const handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    const usuario = limpiarId(
        m.key.participant ||
        m.key.remoteJid
    )

    const clave = from + ':' + usuario

    try {

        if (global.emojiJuegos.has(clave)) {

            const activo =
                global.emojiJuegos.get(clave)

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`⚠️ Ya tienes un Emoji Quiz activo.`\n\n' +
                        activo.emojis +
                        '\n\n' +
                        '`💡 Responde usando .adivina`'
                },
                { quoted: m }
            )
        }

        const juego =
            juegos[
                Math.floor(
                    Math.random() * juegos.length
                )
            ]

        global.emojiJuegos.set(
            clave,
            {
                emojis: juego.emojis,
                respuestas: juego.respuestas,
                intentos: 0
            }
        )

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🎮',
                    key: m.key
                }
            }
        )

        const texto = [
            '`🎮 EMOJI QUIZ`',
            '',
            '❓ ¿Qué representan estos emojis?',
            '',
            juego.emojis,
            '',
            '`💡 Tienes 3 intentos.`',
            '',
            '`📝 Responde usando:`',
            '`.adivina tu respuesta`'
        ].join('\n')

        await sock.sendMessage(
            from,
            {
                text: texto
            },
            { quoted: m }
        )

    } catch (e) {

        console.error(
            'ERROR EMOJI:',
            e
        )

        await sock.sendMessage(
            from,
            {
                text:
                    '`❌ Ocurrió un error al iniciar el juego.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'emoji',
    'emojis'
]

handler.help = [
    'emoji'
]

handler.tags = [
    'diversión'
]

handler.menu = true

export default handler