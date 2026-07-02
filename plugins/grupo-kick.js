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

    // OBTENER TODOS LOS MENCIONADOS O EL CITADO
    const quotedParticipant = m.message?.extendedTextMessage?.contextInfo?.participant
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    let objetivos = []
    if (quotedParticipant) objetivos.push(quotedParticipant)
    if (mentioned.length) objetivos.push(...mentioned)

    if (objetivos.length === 0) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`❌ Ejemplos de uso:`\n> .kick @usuario o responde a un mensaje\n> .kick @usuario1 @usuario2 @usuario3',
            quoted: m
        })
    }

    // PROTECCIÓN: NO EXPULSAR AL DUEÑO
    const tieneDueno = objetivos.some(u => {
        const info = participantes.find(p => p.id === u || p.jid === u)
        return info?.admin === 'superadmin'
    })
    if (tieneDueno) {
        await sock.sendMessage(from, {
            react: { text: '👑', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`👑 No puedes expulsar al dueño del grupo`'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })

        let texto, menciones
        if (objetivos.length === 1) {
            const num = limpiarNumero(objetivos[0])
            texto = `🌊 𝐄𝐗𝐏𝐔𝐋𝐒𝐀𝐃𝐎 🦈\n\nAdiós @${num}\n\n> ${config.BOT_NAME}`
            menciones = [objetivos[0]]
        } else {
            const lista = objetivos.map(u => `• @${limpiarNumero(u)}`).join('\n')
            texto = `🌊 𝐄𝐗𝐏𝐔𝐋𝐒𝐀𝐃𝐎𝐒 🦈\n\nSe han retirado:\n${lista}\n\n> ${config.BOT_NAME}`
            menciones = objetivos
        }

        await sock.sendMessage(from, { text: texto, mentions: menciones }, { quoted: m })
        await sock.groupParticipantsUpdate(from, objetivos, 'remove')

    } catch (e) {
        console.log('ERROR KICK:', e)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        await sock.sendMessage(from, { text: '`❌ No pude expulsarlo/s`' }, { quoted: m })
    }
}

handler.command = ['kick']
handler.help = ['kick @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler
