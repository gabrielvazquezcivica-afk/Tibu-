import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')

const cola = []
let procesando = false
let cacheMuteados = {} // Caché en memoria

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

// Cargar lista completa a memoria una vez
function actualizarCache() {
    cacheMuteados = leerDB()
    // Sincronizar con la lista global para borrado inmediato
    if (global.silenciadosCache) global.silenciadosCache.clear()
    for (const grupo in cacheMuteados) {
        cacheMuteados[grupo].forEach(u => {
            if (global.silenciadosCache) global.silenciadosCache.add(limpiar(u))
        })
    }
}

// Actualizar caché cada 2 minutos y al inicio
actualizarCache()
setInterval(actualizarCache, 2 * 60 * 1000)

async function procesarCola(sock) {
    if (procesando) return
    procesando = true

    while (cola.length) {
        const item = cola.shift()
        try {
            await sock.sendMessage(item.from, { delete: item.key })
            // Bajar pausa para borrar más rápido
            await new Promise(resolve => setTimeout(resolve, 250))
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

        const sender = limpiar(m.key.participant || m.key.remoteJid)

        // ✅ Primero revisa la lista global (instantáneo)
        if (global.silenciadosCache?.has(sender)) {
            cola.push({
                from,
                key: { remoteJid: from, fromMe: false, id: m.key.id, participant: m.key.participant }
            })
            procesarCola(sock)
            return true
        }

        // ✅ Si no está en la lista, revisa caché de archivo
        const muteados = cacheMuteados[from] || []
        const estaMuteado = muteados.some(x => limpiar(x) === sender)

        if (!estaMuteado) return false

        // ✅ Agregar a lista global para borrar los siguientes al instante
        global.silenciadosCache?.add(sender)

        cola.push({
            from,
            key: { remoteJid: from, fromMe: false, id: m.key.id, participant: m.key.participant }
        })
        procesarCola(sock)

        return true
    } catch (e) {
        console.log('MUTEWATCHER ERROR:', e)
        return false
    }
}
