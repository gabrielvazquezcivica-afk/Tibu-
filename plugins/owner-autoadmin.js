import config from '../config.js'

function limpiarNum(n = '') {
    return n.replace(/[^0-9]/g, '')
}

function limpiarJid(jid = '') {
    return jid
        .replace(/:\d+@/, '@')
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
            { text: '`🚫 Solo capitanes pueden usarlo`' },
            { quoted: m }
        )
    }

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(
            from,
            { text: '`🌊 Solo funciona en grupos`' },
            { quoted: m }
        )
    }

    try {
        const metadata = await sock.groupMetadata(from)

        const botLid = limpiarJid(sock.user?.lid || '')
        const botJid = limpiarJid(sock.user?.id || '')

        const botParticipante = metadata.participants.find(
            p =>
                limpiarJid(p.id || '') === botLid ||
                limpiarJid(p.jid || '') === botJid
        )

        const botEsAdmin =
            botParticipante &&
            (
                botParticipante.admin === 'admin' ||
                botParticipante.admin === 'superadmin'
            )

        if (!botEsAdmin) {
            return sock.sendMessage(
                from,
                { text: '`⚠️ No tengo rango de capitán aquí`' },
                { quoted: m }
            )
        }

        const userParticipante = metadata.participants.find(
            p =>
                limpiarNum(p.jid || p.id || '') === remNum
        )

        const yaEsAdmin =
            userParticipante &&
            (
                userParticipante.admin === 'admin' ||
                userParticipante.admin === 'superadmin'
            )

        if (yaEsAdmin) {
            return sock.sendMessage(
                from,
                { text: '`✅ Ya eres administrador`' },
                { quoted: m }
            )
        }

        const userJid =
            userParticipante?.jid ||
            `${remNum}@s.whatsapp.net`

        await sock.groupParticipantsUpdate(
            from,
            [userJid],
            'promote'
        )

        await sock.sendMessage(
            from,
            {
                text:
                    `\`🌊 CAPITÁN ASCENDIDO 🦈\`\n` +
                    `Ahora gobiernas estas aguas @${remNum}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [userJid]
            },
            { quoted: m }
        )

    } catch (err) {
        console.log(err)

        await sock.sendMessage(
            from,
            {
                text:
                    `\`❌ Error\`\n${err.message || err}`
            },
            { quoted: m }
        )
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['grupo']
handler.menu = true

export default handler