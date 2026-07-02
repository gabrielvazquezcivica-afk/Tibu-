import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Solo funciona en grupos`'
        }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return sock.sendMessage(from, {
            text: '`❌ No pude leer el grupo`'
        }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const userInfo = participantes.find(
        p => p.id === sender || p.jid === sender
    )

    const esAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'

    if (!esAdmin) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`🚫 Solo admins pueden usarlo`'
        }, { quoted: m })
    }

    const mentions = participantes.map(p => p.jid || p.id)

    await sock.sendMessage(from, {
        react: { text: '📢', key: m.key }
    })

    // RESPONDIENDO A MENSAJE
    if (m.quoted) {
        const q = m.quoted
        const msg = q.message || {}

        if (msg.conversation || q.text) {
            return sock.sendMessage(from, {
                text: `${q.text}\n\n> ${config.BOT_NAME}`,
                mentions
            })
        }

        if (msg.imageMessage) {
            return sock.sendMessage(from, {
                image: { url: q.download() },
                caption: `${msg.imageMessage.caption || ''}\n\n> ${config.BOT_NAME}`,
                mentions
            })
        }

        if (msg.videoMessage) {
            return sock.sendMessage(from, {
                video: { url: q.download() },
                caption: `${msg.videoMessage.caption || ''}\n\n> ${config.BOT_NAME}`,
                mentions
            })
        }

        if (msg.audioMessage) {
            return sock.sendMessage(from, {
                audio: { url: q.download() },
                mimetype: 'audio/mp4',
                ptt: msg.audioMessage.ptt || false,
                mentions
            })
        }

        if (msg.stickerMessage) {
            return sock.sendMessage(from, {
                sticker: { url: q.download() },
                mentions
            })
        }

        if (msg.documentMessage) {
            return sock.sendMessage(from, {
                document: { url: q.download() },
                fileName: msg.documentMessage.fileName,
                mimetype: msg.documentMessage.mimetype,
                mentions
            })
        }
    }

    // TEXTO NORMAL
    const texto = args.join(' ').trim()

    if (!texto) {
        return sock.sendMessage(from, {
            text: '`❌ Escribe o responde a un mensaje`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        text: `${texto}\n\n> ${config.BOT_NAME}`,
        mentions
    })
}

handler.command = ['n']
handler.help = ['n <texto>']
handler.tags = ['grupo']
handler.menu = true

export default handler