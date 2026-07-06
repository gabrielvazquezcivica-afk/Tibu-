const gifs = [
  'https://telegra.ph/file/a4f925aac453cad828ef2.mp4',
  'https://telegra.ph/file/f19318f1e8dad54303055.mp4',
  'https://telegra.ph/file/15605caa86eee4f924c87.mp4',
  'https://telegra.ph/file/d301ffcc158502e39afa7.mp4',
  'https://telegra.ph/file/c6105160ddd3ca84f887a.mp4',
  'https://telegra.ph/file/abd44f64e45c3f30442bd.mp4',
  'https://telegra.ph/file/9611e5c1d616209bc0315.mp4'
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
    caption = `😊 @${remitente.split('@')[0]} se sonrojó por @${usuario.split('@')[0]} ❤️`
    mentions = [remitente, usuario]
  } else {
    caption = `😊 @${remitente.split('@')[0]} se sonrojó... ❤️`
    mentions = [remitente]
  }

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption,
    mentions
  }, { quoted: m })
}

handler.command = ['sonrojarse', 'sonrojo', 'blush']
handler.help = ['sonrojarse @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler