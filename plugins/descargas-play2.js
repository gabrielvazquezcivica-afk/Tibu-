import yts from 'yt-search'

const API_URL = 'https://api.lempi.lat/dl/ytv'
const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

const handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return await sock.sendMessage(
            from,
            {
                text:
`🎬 *PLAY2*

Escribe el nombre del video.

📌 *Ejemplo:*
.play2 Maluma

> TIBU`
            },
            { quoted: m }
        )
    }

    try {
        // Reacción mientras busca
        await sock.sendMessage(from, {
            react: {
                text: '🕒',
                key: m.key
            }
        })

        // Buscar en YouTube
        const search = await yts(text)

        if (!search?.videos?.length) {
            await sock.sendMessage(from, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return await sock.sendMessage(
                from,
                {
                    text: '❌ *No encontré resultados.*'
                },
                { quoted: m }
            )
        }

        const video = search.videos[0]

        // API de Lempi
        const api =
            `${API_URL}?url=${encodeURIComponent(video.url)}` +
            `&apikey=${encodeURIComponent(API_KEY)}`

        const response = await fetch(api, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`API respondió con HTTP ${response.status}`)
        }

        const data = await response.json()



        if (
            !data?.status ||
            !data?.datos?.url
        ) {
            throw new Error(
                data?.message ||
                'La API no devolvió el video'
            )
        }

        const yt = data.datos

        const info =
`┌──────────────
│ 🎬 *PLAY2*
├──────────────
│ 🎵 ${data.titulo || video.title}
│ 👤 ${data.canal || video.author?.name || 'Desconocido'}
│ ⏱️ ${data.duracion || video.timestamp}
│ 👀 ${video.views?.toLocaleString() || '0'} vistas
│ 📺 ${yt.calidad || '360p'}
│ 💾 ${yt.tamaño || 'Desconocido'}
└──────────────`

        // Enviar video
        await sock.sendMessage(
            from,
            {
                video: {
                    url: yt.url
                },
                mimetype: 'video/mp4',
                fileName: yt.archivo || `${data.titulo || video.title}.mp4`,
                caption: info
            },
            { quoted: m }
        )

        // Reacción final
        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (error) {
        console.error('PLAY2 ERROR:', error)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
`❌ *Error al descargar el video.*

${error.message || error}

> TIBU`
            },
            { quoted: m }
        )
    }
}

handler.command = ['play2']
handler.help = ['play2 <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler