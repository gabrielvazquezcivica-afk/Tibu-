import config from '../config.js'
import { limpiarJid, leerDB, guardarDB } from '../lib/muteWatcher.js'

let handler = {}

handler.run = async (sock, m) => {
  const from = m.key.remoteJid
  const sender = limpiarJid(m.key.participant || m.key.remoteJid)

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '`🌊 Solo funciona en grupos`' }, { quoted: m })
  }

  const metadata = await sock.groupMetadata(from).catch(() => null)
  if (!metadata) return sock.sendMessage(from, { text: '`❌ No pude leer el grupo`' }, { quoted: m })

  const adminInfo = metadata.participants.find(p => limpiarJid(p.id) === sender)
  const isAdmin = adminInfo?.admin === 'admin' || adminInfo?.admin === 'superadmin'
  if (!isAdmin) {
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

  if (db[from].includes(target)) {
    await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
    return sock.sendMessage(from, {
      text: `🌊 𝐘𝐀 𝐄𝐒𝐓𝐀 𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎 ⚠️\n\n👤 Usuario: @${target.split('@')[0]}\n\n> ${config.BOT_NAME}`,
      mentions: [target]
    }, { quoted: m })
  }

  db[from].push(target)
  guardarDB(db)

  // ✅ AGREGAR A LISTA INMEDIATAMENTE
  global.silenciadosCache.add(target)

  await sock.sendMessage(from, { react: { text: '🔇', key: m.key } })
  await sock.sendMessage(from, {
    text: `🌊 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎 🔇\n\n👤 Usuario: @${target.split('@')[0]}\n🦈 Silenciado por: @${sender.split('@')[0]}\n\n> ${config.BOT_NAME}`,
    mentions: [target, sender]
  }, { quoted: m })
}

handler.command = ['mute']
handler.help = ['mute @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler
