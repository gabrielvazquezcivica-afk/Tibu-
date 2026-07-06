const gifs = [
  'https://telegra.ph/file/0ce171b163a669ae9819d.mp4',
  'https://telegra.ph/file/b80fdfb8551b66f77b67e.mp4',
  'https://telegra.ph/file/f87d442b78389d4ed5be0.mp4',
  'https://telegra.ph/file/74828e36617c16421598f.mp4',
  'https://telegra.ph/file/093cbdd990220446d8920.mp4',
  'https://telegra.ph/file/5042d5f627a3500e2fe8e.mp4',
  'https://telegra.ph/file/02ec493403335917d1ece.mp4',
  'https://telegra.ph/file/a0a86516033a906b55220.mp4',
  'https://telegra.ph/file/570944813cab1c9dddd03.mp4'
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

  if (!usuario || usuario === remitente) {
    return sock.sendMessage(from, {
      text: '`👅 Menciona o responde al usuario que quieres lamer.`'
    }, { quoted: m })
  }

  await sock.sendMessage(from, {
    react: {
      text: '👅',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption: `👅 @${remitente.split('@')[0]} lamió a @${usuario.split('@')[0]} 😋`,
    mentions: [remitente, usuario]
  }, { quoted: m })
}

handler.command = ['lamer', 'lick']
handler.help = ['lamer @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler