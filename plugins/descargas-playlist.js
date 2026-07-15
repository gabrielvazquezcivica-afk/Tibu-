import yts from 'yt-search'
import config from '../config.js'
import { sendList } from '../lib/sendList.js'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🎵 \`PLAYLIST\`

Busca canciones en YouTube.

Ejemplos:
.playlist bad bunny
.playlist peso pluma
.playlist grupo frontera

Selecciona una canción y descarga:
• Audio MP3
• Video MP4

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

        const videos =
            result.videos
            .filter(v => v.seconds > 0)
            .slice(0, 10)

        if (!videos.length) {
            return sock.sendMessage(from, {
                text: '`❌ No encontré resultados`'
            }, { quoted: m })
        }

        const sections = []

        for (const v of videos) {

            sections.push({
                title: v.title.substring(0, 60),
                rows: [
                    {
                        title: '🎵 Descargar Audio',
                        description:
                            `Duración: ${v.timestamp}`,
                        id:
                            `.ytmp3 ${v.url}`
                    },
                    {
                        title: '🎥 Descargar Video',
                        description:
                            `Duración: ${v.timestamp}`,
                        id:
                            `.ytmp4 ${v.url}`
                    }
                ]
            })
        }

        await sendList(
            sock,
            from,
            '🎵 TIBU PLAYLIST',
            `🔎 Búsqueda:\n> ${text}\n\nSelecciona una canción:`,
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
`❌ Error al buscar canciones

${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['playlist']
handler.help = ['playlist <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler