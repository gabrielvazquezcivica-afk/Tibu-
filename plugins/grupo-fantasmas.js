import fs from 'fs'
import path from 'path'

const rutaMsgCount = path.join(process.cwd(), 'database', 'msgcount.json')

function leerContadores() {
  try {
    return JSON.parse(fs.readFileSync(rutaMsgCount, 'utf8'))
  } catch {
    return {}
  }
}

let handler = {}

handler.run = async (sock, m, args, { isAdmin }) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '`🌊 Este comando es solo para grupos`' }, { quoted: m })
  }

  if (!await isAdmin(sock, from, sender)) {
    await sock.sendMessage(from, { react: { text: '⛔', key: m.key } })
    return sock.sendMessage(from, { text: '`🦈 Solo administradores pueden usar este comando`' }, { quoted: m })
  }

  // Obtener todos los miembros reales del grupo
  const metadata = await sock.groupMetadata(from)
  const todosMiembros = metadata.participants.map(p => p.id)

  const datos = leerContadores()
  const grupo = datos[from] || {}

  // Buscar: sin registro O con valor -10
  const fantasmas = todosMiembros.filter(usuario => {
    const cuenta = grupo[usuario]
    return cuenta === undefined || cuenta === -10
  })

  if (fantasmas.length === 0) {
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
    return sock.sendMessage(from, {
      text: `👻 ` + '`SIN USUARIOS FANTASMAS`' + `\n\nTodos los miembros tienen mensajes registrados.`,
      quoted: m
    })
  }

  const listaMenciones = fantasmas.map(u => `• @${u.split('@')[0]}`).join('\n')

  await sock.sendMessage(from, {
    text: `👻 ` + '`USUARIOS FANTASMAS`' + `\n(Sin mensajes o con -10)\n\n${listaMenciones}`,
    mentions: fantasmas
  }, { quoted: m })
}

handler.command = ['fantasmas']
handler.help = ['fantasmas']
handler.tags = ['grupo']

export default handler
