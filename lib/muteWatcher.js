import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')
const cola = []
let procesando = false

// Crear lista global segura
if (!global.silenciadosCache) global.silenciadosCache = new Set()

function leerDB() {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'))
  } catch {
    return {}
  }
}

function guardarDB(db) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true })
  fs.writeFileSync(ruta, JSON.stringify(db, null, 2))
}

function limpiarJid(jid = '') {
  return String(jid).replace(/:\d+@/, '@').trim()
}

// Sincronizar lista en memoria con archivo
function actualizarCache() {
  const db = leerDB()
  global.silenciadosCache.clear()
  for (const grupo in db) {
    db[grupo].forEach(u => global.silenciadosCache.add(limpiarJid(u)))
  }
}
actualizarCache()
setInterval(actualizarCache, 120000)

async function procesarCola(sock) {
  if (procesando) return
  procesando = true

  while (cola.length) {
    const item = cola.shift()

    try {
      await sock.sendMessage(item.from, {
        delete: item.key
      })

      await new Promise(r => setTimeout(r, 200))
    } catch (e) {
      console.log('❌ No se pudo borrar:', e.message)
    }
  }

  procesando = false
}

export async function muteWatcher(sock, m) {
  try {
    const from = m.key.remoteJid
    if (!from?.endsWith('@g.us') || m.key.fromMe) return false

    const remitente = limpiarJid(m.key.participant || m.key.remoteJid)

    // ✅ Si está en lista → borrar directo
    if (global.silenciadosCache.has(remitente)) {
      cola.push({
        from,
        key: { remoteJid: from, fromMe: false, id: m.key.id, participant: m.key.participant }
      })
      procesarCola(sock)
      return true
    }

    // ✅ Verificar en base
    const db = leerDB()
    const muteados = db[from] || []
    const estaMuteado = muteados.some(u => limpiarJid(u) === remitente)

    if (!estaMuteado) return false

    // ✅ Agregar a lista y borrar
    global.silenciadosCache.add(remitente)
    cola.push({
  from,
  key: m.key
})
    })
    procesarCola(sock)
    return true
  } catch (e) {
    console.log('MUTEWATCHER ERROR:', e)
    return false
  }
}

// Exportar para usar en comandos
export { limpiarJid, leerDB, guardarDB }
