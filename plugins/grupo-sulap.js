import config from '../config.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

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
            text: '`🚫 Solo capitanes pueden usar magia`'
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

    let target = null

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.participant

    const mentioned =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid

    if (quoted) target = quoted
    if (!target && mentioned?.length) target = mentioned[0]

    if (!target) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`❌ Responde o menciona a alguien`'
        }, { quoted: m })
    }

    const targetInfo = participantes.find(
        p => p.id === target || p.jid === target
    )

    if (targetInfo?.admin === 'superadmin') {
        return sock.sendMessage(from, {
            text: '`👑 No puedo desaparecer al dueño del grupo`'
        }, { quoted: m })
    }

    const numero = target.split('@')[0]

    try {
        await sock.sendMessage(from, {
            react: { text: '🪄', key: m.key }
        })

        await sock.sendMessage(from, {
            text: `🪄 Preparando ritual marino para @${numero}...`,
            mentions: [target]
        }, { quoted: m })

        await sleep(1500)

        await sock.sendMessage(from, {
            text: `🌊 Invocando olas místicas...`
        })

        await sleep(1500)

        await sock.sendMessage(from, {
            text: `🐟 Abracadabra... Tiburcadabra...`
        })

        await sleep(1800)

        await sock.sendMessage(from, {
            text: `💨 ¡Y desaparece del océano!`
        })

        await sleep(1000)

        await sock.groupParticipantsUpdate(
            from,
            [target],
            'remove'
        )

    } catch (e) {
        console.log('SULAP ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ El truco falló`'
        }, { quoted: m })
    }
}

handler.command = ['sulap']
handler.help = ['sulap @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler