import config from '../config.js'
import yts from 'yt-search'
import axios from 'axios'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        await sock.sendMessage(from, {
            react: { text: '🎵', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                '`🎵 Escribe una canción para buscar`\n\n' +
                'Ej:\n.play Bad Bunny'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: { text: '🎧', key: m.key }
    })

    try {
        const search = await yts(text)

        if (!search?.videos?.length) {
            await sock.sendMessage(from, {
                react: { text: '❌', key: m.key }
            })

            return sock.sendMessage(from, {
                text: '`❌ No encontré resultados`'
            }, { quoted: m })
        }

        const video = search.videos[0]

        const {
            title,
            url,
            thumbnail,
            timestamp,
            views,
            author
        } = video

        const api =
            `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(url)}`

        const { data } = await axios.get(api)

        if (!data?.status || !data?.data?.download) {
            throw new Error('API inválida')
        }

        const audio =
            data.data.download?.url ||
            data.data.download

        const caption =
`╭──────────────⬣
│ 𝐓𝐈𝐁𝐔 𝐏𝐋𝐀𝐘 🎧
├──────────────
│ 🎵 ${title}
│
│ 👤 ${author?.name || 'Desconocido'}
│
│ ⏱ ${timestamp}
│
│ 👁 ${views.toLocaleString()}
│
│ 📥 Descargando...
╰──────────────⬣
> ${config.BOT_NAME}`

        await sock.sendMessage(from, {
            image: { url: thumbnail },
            caption
        }, { quoted: m })

        await sock.sendMessage(from, {
            audio: { url: audio },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

    } catch (e) {
        console.log('PLAY ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ Error al descargar la canción`'
        }, { quoted: m })
    }
}

handler.command = ['play']
handler.help = ['play <texto>']
handler.tags = ['descargas']
handler.menu = true

export default handler