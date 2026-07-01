import config from '../config.js'

function limpiarNum(n) {
    return n.replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args, { isAdmin, isBotAdmin, limpiarJid }) => {
    const from = m.key.remoteJid
    const remitente = limpiarJid(m.key.participant || m.key.remoteJid)
    const remNum = limpiarNum(remitente)

    // Solo dueños pueden usar
    const esDueno =
        config.owner.some(n => limpiarNum(n) === remNum) ||
        config.ownerLid.some(l => limpiarNum(l) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚫 Solo los capitanes pueden usar este comando`'
        }, { quoted: m })
    }

    // Solo en grupos
    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
    }

    // Verificar si el bot es admin
    const botEsAdmin = await isBotAdmin(sock, from)
    if (!botEsAdmin) {
        await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
        return sock.sendMessage(from, {
            text: '`⚠️ No tengo rango de capitán aquí, no puedo asignar rangos`'
        }, { quoted: m })
    }

    // Verificar si ya es admin
    const yaEsAdmin = await isAdmin(sock, from, remitente)
    if (yaEsAdmin) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`✅ Ya eres administrador de estas aguas`'
        }, { quoted: m })
    }

    // Dar admin solo al que ejecutó
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
