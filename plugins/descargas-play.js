
import axios from 'axios'
import yts from 'yt-search'

const API_KEY = process.env.LEMPI_API_KEY || 'PON_AQUI_TU_API_KEY'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const query = args.join(' ').trim()

  if (!query) {
    return sock.sendMessage(from, {
      text: '🎵 `ESCRIBE EL NOMBRE DE LA CANCIÓN`\n\n> Ejemplo: .play IMU'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '🔎', key: m.key }
    })

    // 1. Buscar la canción
    const search = await yts(query)
    const video = search.videos?.[0]

    if (!video) {
      return sock.sendMessage(from, {
        text: '❌ `NO ENCONTRÉ RESULTADOS PARA ESA BÚSQUEDA`'
      }, { quoted: m })
    }

    // 2. Iniciar la descarga de Lempi y enviar la portada
    // al mismo tiempo para ahorrar tiempo total.
    const apiPromise = axios.get(
      'https://api.lempi.lat/dl/yta',
      {
        params: {
          url: video.url,
          apikey: API_KEY
        },
        timeout: 45000
      }
    )

    const infoPromise = sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption:
        '╭───────────────────────╮\n' +
        '│      🎵 REPRODUCCIÓN\n' +
        '╰───────────────────────╯\n\n' +
        `📀 Título: \`${video.title}\`\n` +
        `👤 Artista: \`${video.author?.name || 'Desconocido'}\`\n` +
        `⏱️ Duración: \`${video.duration || 'Desconocida'}\`\n` +
        `👁️ Vistas: \`${Number(video.views || 0).toLocaleString()}\`\n` +
        `📅 Fecha: \`${video.uploadDate || 'Desconocida'}\`\n\n` +
        `🔗 ${video.url}\n\n` +
        '▸ `Preparando audio...`'
    }, { quoted: m })

    // Esperar las dos operaciones en paralelo
    const [apiResponse] = await Promise.all([
      apiPromise,
      infoPromise
    ])

    const data = apiResponse.data

    if (!data?.status) {
      console.error('LEMPi PLAY:', data)

      return sock.sendMessage(from, {
        text: '❌ `LA API NO PUDO PREPARAR ESTA CANCIÓN`'
      }, { quoted: m })
    }

    const audioUrl =
      data?.datos?.url ||
      data?.resultado?.url ||
      data?.datos?.downloadUrl ||
      data?.resultado?.downloadUrl

    if (!audioUrl || typeof audioUrl !== 'string') {
      console.error('RESPUESTA SIN AUDIO:', data)

      return sock.sendMessage(from, {
        text: '❌ `LA API NO DEVOLVIÓ UNA URL DE AUDIO`'
      }, { quoted: m })
    }

    // 3. Enviar usando la URL directamente.
    // Evita descargar el archivo completo en un Buffer
    // dentro de tu propio proceso antes de enviarlo.
    await sock.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4',
      fileName: `${video.title}.m4a`,
      ptt: false
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    console.error(
      'PLAY ERROR:',
      error.response?.status || error.message
    )

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    const aviso = error.code === 'ECONNABORTED'
      ? '⏳ `LA API TARDÓ DEMASIADO. INTENTA DE NUEVO`'
      : '❌ `NO SE PUDO ENVIAR EL AUDIO. INTENTA NUEVAMENTE`'

    await sock.sendMessage(from, {
      text: aviso
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['play', 'mp3', 'musica']
handler.help = ['play <canción>']
handler.tags = ['descargas']
handler.menu = true

export default handler
