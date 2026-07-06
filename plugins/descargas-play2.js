import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🎬 Escribe el nombre del video

Ejemplo:
.play2 Maluma`
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: { text: '🕒', key: m.key }
    })

    try {

        const search = await yts(text)

        if (!search.videos.length) {
            await sock.sendMessage(from, {
                react: { text: '❌', key: m.key }
            })

            return sock.sendMessage(from, {
                text: '`❌ No encontré resultados.`'
            }, { quoted: m })
        }

        const video = search.videos[0]

        const api =
`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(video.url)}&format=360p`

        const res = await fetch(api)
        const json = await res.json()

        if (!json.status || !json.data) {
            throw new Error('API ERROR')
        }

        const yt = json.data

        const info =
`┌─────────────┐
│ 🎬 PLAY2
├──────────────┤
│ 🎵 ${yt.title}
│ 👤 ${yt.author}
│ ⏱️ ${video.timestamp}
│ 👀 ${video.views.toLocaleString()} vistas
└──────────────────────┘`

        await sock.sendMessage(from, {
    video: {
        url: yt.download
    },
    mimetype: 'video/mp4',
    fileName: `${yt.title}.mp4`,
    caption: info
}, { quoted: m })

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

    } catch (e) {

        console.log('PLAY2 ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ Error al descargar el video.`'
        }, { quoted: m })
    }
}

handler.command = ['play2']
handler.help = ['play2 <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler