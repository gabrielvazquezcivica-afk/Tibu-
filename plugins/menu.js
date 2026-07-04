import fs from 'fs'
import config from '../config.js'

const menuImage = fs.readFileSync(
    './assets/file_00000000c4fc71fb8210c9dcdbac8d78.png'
)

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
        react: {
            text: '🦈',
            key: m.key
        }
    })

    if (!commands || !commands.size) {
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
    const handlers = [...new Set(commands.values())]

    for (const plugin of handlers) {
        if (
            !plugin ||
            !Array.isArray(plugin.help) ||
            !Array.isArray(plugin.tags)
        ) continue

        const tag = plugin.tags[0]?.toLowerCase() || 'otros'

        if (!grupos[tag]) grupos[tag] = []

        plugin.help.forEach(cmd => {
            if (cmd.includes(' ')) {
                const [base, ...params] = cmd.split(' ')
                grupos[tag].push(
                    `${base} \`${params.join(' ')}\``
                )
            } else {
                grupos[tag].push(cmd)
            }
        })
    }

    let texto = `┌───────────────────────────┐
│ 🦈 ${config.BOT_NAME.toUpperCase()} 🦈
│ 👤 Usuario: ${nombreUsuario}
│ 👑 Dueño: ${config.OWNER_NAME}
│ 💬 Saludo: ${obtenerSaludo()}
│ ⚓ Prefijo: ${config.PREFIX}
└───────────────────────────┘`

    for (const tag of ordenTags) {
        if (!grupos[tag]) continue

        const icono = emojiTag[tag] || '📌'

        texto += `

┌─ ${icono} ${tag.toUpperCase()} ─┐`

        grupos[tag].forEach(cmd => {
            texto += `
│ ${icono} ${config.PREFIX}${cmd}`
        })

        texto += `
└───────────────────────────┘`
    }

    texto += `

🌊 Navega con cuidado y disfruta de estas aguas 🦈`

    try {
        await sock.sendMessage(from, {
            image: menuImage,
            caption: texto
        }, { quoted: m })
    } catch (e) {
        console.log('MENU ERROR:', e)

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