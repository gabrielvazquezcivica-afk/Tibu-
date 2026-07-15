import axios from 'axios'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const url = args[0]

    if (!url) {
        return sock.sendMessage(from, {
            text:
`🎵 YTMP3

Uso:
.ytmp3 https://youtube.com/watch?v=xxxx`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '⏳',
                key: m.key
            }
        })

        const { data } = await axios.get(
            `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(url)}`
        )

        const audio =
            data?.data?.download ||
            data?.data?.url ||
            data?.download ||
            data?.url

        const titulo =
            data?.data?.title ||
            data?.title ||
            'audio.mp3'

        if (!audio) {
            throw new Error('No se encontró el enlace de descarga')
        }

        await sock.sendMessage(from, {
            audio: {
                url: audio
            },
            mimetype: 'audio/mpeg',
            fileName: `${titulo}.mp3`
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('YTMP3 ERROR:', e.response?.data || e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: `❌ Error\n\n${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['ytmp3']
handler.help = ['ytmp3 <url>']
handler.tags = ['descargas']
handler.menu = false

export default handler