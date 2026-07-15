import axios from 'axios'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const url = args[0]

    if (!url) {
        return sock.sendMessage(from, {
            text: `🎵 *YTMP3*

Uso:
.ytmp3 https://youtube.com/watch?v=xxxx`
        }, { quoted: m })
    }

    const esPlaylist = args.includes('--playlist')

    try {

        await sock.sendMessage(from, {
            react: {
                text: esPlaylist ? '🎶' : '🎧',
                key: m.key
            }
        })

        if (esPlaylist) {

            await sock.sendMessage(from, {
                text: `
╭━━━〔 🎶 𝐏𝐋𝐀𝐘𝐋𝐈𝐒𝐓 〕━━━⬣
┃ 🎵 Canción seleccionada
┃ ⏳ Descargando audio...
┃ 🎧 Preparando archivo MP3
╰━━━━━━━━━━━━━━━━⬣`
            }, { quoted: m })

        } else {

            await sock.sendMessage(from, {
                text: `
╭━━━〔 🎵 𝐘𝐓𝐌𝐏𝟑 〕━━━⬣
┃ 🔎 Analizando enlace
┃ ⏳ Descargando audio
┃ 📦 Procesando archivo
╰━━━━━━━━━━━━━━━━⬣`
            }, { quoted: m })

        }

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
            'audio'

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
            text: `❌ Error al descargar el audio.\n\n${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['ytmp3']
handler.help = ['ytmp3 <url>']
handler.tags = ['descargas']
handler.menu = true

export default handler