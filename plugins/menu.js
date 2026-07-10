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
        nsfw: '🥵',
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
        'stickers',
        'nsfw'
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

        function fancy(texto) {
    const map = {
        a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',
        g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',
        m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',
        s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',
        y:'𝐲',z:'𝐳',
        A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',
        G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',
        M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',
        S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',
        Y:'𝐘',Z:'𝐙'
    }

    return [...texto]
        .map(x => map[x] || x)
        .join('')
}

grupos[tag].forEach(cmd => {
    texto += `
│ ${icono} ${fancy(config.PREFIX + cmd)}`
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