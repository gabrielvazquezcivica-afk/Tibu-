import config from '../config.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

function footer() {
    return `\n\n> ${config.BOT_NAME}`
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`🌊 Solo funciona en grupos`'
        }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`❌ No pude leer el grupo`'
        }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const userInfo = participantes.find(
        p => p.id === sender || p.jid === sender
    )

    const isAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`🚫 Solo admins pueden usarlo`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: { text: '📢', key: m.key }
    })

    const mentions = participantes.map(p => p.id || p.jid)

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (quoted) {
        const type = Object.keys(quoted)[0]
        let msg = {}

        if (type === 'conversation' || type === 'extendedTextMessage') {
            msg.text =
                (
                    quoted.conversation ||
                    quoted.extendedTextMessage?.text ||
                    ''
                ) + footer()
        } else {
            const mediaType = type.replace('Message', '')
            const stream = await downloadContentFromMessage(
                quoted[type],
                mediaType
            )

            let buffer = Buffer.from([])

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            msg[mediaType] = buffer

            if (
                mediaType === 'image' ||
                mediaType === 'video' ||
                mediaType === 'document'
            ) {
                msg.caption =
                    (
                        quoted[type]?.caption ||
                        args.join(' ') ||
                        ''
                    ) + footer()
            }

            if (mediaType === 'audio') {
                msg.ptt = quoted[type]?.ptt || false
                msg.mimetype =
                    quoted[type]?.mimetype || 'audio/mp4'
            }

            if (mediaType === 'document') {
                msg.fileName = quoted[type]?.fileName || 'archivo'
                msg.mimetype = quoted[type]?.mimetype
            }
        }

        msg.mentions = mentions
        return sock.sendMessage(from, msg, { quoted: m })
    }

    const text = args.join(' ').trim()

    if (!text) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`❌ Usa .n <texto> o responde un mensaje`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        text: text + footer(),
        mentions
    }, { quoted: m })
}

handler.command = ['n']
handler.help = ['n <texto>']
handler.tags = ['grupo']
handler.menu = true

export default handler