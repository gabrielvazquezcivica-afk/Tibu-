import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'setwelcome.json')

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

let handler = {}

handler.run = async (sock, m) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, {
      text: '`🌊 Solo funciona en grupos`'
    }, { quoted: m })
  }

  const metadata = await sock.groupMetadata(from)
  const admin = metadata.participants.find(
    p => p.id === sender || p.jid === sender
  )

  if (!admin?.admin) {
    return sock.sendMessage(from, {
      text: '`🚫 Solo admins pueden usarlo`'
    }, { quoted: m })
  }

  const db = leerDB()

  if (!db[from]) {
    return sock.sendMessage(from, {
      text: '`⚠️ No hay welcome personalizado`'
    }, { quoted: m })
  }

  delete db[from]
  guardarDB(db)

  await sock.sendMessage(from, {
    text: '`🌊 Welcome personalizado eliminado`'
  }, { quoted: m })
}

handler.command = ['delwelcome']
handler.help = ['delwelcome']
handler.tags = ['grupo']
handler.menu = true

export default handler