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

    let target = null

    const quotedParticipant =
        m.message?.extendedTextMessage?.contextInfo?.participant

    if (quotedParticipant) {
        target = quotedParticipant
    }

    const mentioned =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid

    if (!target && mentioned?.length) {
        target = mentioned[0]
    }

    if (!target) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`❌ Responde o menciona a alguien`'
        }, { quoted: m })
    }

    const numero = limpiarNumero(target)

    try {
        await sock.sendMessage(from, {
            react: { text: '🦈', key: m.key }
        })

        await sock.sendMessage(from, {
            text:
                `🌊 𝐄𝐗𝐏𝐔𝐋𝐒𝐀𝐃𝐎 🦈\n\n` +
                `Adiós @${numero}\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [target]
        }, { quoted: m })

        await sock.groupParticipantsUpdate(from, [target], 'remove')

    } catch (e) {
        console.log('ERROR KICK:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        await sock.sendMessage(from, {
            text: '`❌ No pude expulsarlo`'
        }, { quoted: m })
    }
}

handler.command = ['kick']
handler.help = ['kick @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler