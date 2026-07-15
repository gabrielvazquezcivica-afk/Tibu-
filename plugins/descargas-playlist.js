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

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        console.log('PLAYLIST INICIO')

        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        console.log('BUSCANDO:', query)

        const result = await yts(query)

        console.log('RESULTADO OBTENIDO')

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
                    description: `${v.timestamp} • ${v.author?.name || 'Desconocido'}`,
                    id: `.ytmp3 ${v.url}`
                }))
            }
        ]

        console.log('SECCIONES CREADAS')
        console.log(JSON.stringify(sections, null, 2))

        console.log('ANTES DEL SENDLIST')

        await sendList(
            sock,
            from,
            'TIBU BOT',
            `🔎 Resultados para: ${query}`,
            'ABRIR RESULTADOS',
            sections
        )

        console.log('DESPUES DEL SENDLIST')

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('PLAYLIST ERROR:')
        console.log(e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ Error

${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['playlist']
handler.help = ['playlist <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler