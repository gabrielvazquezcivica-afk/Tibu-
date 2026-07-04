import config from '../config.js'

function obtenerSaludo() {
    const hora = new Date().getHours()

    if (hora >= 5 && hora < 12) return '🌅 ¡Buenos días'
    if (hora >= 12 && hora < 19) return '☀️ ¡Buenas tardes'
    return '🌙 ¡Buenas noches'
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const plugins = [...(global.plugins || [])]

    if (!plugins.length) {
        return sock.sendMessage(from, {
            text: '❌ No hay comandos disponibles'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: { text: '🦈', key: m.key }
    })

    const nombreUsuario = m.pushName || 'Capitán'

    const emojiTag = {
        informacion: '⛱️',
        'on-off': '🌊',
        grupo: '🏄🏻',
        descargas: '⛵',
        buscador: '🛥️',
        herramientas: '🌅',
        diversión: '🐚',
        owner: '🚢',
        stickers: '☀️'
    }

    const ordenTags = [
        'informacion',
        'on-off',
        'grupo',
        'descargas',
        'buscador',
        'herramientas',
        'diversión',
        'owner',
        'stickers'
    ]

    const grupos = {}

    for (const p of plugins) {
        if (!p.menu || !p.command) continue

        const cmds = Array.isArray(p.command)
            ? p.command
            : [p.command]

        const tag = p.tags?.[0] || 'informacion'

        if (!grupos[tag]) grupos[tag] = []
        grupos[tag].push(...cmds)
    }

    let texto = `┌───────────────────────────┐
│ 🦈 ${config.BOT_NAME.toUpperCase()} 🦈
│ 👤 Usuario: ${nombreUsuario}
│ 👑 Dueño: ${config.OWNER_NAME}
│ 💬 Saludo: ${obtenerSaludo()}
│ ⚓ Prefijo: ${config.PREFIX}
└───────────────────────────┘\n`

    for (const tag of ordenTags) {
        if (!grupos[tag]) continue

        const icono = emojiTag[tag] || '📌'
        const cmds = [...new Set(grupos[tag])].sort()

        texto += `\n┌─ ${icono} ${tag.toUpperCase()} ─┐\n`

        for (const cmd of cmds) {
            texto += `│ ${icono} ${config.PREFIX}${cmd}\n`
        }

        texto += `└───────────────────────────┘`
    }

    texto += `\n\n🌊 Navega con cuidado y disfruta de estas aguas 🦈`

    try {
        await sock.sendMessage(from, {
            image: {
                url: 'https://files.catbox.moe/57rwz7.png'
            },
            caption: texto
        }, { quoted: m })
    } catch {
        await sock.sendMessage(from, {
            text: texto
        }, { quoted: m })
    }
}

handler.command = ['menu', 'comandos', 'ayuda']
handler.help = ['menu']
handler.tags = ['informacion']
handler.menu = true

export default handler