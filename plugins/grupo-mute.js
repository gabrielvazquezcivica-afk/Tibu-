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

function limpiarNumero(num = '') {
  return String(num).replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const nombreAdmin = m.pushName || `@${limpiarNumero(sender)}`

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, {
      text: '`🌊 Este comando es solo para grupos`'
    }, { quoted: m })
  }

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return sock.sendMessage(from, {
      text: '`❌ No pude leer el grupo`'
    }, { quoted: m })
  }

  const participantes = metadata.participants || []

  // ADMIN USUARIO
  const userInfo = participantes.find(p => {
    const id = String(p.id || '')
    const jid = String(p.jid || '')
    return id === sender || jid === sender
  })

  const isAdmin =
    userInfo?.admin === 'admin' ||
    userInfo?.admin === 'superadmin'

  if (!isAdmin) {
    await sock.sendMessage(from, {
      react: { text: '⛔', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`🦈 Solo administradores pueden usar este comando`'
    }, { quoted: m })
  }

  // ADMIN BOT
  const botNum = sock.user.id.split(':')[0]

  const botInfo = participantes.find(p => {
    const id = String(p.id || '')
    const jid = String(p.jid || '')
    return id.includes(botNum) || jid.includes(botNum)
  })

  const botAdmin =
    botInfo?.admin === 'admin' ||
    botInfo?.admin === 'superadmin'

  if (!botAdmin) {
    await sock.sendMessage(from, {
      react: { text: '⚠️', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`❌ Necesito ser administrador para borrar mensajes`'
    }, { quoted: m })
  }

  let usuario = null

  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    usuario = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    usuario = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!usuario) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`❌ Menciona o responde a un usuario`'
    }, { quoted: m })
  }

  const lista = cargarMuteados()
  const clave = `${from}-${usuario}`

  if (lista[clave]) {
    await sock.sendMessage(from, {
      react: { text: '⚠️', key: m.key }
    })

    return sock.sendMessage(from, {
      text: '`⚠️ Este usuario ya está silenciado`'
    }, { quoted: m })
  }

  lista[clave] = {
    admin: sender,
    nombreAdmin
  }

  guardarMuteados(lista)

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })

  await sock.sendMessage(from, {
    text:
      `\`✅ USUARIO SILENCIADO\`\n` +
      `👤 @${limpiarNumero(usuario)}\n` +
      `🔇 Por: ${nombreAdmin}\n` +
      `Sus mensajes se borrarán automáticamente.`,
    mentions: [usuario, sender]
  }, { quoted: m })
}

// AUTO DELETE
export async function borrarSiMuteado(sock, m) {
  const from = m.key.remoteJid
  const remitente = m.key.participant || m.key.remoteJid

  if (!from || !from.endsWith('@g.us') || !remitente) return

  const lista = cargarMuteados()
  const clave = `${from}-${remitente}`

  if (lista[clave]) {
    try {
      await sock.sendMessage(from, {
        delete: m.key
      })
    } catch (e) {
      console.log('DELETE ERROR:', e)
    }
  }
}

handler.command = ['mute']
handler.help = ['mute @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler