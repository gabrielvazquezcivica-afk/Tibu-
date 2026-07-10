import fs from 'fs'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
    }

    // 🔞 NSFW
    let nsfw = {}

    try {
        nsfw = JSON.parse(
            fs.readFileSync('./database/nsfw.json', 'utf8')
        )
    } catch {}

    if (!nsfw[from]) {
        return sock.sendMessage(from, {
            text:
`🔞 El NSFW está desactivado en este grupo.

> Usa .nsfw on

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    let target =
        m.message?.extendedTextMessage?.contextInfo?.participant ||
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!target) {
        return sock.sendMessage(from, {
            text:
`💦 ETIQUETA O RESPONDE A ALGUIEN.

Ejemplo:
.cum @usuario

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    if (target === sender) {
        return sock.sendMessage(from, {
            text:
`😳 No puedes venirte en ti mismo.

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const videos = [
        'https://telegra.ph/file/9243544e7ab350ce747d7.mp4',
        'https://telegra.ph/file/fadc180ae9c212e2bd3e1.mp4',
        'https://telegra.ph/file/79a5a0042dd8c44754942.mp4',
        'https://telegra.ph/file/035e84b8767a9f1ac070b.mp4',
        'https://telegra.ph/file/0103144b636efcbdc069b.mp4',
        'https://telegra.ph/file/4d97457142dff96a3f382.mp4',
        'https://telegra.ph/file/b1b4c9f48eaae4a79ae0e.mp4',
        'https://telegra.ph/file/5094ac53709aa11683a54.mp4',
        'https://telegra.ph/file/dc279553e1ccfec6783f3.mp4',
        'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'
    ]

    const video =
        videos[Math.floor(Math.random() * videos.length)]

    const name1 = sender.split('@')[0]
    const name2 = target.split('@')[0]

    await sock.sendMessage(from, {
        react: {
            text: '💦',
            key: m.key
        }
    })

    await sock.sendMessage(from, {
        video: {
            url: video
        },
        gifPlayback: true,
        caption:
`💦 *CUM* 💦

💦 @${name1} se vino dentro de @${name2} 🤤

> ${config.BOT_NAME}`,
        mentions: [sender, target]
    }, {
        quoted: m
    })
}

handler.command = ['cum']
handler.help = ['cum @usuario']
handler.tags = ['nsfw']
handler.group = true
handler.menu = true

export default handler