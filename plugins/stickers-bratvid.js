import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
`🦈 \`BRAT ANIMADO\`

✏️ Escribe un texto para crear el sticker.

Ejemplo:
.brat Hola Tibu

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

        const apiKey = Buffer
            .from('c3lscGh5LTZmMTUwZA==', 'base64')
            .toString('utf-8')

        const url =
    `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(text)}&color=Negro&fondo=Blanco&type=Anim&api_key=${apiKey}`

        const { data } = await axios.get(url, {
            responseType: 'arraybuffer'
        })

        await sock.sendMessage(from, {
            sticker: Buffer.from(data)
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('BRAT ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al crear el sticker brat animado\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['bratvid']
handler.help = ['bratvid <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler