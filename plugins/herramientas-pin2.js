import axios from 'axios'

const API_URL = 'https://api-faa.my.id/faa/pin-down'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const input = args.join(' ').trim()

  if (!input) {
    return sock.sendMessage(from, {
      text: '📌 *DESCARGADOR DE PINTEREST*\n\n' +
        'Envía el enlace de un pin para descargarlo.\n\n' +
        '*Ejemplo:*\n.pin2 https://pin.it/ejemplo'
    }, { quoted: m })
  }

  if (!/^https?:\/\//i.test(input)) {
    return sock.sendMessage(from, {
      text: '❌ *ENLACE NO VÁLIDO*\n\nEnvía una URL válida de Pinterest.'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    const response = await axios.get(API_URL, {
      params: { url: input },
      timeout: 60000
    })

    const data = response.data
    const result = data?.result

    if (
      !data?.status ||
      !Array.isArray(result?.medias) ||
      result.medias.length === 0
    ) {
      throw new Error('No se encontraron archivos descargables')
    }

    const title = result.title?.trim() || 'Sin título'
    const description = result.description?.trim() || 'Sin descripción'
    const thumbnail = result.thumbnail
    const medias = result.medias.filter(media =>
      media &&
      typeof media.url === 'string' &&
      /^https?:\/\//i.test(media.url)
    )

    if (!medias.length) {
      throw new Error('No hay enlaces de descarga válidos')
    }

    // Enviar la información del pin
    const info =
      `📌 *PINTEREST DOWNLOADER*\n\n` +
      `📖 *Título:* ${title}\n` +
      `📝 *Descripción:* ${description}\n` +
      `📦 *Archivos encontrados:* ${medias.length}\n\n` +
      `> Descargando contenido...`

    if (thumbnail && /^https?:\/\//i.test(thumbnail)) {
      await sock.sendMessage(from, {
        image: { url: thumbnail },
        caption: info
      }, { quoted: m })
    } else {
      await sock.sendMessage(from, {
        text: info
      }, { quoted: m })
    }

    // Descargar y enviar cada archivo encontrado
    for (const media of medias) {
      const type = media.type?.toLowerCase()
      const ext = media.ext?.toLowerCase() || 'bin'

      const caption =
        `📥 *Archivo de Pinterest*\n` +
        `🎞️ *Tipo:* ${type || 'Desconocido'}\n` +
        `✨ *Calidad:* ${media.quality || 'Original'}\n` +
        `📁 *Formato:* ${ext}`

      if (type === 'image') {
        await sock.sendMessage(from, {
          image: { url: media.url },
          caption
        }, { quoted: m })

      } else if (type === 'video') {
        await sock.sendMessage(from, {
          video: { url: media.url },
          mimetype: 'video/mp4',
          caption
        }, { quoted: m })

      } else {
        // Para otros formatos, enviarlo como documento
        await sock.sendMessage(from, {
          document: { url: media.url },
          mimetype: 'application/octet-stream',
          fileName: `pinterest.${ext}`,
          caption
        }, { quoted: m })
      }
    }

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    let message = '❌ *NO SE PUDO DESCARGAR EL CONTENIDO DE PINTEREST.*'

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

handler.command = ['pin2', 'pindown']
handler.help = ['pin2 <url de Pinterest>']
handler.tags = ['descargas']
handler.menu = true

export default handler