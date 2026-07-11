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

function fancy(texto) {
    const map = {
        a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',
        g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',
        m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',
        s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',
        y:'𝐲',z:'𝐳'
    }

    return [...texto]
        .map(x => map[x] || x)
        .join('')
}

function fancyTag(texto) {
    const map = {
        A:'𝑨',B:'𝑩',C:'𝑪',D:'𝑫',E:'𝑬',F:'𝑭',
        G:'𝑮',H:'𝑯',I:'𝑰',J:'𝑱',K:'𝑲',L:'𝑳',
        M:'𝑴',N:'𝑵',O:'𝑶',P:'𝑷',Q:'𝑸',R:'𝑹',
        S:'𝑺',T:'𝑻',U:'𝑼',V:'𝑽',W:'𝑾',X:'𝑿',
        Y:'𝒀',Z:'𝒁'
    }

    return [...texto]
        .map(x => map[x] || x)
        .join('')
}

function centrarTitulo(icono, tag) {
    return `ㅤㅤㅤㅤ${icono} ${fancyTag(tag.toUpperCase())}`
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
    plugin.menu === false ||
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

${centrarTitulo(icono, tag)}
┌───────────────────────────┐`

    grupos[tag].forEach(cmd => {

        const partes = cmd.split(' ')
const comando = partes.shift()
const params = partes.join(' ')

texto += `
│ ${icono} ${config.PREFIX}${fancy(comando)}${params ? ' ' + params : ''}`
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