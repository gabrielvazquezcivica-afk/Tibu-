import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const final = text?.trim() || m.quoted?.text?.trim()

    if (!final) {
        return conn.reply(
            m.chat,
            `🌊 *Escribe el texto para crear tu sticker*\n\n> Ejemplo: ${usedPrefix + command} Hola mundo`,
            m
        )
    }

    if (final.length > 35) {
        return conn.reply(
            m.chat,
            `⚠️ *Texto demasiado largo*\n\n> Máximo: *35 caracteres*`,
            m
        )
    }

    await m.react('🕒')

    const id = Date.now()
    const img = `./tibu-brat-${id}.png`
    const webp = `./tibu-brat-${id}.webp`

    try {
        const formatted = wrap(final, 28)

        const url =
            `https://api.lempi.lat/tools/brat` +
            `?text=${encodeURIComponent(formatted)}` +
            `&color=blanco` +
            `&fondo=negro` +
            `&format=image` +
            `&apikey=${API_KEY}`

        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000
        })

        fs.writeFileSync(img, res.data)

        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -y -i "${img}" -vcodec libwebp ` +
                `-vf "scale=512:512:force_original_aspect_ratio=decrease,` +
                `format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ` +
                `"${webp}"`,
                error => {
                    if (error) reject(error)
                    else resolve()
                }
            )
        })

        await conn.sendMessage(
            m.chat,
            {
                sticker: fs.readFileSync(webp),
                packname: 'Tibu Bot 🌊',
                author: 'Tibu'
            },
            { quoted: m }
        )

        await m.react('✅')

    } catch (e) {
        console.error('BRAT ERROR:', e)

        await m.react('❌')

        await conn.reply(
            m.chat,
            '❌ *No se pudo generar el sticker.*',
            m
        )

    } finally {
        if (fs.existsSync(img)) fs.unlinkSync(img)
        if (fs.existsSync(webp)) fs.unlinkSync(webp)
    }
}

function wrap(text, max = 28) {
    const words = text.split(/\s+/)
    const lines = []
    let current = ''

    for (const word of words) {
        const siguiente = `${current} ${word}`.trim()

        if (siguiente.length > max) {
            if (current) lines.push(current)
            current = word
        } else {
            current = siguiente
        }
    }

    if (current) lines.push(current)

    return lines.join('\n')
}

handler.command = ['brat']
handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.menu = true

export default handler