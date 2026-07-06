import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

async function createSticker(buffer) {
    const tmpIn = path.join(os.tmpdir(), `${Date.now()}.png`)
    const tmpOut = path.join(os.tmpdir(), `${Date.now()}.webp`)

    fs.writeFileSync(tmpIn, buffer)

    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', [
            '-i', tmpIn,
            '-vcodec', 'libwebp',
            '-vf',
            'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
            '-lossless', '1',
            '-loop', '0',
            '-preset', 'default',
            '-an',
            '-vsync', '0',
            '-y',
            tmpOut
        ])

        ff.stderr.on('data', () => {})

        ff.on('close', code => {
            if (code === 0) resolve()
            else reject(new Error('FFmpeg falló'))
        })

        ff.on('error', reject)
    })

    const sticker = fs.readFileSync(tmpOut)

    try { fs.unlinkSync(tmpIn) } catch {}
    try { fs.unlinkSync(tmpOut) } catch {}

    return sticker
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    let text = args.join(' ').trim()

    if (
        !text &&
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ) {
        const quoted =
            m.message.extendedTextMessage.contextInfo.quotedMessage

        text =
            quoted?.conversation ||
            quoted?.extendedTextMessage?.text ||
            quoted?.imageMessage?.caption ||
            quoted?.videoMessage?.caption ||
            ''
    }

    if (!text) {
        return sock.sendMessage(from, {
            text:
                '`❌ Escribe un texto`\n\n' +
                'Ejemplo:\n' +
                '`.qc Hola mundo`'
        }, { quoted: m })
    }

    if (text.length > 200) {
        return sock.sendMessage(from, {
            text: '`❌ Máximo 200 caracteres`'
        }, { quoted: m })
    }

    const name =
        m.pushName ||
        sender.split('@')[0]

    const avatar =
        await sock.profilePictureUrl(sender, 'image')
            .catch(() => 'https://i.imgur.com/JP2jKzD.png')

    await sock.sendMessage(from, {
        react: {
            text: '🖌️',
            key: m.key
        }
    })

    try {
        const body = {
            type: 'quote',
            format: 'png',
            backgroundColor: '#1b1429',
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                avatar: true,
                from: {
                    id: 1,
                    name,
                    photo: {
                        url: avatar
                    }
                },
                text,
                replyMessage: {}
            }]
        }

        const res = await axios.post(
            'https://bot.lyo.su/quote/generate',
            body,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        if (!res.data?.result?.image)
            throw new Error('API inválida')

        const buffer = Buffer.from(
            res.data.result.image,
            'base64'
        )

        const sticker = await createSticker(buffer)

        await sock.sendMessage(from, {
            sticker
        }, {
            quoted: m
        })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {
        console.log('QC ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: '`❌ Error al generar QC`'
        }, {
            quoted: m
        })
    }
}

handler.command = ['qc']
handler.help = ['qc <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler