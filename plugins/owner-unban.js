import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaBaneados = path.join(process.cwd(), 'database', 'baneados.json')

function limpiarNumero(num = '') {
  return String(num).replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const senderNum = limpiarNumero(sender)

  const esDueno = config.owner.map(limpiarNumero).includes(senderNum) ||
                  config.ownerLid.map(limpiarNumero).includes(senderNum)

  if (!esDueno) {
    await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
    return sock.sendMessage(from, { text: '`🚫 Solo capitanes pueden desbanear`' }, { quoted: m })
  }

  let usuario = null
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    usuario = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    usuario = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!usuario) {
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
    return sock.sendMessage(from, { text: '`❌ Menciona o responde al usuario`' }, { quoted: m })
  }

  try {
    let lista = JSON.parse(fs.readFileSync(rutaBaneados, 'utf8'))
    const numUsuario = limpiarNumero(usuario)

    if (!lista.includes(numUsuario)) {
      await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
      return sock.sendMessage(from, { text: '`⚠️ Este usuario no está baneado`' }, { quoted: m })
    }

    lista = lista.filter(n => n !== numUsuario)
    fs.writeFileSync(rutaBaneados, JSON.stringify(lista, null, 2))

    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
    await sock.sendMessage(from, {
      text: `\`✅ USUARIO DESBLOQUEADO\`\n@${numUsuario}\nYa puede usar mis comandos.`,
      mentions: [usuario]
    }, { quoted: m })

  } catch {
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
    return sock.sendMessage(from, { text: '`❌ No pude leer la lista de baneados`' }, { quoted: m })
  }
}

handler.command = ['unban']
handler.help = ['unban @usuario', 'unban (responder mensaje)']
handler.tags = ['owner']
handler.menu = true

export default handler
