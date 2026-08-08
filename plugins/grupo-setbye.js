
import fs from 'fs'
import path from 'path'
import config from '../config.js'

const ruta = path.join(
  process.cwd(),
  'database',
  'setbye.json'
)

function leerDB() {
  try {
    return JSON.parse(
      fs.readFileSync(ruta, 'utf8')
    )
  } catch {
    return {}
  }
}

function guardarDB(db) {
  fs.mkdirSync(
    path.dirname(ruta),
    { recursive: true }
  )

  fs.writeFileSync(
    ruta,
    JSON.stringify(db, null, 2),
    'utf8'
  )
}

let handler = {}

handler.run = async (sock, m, args) => {

  const from = m.key.remoteJid
  const sender =
    m.key.participant ||
    m.key.remoteJid

  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(
      from,
      {
        text: '`🌊 Solo funciona en grupos`'
      },
      { quoted: m }
    )
  }

  const metadata =
    await sock.groupMetadata(from)

  const admin =
    metadata.participants.find(
      p =>
        p.id === sender ||
        p.jid === sender
    )

  if (!admin?.admin) {
    return sock.sendMessage(
      from,
      {
        text:
          '`🚫 Solo admins pueden usarlo`'
      },
      { quoted: m }
    )
  }

  /*
   * Obtenemos el mensaje original
   * para conservar los saltos de línea.
   */
  const body =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  /*
   * Eliminamos únicamente .setbye.
   * Los saltos de línea se mantienen.
   */
  const texto = body
    .replace(
      /^\.?setbye(?:\s+)?/i,
      ''
    )
    .trim()

  if (!texto) {
    return sock.sendMessage(
      from,
      {
        text:
`🌊 \`USO\`

.setbye <texto>

⚓ Variables:
> @user
> @members
> @group

💡 También puedes usar saltos de línea.`
      },
      { quoted: m }
    )
  }

  const db = leerDB()

  db[from] = texto

  guardarDB(db)

  await sock.sendMessage(
    from,
    {
      text:
`🌊 𝐁𝐘𝐄 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎

${texto}

> ${config.BOT_NAME}`
    },
    { quoted: m }
  )
}

handler.command = ['setbye']
handler.help = ['setbye <texto>']
handler.tags = ['grupo']
handler.menu = true

export default handler