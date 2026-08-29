import axios from 'axios'
import fs from 'fs'
import { execFile } from 'child_process'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    const texto =
        args.join(' ').trim() ||
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation?.trim() ||
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text?.trim()

    if (!texto) {
        return sock.sendMessage(from, {
            text:
`🌊 *BRAT*

Escribe el texto para crear tu sticker.

> Ejemplo:
.brat Hola mundo`
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '🕒',
            key: m.key
        }
    })

    const id = Date.now()

    const img = `./tibu-brat-${id}.png`
    const webp = `./tibu-brat-${id}.webp`

    try {

        // Texto completo, sin límite ni wrap
        const apiUrl =
            `https://api.lempi.lat/tools/brat` +
            `?text=${encodeURIComponent(texto)}` +
            `&color=blanco` +
            `&fondo=negro` +
            `&format=image` +
            `&apikey=${API_KEY}`

        // Solicitar Brat a Lempi
        const respuesta = await axios.get(apiUrl, {
            timeout: 30000
        })

        const data = respuesta.data


        // Comprobar respuesta de la API
        if (!data?.status) {
            throw new Error(
                data?.mensaje ||
                data?.message ||
                data?.error ||
                'La API no pudo generar el Brat'
            )
        }

        // URL de la imagen generada
        const descarga = data.descarga

        if (!descarga) {
            throw new Error(
                'La API no devolvió la URL de descarga'
            )
        }

        // Descargar la imagen
        const imagen = await axios.get(descarga, {
            responseType: 'arraybuffer',
            timeout: 30000
        })

        const buffer = Buffer.from(imagen.data)

        if (!buffer.length) {
            throw new Error(
                'La imagen descargada está vacía'
            )
        }

        fs.writeFileSync(img, buffer)

        // Convertir imagen a WebP
        await convertirSticker(img, webp)

        if (!fs.existsSync(webp)) {
            throw new Error(
                'No se pudo crear el sticker'
            )
        }

        // Leer WebP
        const sticker = fs.readFileSync(webp)

        // Enviar como sticker
        await sock.sendMessage(
            from,
            {
                sticker: sticker,
                packname: 'Tibu Bot 🌊',
                author: 'SoyGabo'
            },
            { quoted: m }
        )

        // Reacción de éxito
        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.error('BRAT ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ *No se pudo crear el sticker Brat.*

> ${e.message || 'Error desconocido'}`
        }, { quoted: m })

    } finally {

        // Eliminar archivos temporales
        if (fs.existsSync(img)) {
            try {
                fs.unlinkSync(img)
            } catch {}
        }

        if (fs.existsSync(webp)) {
            try {
                fs.unlinkSync(webp)
            } catch {}
        }
    }
}


// ─────────────────────────────
// CONVERTIR IMAGEN A STICKER
// ─────────────────────────────

function convertirSticker(input, output) {

    return new Promise((resolve, reject) => {

        execFile(
            'ffmpeg',
            [
                '-y',
                '-i', input,

                '-vcodec',
                'libwebp',

                '-vf',
                'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',

                '-lossless',
                '0',

                '-q:v',
                '75',

                output
            ],
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        'FFMPEG ERROR:',
                        stderr
                    )

                    reject(error)
                    return
                }

                resolve()
            }
        )
    })
}


// ─────────────────────────────
// CONFIGURACIÓN TIBU
// ─────────────────────────────

handler.command = ['brat']
handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.menu = true

export default handler