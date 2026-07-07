import fs from 'fs'
import path from 'path'
import config from '../config.js'

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

handler.run = async (sock, m, args) => {
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

  const body =
  m.message?.conversation ||
  m.message?.extendedTextMessage?.text ||
  ''

const texto = body
  .replace(/^\.?setwelcome\s*/i, '')
  .trim()

  if (!texto) {
    return sock.sendMessage(from, {
      text:
`🌊 \`Usa\`
\`.setwelcome <texto>\`

⚓ Variables:
> @user
> @members
> @group`
    }, { quoted: m })
  }

  const db = leerDB()
  db[from] = texto
  guardarDB(db)

  await sock.sendMessage(from, {
    text:
`🌊 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎

${texto}

> ${config.BOT_NAME}`
  }, { quoted: m })
}

handler.command = ['setwelcome']
handler.help = ['setwelcome <texto>']
handler.tags = ['grupo']
handler.menu = true

export default handler