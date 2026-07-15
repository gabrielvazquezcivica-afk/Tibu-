import yts from 'yt-search'

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

        const result = await yts(query)

        const allVideos = result.videos

        if (!allVideos.length) {
            return sock.sendMessage(from, {
                text: '❌ No encontré resultados'
            }, { quoted: m })
        }

        const videos = allVideos.slice(0, 9)

        let texto = `🎵 RESULTADOS PARA: ${query.toUpperCase()}\n\n`

        const emojis = [
            '1️⃣','2️⃣','3️⃣',
            '4️⃣','5️⃣','6️⃣',
            '7️⃣','8️⃣','9️⃣'
        ]

        videos.forEach((v, i) => {
            texto += `${emojis[i]} ${v.title}\n`
            texto += `> ⏱️ ${v.timestamp}\n\n`
        })

        texto += '🔄 Más resultados\n'
        texto += '🎧 Reacciona con un número para descargar.'

        const msg = await sock.sendMessage(from, {
            text: texto
        }, { quoted: m })

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

        console.log('PLAYLIST ERROR:', e)

        await sock.sendMessage(from, {
            text: `❌ ${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['playlist']
handler.help = ['playlist <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler