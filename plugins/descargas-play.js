import axios from 'axios'

const API_URL = 'https://api-faa.my.id/faa/ytplay'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const query = args.join(' ').trim()

  if (!query) {
    return sock.sendMessage(from, {
      text: '🎵 *ESCRIBE EL NOMBRE DE LA CANCIÓN*\n\n> Ejemplo: .play IMU'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '🔎', key: m.key }
    })

    // Buscar la canción y obtener el enlace del MP3
    const response = await axios.get(API_URL, {
      params: { query },
      timeout: 60000
    })

    const data = response.data
    const song = data?.result

    if (!data?.status || !song?.mp3) {
      await sock.sendMessage(from, {
        text: '❌ *NO SE ENCONTRÓ LA CANCIÓN O NO SE OBTUVO EL MP3.*'
      }, { quoted: m })

      await sock.sendMessage(from, {
        react: { text: '❌', key: m.key }
      })
      return
    }

    const title = song.title || query
    const author = song.author || 'Desconocido'

    const duration = song.duration_timestamp ||
      (typeof song.duration === 'number'
        ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}`
        : 'Desconocida')

    const views = Number(song.views || 0).toLocaleString('es-MX')
    const thumbnail = song.thumbnail
    const videoUrl = song.url || ''

    const caption =
      '╭━━━〔 🎵 REPRODUCCIÓN 〕━━━╮\n' +
      `│ 📀 Título: ${title}\n` +
      `│ 👤 Artista: ${author}\n` +
      `│ ⏱️ Duración: ${duration}\n` +
      `│ 👁️ Vistas: ${views}\n` +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      (videoUrl ? `🔗 ${videoUrl}\n\n` : '') +
      '▸ Preparando audio...'

    // Enviar la tarjeta de información
    if (thumbnail) {
      try {
        await sock.sendMessage(from, {
          image: { url: thumbnail },
          caption
        }, { quoted: m })
      } catch {
        await sock.sendMessage(from, {
          text: caption
        }, { quoted: m })
      }
    } else {
      await sock.sendMessage(from, {
        text: caption
      }, { quoted: m })
    }

    // Descargar el MP3 desde la URL proporcionada por API Faa
    const audioResponse = await axios.get(song.mp3, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024
    })

    const audio = Buffer.from(audioResponse.data)

    if (!audio.length) {
      throw new Error('El archivo de audio está vacío')
    }

    const fileName = `${title}`
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 150) + '.mp3'

    // Enviar el audio directamente al chat
    await sock.sendMessage(from, {
      audio,
      mimetype: 'audio/mpeg',
      fileName,
      ptt: false
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    console.error(
      '[PLAY]',
      error.response?.status || error.code || error.message
    )

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    let message = '❌ *NO SE PUDO PROCESAR EL AUDIO. INTENTA MÁS TARDE.*'

    if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      message = '⏳ *LA API TARDÓ DEMASIADO. INTENTA DE NUEVO.*'
    } else if (error.response?.status === 429) {
      message = '⏳ *LA API ESTÁ RECIBIENDO DEMASIADAS SOLICITUDES.*'
    } else if (error.response?.status >= 500) {
      message = '⚠️ *EL SERVICIO DE AUDIO NO ESTÁ DISPONIBLE.*'
    }

    await sock.sendMessage(from, {
      text: message
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['play', 'mp3', 'musica']
handler.help = ['play <canción>']
handler.tags = ['descargas']
handler.menu = true

export default handler