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

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

export async function muteWatcher(sock, m) {
    try {
        const from = m.key.remoteJid
        if (!from || !from.endsWith('@g.us')) return
        if (m.key.fromMe) return

        const sender = limpiarJid(
            m.key.participant || m.key.remoteJid
        )

        const db = leerDB()
        const muteados = db[from] || []

        const estaMuteado = muteados.some(
            x => limpiarJid(x) === sender
        )

        if (!estaMuteado) return

        await sock.sendMessage(from, {
            delete: m.key
        })
    } catch (e) {
        console.log('MUTEWATCHER ERROR:', e.message)
    }
}