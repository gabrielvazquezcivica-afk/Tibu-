import yts from 'yt-search'
import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = {}

async function sendPlaylistButtons(sock, jid, resultados) {

    const buttons = resultados.map((v, i) => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: `${i + 1}. ${v.title.substring(0, 45)}`,
            id: `.ytmp3 ${v.url}`
        })
    }))

    const msg = generateWAMessageFromContent(
        jid,
        {
            interactiveMessage: proto.Message.InteractiveMessage.create({
                body: {
                    text:
`🎵 PLAYLIST YOUTUBE

Selecciona una canción para descargar en MP3`
                },
                footer: {
                    text: 'Tibu Bot'
                },
                nativeFlowMessage: {
                    buttons
                }
            })
        },
        {}
    )

    await sock.relayMessage(
        jid,
        msg.message,
        { messageId: msg.key.id }
    )
}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🎵 \`PLAYLIST\`

Busca canciones en YouTube.

Ejemplo:
.playlist bad bunny

Al tocar una canción se descargará automáticamente con .ytmp3`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        const search = await yts(text)

        const videos =
            search.videos
            .filter(v => v.seconds > 0)
            .slice(0, 10)

        if (!videos.length) {
            return sock.sendMessage(from, {
                text: '`❌ No encontré resultados`'
            }, { quoted: m })
        }

        try {

    await sendPlaylistButtons(
        sock,
        from,
        videos
    )

} catch (e) {

    console.log(
        'BOTONES ERROR:',
        e
    )

    await sock.sendMessage(from, {
        text:
`❌ Error al enviar botones

${e.message || e}`
    }, { quoted: m })
}

        await sock.sendMessage(from, {
            react: {
                text: '🎵',
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
'`❌ Error al buscar canciones`'
        }, { quoted: m })
    }
}

handler.command = ['playlist']
handler.help = ['playlist <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler