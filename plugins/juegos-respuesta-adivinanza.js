import config from '../config.js'

if (!global.adivinanzasActivas) {
    global.adivinanzasActivas = new Map()
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    if (!global.adivinanzasActivas.has(from)) {
        return sock.sendMessage(from, {
            text:
`❌ \`No hay ninguna adivinanza activa.\`

💡 Usa:
\`.adivinanza\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const respuesta =
        args.join(' ')
            .toLowerCase()
            .trim()

    if (!respuesta) {
        return sock.sendMessage(from, {
            text:
`❌ \`Debes escribir una respuesta.\`

Ejemplo:
\`.respuesta reloj\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const correcta =
        global.adivinanzasActivas.get(from)

    if (respuesta === correcta) {

        global.adivinanzasActivas.delete(from)

        await sock.sendMessage(from, {
            react: {
                text: '🎉',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text:
`🎉 \`¡Respuesta correcta!\`

🏆 La respuesta era:

\`${correcta}\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '❌',
            key: m.key
        }
    })

    return sock.sendMessage(from, {
        text:
`❌ \`Respuesta incorrecta.\`

🔄 Sigue intentando.

> ${config.BOT_NAME}`
    }, { quoted: m })
}

handler.command = ['respuesta']
handler.help = false
handler.tags = false
handler.menu = false

export default handler