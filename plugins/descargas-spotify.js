import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(from, {
            text:
`🎵 \`SPOTIFY PLAY\`

✏️ Escribe el nombre de una canción o un enlace de Spotify.

Ejemplo:
.play Dakiti

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🎧',
                key: m.key
            }
        })

        const key = 'sasuke'

        let spotifyUrl = query

        if (!query.includes('spotify.com/track/')) {

            const { data: search } = await axios.get(
                `https://api.evogb.org/search/spotify?query=${encodeURIComponent(query)}&key=${key}`
            )

            if (
                !search?.status ||
                !search?.result?.length
            ) {
                throw new Error(
                    'No encontré resultados'
                )
            }

            spotifyUrl = search.result[0].link
        }

        const { data } = await axios.get(
            `https://api.evogb.org/dl/spotify?url=${encodeURIComponent(spotifyUrl)}&key=${key}`
        )

        if (
            !data?.status ||
            !data?.data?.url
        ) {
            throw new Error(
                data?.message ||
                'No se pudo descargar'
            )
        }

        const song = data.data

        await sock.sendMessage(from, {
            image: {
                url: song.imageHD || song.image
            },
            caption:
`🎵 *SPOTIFY PLAY*

📀 Título: ${song.name || 'Desconocido'}
🎤 Artista: ${song.artist || 'Desconocido'}
💿 Álbum: ${song.album || 'Desconocido'}
⏱️ Duración: ${song.duration || 'Desconocida'}

> ${config.BOT_NAME}`
        }, { quoted: m })

        await sock.sendMessage(from, {
            audio: {
                url: song.url
            },
            mimetype: 'audio/mpeg',
            fileName: `${song.name || 'spotify'}.mp3`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '🔥',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'SPOTIFY ERROR:',
            e.response?.data || e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`No pude descargar la canción\`

${e.response?.data?.message || e.message}

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['spotify','song','sp']
handler.help = ['spotify <canción>']
handler.tags = ['descargas']
handler.menu = true

export default handler