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

        console.log('GROUP:', from)
        console.log('SENDER:', sender)

        const db = leerDB()
        console.log('DB:', db)

        const muteados = db[from] || []
        console.log('MUTEADOS:', muteados)

        const estaMuteado = muteados.some(
            x => limpiar(x) === sender
        )

        console.log('ESTA MUTEADO:', estaMuteado)

        if (!estaMuteado) return

        await sock.sendMessage(from, {
            delete: m.key
        })

        console.log('MENSAJE BORRADO')
    } catch (e) {
        console.log('MUTEWATCHER ERROR:', e)
    }
}