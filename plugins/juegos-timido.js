const gifs = [
  'https://telegra.ph/file/a9ccfa5013d58fad2e677.mp4',
  'https://telegra.ph/file/2cd355afa143095b97890.mp4',
  'https://telegra.ph/file/362c8566dc9367a5a473d.mp4',
  'https://telegra.ph/file/4f9323ca22e126b9d275c.mp4',
  'https://telegra.ph/file/51b688e0c5295bc37ca92.mp4',
  'https://telegra.ph/file/dfe74d7eee02c170f6f55.mp4',
  'https://telegra.ph/file/697719af0e6f3baec4b2f.mp4',
  'https://telegra.ph/file/89e1e1e44010975268b38.mp4',
  'https://telegra.ph/file/654313ad5a3e8b43fc535.mp4'
]

let handler = {}

handler.run = async (sock, m) => {
  const from = m.key.remoteJid
  const remitente = m.key.participant || m.key.remoteJid

  const mencionados =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  let usuario = null

  if (mencionados.length >= 1) {
    usuario = mencionados[0]
  } else if (
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage
  ) {
    usuario = m.message.extendedTextMessage.contextInfo.participant
  }

  await sock.sendMessage(from, {
    react: {
      text: '😊',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  let caption
  let mentions

  if (usuario && usuario !== remitente) {
    caption = `😊 @${remitente.split('@')[0]} se puso tímido por @${usuario.split('@')[0]}... 👉👈❤️`
    mentions = [remitente, usuario]
  } else {
    caption = `😊 @${remitente.split('@')[0]} se puso tímido... 👉👈`
    mentions = [remitente]
  }

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption,
    mentions
  }, { quoted: m })
}

handler.command = ['timido', 'tímido', 'shy']
handler.help = ['timido @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler