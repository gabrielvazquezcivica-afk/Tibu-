import config from '../config.js'

let handler = {}

handler.run = async (
    sock,
    m,
    args,
    { isAdmin, isBotAdmin }
) => {
    const from = m.key.remoteJid
    const sender =
        m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🌊',
                    key: m.key
                }
            }
        )

        return sock.sendMessage(
            from,
            {
                text: '`🌊 Solo funciona en grupos`'
            },
            { quoted: m }
        )
    }

    if (!(await isAdmin(sock, from, sender))) {
        await sock.sendMessage(from, {
            react: {
                text: '🚫',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text:
                    '`🚫 Solo administradores pueden usar esto`'
            },
            { quoted: m }
        )
    }

    if (!(await isBotAdmin(sock, from))) {
        await sock.sendMessage(from, {
            react: {
                text: '⚠️',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text:
                    '`⚠️ Debo ser admin para hacer eso`'
            },
            { quoted: m }
        )
    }

    const comando =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        ''

    const cmd = comando
        .trim()
        .slice(config.PREFIX.length)
        .split(' ')[0]
        .toLowerCase()

    const numero = sender
        .replace(/:\d+@/, '@')
        .replace(/@lid$/, '')
        .replace(/@s.whatsapp.net$/, '')

    try {
        if (cmd === 'cerrar') {
            await sock.groupSettingUpdate(
                from,
                'announcement'
            )

            await sock.sendMessage(from, {
                react: {
                    text: '🔒',
                    key: m.key
                }
            })

            return sock.sendMessage(
                from,
                {
                    text:
                        `🔒 𝐆𝐑𝐔𝐏𝐎 𝐂𝐄𝐑𝐑𝐀𝐃𝐎\n\n` +
                        `Solo admins pueden enviar mensajes\n` +
                        `👮 Cerrado por: @${numero}\n\n` +
                        `> ${config.BOT_NAME}`,
                    mentions: [sender]
                },
                { quoted: m }
            )
        }

        if (cmd === 'abrir') {
            await sock.groupSettingUpdate(
                from,
                'not_announcement'
            )

            await sock.sendMessage(from, {
                react: {
                    text: '🔓',
                    key: m.key
                }
            })

            return sock.sendMessage(
                from,
                {
                    text:
                        `🔓 𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐈𝐄𝐑𝐓𝐎\n\n` +
                        `Todos pueden enviar mensajes\n` +
                        `👮 Abierto por: @${numero}\n\n` +
                        `> ${config.BOT_NAME}`,
                    mentions: [sender]
                },
                { quoted: m }
            )
        }
    } catch (e) {
        console.log('ERROR GRUPO:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text:
                    '`❌ No pude cambiar el estado del grupo`'
            },
            { quoted: m }
        )
    }
}

handler.command = ['abrir', 'cerrar']
handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.menu = true

export default handler