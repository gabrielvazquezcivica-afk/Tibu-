import fetch from 'node-fetch'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const texto = args.join(' ').trim() ||
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
        ''

    if (!texto) {
        return sock.sendMessage(from, {
            text: `⚠️ Escribe el texto para generar el sticker.\n\nEjemplo:\n${config.PREFIX}brat Sasuke Uchiha`
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '🟢',
            key: m.key
        }
    })

    try {

        const api = 'https://sylphyy.xyz/tools/brat'

        const apiKey = Buffer
            .from('c3lscGh5LTZmMTUwZA==', 'base64')
            .toString('utf8')

        const url =
            `${api}?text=${encodeURIComponent(texto)}&color=Blanco&fondo=Negro&type=Static&api_key=${apiKey}`

        const res = await fetch(url)

        if (!res.ok) {
            throw new Error('API ERROR')
        }

        const sticker = Buffer.from(await res.arrayBuffer())

        await sock.sendMessage(from, {
            sticker
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
            text: '❌ Error al generar el sticker.'
        }, { quoted: m })
    }
}

handler.command = ['bratv']
handler.help = ['bratv <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler