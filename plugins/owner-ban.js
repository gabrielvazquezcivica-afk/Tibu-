import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaBaneados = path.join(process.cwd(), 'database', 'baneados.json')
const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

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

function leerOwners() {
  try {
    return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
  } catch {
    return []
  }
}

function limpiarNumero(num = '') {
  return String(num).replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const senderNum = limpiarNumero(sender)

  const duenosPrincipales = config.owner
    .map(limpiarNumero)
    .filter(Boolean)

  const duenosLid = config.ownerLid
    .map(limpiarNumero)
    .filter(Boolean)

  const duenosExtras = []

  for (const owner of leerOwners()) {
    if (owner.number) duenosExtras.push(limpiarNumero(owner.number))
    if (owner.id) duenosExtras.push(limpiarNumero(owner.id))
  }

  const todosDuenos = [
    ...duenosPrincipales,
    ...duenosLid,
    ...duenosExtras
  ]

  const esDueno = todosDuenos.includes(senderNum)

  if (!esDueno) {
    await sock.sendMessage(from, {
      react: { text: '🚫', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`🚫 Solo capitanes pueden banear usuarios`'
    }, { quoted: m })
  }

  let usuario = null

  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    usuario =
      m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage
  ) {
    usuario =
      m.message.extendedTextMessage.contextInfo.participant
  }

  if (!usuario) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`❌ Menciona o responde al usuario a banear`'
    }, { quoted: m })
  }

  const numUsuario = limpiarNumero(usuario)

  // Protección de owners
  if (todosDuenos.includes(numUsuario)) {
    await sock.sendMessage(from, {
      react: { text: '⛔', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`⛔ No puedes banear a un capitán`',
      mentions: [usuario]
    }, { quoted: m })
  }

  const lista = leerBaneados()

  if (lista.includes(numUsuario)) {
    await sock.sendMessage(from, {
      react: { text: '⚠️', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`⚠️ Este usuario ya está baneado`'
    }, { quoted: m })
  }

  lista.push(numUsuario)
  guardarBaneados(lista)

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })

  await sock.sendMessage(from, {
    text:
      `\`✅ USUARIO BANEADO\`\n` +
      `@${numUsuario}\n` +
      `Ya no recibirán respuesta sus comandos.`,
    mentions: [usuario]
  }, { quoted: m })
}

handler.command = ['ban']
handler.help = ['ban @usuario']
handler.tags = ['owner']
handler.menu = true

export default handler