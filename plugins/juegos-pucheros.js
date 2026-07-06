const gifs = [
  'https://telegra.ph/file/e2a25adcb74689a58bcc6.mp4',
  'https://telegra.ph/file/5239f6f8837383fa5bf2d.mp4',
  'https://telegra.ph/file/63564769ec715d3b6379d.mp4',
  'https://telegra.ph/file/06f7458e3a6a19deb5173.mp4',
  'https://telegra.ph/file/cdd5e7db98e1d3a46231a.mp4',
  'https://telegra.ph/file/070e2c38c9569a764cc10.mp4',
  'https://telegra.ph/file/c1834a34cd0edfd2bdbe1.mp4',
  'https://telegra.ph/file/4ceafdd813e727548cb2f.mp4',
  'https://telegra.ph/file/7aa2790c3eba5b27416ce.mp4',
  'https://telegra.ph/file/ec2d25e70b165a19e7ef7.mp4'
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
      text: '🥺',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  let caption
  let mentions

  if (usuario && usuario !== remitente) {
    caption = `🥺 @${remitente.split('@')[0]} le hizo pucheros a @${usuario.split('@')[0]}... 👉👈`
    mentions = [remitente, usuario]
  } else {
    caption = `🥺 @${remitente.split('@')[0]} está haciendo pucheros... 👉👈`
    mentions = [remitente]
  }

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption,
    mentions
  }, { quoted: m })
}

handler.command = ['pucheros', 'puchero']
handler.help = ['pucheros @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler