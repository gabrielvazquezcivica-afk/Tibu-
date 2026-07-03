import config from '../config.js'

function limpiarNumero(num = '') {
    return String(num).replace(/[^0-9]/g, '')
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
            text: '`🚫 Solo capitanes pueden usar la ruleta`'
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

    // Filtrar solo miembros normales
    const candidatos = participantes.filter(p => {
        const jid = p.id || p.jid
        if (!jid) return false
        if (jid === sender) return false
        if (jid === botId) return false
        if (p.admin === 'admin' || p.admin === 'superadmin') return false
        return true
    })

    if (!candidatos.length) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`⚠️ No hay tripulantes para expulsar`'
        }, { quoted: m })
    }

    const elegido =
        candidatos[Math.floor(Math.random() * candidatos.length)]

    const target = elegido.id || elegido.jid
    const numero = limpiarNumero(target)

    try {
        await sock.sendMessage(from, {
            react: { text: '🎰', key: m.key }
        })

        await sock.sendMessage(from, {
            text:
                `🎰 𝐑𝐔𝐋𝐄𝐓𝐀 𝐃𝐄𝐋 𝐌𝐀𝐑 🎰\n\n` +
                `🌊 La ruleta giró...\n` +
                `💀 Perdedor: @${numero}\n` +
                `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
                `⚓ Fue arrojado por la borda\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [target, sender]
        }, { quoted: m })

        await sock.groupParticipantsUpdate(
            from,
            [target],
            'remove'
        )

    } catch (e) {
        console.log('RULETABAN ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ No pude expulsarlo`'
        }, { quoted: m })
    }
}

handler.command = ['ruletaban']
handler.help = ['ruletaban']
handler.tags = ['grupo']
handler.menu = true

export default handler