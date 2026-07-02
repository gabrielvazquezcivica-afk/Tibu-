import config from '../config.js'

function limpiarNumero(num = '') {
    return String(num).replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
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

    const userInfo = participantes.find(p => p.id === sender || p.jid === sender)
    const isAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚫 Solo admins pueden usarlo`'
        }, { quoted: m })
    }

    const botInfo = participantes.find(
        p =>
            p.id === sock.user.id ||
            p.jid === sock.user.id ||
            p.id?.includes(sock.user.id.split(':')[0]) ||
            p.jid?.includes(sock.user.id.split(':')[0])
    )

    const botAdmin = botInfo?.admin === 'admin' || botInfo?.admin === 'superadmin'

    if (!botAdmin) {
        return sock.sendMessage(from, {
            text: '`⚠️ No soy admin aquí`'
        }, { quoted: m })
    }

    let target =
        m.message?.extendedTextMessage?.contextInfo?.participant ||
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!target) {
        return sock.sendMessage(from, {
            text: '`❌ Responde o menciona a alguien`'
        }, { quoted: m })
    }

    try {
        await sock.groupParticipantsUpdate(from, [target], 'promote')

        await sock.sendMessage(from, {
            react: { text: '👑', key: m.key }
        })

        await sock.sendMessage(from, {
            text: `🌊 𝐀𝐒𝐂𝐄𝐍𝐃𝐈𝐃𝐎 🦈\n\n@${limpiarNumero(target)} ahora es admin\n\n> ${config.BOT_NAME}`,
            mentions: [target]
        }, { quoted: m })
    } catch (e) {
        console.log(e)
        await sock.sendMessage(from, {
            text: '`❌ No pude ascenderlo`'
        }, { quoted: m })
    }
}

handler.command = ['promote']
handler.help = ['promote @user']
handler.tags = ['grupo']
handler.menu = true

export default handler