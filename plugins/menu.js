import config from '../config.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

    await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })

    const pluginsDir = path.join(__dirname, '../plugins')
    if (!fs.existsSync(pluginsDir)) {
        return sock.sendMessage(from, {
            text: '`❌ No existe la carpeta de plugins`'
        }, { quoted: m })
    }

    const archivos = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
    if (archivos.length === 0) {
        return sock.sendMessage(from, {
            text: '`❌ No hay comandos cargados en este momento`'
        }, { quoted: m })
    }

    const ordenTags = [
        'información',
        'on-off',
        'grupo',
        'descargas',
        'buscador',
        'herramientas',
        'diversión',
        'owner',
        'otros'
    ]

    const grupos = {}

    for (const archivo of archivos) {
        try {
            const ruta = path.join(pluginsDir, archivo)
            const plugin = await import(ruta)
            const cmd = plugin.default
            if (!cmd || !Array.isArray(cmd.help) || !Array.isArray(cmd.tags)) continue

            let tag = cmd.tags[0]?.toLowerCase() || 'otros'
            if (!grupos[tag]) grupos[tag] = []

            cmd.help.forEach(ayuda => {
                if (ayuda.includes(' ')) {
                    const [base, ...params] = ayuda.split(' ')
                    grupos[tag].push(`${base} \`${params.join(' ')}\``)
                } else {
                    grupos[tag].push(ayuda)
                }
            })
        } catch {}
    }

    let texto = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🦈 ${config.BOT_NAME} 🦈
┃ 👑 Dueño: ${config.OWNER_NAME || 'Desconocido'}
┃ ${obtenerSaludo()}, ${nombreUsuario}!
┃ ⚓ Prefijo: ${config.PREFIX}
╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

    ordenTags.forEach(tag => {
        if (!grupos[tag]) return
        texto += `╭━━━〔 ${tag.toUpperCase()} 〕━━━⬣\n`
        grupos[tag].forEach(comando => {
            texto += `┃ ${config.PREFIX}${comando}\n`
        })
        texto += `╰━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
    })

    Object.keys(grupos).forEach(tag => {
        if (ordenTags.includes(tag)) return
        texto += `╭━━━〔 ${tag.toUpperCase()} 〕━━━⬣\n`
        grupos[tag].forEach(comando => {
            texto += `┃ ${config.PREFIX}${comando}\n`
        })
        texto += `╰━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
    })

    texto += `🌊 Navega con cuidado y disfruta de estas aguas 🦈`

    try {
        await sock.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/273uw0.png' }, // Pon tu enlace real
            caption: texto
        }, { quoted: m })
    } catch {
        await sock.sendMessage(from, { text: texto }, { quoted: m })
    }
}

handler.command = ['menu', 'comandos', 'ayuda']
handler.help = ['menu']
handler.tags = ['información']
handler.menu = true

export default handler
