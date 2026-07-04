import config from '../config.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let menuCache = null
let menuCacheTime = 0

function obtenerSaludo() {
    const hora = new Date().getHours()
    if (hora >= 5 && hora < 12) return '🌅 ¡Buenos días'
    if (hora >= 12 && hora < 19) return '☀️ ¡Buenas tardes'
    return '🌙 ¡Buenas noches'
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const nombreUsuario = m.pushName || 'Capitán'

    await sock.sendMessage(from, {
        react: { text: '🦈', key: m.key }
    })

    // CACHE (5 min)
    if (menuCache && Date.now() - menuCacheTime < 300000) {
        try {
            return await sock.sendMessage(from, {
                image: { url: 'https://files.catbox.moe/57rwz7.png' },
                caption: menuCache
            }, { quoted: m })
        } catch {
            return await sock.sendMessage(from, {
                text: menuCache
            }, { quoted: m })
        }
    }

    const pluginsDir = path.join(__dirname, '../plugins')

    if (!fs.existsSync(pluginsDir)) {
        return sock.sendMessage(from, {
            text: '`❌ No existe la carpeta de plugins`'
        }, { quoted: m })
    }

    const archivos = fs.readdirSync(pluginsDir)
        .filter(f => f.endsWith('.js'))

    if (archivos.length === 0) {
        return sock.sendMessage(from, {
            text: '`❌ No hay comandos cargados`'
        }, { quoted: m })
    }

    const emojiTag = {
        'informacion': '⛱️',
        'on-off': '🌊',
        'grupo': '🏄🏻',
        'descargas': '⛵',
        'buscador': '🛥️',
        'herramientas': '🌅',
        'diversión': '🐚',
        'owner': '🚢',
        'stickers': '☀️'
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

    for (const archivo of archivos) {
        try {
            const ruta = path.join(pluginsDir, archivo)
            const plugin = await import(ruta)
            const cmd = plugin.default

            if (
                !cmd ||
                !Array.isArray(cmd.help) ||
                !Array.isArray(cmd.tags)
            ) continue

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

    menuCache = texto
    menuCacheTime = Date.now()

    try {
        await sock.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/57rwz7.png' },
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