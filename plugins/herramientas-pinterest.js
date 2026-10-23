import axios from 'axios'

const API_URL = 'https://api-faa.my.id/faa/pinterest'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const query = args.join(' ').trim()

  if (!query) {
    return sock.sendMessage(from, {
      text: '📌 *ESCRIBE LO QUE QUIERES BUSCAR*\n\n> Ejemplo: .pin Neymar'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '🔎', key: m.key }
    })

    const response = await axios.get(API_URL, {
      params: { q: query },
      timeout: 60000
    })

    const data = response.data
    const images = data?.result

    if (!data?.status || !Array.isArray(images) || images.length === 0) {
      await sock.sendMessage(from, {
        text: '❌ *NO SE ENCONTRARON IMÁGENES.*'
      }, { quoted: m })

      await sock.sendMessage(from, {
        react: { text: '❌', key: m.key }
      })

      return
    }

    // Limitar el envío para evitar sobrecargar WhatsApp
    const selectedImages = images
      .filter(url => typeof url === 'string' && /^https?:\/\//i.test(url))
      .slice(0, 10)

    if (!selectedImages.length) {
      throw new Error('No hay enlaces de imágenes válidos')
    }

    // Enviar las imágenes sin texto individual
    for (let i = 0; i < selectedImages.length; i += 1) {
      await sock.sendMessage(from, {
        image: { url: selectedImages[i] }
      }, { quoted: i === 0 ? m : undefined })
    }

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    console.error(
      '[PINTEREST]',
      error.response?.status || error.code || error.message
    )

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    let message = '❌ *NO SE PUDIERON OBTENER LAS IMÁGENES.*'

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = '⏳ *LA API TARDÓ DEMASIADO. INTENTA DE NUEVO.*'
    } else if (error.response?.status === 429) {
      message = '⏳ *LA API RECIBIÓ DEMASIADAS SOLICITUDES.*'
    }

    await sock.sendMessage(from, {
      text: message
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['pin', 'pinterest']
handler.help = ['pin <búsqueda>']
handler.tags = ['descargas']
handler.menu = true

export default handler