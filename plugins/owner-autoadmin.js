import config from '../config.js'

function limpiar(n) {
    return n.replace(/[:].*@/, '@').trim()
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = limpiar(m.key.participant || m.key.remoteJid)
    const remNum = remitente.replace(/[^0-9]/g, '')

    // Solo dueños
    const esDueno =
        config.owner.some(n => limpiar(n) === remNum) ||
        config.ownerLid.some(l => limpiar(l) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo capitanes pueden usarlo`' }, { quoted: m })
    }

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, { text: '`🌊 Solo funciona en grupos`' }, { quoted: m })
    }

    const botId = limpiar(sock.user.id)
    const metadata = await sock.groupMetadata(from)
    const participantes = metadata.participants.map(p => ({ id: limpiar(p.id), admin: p.admin }))

    // Verificación limpia
    const botEsAdmin = participantes.some(p => p.id === botId && p.admin)
    if (!botEsAdmin) {
        await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
        return sock.sendMessage(from, {
            text: '`⚠️ No tengo rango de capitán aquí`'
        }, { quoted: m })
    }

    const yaEsAdmin = participantes.some(p => p.id === remitente && p.admin)
    if (yaEsAdmin) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`✅ Ya eres administrador de estas aguas`'
        }, { quoted: m })
    }

    try {
        await sock.groupParticipantsUpdate(from, [remitente], 'promote')
        await sock.sendMessage(from, { react: { text: '👑', key: m.key } })
        await sock.sendMessage(from, {
            text: `\`🌊 CAPITÁN ASCENDIDO 🦈\`\nAhora gobiernas estas aguas @${remNum}\n\n> ${config.BOT_NAME}`,
            mentions: [remitente]
        }, { quoted: m })
    } catch (err) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        await sock.sendMessage(from, {
            text: `\`❌ No se pudo asignar rango\`\n${err.message}`
        }, { quoted: m })
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['grupo']
handler.menu = true

export default handler
