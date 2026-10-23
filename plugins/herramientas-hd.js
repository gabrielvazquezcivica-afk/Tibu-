import axios from 'axios'
import FormData from 'form-data'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const API_URL = 'https://api-faa.my.id/faa/hdv4'
const UPLOAD_URL = 'https://catbox.moe/user/api.php'

const handler = {}

handler.run = async (sock, m) => {
  const from = m.key.remoteJid

  try {
    // Buscar la imagen en el mensaje actual o en el citado
    const msg = m.message
    const context =
      msg?.extendedTextMessage?.contextInfo ||
      msg?.imageMessage?.contextInfo ||
      msg?.videoMessage?.contextInfo

    const quoted = context?.quotedMessage

    const imageMessage =
      msg?.imageMessage ||
      msg?.ephemeralMessage?.message?.imageMessage ||
      quoted?.imageMessage ||
      quoted?.ephemeralMessage?.message?.imageMessage

    if (!imageMessage) {
      return sock.sendMessage(from, {
        text:
          '🖼️ *MEJORAR IMAGEN A HD*\n\n' +
          '• Envía una imagen con `.hd` en el pie de foto.\n' +
          '• O responde a una imagen con `.hd`.'
      }, { quoted: m })
    }

    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    // Descargar la imagen desde WhatsApp
    const stream = await downloadContentFromMessage(imageMessage, 'image')
    const chunks = []

    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)

    if (!buffer.length) {
      throw new Error('La imagen está vacía')
    }

    if (buffer.length > 15 * 1024 * 1024) {
      throw new Error('La imagen supera el límite de 15 MB')
    }

    // Subir la imagen para obtener una URL pública
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, {
      filename: 'imagen.jpg',
      contentType: 'image/jpeg'
    })

    const uploadResponse = await axios.post(UPLOAD_URL, form, {
      headers: form.getHeaders(),
      timeout: 60000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    })

    const imageUrl = String(uploadResponse.data || '').trim()

    if (!/^https:\/\/files\.catbox\.moe\/[\w.-]+$/i.test(imageUrl)) {
      throw new Error('No se pudo obtener una URL pública')
    }

    // Solicitar la mejora HD
    const response = await axios.get(API_URL, {
      params: { image: imageUrl },
      timeout: 120000
    })

    const resultUrl = response.data?.result?.image_upscaled

    if (!response.data?.status || !resultUrl) {
      throw new Error('La API no devolvió la imagen mejorada')
    }

    // Enviar la imagen mejorada
    await sock.sendMessage(from, {
      image: { url: resultUrl },
      caption: '✨ *IMAGEN MEJORADA A HD*\n\n> Procesada por Tibu Bot.'
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    let message = '❌ *NO SE PUDO MEJORAR LA IMAGEN.*'

    if (error.response?.status === 429) {
      message += '\n\nLa API recibió demasiadas solicitudes.'
    } else if (error.code === 'ECONNABORTED') {
      message += '\n\nLa solicitud tardó demasiado. Intenta de nuevo.'
    } else if (error.message?.includes('15 MB')) {
      message += '\n\nLa imagen supera el límite de 15 MB.'
    } else if (error.message?.includes('URL pública')) {
      message += '\n\nNo se pudo alojar la imagen temporalmente.'
    }

    await sock.sendMessage(from, {
      text: message
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['hd', 'enhance', 'upscale']
handler.help = ['hd']
handler.tags = ['herramientas']
handler.menu = true

export default handler