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

// Limpiar para comparar números/IDs
function limpiar(texto) {
    return texto.replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = m.key.participant || m.key.remoteJid
    const remNum = limpiar(remitente)

    // ✅ DETECTA POR NÚMERO (arreglo owner) O POR LID (arreglo ownerLid)
    const esDueno =
        config.owner.some(num => limpiar(num) === remNum) ||
        config.ownerLid.some(lid => limpiar(lid) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚫 Solo los capitanes pueden agregar nuevos dueños`'
        }, { quoted: m })
    }

    // Obtener usuario: respuesta, mención o número
    let usuarioJid, numero, nombre
    if (m.quoted?.sender) {
        usuarioJid = m.quoted.sender
        numero = limpiar(usuarioJid)
        nombre = args.join(' ') || m.quoted.pushName || `Capitán ${numero}`
    } else if (m.mentions?.[0]) {
        usuarioJid = m.mentions[0]
        numero = limpiar(usuarioJid)
        nombre = args.slice(1).join(' ') || `Capitán ${numero}`
    } else if (args[0]) {
        numero = limpiar(args[0])
        usuarioJid = `${numero}@s.whatsapp.net`
        nombre = args.slice(1).join(' ') || `Capitán ${numero}`
    } else {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Responde, menciona o escribe el número`\nEj: .addowner @usuario Nombre'
        }, { quoted: m })
    }

    const lista = leerOwners()
    const existe = lista.some(o => limpiar(o.number) === numero || limpiar(o.id) === numero)

    if (existe) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚢 Este capitán ya navega en nuestra flota`'
        }, { quoted: m })
    }

    lista.push({ number: numero, id: usuarioJid, name: nombre })
    guardarOwners(lista)

    await sock.sendMessage(from, { react: { text: '🏴‍☠️', key: m.key } })
    await sock.sendMessage(from, {
        text: `\`🌊 NUEVO CAPITÁN AGREGADO 🦈\`\nNombre: ${nombre}\nNúmero: @${numero}\n\n> ${config.BOT_NAME}`,
        mentions: [usuarioJid]
    }, { quoted: m })
}

handler.command = ['addowner', 'nuevocapitan']
handler.help = ['addowner <@/número> [nombre]']
handler.tags = ['dueño']
handler.menu = true

export default handler
