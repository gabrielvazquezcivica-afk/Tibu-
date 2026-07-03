import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')
const cola = []
let procesando = false

// ✅ CREAR LA LISTA AQUÍ MISMO PARA EVITAR ERRORES
if (!global.silenciadosCache) global.silenciadosCache = new Set()

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

function actualizarCache() {
  const db = leerDB()
  global.silenciadosCache.clear()
  for (const grupo in db) {
    db[grupo].forEach(u => global.silenciadosCache.add(limpiar(u)))
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
      await sock.sendMessage(item.from, { delete: item.key })
      await new Promise(r => setTimeout(r, 200))
    } catch (e) {
      console.log('DELETE ERROR:', e.message)
    }
  }
  procesando = false
}

export async function muteWatcher(sock, m) {
  try {
    const from = m.key.remoteJid
    if (!from?.endsWith('@g.us') || m.key.fromMe) return false

    const sender = limpiar(m.key.participant || m.key.remoteJid)

    if (global.silenciadosCache.has(sender)) {
      cola.push({ from, key: { remoteJid: from, fromMe: false, id: m.key.id, participant: m.key.participant } })
      procesarCola(sock)
      return true
    }

    const db = leerDB()
    const muteados = db[from] || []
    const estaMuteado = muteados.some(x => limpiar(x) === sender)

    if (!estaMuteado) return false

    global.silenciadosCache.add(sender)
    cola.push({ from, key: { remoteJid: from, fromMe: false, id: m.key.id, participant: m.key.participant } })
    procesarCola(sock)
    return true
  } catch (e) {
    console.log('MUTEWATCHER ERROR:', e)
    return false
  }
}
