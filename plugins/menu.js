import config from '../config.js'
import chalk from 'chalk'

let handler = {}

function obtenerSaludo() {
    const hora = new Date().getHours()
    if (hora >= 5 && hora < 12) return '🌅 ¡Buenos días'
    if (hora >= 12 && hora < 19) return '☀️ ¡Buenas tardes'
    return '🌙 ¡Buenas noches'
}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const nombreUsuario = m.pushName || 'Capitán'

    await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })

    // Obtener comandos cargados
    const comandos = Array.from(sock.commands?.values() || [])
    if (comandos.length === 0) {
        return sock.sendMessage(from, {
            text: '`❌ No hay comandos cargados en este momento`'
        }, { quoted: m })
    }

    // Orden de etiquetas
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

    // Agrupar por etiquetas
    const grupos = {}
    comandos.forEach(cmd => {
        let tag = cmd.tags?.[0]?.toLowerCase() || 'otros'
        if (!grupos[tag]) grupos[tag] = []
        grupos[tag].push(cmd)
    })

    // Encabezado con saludo, bot y dueño
    let texto = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🦈 ${config.BOT_NAME} 🦈
┃ 👑 Dueño: ${config.OWNER_NAME || 'Desconocido'}
┃ ${obtenerSaludo()}, ${nombreUsuario}!
┃ ⚓ Prefijo: ${config.PREFIX}
╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

    // Agregar por orden de etiquetas
    ordenTags.forEach(tag => {
        if (!grupos[tag]) return
        texto += `╭━━━〔 ${tag.toUpperCase()} 〕━━━⬣\n`
        grupos[tag].forEach(cmd => {
            cmd.help.forEach(ayuda => {
                // Si tiene parámetros, poner entre acento grave
                if (ayuda.includes(' ')) {
                    texto += `┃ ${config.PREFIX}${ayuda.split(' ')[0]} \`${ayuda.split(' ').slice(1).join(' ')}\`\n`
                } else {
                    texto += `┃ ${config.PREFIX}${ayuda}\n`
                }
            })
        })
        texto += `╰━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
    })

    // Etiquetas restantes
    Object.keys(grupos).forEach(tag => {
        if (ordenTags.includes(tag)) return
        texto += `╭━━━〔 ${tag.toUpperCase()} 〕━━━⬣\n`
        grupos[tag].forEach(cmd => {
            cmd.help.forEach(ayuda => {
                if (ayuda.includes(' ')) {
                    texto += `┃ ${config.PREFIX}${ayuda.split(' ')[0]} \`${ayuda.split(' ').slice(1).join(' ')}\`\n`
                } else {
                    texto += `┃ ${config.PREFIX}${ayuda}\n`
                }
            })
        })
        texto += `╰━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
    })

    texto += `🌊 Navega con cuidado y disfruta de estas aguas 🦈`

    // Enviar con imagen
    try {
        await sock.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/273uw0.png' }, // Pon tu enlace real
            caption: texto
        }, { quoted: m })
    } catch (err) {
        console.log(chalk.redBright('⚠️ Error al enviar imagen:'), err.message)
        await sock.sendMessage(from, { text: texto }, { quoted: m })
    }
}

handler.command = ['menu', 'comandos', 'ayuda']
handler.help = ['menu']
handler.tags = ['información']
handler.menu = true

export default handler
