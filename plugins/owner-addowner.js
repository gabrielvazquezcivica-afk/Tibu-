import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

// Leer lista guardada
function leerOwners() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

// Guardar lista
function guardarOwners(lista) {
    fs.mkdirSync(path.dirname(rutaOwners), { recursive: true })
    fs.writeFileSync(rutaOwners, JSON.stringify(lista, null, 4), 'utf8')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = m.key.participant || m.key.remoteJid

    // Solo dueño principal
    const principal = config.OWNERS[0]
    if (remitente !== principal.id && remitente !== `${principal.number}@s.whatsapp.net`) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚫 Solo el capitán principal puede agregar nuevos dueños`'
        }, { quoted: m })
    }

    // Obtener usuario: por respuesta o mención
    let usuarioJid, numero, nombre
    if (m.quoted && m.quoted.sender) {
        usuarioJid = m.quoted.sender
        numero = usuarioJid.split('@')[0]
        nombre = args.join(' ') || m.quoted.pushName || `Capitán ${numero}`
    } else if (m.mentions && m.mentions[0]) {
        usuarioJid = m.mentions[0]
        numero = usuarioJid.split('@')[0]
        nombre = args.slice(1).join(' ') || `Capitán ${numero}`
    } else if (args[0]) {
        numero = args[0].replace(/[^0-9]/g, '')
        usuarioJid = `${numero}@s.whatsapp.net`
        nombre = args.slice(1).join(' ') || `Capitán ${numero}`
    } else {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Responde a un mensaje, menciona o escribe el número del nuevo capitán`\nEj: `.addowner @usuario Nombre` o `.addowner 521...`'
        }, { quoted: m })
    }

    let lista = leerOwners()

    // Evitar duplicados
    const existe = lista.some(o => o.number === numero || o.id === usuarioJid)
    if (existe) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚢 Este capitán ya navega en nuestra flota`'
        }, { quoted: m })
    }

    // Agregar
    lista.push({ number: numero, id: usuarioJid, name: nombre })
    guardarOwners(lista)

    await sock.sendMessage(from, { react: { text: '🏴‍☠️', key: m.key } })
    await sock.sendMessage(from, {
        text: `\`🌊 NUEVO CAPITÁN AGREGADO 🦈\`\nNombre: ${nombre}\nNúmero: @${numero}\n\nAhora gobierna junto a nosotros en estas aguas.\n\n> ${config.BOT_NAME}`,
        mentions: [usuarioJid]
    }, { quoted: m })
}

handler.command = ['addowner', 'nuevocapitan']
handler.help = ['addowner <@/número> [nombre]']
handler.tags = ['owner']
handler.menu = true

export default handler
