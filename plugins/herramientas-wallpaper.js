import fetch from 'node-fetch'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const query = args.join(' ').trim() || 'nature'

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🖼️',
                key: m.key
            }
        })

        const apiKey =
            '54924806-f3dbf063a8f732bda7f60d460'

        const url =
            `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=vertical&per_page=20`

        const response = await fetch(url)
        const data = await response.json()

        if (
            !data?.hits ||
            !data.hits.length
        ) {

            await sock.sendMessage(from, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return sock.sendMessage(from, {
                text: `❌ No encontré resultados para: ${query}`
            }, { quoted: m })
        }

        const image =
            data.hits[
                Math.floor(
                    Math.random() *
                    data.hits.length
                )
            ]

        const caption =
`╭━━━〔 🖼️ 𝐖𝐀𝐋𝐋𝐏𝐀𝐏𝐄𝐑 〕━━━⬣
┃ 🔎 Búsqueda:
┃ ${query}
┃
┃ 👤 Autor:
┃ ${image.user}
┃
┃ 🏷️ Tags:
┃ ${image.tags}
┃
┃ 🌐 Fuente:
┃ Pixabay
╰━━━━━━━━━━━━━━━━⬣`

        await sock.sendMessage(
            from,
            {
                image: {
                    url: image.largeImageURL
                },
                caption
            },
            {
                quoted: m
            }
        )

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'WALLPAPER ERROR:',
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

handler.command = ['wallpaper','wp']
handler.help = ['wallpaper <texto>']
handler.tags = ['herramientas']
handler.menu = true

export default handler