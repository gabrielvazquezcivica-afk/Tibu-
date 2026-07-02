import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaBaneados = path.join(process.cwd(), 'database', 'baneados.json')

function iniciarArchivo() {
  if (!fs.existsSync(rutaBaneados)) {
    fs.writeFileSync(rutaBaneados, JSON.stringify([], null, 2))
  }
}

function leerBaneados() {
  iniciarArchivo()
  return JSON.parse(fs.readFileSync(rutaBaneados, 'utf8'))
}

function guardarBaneados(lista) {
  fs.writeFileSync(rutaBaneados, JSON.stringify(lista, null, 2))
}

function limpiarNumero(num = '') {
  return String(num).replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const senderNum = limpiarNumero(sender)

  // Solo dueños
  const esDueno = config.owner.map(limpiarNumero).includes(senderNum) ||
                  config.ownerLid.map(limpiarNumero).includes(senderNum)

  if (!esDueno) {
    await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
    return sock.sendMessage(from, { text: '`🚫 Solo capitanes pueden banear usuarios`' }, { quoted: m })
  }

  let usuario = null
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    usuario = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    usuario = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!usuario) {
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
    return sock.sendMessage(from, { text: '`❌ Menciona o responde al usuario a banear`' }, { quoted: m })
  }

  const lista = leerBaneados()
  const numUsuario = limpiarNumero(usuario)

  if (lista.includes(numUsuario)) {
    await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
    return sock.sendMessage(from, { text: '`⚠️ Este usuario ya está baneado`' }, { quoted: m })
  }

  lista.push(numUsuario)
  guardarBaneados(lista)

  await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
  await sock.sendMessage(from, {
    text: `\`✅ USUARIO BANEADO\`\n@${numUsuario}\nYa no recibirán respuesta sus comandos.`,
    mentions: [usuario]
  }, { quoted: m })
}

handler.command = ['ban']
handler.help = ['ban @usuario', 'ban (responder mensaje)']
handler.tags = ['owner']
handler.menu = true

export default handler
