import axios from 'axios'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

global.playlistCache = global.playlistCache || {}

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(from, {
            text:
`🎵 PLAYLIST

Busca canciones en YouTube.

Ejemplo:
.playlist mc davo`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        const url =
            `https://api.lempi.lat/s/youtube?query=${encodeURIComponent(query)}&apikey=${API_KEY}`

        const response = await axios.get(url, {
            timeout: 30000
        })

        const data = response.data

        const allVideos =
            data?.datos?.results?.videos || []

        if (!allVideos.length) {
            return sock.sendMessage(from, {
                text: '❌ No encontré resultados.'
            }, { quoted: m })
        }

        const videos = allVideos.slice(0, 9)

        const emojis = [
            '1️⃣','2️⃣','3️⃣',
            '4️⃣','5️⃣','6️⃣',
            '7️⃣','8️⃣','9️⃣'
        ]

        let texto =
`🎵 RESULTADOS PARA: ${query.toUpperCase()}

`

        videos.forEach((v, i) => {

            texto +=
                `${emojis[i]} ${String(v.title || 'Sin título')}\n`

            if (v.duration) {
                texto += `> ⏱️ ${v.duration}\n\n`
            } else {
                texto += `\n`
            }
        })

        texto +=
            '🔄 Más resultados\n'

        texto +=
            '🎧 Reacciona con un número para descargar.'

        const msg =
            await sock.sendMessage(
                from,
                { text: texto },
                { quoted: m }
            )

        global.playlistCache[msg.key.id] = {
            query,
            page: 0,
            allVideos
        }

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.error('PLAYLIST ERROR:', e)

        await sock.sendMessage(from, {
            text: `❌ Error: ${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['playlist']
handler.help = ['playlist <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler