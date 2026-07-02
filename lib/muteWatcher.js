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

        const estaMuteado = muteados.some(
            x => limpiar(x) === sender
        )

        console.log('ESTA MUTEADO:', estaMuteado)

        if (!estaMuteado) return

        await sock.sendMessage(from, {
            delete: m.key
        })

        console.log('BORRADO OK')
    } catch (e) {
        console.log('MUTEWATCHER ERROR:', e)
    }
}