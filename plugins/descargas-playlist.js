import yts from 'yt-search'
import config from '../config.js'
import { sendList } from '../lib/sendList.js'

let handler = {}

handler.run = async (
    sock,
    m,
    args
) => {

    const from =
        m.key.remoteJid

    const text =
        args.join(' ').trim()

    if (!text) {

        return sock.sendMessage(
            from,
            {
                text:
`🎵 PLAYLIST

Ejemplo:
.playlist bad bunny

> ${config.BOT_NAME}`
            },
            { quoted: m }
        )
    }

    try {

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🔎',
                    key: m.key
                }
            }
        )

        console.log(
            'BUSCANDO:',
            text
        )

        const result =
            await yts(text)

        console.log(
            'VIDEOS:',
            result.videos.length
        )

        const videos =
            result.videos
            .filter(
                v => v.seconds > 0
            )
            .slice(0, 10)

        console.log(
            'VIDEOS FILTRADOS:',
            videos.length
        )

        if (!videos.length) {

            return sock.sendMessage(
                from,
                {
                    text:
'❌ No encontré resultados'
                },
                { quoted: m }
            )
        }

        const sections = []

        for (const v of videos) {

            sections.push({

                title:
                    v.title.substring(
                        0,
                        60
                    ),

                rows: [
                    {
                        title:
                        '🎵 Descargar Audio',

                        description:
                        `Duración: ${v.timestamp}`,

                        id:
                        `.ytmp3 ${v.url}`
                    },

                    {
                        title:
                        '🎥 Descargar Video',

                        description:
                        `Duración: ${v.timestamp}`,

                        id:
                        `.ytmp4 ${v.url}`
                    }
                ]

            })
        }

        console.log(
            'PASO 1'
        )

        console.log(
            sections.length
        )

        await sendList(
            sock,
            from,
            '🎵 TIBU PLAYLIST',
            `🔎 Búsqueda:\n> ${text}`,
            'ABRIR RESULTADOS',
            sections
        )

        console.log(
            'PASO 2'
        )

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '✅',
                    key: m.key
                }
            }
        )

    } catch (e) {

        console.log(
            'PLAYLIST ERROR:',
            e
        )

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '❌',
                    key: m.key
                }
            }
        )

        await sock.sendMessage(
            from,
            {
                text:
`❌ Error

${e.message}`
            },
            { quoted: m }
        )
    }
}

handler.command = ['playlist']

export default handler