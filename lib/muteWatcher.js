import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')

const cola = []
let procesando = false

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

async function procesarCola(sock) {
    if (procesando) return
    procesando = true

    while (cola.length) {
        const item = cola.shift()

        try {
            await sock.sendMessage(item.from, {
                delete: item.key
            })

            await new Promise(resolve =>
                setTimeout(resolve, 700)
            )
        } catch (e) {
            console.log('DELETE ERROR:', e.message || e)
        }
    }

    procesando = false
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

        cola.push({
            from,
            key: {
                remoteJid: from,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant
            }
        })

        procesarCola(sock)

        return true
    } catch (e) {
        console.log('MUTEWATCHER ERROR:', e)
        return false
    }
}