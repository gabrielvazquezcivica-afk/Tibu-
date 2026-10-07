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
            text: '`🚫 Solo admins pueden usarlo`'
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
        const code = await sock.groupInviteCode(from)
        const link = `https://chat.whatsapp.com/${code}`

        await sock.sendMessage(from, {
            text: `🔗 Aquí tienes el link @${sender.split('@')[0]}\n\n${link}`,
            mentions: [sender]
        }, { quoted: m })

    } catch (e) {
        console.log('LINK ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ No pude obtener el link del grupo`'
        }, { quoted: m })
    }
}

handler.command = ['link']
handler.help = ['link']
handler.tags = ['grupo']
handler.menu = true

export default handler