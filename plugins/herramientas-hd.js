import axios from 'axios'

const API_URL = 'https://api-faa.my.id/faa/hdv4'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid

  try {
    // Obtener la imagen del mensaje o de la imagen citada
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    const imageMessage =
      m.message?.imageMessage ||
      quoted?.imageMessage

    if (!imageMessage) {
      return sock.sendMessage(from, {
        text: '🖼️ *MEJORAR IMAGEN A HD*\n\n' +
          'Envía una imagen con el comando `.hd` en el pie de foto, ' +
          'o responde a una imagen con `.hd`.'
      }, { quoted: m })
    }

    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    // Obtener el enlace de la imagen
    let imageUrl = imageMessage.url

    // Si no hay URL pública, descargar la imagen de WhatsApp
    if (!imageUrl) {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys')
      const stream = await downloadContentFromMessage(imageMessage, 'image')
      const chunks = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      const buffer = Buffer.concat(chunks)

      // La API requiere una URL, por lo que no se puede enviar el buffer directamente.
      // Se intenta usar la URL del mensaje si está disponible.
      if (!buffer.length) {
        throw new Error('No se pudo leer la imagen')
      }

      throw new Error('No se obtuvo una URL para procesar la imagen')
    }

    const response = await axios.get(API_URL, {
      params: { image: imageUrl },
      timeout: 60000
    })

    const data = response.data
    const resultUrl = data?.result?.image_upscaled

    if (!data?.status || !resultUrl || !/^https?:\/\//i.test(resultUrl)) {
      throw new Error('La API no devolvió una imagen mejorada')
    }

    await sock.sendMessage(from, {
      image: { url: resultUrl },
      caption: '✨ *IMAGEN MEJORADA A HD*\n\n> Procesada con éxito por Tibu Bot.'
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    await sock.sendMessage(from, {
      text: '❌ *NO SE PUDO MEJORAR LA IMAGEN.*\n\n' +
        'Verifica que la imagen tenga un enlace accesible e inténtalo de nuevo.'
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['hd', 'enhance', 'upscale']
handler.help = ['hd']
handler.tags = ['herramientas']
handler.menu = true

export default handler