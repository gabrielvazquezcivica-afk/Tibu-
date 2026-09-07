import axios from 'axios'
import config from '../config.js'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`╭─〔 🦈 BRAT ANIMADO 〕─╮
│
│ ✏️ Escribe un texto
│    para crear el sticker.
│
│ Ejemplo:
│ .bratvid Hola Tibu
│
╰──────────────────────╯
> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🎬',
                key: m.key
            }
        })

        const apiUrl =
            `https://api.lempi.lat/tools/brat` +
            `?text=${encodeURIComponent(text)}` +
            `&color=Blanco` +
            `&format=video` +
            `&apikey=${encodeURIComponent(API_KEY)}`

        const { data } = await axios.get(apiUrl, {
            timeout: 60000
        })

        if (!data?.status || !data?.descarga) {
            throw new Error(
                data?.mensaje ||
                data?.message ||
                data?.error ||
                'No se pudo crear el BRAT.'
            )
        }

        // 📥 Descargar el video generado
        const video = await axios.get(data.descarga, {
            responseType: 'arraybuffer',
            timeout: 120000
        })

        // 🎨 Enviar como sticker
        await sock.sendMessage(from, {
            sticker: Buffer.from(video.data)
        }, { quoted: m })

        // ✅ COMPLETADO
        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.error(
            'BRAT ERROR:',
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
`╭─〔 ❌ BRAT 〕─╮
│
│ No pude crear el sticker.
│
│ ${e.response?.data?.mensaje ||
   e.response?.data?.message ||
   e.message ||
   'Error desconocido.'}
│
╰────────────────╯
> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['bratvid']
handler.help = ['bratvid <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler