const gifs = [
  'https://telegra.ph/file/3ba192c3806b097632d3f.mp4',
  'https://telegra.ph/file/58b33c082a81f761bbee8.mp4',
  'https://telegra.ph/file/da5011a1c504946832c81.mp4',
  'https://telegra.ph/file/20ac5be925e6cd48f549f.mp4',
  'https://telegra.ph/file/a00bc137b0beeec056b04.mp4',
  'https://telegra.ph/file/080f08d0faa15119621fe.mp4',
  'https://telegra.ph/file/eb0b010b2f249dd189d06.mp4',
  'https://telegra.ph/file/734cb1e4416d80a299dac.mp4',
  'https://telegra.ph/file/fc494a26b4e46c9b147d2.mp4'
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
      text: '`👋 Menciona o responde al usuario que quieres abofetear.`'
    }, { quoted: m })
  }

  await sock.sendMessage(from, {
    react: {
      text: '👋',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption: `👋 @${remitente.split('@')[0]} le dio una tremenda bofetada a @${usuario.split('@')[0]} 💥`,
    mentions: [remitente, usuario]
  }, { quoted: m })
}

handler.command = ['bofetada', 'slap']
handler.help = ['bofetada @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler