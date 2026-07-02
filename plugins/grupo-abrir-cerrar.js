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

    const rawText =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        ''

    const cmd = rawText.trim().split(' ')[0].replace(config.PREFIX, '').toLowerCase()

    const numero = sender.replace(/[^0-9]/g, '')

    try {
        if (cmd === 'cerrar') {
            await sock.groupSettingUpdate(
                from,
                'announcement'
            )

            await sock.sendMessage(from, {
                react: { text: '🔒', key: m.key }
            })

            return sock.sendMessage(from, {
                text:
                    `🔒 𝐆𝐑𝐔𝐏𝐎 𝐂𝐄𝐑𝐑𝐀𝐃𝐎\n\n` +
                    `Solo admins pueden enviar mensajes\n` +
                    `👮 Cerrado por: @${numero}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [sender]
            }, { quoted: m })
        }

        if (cmd === 'abrir') {
            await sock.groupSettingUpdate(
                from,
                'not_announcement'
            )

            await sock.sendMessage(from, {
                react: { text: '🔓', key: m.key }
            })

            return sock.sendMessage(from, {
                text:
                    `🔓 𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐈𝐄𝐑𝐓𝐎\n\n` +
                    `Todos pueden enviar mensajes\n` +
                    `👮 Abierto por: @${numero}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [sender]
            }, { quoted: m })
        }

    } catch (e) {
        console.log('ERROR GRUPO:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ No pude cambiar ajustes del grupo`'
        }, { quoted: m })
    }
}

handler.command = ['abrir', 'cerrar']
handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.menu = true

export default handler