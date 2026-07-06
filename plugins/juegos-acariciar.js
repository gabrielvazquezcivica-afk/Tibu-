const gifs = [
  'https://telegra.ph/file/f75aed769492814d68016.mp4',
  'https://telegra.ph/file/4f24bb58fe580a5e97b0a.mp4',
  'https://telegra.ph/file/30206abdcb7b8a4638510.mp4',
  'https://telegra.ph/file/ecd7aeae5b2242c660d41.mp4',
  'https://telegra.ph/file/6d3ba201bcdd1fd2c1408.mp4',
  'https://telegra.ph/file/d5dbdcf845d2739dbe45e.mp4',
  'https://telegra.ph/file/c9a529908d4e0b71d7c5a.mp4'
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
      text: '`🤲 Menciona o responde al usuario que quieres acariciar.`'
    }, { quoted: m })
  }

  await sock.sendMessage(from, {
    react: {
      text: '🤲',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption: `🤲 @${remitente.split('@')[0]} acarició con cariño a @${usuario.split('@')[0]} 💖`,
    mentions: [remitente, usuario]
  }, { quoted: m })
}

handler.command = ['acariciar', 'acaricia', 'pat']
handler.help = ['acariciar @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler