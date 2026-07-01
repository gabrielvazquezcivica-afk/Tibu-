import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerOwners() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

function guardarOwners(lista) {
    fs.mkdirSync(path.dirname(rutaOwners), { recursive: true })
    fs.writeFileSync(rutaOwners, JSON.stringify(lista, null, 4), 'utf8')
}

function limpiar(n) {
    return n.replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = m.key.participant || m.key.remoteJid
    const remNum = limpiar(remitente)

    // Verificar dueño por número o lid
    const esDueno =
        config.owner.some(n => limpiar(n) === remNum) ||
        config.ownerLid.some(l => limpiar(l) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo capitanes pueden agregar`' }, { quoted: m })
    }

    let usuarioJid, numero, nombre

    // ✅ DETECTA RESPUESTA CORRECTAMENTE
    if (m.quoted && m.quoted.key && m.quoted.sender) {
        usuarioJid = m.quoted.sender
        numero = limpiar(usuarioJid)
        nombre = args.join(' ').trim() || m.quoted.pushName || `Capitán ${numero}`
    }
    // ✅ DETECTA MENCIÓN
    else if (m.mentions && m.mentions.length > 0) {
        usuarioJid = m.mentions[0]
        numero = limpiar(usuarioJid)
        nombre = args.slice(1).join(' ').trim() || `Capitán ${numero}`
    }
    // ✅ DETECTA NÚMERO ESCRITO
    else if (args[0]) {
        numero = limpiar(args[0])
        usuarioJid = `${numero}@s.whatsapp.net`
        nombre = args.slice(1).join(' ').trim() || `Capitán ${numero}`
    }
    else {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Responde a un mensaje, menciona o pon el número`\nEj: .addowner @Nombre',
            quoted: m
        })
    }

    const lista = leerOwners()
    const existe = lista.some(o => limpiar(o.number) === numero || limpiar(o.id) === numero)

    if (existe) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, { text: '`🚢 Ya está en la flota`', quoted: m })
    }

    lista.push({ number: numero, id: usuarioJid, name: nombre })
    guardarOwners(lista)

    await sock.sendMessage(from, { react: { text: '🏴‍☠️', key: m.key } })
    await sock.sendMessage(from, {
        text: `\`🌊 NUEVO CAPITÁN AGREGADO 🦈\`\nNombre: ${nombre}\nNúmero: @${numero}\n\n> ${config.BOT_NAME}`,
        mentions: [usuarioJid] // ✅ MENCIÓN CORRECTA
    }, { quoted: m })
}

handler.command = ['addowner', 'nuevocapitan']
handler.help = ['addowner <@/número> [nombre]']
handler.tags = ['dueño']
handler.menu = true

export default handler
