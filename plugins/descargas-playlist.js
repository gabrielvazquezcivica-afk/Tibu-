import yts from 'yt-search'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🎵 \`PLAYLIST YOUTUBE\`

Busca canciones o videos en YouTube y descarga el audio automáticamente al seleccionar un resultado.

📌 Ejemplo:
.playlist Bad Bunny
.playlist Grupo Frontera
.playlist Imagine Dragons

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        const result = await yts(text)
        const videos = result.videos.slice(0, 15)

        if (!videos.length) {
            return sock.sendMessage(from, {
                text:
'`❌ No encontré resultados para tu búsqueda`'
            }, { quoted: m })
        }

        const sections = [{
            title: `🎵 RESULTADOS DE: ${text}`,
            rows: videos.map(v => ({
                title: v.title,
                description:
`⏱️ ${v.timestamp} • 👤 ${v.author.name}`,
                id: `.ytmp3 ${v.url}`
            }))
        }]

        await sock.sendList(
            from,
            '🎵 PLAYLIST YOUTUBE',
            `Se encontraron ${videos.length} resultados.\n\nSelecciona una canción para descargar el audio.`,
            'SELECCIONAR',
            sections,
            m
        )

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'PLAYLIST ERROR:',
            e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`ERROR\`

No pude realizar la búsqueda.

${e.message}

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['playlist']
handler.help = ['playlist <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler