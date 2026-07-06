const gifs = [
  'https://telegra.ph/file/8e60a6379c1b72e4fbe0f.mp4',
  'https://telegra.ph/file/8ac9ca359cac4c8786194.mp4',
  'https://telegra.ph/file/cc20935de6993dd391af1.mp4',
  'https://telegra.ph/file/9c0bba4c6b71979e56f55.mp4',
  'https://telegra.ph/file/5d22649b472e539f27df9.mp4',
  'https://telegra.ph/file/804eada656f96a04ebae8.mp4',
  'https://telegra.ph/file/3a2ef7a12eecbb6d6df53.mp4',
  'https://telegra.ph/file/c4c27701496fec28d6f8a.mp4',
  'https://telegra.ph/file/c8e5a210a3a34e23391ee.mp4',
  'https://telegra.ph/file/70bac5a760539efad5aad.mp4',
  'https://qu.ax/iPDiG.mp4'
]

let handler = {}

handler.run = async (sock, m) => {
  const from = m.key.remoteJid

  const mencionados =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  let usuario

  if (mencionados.length >= 1) {
    usuario = mencionados[0]
  } else if (
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage
  ) {
    usuario = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!usuario) {
    return sock.sendMessage(from, {
      text: '`👊 Menciona o responde a alguien para golpearlo.`'
    }, { quoted: m })
  }

  const remitente = m.key.participant || m.key.remoteJid

  if (usuario === remitente) {
    return sock.sendMessage(from, {
      text: '`😂 No puedes golpearte a ti mismo.`'
    }, { quoted: m })
  }

  await sock.sendMessage(from, {
    react: {
      text: '👊',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption: `👊 @${remitente.split('@')[0]} golpeó a @${usuario.split('@')[0]} 💥`,
    mentions: [remitente, usuario]
  }, { quoted: m })
}

handler.command = ['golpear', 'hit', 'slap']
handler.help = ['golpear @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler