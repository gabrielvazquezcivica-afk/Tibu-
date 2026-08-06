import config from '../config.js'
import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const busqueda = args.join(' ').trim()

    if (!busqueda) {
        await sock.sendMessage(from, { react: { text: '🎵', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🎵 Escribe el nombre de la canción`\n\nEjemplo:\n.play banda ms - el gusto'
        }, { quoted: m })
    }

    await sock.sendMessage(from, { react: { text: '🔎', key: m.key } })

    try {
        const resultado = await yts(busqueda)
        if (!resultado.videos.length) throw new Error('Sin resultados')
        const cancion = resultado.videos[0]

        const api = 'https://api.evogb.org'
        const key = 'sasuke'
        const res = await fetch(`${api}/dl/ytmp3?url=${encodeURIComponent(cancion.url)}&key=${key}`)
        const json = await res.json()

        if (!json.status || !json.data?.dl) throw new Error('No se pudo descargar')
        const info = json.data

        const caption =
`╭──────────────⬣
│ 𝐓𝐈𝐁𝐔 𝐏𝐋𝐀𝐘 🎧
├──────────────
│ 🎵 ${info.title || cancion.title}
│
│ ⏱ ${info.duration || cancion.timestamp}
│
│ 💽 MP3 128kbps
│
│ 📥 Descargando...
╰──────────────⬣
> ${config.BOT_NAME}`

        await sock.sendMessage(from, {
            image: { url: info.thumbnail || cancion.thumbnail },
            caption
        }, { quoted: m })

        await sock.sendMessage(from, {
            audio: { url: info.dl },
            mimetype: 'audio/mpeg',
            fileName: `${info.title || cancion.title}.mp3`,
            ptt: false
        }, { quoted: m })

        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.log('PLAY ERROR:', e)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        await sock.sendMessage(from, { text: '`❌ No se encontró o no se pudo descargar la canción`' }, { quoted: m })
    }
}

handler.command = ['play']
handler.help = ['play <nombre de la canción>']
handler.tags = ['descargas']
handler.menu = true

export default handler
