import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerExtras() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

function limpiarNumero(txt = '') {
    return String(txt).replace(/[^0-9]/g, '')
}

function obtenerNumero(obj) {
    if (!obj) return ''

    if (typeof obj === 'string') {
        if (obj.includes(':')) obj = obj.split(':')[0]
        return limpiarNumero(obj)
    }

    if (obj.jid) return obtenerNumero(obj.jid)
    if (obj.id) return obtenerNumero(obj.id)

    return ''
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = obtenerNumero(sender)

    console.log('========== MESSAGE ==========')
    console.log('participant:', m.key.participant)
    console.log('remoteJid:', m.key.remoteJid)
    console.log('sender:', sender)
    console.log('senderNum:', senderNum)

    console.log('========== BOT ==========')
    console.log(JSON.stringify(sock.user, null, 2))

    if (m.key.fromMe) return

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: 'Solo grupos'
        }, { quoted: m })
    }

    const fijos = [
        ...config.owner.map(limpiarNumero),
        ...config.ownerLid.map(limpiarNumero)
    ]

    const extras = leerExtras().map(o => limpiarNumero(o.number))
    const todosDueños = [...fijos, ...extras]

    console.log('OWNERS:', todosDueños)

    if (!todosDueños.includes(senderNum)) {
        return sock.sendMessage(from, {
            text: 'No eres owner'
        }, { quoted: m })
    }

    const metadata = await sock.groupMetadata(from)

    console.log('======= PARTICIPANTS =======')

    for (const p of metadata.participants) {
        console.log({
            id: p.id,
            jid: p.jid,
            numero: obtenerNumero(p),
            admin: p.admin
        })
    }

    await sock.sendMessage(from, {
        text: 'Revisa consola de Termux'
    }, { quoted: m })
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['owner']
handler.menu = true

export default handler