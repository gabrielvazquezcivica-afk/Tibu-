import axios from 'axios'
import config from '../config.js'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(from, {
            text:
`╭─〔 🎵 SPOTIFY PLAY 〕─╮
│
│ ✏️ Escribe una canción
│    o un enlace de Spotify.
│
│ Ejemplo:
│ • .play Dakiti
│
╰──────────────────────╯
> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        // 🎧 INICIO
        await sock.sendMessage(from, {
            react: {
                text: '🎧',
                key: m.key
            }
        })

        let spotifyUrl = query

        // 🔎 BÚSQUEDA
        if (!query.includes('spotify.com/track/')) {

            const { data: search } = await axios.get(
                `https://api.lempi.lat/s/sp?q=${encodeURIComponent(query)}&limit=10&apikey=${encodeURIComponent(API_KEY)}`,
                { timeout: 30000 }
            )

            const canciones =
                search?.resultados?.canciones || []

            if (!search?.status || !canciones.length) {
                throw new Error(
                    'No encontré ninguna canción.'
                )
            }

            spotifyUrl = canciones[0].url
        }

        // 📥 DESCARGA
        const { data } = await axios.get(
            `https://api.lempi.lat/dl/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=${encodeURIComponent(API_KEY)}`,
            { timeout: 60000 }
        )

        if (!data?.status || !data?.datos?.url) {
            throw new Error(
                data?.mensaje ||
                data?.message ||
                'No se pudo descargar la canción.'
            )
        }

        const titulo =
            data.titulo || 'Desconocido'

        const artista =
            data.artista || 'Desconocido'

        const album =
            data.album || 'Desconocido'

        // ⏱️ DURACIÓN
        let duracion = 'Desconocida'

        if (typeof data.duracion === 'number') {

            const segundos =
                Math.floor(data.duracion)

            const minutos =
                Math.floor(segundos / 60)

            const seg =
                segundos % 60

            duracion =
                `${minutos}:${String(seg).padStart(2, '0')}`
        }

        // 🖼️ INFORMACIÓN
        await sock.sendMessage(from, {
            image: {
                url: data.miniatura
            },
            caption:
`╭─〔 🎵 SPOTIFY PLAY 〕─╮
│
│ 🎧 ${titulo}
│
│ 👤 ${artista}
│ 💿 ${album}
│ ⏱️ ${duracion}
│ 📦 ${data.datos.tamaño || 'Desconocido'}
│
╰──────────────────────╯
> ${config.BOT_NAME}`
        }, { quoted: m })

        // 📥 OBTENER MP3
        const audioResponse = await axios.get(
            data.datos.url,
            {
                responseType: 'arraybuffer',
                timeout: 120000
            }
        )

        const audioBuffer =
            Buffer.from(audioResponse.data)

        // 🎵 ENVIAR AUDIO
        await sock.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${titulo}.mp3`,
            ptt: false
        }, { quoted: m })

        // 🔥 COMPLETADO
        await sock.sendMessage(from, {
            react: {
                text: '🔥',
                key: m.key
            }
        })

    } catch (e) {

        console.error(
            'SPOTIFY ERROR:',
            e.response?.data || e.message
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`╭─〔 ❌ SPOTIFY 〕─╮
│
│ No pude descargar
│ la canción solicitada.
│
│ ${e.response?.data?.mensaje ||
   e.response?.data?.message ||
   e.message ||
   'Error desconocido.'}
│
╰──────────────────╯
> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = [
    'spotify',
    'song',
    'sp'
]

handler.help = [
    'spotify <canción>'
]

handler.tags = [
    'descargas'
]

handler.menu = true

export default handler