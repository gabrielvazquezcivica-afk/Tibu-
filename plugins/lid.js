let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    let target = null

    // Reply
    if (m.quoted?.key) {
        target =
            m.quoted.key.participant ||
            m.quoted.key.remoteJid
    }

    // Mention
    else if (
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length
    ) {
        target =
            m.message.extendedTextMessage
                .contextInfo
                .mentionedJid[0]
    }

    // Yo mismo
    else {
        target =
            m.key.participant ||
            m.key.remoteJid
    }

    let lid = target
    let jid = target

    // Si es grupo, buscar metadata para obtener ambos
    if (from.endsWith('@g.us')) {
        try {
            const metadata = await sock.groupMetadata(from)
            const participante = metadata.participants.find(
                p =>
                    p.id === target ||
                    p.jid === target
            )

            if (participante) {
                lid = participante.id || 'No encontrado'
                jid = participante.jid || 'No encontrado'
            }
        } catch {}
    }

    await sock.sendMessage(
        from,
        {
            text:
                `\`🦈 INFO IDENTIDAD\`\n\n` +
                `LID: ${lid}\n` +
                `JID: ${jid}`
        },
        { quoted: m }
    )
}

handler.command = ['lid', 'idlid']
handler.help = ['lid']
handler.tags = ['tools']
handler.menu = true

export default handler