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

        if (!data?.status) {
            return { status: false }
        }

        return {
            status: true,
            title: data.data?.title || 'Sin título',
            author: data.data?.author?.nickname || 'Desconocido',
            user: data.data?.author?.unique_id || 'Desconocido',
            duration: data.data?.duration || 'Desconocido',
            likes: data.data?.stats?.likes || 0,
            comments: data.data?.stats?.comments || 0,
            shares: data.data?.stats?.shares || 0,
            views: data.data?.stats?.views || 0,
            download: data.data?.dl
        }

    } catch (e) {
        console.log('TT SCRAPER ERROR:', e)
        return { status: false }
    }
}

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    let query = (args || []).join(' ').trim()

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

        await sock.sendMessage(from, {
            react: {
                text: '🎵',
                key: m.key
            }
        })

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

    try {

        const res = await tiktokScraper(query)

        if (!res.status || !res.download) {

            await sock.sendMessage(from, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return sock.sendMessage(from, {
                text:
'`❌ No pude descargar el TikTok`'
            }, { quoted: m })
        }

        const caption =
`╭──────────────⬣
│ 𝐓𝐈𝐁𝐔 𝐓𝐈𝐊𝐓𝐎𝐊 🎵
├──────────────
│ 📝 ${res.title}
│
│ 👤 ${res.author}
│ 🆔 @${res.user}
│
│ ⏱ ${res.duration}
│
│ 👁 ${Number(res.views).toLocaleString()}
│
│ ❤️ ${Number(res.likes).toLocaleString()}
│
│ 💬 ${Number(res.comments).toLocaleString()}
│
│ 🔄 ${Number(res.shares).toLocaleString()}
│
│ 📥 Descargando...
╰──────────────⬣
> ${config.BOT_NAME}`

        await sock.sendMessage(from, {
            video: {
                url: res.download
            },
            mimetype: 'video/mp4',
            fileName: 'tibu-tiktok.mp4',
            caption
        }, {
            quoted: m
        })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('TT ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
'`❌ Error al descargar el TikTok`'
        }, { quoted: m })
    }
}

handler.command = ['tt', 'tiktok']
handler.help = ['tt <link>']
handler.tags = ['descargas']
handler.menu = true

export default handler