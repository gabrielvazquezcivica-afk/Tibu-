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
`❤️‍🔥 ETIQUETA O RESPONDE A ALGUIEN.

Ejemplo:
.agarrartetas @usuario

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    if (target === sender) {
        return sock.sendMessage(from, {
            text:
`😳 No puedes agarrarte las tetas a ti mismo.

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const videos = [
    'https://telegra.ph/file/82d32821f3b57b62359f2.mp4',
    'https://telegra.ph/file/04bbf490e29158f03e348.mp4',
    'https://telegra.ph/file/37c21753892b5d843b9ce.mp4',
    'https://telegra.ph/file/075db3ebba7126d2f0d95.mp4',
    'https://telegra.ph/file/e6bf14b93dfe22c4972d0.mp4',
    'https://telegra.ph/file/05c1bd3a2ec54428ac2fc.mp4',
    'https://telegra.ph/file/e999ef6e67a1a75a515d6.mp4',
    'https://telegra.ph/file/538c95e4f1c481bcc3cce.mp4',
    'https://telegra.ph/file/61d85d10baf2e3b9a4cde.mp4',
    'https://telegra.ph/file/36149496affe5d02c8965.mp4'
  ]

    const video =
        videos[Math.floor(Math.random() * videos.length)]

    const name1 = sender.split('@')[0]
    const name2 = target.split('@')[0]

    await sock.sendMessage(from, {
        react: {
            text: '🤤',
            key: m.key
        }
    })

    await sock.sendMessage(from, {
        video: {
            url: video
        },
        gifPlayback: true,
        caption:
`🤤 *AGARAR TETAS* 🔥

🔥🥵 @${name1} le está agarrando las tetas a @${name2} 🔥🥵

> ${config.BOT_NAME}`,
        mentions: [sender, target]
    }, {
        quoted: m
    })
}

handler.command = ['agarrartetas']
handler.help = ['agarrartetas @usuario']
handler.tags = ['nsfw']
handler.group = true
handler.menu = true

export default handler