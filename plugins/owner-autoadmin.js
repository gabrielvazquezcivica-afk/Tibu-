import config from '../config.js'

function limpiar(n) {
    return n.replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = m.key.participant || m.key.remoteJid
    const remNum = limpiar(remitente)

    // Solo dueños pueden usar
    const esDueno =
        config.owner.some(n => limpiar(n) === remNum) ||
        config.ownerLid.some(l => limpiar(l) === remNum)

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

    const botNumber = sock.user.id.replace(/:.*@/, '@')
    const metadata = await sock.groupMetadata(from)
    const participantes = metadata.participants

    // Verificar si el bot es admin
    const botEsAdmin = participantes.some(p => p.id === botNumber && p.admin)
    if (!botEsAdmin) {
        await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
        return sock.sendMessage(from, {
            text: '`⚠️ No tengo permisos de capitán aquí, no puedo asignar rangos`'
        }, { quoted: m })
    }

    // Ver si el usuario ya es admin
    const yaEsAdmin = participantes.some(p => p.id === remitente && p.admin)
    if (yaEsAdmin) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`✅ Ya eres administrador de estas aguas`'
        }, { quoted: m })
    }

    // Dar admin SOLO al que ejecutó
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
            text: `\`❌ No se pudo asignar rango\`\nError: ${err.message}`
        }, { quoted: m })
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['grupo']
handler.menu = true

export default handler
