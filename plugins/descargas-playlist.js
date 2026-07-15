import yts from 'yt-search'
import { sendList } from '../lib/sendList.js'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(from, {
            text:
`🎵 \`PLAYLIST\`

Busca canciones o videos de YouTube.

Ejemplo:
.playlist mc davo
.playlist canserbero
.playlist bad bunny

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

        console.log('BUSCANDO:', query)

        const result = await yts(query)

        const videos = result.videos.slice(0, 10)

        console.log('VIDEOS:', videos.length)

        if (!videos.length) {
            return sock.sendMessage(from, {
                text: '`❌ No encontré resultados`'
            }, { quoted: m })
        }

        const sections = [
            {
                title: '🎵 RESULTADOS',
                rows: videos.map(v => ({
                    header: 'YOUTUBE',
                    title: v.title,
                    description: `${v.timestamp} • ${v.author.name}`,
                    id: `.ytmp3 ${v.url}`
                }))
            }
        ]

        await sendList(
            sock,
            from,
            'TIBU BOT',
            `🔎 Resultados para: ${query}`,
            'ABRIR RESULTADOS',
            sections
        )

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('PLAYLIST ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ Error al buscar

${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['playlist']
handler.help = ['playlist <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler