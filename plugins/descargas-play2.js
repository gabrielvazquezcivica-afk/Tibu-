import yts from 'yt-search'

const API_URL = 'https://api.evogb.org/dl/ytmp4'
const API_KEY = process.env.EVOGB_API_KEY || 'TU_API_KEY'

const handler = {}

handler.run = async (sock, m, args = []) => {
    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text: `🎬 *PLAY2*

Escribe el nombre o enlace del video.

📌 *Ejemplo:*
.play2 Maluma

> TIBU`
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🔎', key: m.key }
        })

        let video

        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(text)) {
            const videoUrl = text.startsWith('http') ? text : `https://${text}`
            video = { url: videoUrl, title: 'Video de YouTube' }
        } else {
            const search = await yts(text)

            if (!search?.videos?.length) {
                throw new Error('No encontré resultados en YouTube.')
            }

            video = search.videos[0]
        }

        const api = new URL(API_URL)
        api.searchParams.set('key', API_KEY)
        api.searchParams.set('url', video.url)
        api.searchParams.set('quality', '720')

        const response = await fetch(api, {
            signal: AbortSignal.timeout(60000)
        })

        if (!response.ok) {
            throw new Error(`La API respondió HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data?.status || !data?.data?.download_url) {
            throw new Error(data?.message || 'La API no devolvió el enlace de descarga.')
        }

        const downloadUrl = data.data.download_url
        const filename = data.data.filename || 'video.mp4'

        const info =
`┌──────────────
│ 🎬 *PLAY2*
├──────────────
│ 🎵 ${video.title}
│ 📺 Calidad: 720p
│ 💾 Archivo: ${filename}
└──────────────`

        await sock.sendMessage(from, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            fileName: filename,
            caption: info
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

    } catch (error) {
        console.error('PLAY2 ERROR:', error)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: `❌ *Error al descargar el video.*\n\n${error.message || error}\n\n> TIBU`
        }, { quoted: m })
    }
}

handler.command = ['play2']
handler.help = ['play2 <texto o enlace>']
handler.tags = ['descargas']
handler.menu = true

export default handler