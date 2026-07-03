import config from '../config.js'
import { limpiarJid, leerDB, guardarDB } from '../lib/muteWatcher.js'

let handler = {}

handler.run = async (sock, m, args, { isAdmin }) => {
  const from = m.key.remoteJid
  const sender = limpiarJid(m.key.participant || m.key.remoteJid)

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '`🌊 Solo funciona en grupos`' }, { quoted: m })
  }

  if (!await isAdmin(sock, from, sender)) {
    await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
    return
  }

  let target = m.message?.extendedTextMessage?.contextInfo?.participant
              || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!target) {
    return sock.sendMessage(from, { text: '`❌ Responde o menciona un usuario`' }, { quoted: m })
  }

  target = limpiarJid(target)

  const db = leerDB()
  if (!db[from]) db[from] = []

  if (!db[from].includes(target)) {
    await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
    return sock.sendMessage(from, { text: '`⚠️ Ese usuario no estaba muteado`' }, { quoted: m })
  }

  db[from] = db[from].filter(u => limpiarJid(u) !== target)
  guardarDB(db)

  // ✅ QUITAR DE LISTA INMEDIATAMENTE
  global.silenciadosCache.delete(target)

  await sock.sendMessage(from, { react: { text: '🔊', key: m.key } })
  await sock.sendMessage(from, {
    text: `🌊 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐃𝐄𝐒𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎 🔊\n\n👤 Usuario: @${target.split('@')[0]}\n🦈 Activado por: @${sender.split('@')[0]}\n\n> ${config.BOT_NAME}`,
    mentions: [target, sender]
  }, { quoted: m })
}

handler.command = ['unmute']
handler.help = ['unmute @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler
