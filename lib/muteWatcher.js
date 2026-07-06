import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')

// Cache global
if (!global.silenciadosCache) {
  global.silenciadosCache = new Set()
}

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
  return String(jid)
    .replace(/:\d+@/, '@')
    .trim()
}

function actualizarCache() {
  const db = leerDB()
  global.silenciadosCache.clear()

  for (const grupo in db) {
    const usuarios = db[grupo] || []

    for (const user of usuarios) {
      global.silenciadosCache.add(
        `${grupo}|${limpiarJid(user)}`
      )
    }
  }
}

actualizarCache()

export async function muteWatcher(sock, m) {
  try {
    const from = m.key.remoteJid
    if (!from?.endsWith('@g.us')) return false
    if (m.key.fromMe) return false

    const remitente = limpiarJid(
      m.key.participant || m.key.remoteJid
    )

    const clave = `${from}|${remitente}`

let estaMuteado = global.silenciadosCache.has(clave)

    if (!estaMuteado) {
      const db = leerDB()
      const lista = db[from] || []

      estaMuteado = lista.some(
        user => limpiarJid(user) === remitente
      )

      if (estaMuteado) {
    global.silenciadosCache.add(clave)
}
    }

    if (!estaMuteado) return false

    try {
      await sock.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      })
    } catch {}

    return true

  } catch (e) {
    console.log('MUTEWATCHER ERROR:', e)
    return false
  }
}

export {
  limpiarJid,
  leerDB,
  guardarDB,
  actualizarCache
}