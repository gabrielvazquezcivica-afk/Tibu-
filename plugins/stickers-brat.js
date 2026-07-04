import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const texto = args.join(' ').trim() ||
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
        ''

    if (!texto) {
        return sock.sendMessage(from, {
            text: `⚡ Escribe un texto.\n\nEjemplo:\n${config.PREFIX}brat Hola mundo`
        }, { quoted: m })
    }

    if (texto.length > 35) {
        return sock.sendMessage(from, {
            text: '⚠️ Máximo 35 caracteres.'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '🕒',
            key: m.key
        }
    })

    try {

        const formatted = wrap(texto, 28)

        const key = Buffer
            .from('c3lscGh5LTZmMTUwZA==', 'base64')
            .toString()

        const url =
            `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(formatted)}&color=black&fondo=white&type=Nose&api_key=${key}`

        const res = await axios.get(url, {
            responseType: 'arraybuffer'
        })

        const png = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`

        fs.writeFileSync(png, res.data)

        await new Promise((resolve, reject) => {

            exec(
                `ffmpeg -i "${png}" -vcodec libwebp -lossless 1 -qscale 80 -preset default -loop 0 -an -vsync 0 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" "${webp}"`,
                err => {

                    if (err) return reject(err)

                    resolve()
                }
            )

        })

        await sock.sendMessage(from, {
            sticker: fs.readFileSync(webp)
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

        try {
            fs.unlinkSync(png)
            fs.unlinkSync(webp)
        } catch {}

    } catch (e) {

        console.log('BRAT ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: '❌ Error al generar el sticker.'
        }, { quoted: m })
    }
}

function wrap(text, max = 22) {

    const words = text.split(' ')
    const lines = []
    let current = []

    for (const word of words) {

        if ((current.join(' ').length + word.length + 1) > max) {
            lines.push(current.join(' '))
            current = [word]
        } else {
            current.push(word)
        }

    }

    if (current.length) lines.push(current.join(' '))

    return lines.join('\n')
}

handler.command = ['brat']
handler.help = ['brat <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler