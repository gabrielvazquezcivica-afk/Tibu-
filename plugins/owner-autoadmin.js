import config from '../config.js'

function limpiarNum(n = '') {
    return n.replace(/[^0-9]/g, '')
}

function limpiarJid(jid = '') {
    return jid
        .replace(/:\d+@/, '@')
        .replace(/@lid$/, '@s.whatsapp.net')
        .trim()
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = limpiarJid(m.key.participant || m.key.remoteJid)
    const remNum = limpiarNum(remitente)

    const esDueno =
        config.owner.some(n => limpiarNum(n) === remNum) ||
        config.ownerLid.some(l => limpiarNum(l) === remNum)

    if (!esDueno) {
        return sock.sendMessage(
            from,
            { text: '`🚫 Solo owners`' },
            { quoted: m }
        )
    }

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(
            from,
            { text: '`🌊 Solo grupos`' },
            { quoted: m }
        )
    }

    try {
        const metadata = await sock.groupMetadata(from)

        console.log('========= BOT =========')
        console.log(JSON.stringify(sock.user, null, 2))

        console.log('===== PARTICIPANTS =====')
        console.log(JSON.stringify(metadata.participants, null, 2))

        const botNum = limpiarNum(sock.user?.id || '')
        let botEsAdmin = false

        for (const p of metadata.participants) {
            const num = limpiarNum(p.id || '')

            console.log({
                id: p.id,
                num,
                admin: p.admin,
                isAdmin: p.isAdmin,
                isSuperAdmin: p.isSuperAdmin
            })

            if (
                num === botNum &&
                (
                    p.admin ||
                    p.isAdmin ||
                    p.isSuperAdmin ||
                    p.admin === 'admin' ||
                    p.admin === 'superadmin'
                )
            ) {
                botEsAdmin = true
            }
        }

        if (!botEsAdmin) {
            return sock.sendMessage(
                from,
                { text: '`⚠️ No detecto admin (revisa consola)`' },
                { quoted: m }
            )
        }

        const userJid = `${remNum}@s.whatsapp.net`

        await sock.groupParticipantsUpdate(
            from,
            [userJid],
            'promote'
        )

        await sock.sendMessage(
            from,
            {
                text: `\`👑 Promovido\`\n@${remNum}`,
                mentions: [userJid]
            },
            { quoted: m }
        )

    } catch (err) {
        console.log(err)

        await sock.sendMessage(
            from,
            { text: String(err) },
            { quoted: m }
        )
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['grupo']
handler.menu = true

export default handler