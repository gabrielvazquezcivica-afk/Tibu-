import config from '../config.js'

function obtenerSaludo() {
    const hora = new Date().getHours()
    if (hora >= 5 && hora < 12) return '🌅 ¡Buenos días'
    if (hora >= 12 && hora < 19) return '☀️ ¡Buenas tardes'
    return '🌙 ¡Buenas noches'
}

let handler = {}

handler.run = async (sock, m, args, { commands }) => {
    const from = m.key.remoteJid
    const nombreUsuario = m.pushName || 'Capitán'

    await sock.sendMessage(from, {
        react: { text: '🦈', key: m.key }
    })

    if (!commands || commands.size === 0) {
        return sock.sendMessage(from, {
            text: '`❌ No hay comandos cargados`'
        }, { quoted: m })
    }

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
    const handlersUnicos = [...new Set(commands.values())]

    for (const cmd of handlersUnicos) {
        try {
            if (!cmd) continue
            if (!Array.isArray(cmd.help)) continue
            if (!Array.isArray(cmd.tags)) continue

            let tag = cmd.tags[0]?.toLowerCase() || 'otros'

            if (!grupos[tag]) grupos[tag] = []

            cmd.help.forEach(ayuda => {
                if (ayuda.includes(' ')) {
                    const [base, ...params] = ayuda.split(' ')
                    grupos[tag].push(
                        `${base} \`${params.join(' ')}\``
                    )
                } else {
                    grupos[tag].push(ayuda)
                }
            })
        } catch {}
    }

    let texto = `┌───────────────────────────┐
│ 🦈 ${config.BOT_NAME.toUpperCase()} 🦈
│ 👤 Usuario: ${nombreUsuario}
│ 👑 Dueño: ${config.OWNER_NAME || 'Desconocido'}
│ 💬 Saludo: ${obtenerSaludo()}
│ ⚓ Prefijo: ${config.PREFIX}
└───────────────────────────┘\n`

    ordenTags.forEach(tag => {
        if (!grupos[tag]) return

        const icono = emojiTag[tag] || '📌'

        texto += `\n┌─ ${icono} ${tag.toUpperCase()} ─┐\n`

        grupos[tag].forEach(comando => {
            texto += `│ ${icono} ${config.PREFIX}${comando}\n`
        })

        texto += `└───────────────────────────┘`
    })

    texto += `\n\n🌊 Navega con cuidado y disfruta de estas aguas 🦈`

    try {
        console.time('MENU_SEND')

await sock.sendMessage(from, {
    image: {
        url: 'https://files.catbox.moe/57rwz7.png'
    },
    caption: texto
}, { quoted: m })

console.timeEnd('MENU_SEND')
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