import fs from 'fs'
import path from 'path'

const rutaMute = path.join(process.cwd(), 'database', 'muteados.json')

function cargarMuteados() {
  try {
    return JSON.parse(fs.readFileSync(rutaMute, 'utf8'))
  } catch {
    return {}
  }
}

function guardarMuteados(lista) {
  fs.writeFileSync(rutaMute, JSON.stringify(lista, null, 2))
}

let handler = {}

handler.run = async (sock, m, args, { isAdmin }) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const nombreAdmin = m.pushName || `@${sender.split('@')[0]}`

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '`🌊 Este comando es solo para grupos`' }, { quoted: m })
  }

  if (!await isAdmin(sock, from, sender)) {
    await sock.sendMessage(from, { react: { text: '⛔', key: m.key } })
    return sock.sendMessage(from, { text: '`🦈 Solo administradores pueden usar este comando`' }, { quoted: m })
  }

  let usuario = null
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    usuario = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    usuario = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!usuario) {
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
    return sock.sendMessage(from, { text: '`❌ Menciona o responde a un usuario`' }, { quoted: m })
  }

  const lista = cargarMuteados()
  const clave = `${from}-${usuario}`

  if (!lista[clave]) {
    await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
    return sock.sendMessage(from, { text: '`⚠️ Este usuario no está silenciado`' }, { quoted: m })
  }

  delete lista[clave]
  guardarMuteados(lista)

  await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
  await sock.sendMessage(from, {
    text: `\`✅ USUARIO ACTIVADO\`\n👤 @${usuario.replace(/[^0-9]/g, '')}\n🔊 Por: ${nombreAdmin}\nYa puede escribir libremente.`,
    mentions: [usuario, sender]
  }, { quoted: m })
}

handler.command = ['unmute']
handler.help = ['unmute @usuario']
handler.tags = ['grupo']

export default handler
