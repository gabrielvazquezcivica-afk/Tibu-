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
            text: '`🚫 Solo capitanes pueden usarlo`'
        }, { quoted: m })
    }

    const admins = participantes.filter(
        p => p.admin === 'admin' || p.admin === 'superadmin'
    )

    const creador =
        participantes.find(p => p.admin === 'superadmin') ||
        admins[0]

    let texto =
        `🦈 𝐂𝐀𝐏𝐈𝐓𝐀𝐍𝐄𝐒 𝐃𝐄𝐋 𝐎𝐂𝐄𝐀𝐍𝐎\n\n`

    texto += `👑 Creador: @${
        creador.id.split('@')[0]
    }\n\n`

    texto += `⚓ Administradores:\n`

    for (const admin of admins) {
        texto += `• @${admin.id.split('@')[0]}\n`
    }

    texto += `\n> ${config.BOT_NAME}`

    await sock.sendMessage(from, {
        react: { text: '🦈', key: m.key }
    })

    await sock.sendMessage(from, {
        text: texto,
        mentions: admins.map(x => x.id)
    }, { quoted: m })
}

handler.command = ['admins']
handler.help = ['admins']
handler.tags = ['grupo']
handler.menu = true

export default handler