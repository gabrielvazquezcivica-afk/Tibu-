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

    // Verificar dueño
    const esDueno =
        config.owner.some(n => limpiarNum(n) === remNum) ||
        config.ownerLid.some(l => limpiarNum(l) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, {
            react: { text: '🦈', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`🚫 Solo capitanes pueden usarlo`' },
            { quoted: m }
        )
    }

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`🌊 Solo funciona en grupos`' },
            { quoted: m }
        )
    }

    const metadata = await sock.groupMetadata(from)

    const participantes = metadata.participants.map(p => ({
        id: limpiarJid(p.id),
        num: limpiarNum(p.id),
        admin: p.admin
    }))

    const botNum = limpiarNum(sock.user.id)

    // DEBUG (descomenta si quieres revisar)
    // console.log('BOT:', sock.user.id)
    // console.log(participantes)

    const botEsAdmin = participantes.some(
        p => p.num === botNum && p.admin
    )

    if (!botEsAdmin) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`⚠️ No tengo rango de capitán aquí`' },
            { quoted: m }
        )
    }

    const yaEsAdmin = participantes.some(
        p => p.num === remNum && p.admin
    )

    if (yaEsAdmin) {
        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`✅ Ya eres administrador de estas aguas`' },
            { quoted: m }
        )
    }

    try {
        const userJid = `${remNum}@s.whatsapp.net`

        await sock.groupParticipantsUpdate(
            from,
            [userJid],
            'promote'
        )

        await sock.sendMessage(from, {
            react: { text: '👑', key: m.key }
        })

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
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(
            from,
            {
                text:
                    `\`❌ No se pudo asignar rango\`\n` +
                    `${err.message}`
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