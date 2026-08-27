let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    // Solo grupos
    if (!from?.endsWith('@g.us')) {
        return sock.sendMessage(
            from,
            {
                text: '`🌊 Solo funciona en grupos`'
            },
            { quoted: m }
        )
    }

    // Obtener información del grupo
    let metadata

    try {
        metadata = await sock.groupMetadata(from)
    } catch (e) {
        return sock.sendMessage(
            from,
            {
                text: '`❌ No pude leer el grupo`'
            },
            { quoted: m }
        )
    }

    const participantes = metadata.participants || []

    // Comprobar si quien usa .del es admin
    const userInfo = participantes.find(
        p => p.id === sender || p.jid === sender
    )

    const isAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        return sock.sendMessage(
            from,
            {
                text: '`🚫 Solo admins pueden usarlo`'
            },
            { quoted: m }
        )
    }

    // Comprobar si el bot es admin
    const botNumber = sock.user?.id?.split(':')[0]

    const botId = botNumber
        ? `${botNumber}@s.whatsapp.net`
        : null

    const botInfo = participantes.find(
        p => p.id === botId || p.jid === botId
    )

    const botAdmin =
        botInfo?.admin === 'admin' ||
        botInfo?.admin === 'superadmin'

    if (!botAdmin) {
        return sock.sendMessage(
            from,
            {
                text: '`⚠️ No soy admin aquí`'
            },
            { quoted: m }
        )
    }

    // Obtener mensaje respondido
    const ctx =
        m.message?.extendedTextMessage?.contextInfo

    if (!ctx?.stanzaId) {
        return sock.sendMessage(
            from,
            {
                text: '`❌ Responde al mensaje a borrar`'
            },
            { quoted: m }
        )
    }

    try {

        // Borrar mensaje respondido
        await sock.sendMessage(
            from,
            {
                delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: ctx.stanzaId,
                    participant: ctx.participant
                }
            }
        )

        // Borrar el comando .del
        try {
            await sock.sendMessage(
                from,
                {
                    delete: m.key
                }
            )
        } catch {}

    } catch (e) {

        console.log(
            'DEL ERROR:',
            e?.message || e
        )

        return sock.sendMessage(
            from,
            {
                text: '`❌ No pude borrar el mensaje`'
            },
            { quoted: m }
        )
    }
}

handler.command = ['del']
handler.help = ['del']
handler.tags = ['grupo']
handler.menu = true

export default handler