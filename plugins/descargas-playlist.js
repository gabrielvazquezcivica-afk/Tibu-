import yts from 'yt-search'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🎵 PLAYLIST

Ejemplo:
.playlist mc davo`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        const res = await yts(text)

        const videos = res.videos.slice(0, 10)

        const sections = [{
            title: 'RESULTADOS',
            rows: videos.map(v => ({
                title: v.title,
                description: `⏱ ${v.timestamp}`,
                rowId: `.ytmp3 ${v.url}`
            }))
        }]

        await sock.sendMessage(from, {
            text: `Resultados para: ${text}`,
            title: '🎵 PLAYLIST',
            footer: 'Tibu Bot',
            buttonText: 'ABRIR RESULTADOS',
            sections
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })
    }
}

handler.command = ['playlist']
handler.help = ['playlist']
handler.tags = ['informacion']
handler.menu = true

export default handler