const gifs = [
  'https://telegra.ph/file/d6ece99b5011aedd359e8.mp4',
  'https://telegra.ph/file/ba841c699e9e039deadb3.mp4',
  'https://telegra.ph/file/6497758a122357bc5bbb7.mp4',
  'https://telegra.ph/file/8c0f70ed2bfd95a125993.mp4',
  'https://telegra.ph/file/826ce3530ab20b15a496d.mp4'
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
      text: '`💋 Menciona o responde a alguien para darle un beso.`'
    }, { quoted: m })
  }

  const remitente = m.key.participant || m.key.remoteJid

  if (usuario === remitente) {
    return sock.sendMessage(from, {
      text: '`😳 No puedes besarte a ti mismo.`'
    }, { quoted: m })
  }

  await sock.sendMessage(from, {
    react: {
      text: '💋',
      key: m.key
    }
  })

  const gif = gifs[Math.floor(Math.random() * gifs.length)]

  await sock.sendMessage(from, {
    video: { url: gif },
    gifPlayback: true,
    caption: `💋 @${remitente.split('@')[0]} besó a @${usuario.split('@')[0]} ❤️`,
    mentions: [remitente, usuario]
  }, { quoted: m })
}

handler.command = ['kiss', 'beso']
handler.help = ['kiss @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler