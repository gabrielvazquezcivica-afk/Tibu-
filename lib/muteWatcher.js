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

function limpiar(id = '') {
    return String(id)
        .replace(/:\d+@/, '@')
        .trim()
}

export async function muteWatcher(sock, m) {
    try {
        const from = m.key.remoteJid
        if (!from?.endsWith('@g.us')) return
        if (m.key.fromMe) return

        const sender = limpiar(
            m.key.participant || m.key.remoteJid
        )

        const db = leerDB()
        const muteados = db[from] || []

        console.log('GROUP:', from)
        console.log('SENDER:', sender)
        console.log('MUTEADOS:', muteados)

        const muteado = muteados.find(
            x => limpiar(x) === sender
        )

        if (!muteado) return

        console.log('BORRANDO MENSAJE')

        await sock.sendMessage(from, {
            delete: {
                remoteJid: from,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant
            }
        })

    } catch (e) {
        console.log('MUTE ERROR:', e)
    }
}