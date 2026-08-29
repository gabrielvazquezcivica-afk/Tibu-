import axios from 'axios'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    // Texto del mensaje
    const mensaje = args.join(' ').trim()

    // Texto del mensaje citado
    const citado =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    const textoCitado =
        citado?.conversation?.trim() ||
        citado?.extendedTextMessage?.text?.trim() ||
        citado?.imageMessage?.caption?.trim() ||
        citado?.videoMessage?.caption?.trim() ||
        ''

    // Buscar URL en el mensaje o en el mensaje citado
    const texto = `${mensaje} ${textoCitado}`

    const match = texto.match(
        /https?:\/\/(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i
    )

    if (!match) {
        return sock.sendMessage(
            from,
            {
                text:
`🎵 *TIKTOK DOWNLOADER*

Envíame un enlace de TikTok.

*Ejemplos:*
.tt https://vm.tiktok.com/xxxxx

También puedes responder a un mensaje que contenga el enlace.`
            },
            { quoted: m }
        )
    }

    const tiktokUrl = match[0].replace(/[)>.,]+$/, '')

    try {

        const apiUrl =
            `https://api.lempi.lat/dl/tiktok` +
            `?url=${encodeURIComponent(tiktokUrl)}` +
            `&apikey=${API_KEY}`

        const response = await axios.get(apiUrl, {
            timeout: 60000
        })

        const data = response.data

        // Si la API devuelve error
        if (!data?.status) {
            throw new Error(
                data?.mensaje ||
                data?.message ||
                data?.error ||
                'No se pudo descargar el video de TikTok.'
            )
        }

        // Buscar URL del video
        const videoUrl =
            data?.video ||
            data?.video_url ||
            data?.download ||
            data?.url ||
            data?.datos?.url ||
            data?.datos?.video ||
            data?.datos?.video_url ||
            data?.data?.url ||
            data?.data?.video

        if (!videoUrl) {
            throw new Error(
                'La API no devolvió el enlace del video.'
            )
        }

        // Descargar video
        const video = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            maxContentLength: 100 * 1024 * 1024,
            maxBodyLength: 100 * 1024 * 1024
        })

        const buffer = Buffer.from(video.data)

        if (!buffer.length) {
            throw new Error(
                'El video descargado está vacío.'
            )
        }

        // Enviar video
        await sock.sendMessage(
            from,
            {
                video: buffer,
                mimetype: 'video/mp4',
                caption: '🎵 *TikTok descargado sin marca de agua*\n\n🌊 *Tibu Bot*'
            },
            { quoted: m }
        )

    } catch (error) {

        // No mostrar errores/procesos en consola

        await sock.sendMessage(
            from,
            {
                text:
`❌ *No se pudo descargar el TikTok.*

> ${error.message || 'Error desconocido'}`
            },
            { quoted: m }
        )
    }
}

handler.command = ['tt', 'tiktok']
handler.help = ['tt <link>']
handler.tags = ['descargas']
handler.menu = true

export default handler