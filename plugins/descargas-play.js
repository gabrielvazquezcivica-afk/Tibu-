
import axios from 'axios'
import yts from 'yt-search'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const query = args.join(' ').trim()

  if (!query) {
    return sock.sendMessage(from, {
      text: '🎵 `ESCRIBE EL NOMBRE DE LA CANCIÓN`\n\n> Ejemplo: .play IMU'
    }, { quoted: m })
  }

  if (API_KEY === 'PEGA_AQUI_TU_API_KEY' || !API_KEY) {
    return sock.sendMessage(from, {
      text: '❌ `CONFIGURA TU API KEY EN play.js`'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '🔎', key: m.key }
    })

    const search = await yts(query)
    const video = search.videos?.[0]

    if (!video) {
      return sock.sendMessage(from, {
        text: '❌ `NO ENCONTRÉ RESULTADOS`'
      }, { quoted: m })
    }

    const portadaPromise = sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption:
        '╭───────────────────────╮\n' +
        '│      🎵 REPRODUCCIÓN\n' +
        '╰───────────────────────╯\n\n' +
        `📀 Título: \`${video.title}\`\n` +
        `👤 Artista: \`${video.author?.name || 'Desconocido'}\`\n` +
        `⏱️ Duración: \`${video.duration || 'Desconocida'}\`\n` +
        `👁️ Vistas: \`${Number(video.views || 0).toLocaleString()}\`\n\n` +
        `🔗 ${video.url}\n\n` +
        '▸ `Preparando audio...`'
    }, { quoted: m })

    const responsePromise = axios.get(
      'https://api.lempi.lat/dl/yta',
      {
        params: {
          url: video.url,
          apikey: API_KEY
        },
        timeout: 60000
      }
    )

    const [response] = await Promise.all([
      responsePromise,
      portadaPromise
    ])

    const data = response.data

    if (!data?.status) {
      return sock.sendMessage(from, {
        text: '❌ `NO SE PUDO OBTENER EL AUDIO. INTENTA MÁS TARDE.`'
      }, { quoted: m })
    }

    const audioUrl =
      data?.datos?.url ||
      data?.resultado?.url ||
      data?.datos?.downloadUrl ||
      data?.resultado?.downloadUrl ||
      data?.datos?.download ||
      data?.resultado?.download

    if (typeof audioUrl !== 'string' || !audioUrl) {
      return sock.sendMessage(from, {
        text: '❌ `LA API NO DEVOLVIÓ EL ENLACE DEL AUDIO`'
      }, { quoted: m })
    }

    await sock.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4',
      fileName: `${video.title.replace(/[\\/:*?"<>|]/g, '_')}.m4a`,
      ptt: false
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    console.error('[PLAY]', error.code || error.message)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    const mensaje = error.code === 'EHOSTUNREACH' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED'
        ? '⏳ `EL SERVICIO DE DESCARGA NO ESTÁ DISPONIBLE. INTENTA MÁS TARDE.`'
        : error.response?.status === 401
          ? '❌ `LA API KEY FUE RECHAZADA`'
          : '❌ `NO SE PUDO PROCESAR EL AUDIO`'

    await sock.sendMessage(from, {
      text: mensaje
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['play', 'mp3', 'musica']
handler.help = ['play <canción>']
handler.tags = ['descargas']
handler.menu = true

export default handler
