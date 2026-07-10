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
`🔥 ETIQUETA O RESPONDE A ALGUIEN.

Ejemplo:
.coger @usuario

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    if (target === sender) {
        return sock.sendMessage(from, {
            text:
`😳 No puedes cogerte a ti mismo.

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const videos = [
        'https://telegra.ph/file/6ea4ddf2f9f4176d4a5c0.mp4',
        'https://telegra.ph/file/66535b909845bd2ffbad9.mp4',
        'https://telegra.ph/file/1af11cf4ffeda3386324b.mp4',
        'https://telegra.ph/file/e2beba258ba83f09a34df.mp4',
        'https://telegra.ph/file/21543bac2383ce0fc6f51.mp4',
        'https://telegra.ph/file/1baf2e8577d5118c03438.mp4',
        'https://telegra.ph/file/80aa0e43656667b07d0b4.mp4',
        'https://telegra.ph/file/7638618cf43e499007765.mp4',
        'https://telegra.ph/file/1c7d59e637f8e5915dbbc.mp4',
        'https://telegra.ph/file/e7078700d16baad953348.mp4',
        'https://telegra.ph/file/100ba1caee241e5c439de.mp4',
        'https://telegra.ph/file/3b1d6ef30a5e53518b13b.mp4',
        'https://telegra.ph/file/249518bf45c1050926d9c.mp4',
        'https://telegra.ph/file/34e1fb2f847cbb0ce0ea2.mp4',
        'https://telegra.ph/file/52c82a0269bb69d5c9fc4.mp4',
        'https://telegra.ph/file/ca64bfe2eb8f7f8c6b12c.mp4',
        'https://telegra.ph/file/8e94da8d393a6c634f6f9.mp4',
        'https://telegra.ph/file/216b3ab73e1d98d698843.mp4',
        'https://telegra.ph/file/1dec277caf371c8473c08.mp4',
        'https://telegra.ph/file/bbf6323509d48f4a76c13.mp4',
        'https://telegra.ph/file/f8e4abb6923b95e924724.mp4',
        'https://telegra.ph/file/bd4d5a957466eee06a208.mp4',
        'https://telegra.ph/file/a91d94a51dba34dc1bed9.mp4',
        'https://telegra.ph/file/b08996c47ff1b38e13df0.mp4',
        'https://telegra.ph/file/58bcc3cd79cecda3acdfa.mp4'
    ]

    const video =
        videos[Math.floor(Math.random() * videos.length)]

    const name1 = sender.split('@')[0]
    const name2 = target.split('@')[0]

    await sock.sendMessage(from, {
        react: {
            text: '🔥',
            key: m.key
        }
    })

    await sock.sendMessage(from, {
        video: {
            url: video
        },
        gifPlayback: true,
        caption:
`🥵 *ESTAN COGIENDO* 🥵

@${name1} se acaba de coger a @${name2} 😳❤️

> ${config.BOT_NAME}`,
        mentions: [sender, target]
    }, {
        quoted: m
    })
}

handler.command = ['coger','fuck']
handler.help = ['coger @usuario']
handler.tags = ['nsfw']
handler.group = true
handler.menu = true

export default handler