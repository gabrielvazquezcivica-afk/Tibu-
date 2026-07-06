const gifs = [
  'https://telegra.ph/file/5fa4fd7f4306aa7b2e17a.mp4',
  'https://telegra.ph/file/b299115a77fadb7594ca0.mp4',
  'https://telegra.ph/file/9938a8c2e54317d6b8250.mp4',
  'https://telegra.ph/file/e6c7b3f7d482ae42db9a7.mp4',
  'https://telegra.ph/file/a61b52737df7459580129.mp4',
  'https://telegra.ph/file/f34e1d5c8f17bd2739a51.mp4',
  'https://telegra.ph/file/c345ed1ca18a53655f857.mp4',
  'https://telegra.ph/file/4eec929f54bc4d83293a3.mp4',
  'https://telegra.ph/file/856e38b2303046990531c.mp4'
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
      text: '😂',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  let caption
  let mentions

  if (usuario && usuario !== remitente) {
    caption = `😂 @${remitente.split('@')[0]} se está riendo de @${usuario.split('@')[0]} 🤣`
    mentions = [remitente, usuario]
  } else {
    caption = `😂 @${remitente.split('@')[0]} no puede parar de reír 🤣`
    mentions = [remitente]
  }

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption,
    mentions
  }, { quoted: m })
}

handler.command = ['reirse', 'reírse', 'risa', 'laugh']
handler.help = ['reirse @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler