import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')

function leerDB() {
    try {
        return JSON.parse(fs.readFileSync(ruta, 'utf8'))
    } catch {
        return {}
    }
}

function limpiar(jid = '') {
    return String(jid).replace(/:\d+@/, '@').trim()
}

export async function muteWatcher(sock, m) {
    try {
        const from = m.key.remoteJid
        if (!from?.endsWith('@g.us')) return false

        const sender = limpiar(
            m.key.participant || m.key.remoteJid
        )

        const db = leerDB()
        const lista = db[from] || []

        if (!lista.includes(sender)) return false

        await sock.sendMessage(from, {
            delete: {
                remoteJid: from,
                id: m.key.id,
                participant: m.key.participant,
                fromMe: false
            }
        })

        return true
    } catch {
        return false
    }
}