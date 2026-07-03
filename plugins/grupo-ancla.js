import config from '../config.js'

let handler = {}

function parseTiempo(txt = '') {
    const match = txt.toLowerCase().match(/^(\d+)(s|m|h)$/)
    if (!match) return null

    const num = Number(match[1])
    const unidad = match[2]

    if (unidad === 's') return num * 1000
    if (unidad === 'm') return num * 60 * 1000
    if (unidad === 'h') return num * 60 * 60 * 1000

    return null
}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Solo funciona en grupos`'
        }, { quoted: m })
    }

    if (!args?.[0]) {
        return sock.sendMessage(from, {
            text:
                '`⚓ Usa: .ancla 3s | .ancla 5m | .ancla 1h`'
        }, { quoted: m })
    }

    const ms = parseTiempo(args[0])

    if (!ms) {
        return sock.sendMessage(from, {
            text:
                '`❌ Formato inválido (ej: 3s, 5m, 1h)`'
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
        return sock.sendMessage(from, {
            text: '`🚫 Solo capitanes pueden usar el ancla`'
        }, { quoted: m })
    }

    const botId =
        sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botInfo = participantes.find(
        p => p.id === botId || p.jid === botId
    )

    const botAdmin =
        botInfo?.admin === 'admin' ||
        botInfo?.admin === 'superadmin'

    if (!botAdmin) {
        return sock.sendMessage(from, {
            text: '`⚠️ No soy admin aquí`'
        }, { quoted: m })
    }

    try {
        await sock.groupSettingUpdate(
            from,
            'announcement'
        )

        await sock.sendMessage(from, {
            text:
                `⚓ 𝐀𝐍𝐂𝐋𝐀 𝐋𝐀𝐍𝐙𝐀𝐃𝐀\n\n` +
                `🔒 Grupo cerrado por: ${args[0]}\n` +
                `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [sender]
        }, { quoted: m })

        setTimeout(async () => {
            try {
                await sock.groupSettingUpdate(
                    from,
                    'not_announcement'
                )

                await sock.sendMessage(from, {
                    text:
                        `🌊 𝐀𝐍𝐂𝐋𝐀 𝐋𝐄𝐕𝐀𝐍𝐓𝐀𝐃𝐀\n\n` +
                        `🛶 El mar vuelve a abrirse\n\n` +
                        `> ${config.BOT_NAME}`
                })
            } catch (e) {
                console.log('ERROR REABRIENDO:', e)
            }
        }, ms)

    } catch (e) {
        console.log('ANCLA ERROR:', e)

        await sock.sendMessage(from, {
            text: '`❌ No pude cerrar el grupo`'
        }, { quoted: m })
    }
}

handler.command = ['ancla']
handler.help = ['ancla 3m']
handler.tags = ['grupo']
handler.menu = true

export default handler