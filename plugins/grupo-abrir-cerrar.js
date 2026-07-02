import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args, { isAdmin, isBotAdmin }) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = sender.split('@')[0]

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(
            from,
            { text: '`🌊 Solo funciona en grupos`' },
            { quoted: m }
        )
    }

    if (!await isAdmin(sock, from, sender)) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`🚫 Solo admins pueden usar este comando`' },
            { quoted: m }
        )
    }

    if (!await isBotAdmin(sock, from)) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`⚠️ Necesito ser admin del grupo`' },
            { quoted: m }
        )
    }

    try {
        const comando = m.command || ''

        if (comando === 'cerrar') {
            await sock.groupSettingUpdate(
                from,
                'announcement'
            )

            await sock.sendMessage(from, {
                react: { text: '🔒', key: m.key }
            })

            return sock.sendMessage(
                from,
                {
                    text:
                        `🌊 𝐆𝐑𝐔𝐏𝐎 𝐂𝐄𝐑𝐑𝐀𝐃𝐎 🔒\n\n` +
                        `Solo administradores pueden enviar mensajes.\n` +
                        `🦈 Cerrado por: @${senderNum}\n\n` +
                        `> ${config.BOT_NAME}`,
                    mentions: [sender]
                },
                { quoted: m }
            )
        }

        if (comando === 'abrir') {
            await sock.groupSettingUpdate(
                from,
                'not_announcement'
            )

            await sock.sendMessage(from, {
                react: { text: '🔓', key: m.key }
            })

            return sock.sendMessage(
                from,
                {
                    text:
                        `🌊 𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐈𝐄𝐑𝐓𝐎 🔓\n\n` +
                        `Todos los miembros pueden enviar mensajes.\n` +
                        `🦈 Abierto por: @${senderNum}\n\n` +
                        `> ${config.BOT_NAME}`,
                    mentions: [sender]
                },
                { quoted: m }
            )
        }

    } catch {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`❌ No pude cambiar la configuración del grupo`' },
            { quoted: m }
        )
    }
}

handler.command = ['abrir', 'cerrar', 'open', 'close']
handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.menu = true

export default handler