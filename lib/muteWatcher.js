import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')

function leerDB() {
    try {
        const data = JSON.parse(fs.readFileSync(ruta, 'utf8'))
        return Array.isArray(data) ? {} : data
    } catch {
        return {}
    }
}

function limpiar(id = '') {
    return String(id)
        .replace(/:\d+@/, '@')
        .trim()
}

export async function muteWatcher(sock, m) {
    try {
        const from = m.key.remoteJid
        if (!from || !from.endsWith('@g.us')) return
        if (m.key.fromMe) return

        const sender = limpiar(
            m.key.participant || m.key.remoteJid
        )

        const db = leerDB()
        const muteados = db[from] || []

        const estaMuteado = muteados.some(
            x => limpiar(x) === sender
        )

        if (!estaMuteado) return

        console.log('MUTE DETECTADO:', sender)

        await sock.sendMessage(from, {
            delete: {
                remoteJid: from,
                id: m.key.id,
                participant: m.key.participant,
                fromMe: false
            }
        })

    } catch (e) {
        console.log('MUTEWATCHER ERROR:', e)
    }
}