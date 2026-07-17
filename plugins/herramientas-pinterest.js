import axios from 'axios'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(from, {
            text:
`📌 PINTEREST

Busca imágenes en Pinterest.

Ejemplo:
.pin neymar`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        const apiTarget =
            'https://api.evogb.org/search/pinterest'

        const key =
            Buffer.from(
                'c2FzdWtl',
                'base64'
            ).toString('utf-8')

        const { data } = await axios.get(
            `${apiTarget}?query=${encodeURIComponent(query)}&key=${key}`
        )

        if (
            !data?.status ||
            !data?.data?.length
        ) {

            await sock.sendMessage(from, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return sock.sendMessage(from, {
                text: '❌ No encontré resultados.'
            }, { quoted: m })
        }

        const imagenes =
            data.data.slice(0, 5)

        for (const img of imagenes) {

            const caption =
`╭━━━〔 📌 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 〕━━━⬣
┃ 🔎 Búsqueda:
┃ ${query}
┃
┃ 👤 Autor:
┃ ${img.full_name || img.username || 'Desconocido'}
┃
┃ ❤️ Likes:
┃ ${img.likes || 0}
┃
┃ 👥 Seguidores:
┃ ${img.followers || 0}
╰━━━━━━━━━━━━━━━━⬣`

            await sock.sendMessage(
                from,
                {
                    image: {
                        url: img.hd
                    },
                    caption
                },
                {
                    quoted: m
                }
            )
        }

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'PINTEREST ERROR:',
            e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: `❌ ${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['pin', 'pinterest']
handler.help = ['pinterest <texto>']
handler.tags = ['buscadores']
handler.menu = true

export default handler