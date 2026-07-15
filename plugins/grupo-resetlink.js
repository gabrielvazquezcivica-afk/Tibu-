import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
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
            text: '`🚫 Solo admins pueden resetear el radar`'
        }, { quoted: m })
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botInfo = participantes.find(
        p => p.id === botId || p.jid === botId
    )

    const botAdmin =
        botInfo?.admin === 'admin' ||
        botInfo?.admin === 'superadmin'

    if (!botAdmin) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`⚠️ No soy admin aquí`'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🔄', key: m.key }
        })

        await sock.groupRevokeInvite(from)

        const code = await sock.groupInviteCode(from)
        const link = `https://chat.whatsapp.com/${code}`

        let pp = null
        try {
            pp = await sock.profilePictureUrl(from, 'image')
        } catch {}

        const texto =
            `♻️ 𝐑𝐀𝐃𝐀𝐑 𝐑𝐄𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐎\n\n` +
            `🔗 Link anterior invalidado\n` +
            `🌊 Nuevo enlace generado\n` +
            `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
            `${link}\n\n` +
            `> ${config.BOT_NAME}`

        if (pp) {
            await sock.sendMessage(from, {
                image: { url: pp },
                caption: texto,
                mentions: [sender]
            }, { quoted: m })
        } else {
            await sock.sendMessage(from, {
                text: texto,
                mentions: [sender]
            }, { quoted: m })
        }

    } catch (e) {
        console.log('RESETLINK ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ No pude resetear el link`'
        }, { quoted: m })
    }
}

handler.command = ['resetlink']
handler.help = ['resetlink']
handler.tags = ['grupo']
handler.menu = true

export default handler