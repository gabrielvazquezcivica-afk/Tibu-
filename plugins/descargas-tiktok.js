import axios from 'axios'
import config from '../config.js'

async function tiktokScraper(url) {
    try {
        const key64 = 'c2FzdWtl'

        const decodedKey = Buffer
            .from(key64, 'base64')
            .toString('utf-8')

        const { data } = await axios.get(
            `https://api.evogb.org/dl/tiktok?url=${encodeURIComponent(url)}&key=${decodedKey}`
        )

        if (!data.status) {
            return { status: false }
        }

        return {
            status: true,
            title: data.data.title,
            author: data.data.author.nickname,
            user: data.data.author.unique_id,
            duration: data.data.duration,
            likes: data.data.stats.likes,
            shares: data.data.stats.shares,
            comments: data.data.stats.comments || 0,
            views: data.data.stats.views || 0,
            download: data.data.dl
        }

    } catch (e) {
        console.log('TT ERROR:', e)
        return { status: false }
    }
}

let handler = {}

handler.run = async ({
    sock,
    m,
    from,
    args
}) => {

    let query = args.join(' ').trim()

    // Responder a mensaje con link
    if (!query) {
        const quoted =
            m.message?.extendedTextMessage
                ?.contextInfo
                ?.quotedMessage

        query =
            quoted?.conversation ||
            quoted?.extendedTextMessage?.text ||
            ''
    }

    if (!query) {
        return sock.sendMessage(from, {
            text:
`🎵 *TIKTOK DOWNLOADER*

> Envía un enlace de TikTok

> Ejemplo:
> .tt https://vm.tiktok.com/xxxxx

> También puedes responder a un mensaje con el enlace

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '⏳',
            key: m.key
        }
    })

    const res = await tiktokScraper(query)

    if (!res.status) {

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text:
`❌ No pude descargar el TikTok.

> Verifica que el enlace sea válido.

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const info =
`╭━━━〔 🎵 TIKTOK 〕━━⬣
┃
┃ 📝 Título:
┃ ${res.title?.slice(0, 100) || 'Sin título'}
┃
┃ 👤 Autor:
┃ ${res.author} (@${res.user})
┃
┃ ⏱️ Duración:
┃ ${res.duration}
┃
┃ 👀 Reproducciones:
┃ ${Number(res.views).toLocaleString()}
┃
┃ ❤️ Likes:
┃ ${Number(res.likes).toLocaleString()}
┃
┃ 💬 Comentarios:
┃ ${Number(res.comments).toLocaleString()}
┃
┃ 🔄 Compartidos:
┃ ${Number(res.shares).toLocaleString()}
┃
╰━━━━━━━━━━━━━━⬣

> ${config.BOT_NAME}`

    await sock.sendMessage(from, {
        video: {
            url: res.download
        },
        mimetype: 'video/mp4',
        fileName: 'tibu-tiktok.mp4',
        caption: info
    }, {
        quoted: m
    })

    await sock.sendMessage(from, {
        react: {
            text: '✅',
            key: m.key
        }
    })
}

handler.command = ['tt', 'tiktok']
handler.help = ['tt <link>']
handler.tags = ['descargas']
handler.menu = true

export default handler