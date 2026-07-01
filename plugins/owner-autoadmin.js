import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerExtras() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = sender.split('@')[0]

    if (m.key.fromMe) return
    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, { text: '`🌊 Solo funciona en grupos`' }, { quoted: m })
    }

    // Validar dueños fijos + agregados
    const fijos = [...config.owner, ...config.ownerLid]
    const extras = leerExtras().map(o => o.number)
    const todosDueños = [...fijos, ...extras]

    if (!todosDueños.includes(senderNum)) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo capitanes pueden usarlo`' }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        await sock.sendMessage(from, { react: { text: '🪸', key: m.key } })
        return sock.sendMessage(from, { text: '`❌ No pude leer el grupo`' }, { quoted: m })
    }

    const participantes = metadata.participants

    // Limpiar ID del bot para coincidir
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    // Verificar bot primero
    const botInfo = participantes.find(p => p.id === botId)
    const botEsAdmin = botInfo?.admin === 'admin' || botInfo?.admin === 'superadmin'

    if (!botEsAdmin) {
        await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
        return sock.sendMessage(from, { text: '`⚠️ No soy administrador aquí`' }, { quoted: m })
    }

    // Verificar usuario
    const userInfo = participantes.find(p => p.id === sender)
    const yaEsAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'

    if (yaEsAdmin) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, { text: '`✅ Ya eres administrador`' }, { quoted: m })
    }

    // Ascender
    await sock.sendMessage(from, { react: { text: '👑', key: m.key } })
    try {
        await sock.groupParticipantsUpdate(from, [sender], 'promote')
        await sock.sendMessage(from, {
            text: `\`🌊 CAPITÁN ASCENDIDO 🦈\`\nAhora gobiernas estas aguas @${senderNum}\n\n> ${config.BOT_NAME}`,
            mentions: [sender]
        }, { quoted: m })
    } catch (e) {
        console.log('❌ ERROR:', e)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, { text: '`❌ No pude darte el rango`' }, { quoted: m })
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['owner']
handler.menu = true

export default handler
