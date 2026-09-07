import axios from 'axios'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

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

        await sock.sendMessage(from, {
            text: esPlaylist
                ? `╭━━━〔 🎶 𝐏𝐋𝐀𝐘𝐋𝐈𝐒𝐓 〕━━━⬣
┃ 🎵 Canción seleccionada
┃ ⏳ Descargando audio...
┃ 🎧 Preparando archivo MP3
╰━━━━━━━━━━━━━━━━⬣`
                : `╭━━━〔 🎵 𝐘𝐓𝐌𝐏𝟑 〕━━━⬣
┃ 🔎 Analizando enlace
┃ ⏳ Descargando audio
┃ 📦 Procesando archivo
╰━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m })


        // 🎵 LEMPI YOUTUBE AUDIO
        const apiUrl =
            `https://api.lempi.lat/dl/yta?url=${encodeURIComponent(url)}&apikey=${encodeURIComponent(API_KEY)}`

        const { data } = await axios.get(apiUrl, {
            timeout: 60000
        })


        if (!data?.status) {
            throw new Error(
                data?.mensaje ||
                data?.error ||
                'No se pudo descargar el audio.'
            )
        }


        const audio =
            data?.datos?.url ||
            data?.datos?.archivo

        if (!audio) {
            throw new Error(
                'La API no devolvió el enlace del audio.'
            )
        }


        // 📥 DESCARGAR AUDIO
        const audioResponse = await axios.get(audio, {
            responseType: 'arraybuffer',
            timeout: 60000
        })

        const audioBuffer =
            Buffer.from(audioResponse.data)


        const titulo =
            data?.titulo ||
            data?.datos?.titulo ||
            'audio'


        // 🎧 ENVIAR AUDIO
        await sock.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${titulo}.mp3`,
            ptt: false
        }, { quoted: m })


        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'YTMP3 ERROR:',
            e.response?.data || e.message
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ *Error al descargar el audio.*

${e.response?.data?.mensaje || e.message}`
        }, { quoted: m })
    }
}

handler.command = ['ytmp3']
handler.help = ['ytmp3 <url>']
handler.tags = ['descargas']
handler.menu = true

export default handler