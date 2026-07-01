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

    // Verificar dueño
    const esDueno =
        config.owner.some(n => limpiar(n) === remNum) ||
        config.ownerLid.some(l => limpiar(l) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo capitanes pueden remover`' }, { quoted: m })
    }

    let usuarioJid, numero, nombre

    // DETECTA RESPUESTA
    if (m.quoted && m.quoted.key) {
        usuarioJid = m.quoted.key.remoteJid || m.quoted.participant
        numero = limpiar(usuarioJid)
        nombre = args.join(' ').trim() || m.quoted.pushName || `Capitán ${numero}`
    }
    // DETECTA MENCIÓN
    else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        usuarioJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
        numero = limpiar(usuarioJid)
        nombre = args.slice(1).join(' ').trim() || `Capitán ${numero}`
    }
    // DETECTA NÚMERO
    else if (args[0]) {
        numero = limpiar(args[0])
        usuarioJid = `${numero}@s.whatsapp.net`
        nombre = args.slice(1).join(' ').trim() || `Capitán ${numero}`
    }
    else {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Responde, menciona o escribe el número`\nEj: .delowner @Nombre',
            quoted: m
        })
    }

    // No permitir borrar capitanes principales de config
    const esFijo =
        config.owner.some(n => limpiar(n) === numero) ||
        config.ownerLid.some(l => limpiar(l) === numero)

    if (esFijo) {
        await sock.sendMessage(from, { react: { text: '🪸', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🪸 No se puede remover a un capitán principal`',
            quoted: m
        })
    }

    let lista = leerOwners()
    const indice = lista.findIndex(o => limpiar(o.number) === numero || limpiar(o.id) === numero)

    if (indice === -1) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, {
            text: '`❌ Este capitán no está en la flota`',
            quoted: m
        })
    }

    // Eliminar
    lista.splice(indice, 1)
    guardarOwners(lista)

    await sock.sendMessage(from, { react: { text: '🏴‍☠️', key: m.key } })
    await sock.sendMessage(from, {
        text: `\`🌊 CAPITÁN REMOVIDO 🦈\`\nNombre: ${nombre}\nNúmero: @${numero}\nYa no gobierna estas aguas.\n\n> ${config.BOT_NAME}`,
        mentions: [usuarioJid]
    }, { quoted: m })
}

handler.command = ['delowner', 'quitarcapitan']
handler.help = ['delowner <@/número>']
handler.tags = ['dueño']
handler.menu = true

export default handler
