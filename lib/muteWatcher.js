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
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

export async function muteWatcher(sock, m) {
    try {
        const from = m.key.remoteJid
        if (!from?.endsWith('@g.us')) return false
        if (m.key.fromMe) return false

        const sender = limpiar(
            m.key.participant || m.key.remoteJid
        )

        const db = leerDB()
        const muteados = db[from] || []

        const estaMuteado = muteados.some(
            x => limpiar(x) === sender
        )

        if (!estaMuteado) return false

        try {
            await sock.sendMessage(from, {
                delete: m.key
            })
        } catch (e) {
            console.log('DELETE ERROR:', e.message)
        }

        return true
    } catch (e) {
        console.log('MUTEWATCHER ERROR:', e)
        return false
    }
}