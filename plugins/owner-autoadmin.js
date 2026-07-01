import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerOwnersExtras() {
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
    const isGroup = from.endsWith('@g.us')

    if (m.key.fromMe) return

    if (!isGroup) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
    }

    // Verificar dueños fijos y agregados
    const fijos = [...config.owner, ...config.ownerLid]
    const extras = leerOwnersExtras().map(o => o.number)
    const todosDueños = [...fijos, ...extras]

    if (!todosDueños.includes(senderNum)) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚫 Solo los capitanes pueden usar este comando`'
        }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        await sock.sendMessage(from, { react: { text: '🪸', key: m.key } })
        return sock.sendMessage(from, {
            text: '`❌ No pude leer los datos del grupo`'
        }, { quoted: m })
    }

    const participantes = metadata.participants || []

    // ✅ DETECCIÓN DIRECTA COMO LO REPORTA WHATSAPP
    const botId = sock.user.id.replace(/:.*@/, '@')
    const datosBot = participantes.find(p => p.id === botId)
    const botEsAdmin = datosBot?.admin === 'admin' || datosBot?.admin === 'superadmin'

    if (!botEsAdmin) {
        await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
        return sock.sendMessage(from, {
            text: '`⚠️ No tengo rango de capitán aquí, no puedo asignar rangos`'
        }, { quoted: m })
    }

    const datosUsuario = participantes.find(p => p.id === sender)
    const yaEsAdmin = datosUsuario?.admin === 'admin' || datosUsuario?.admin === 'superadmin'

    if (yaEsAdmin) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`✅ Ya eres administrador de estas aguas`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, { react: { text: '👑', key: m.key } })
    try {
        await sock.groupParticipantsUpdate(from, [sender], 'promote')
        await sock.sendMessage(from, {
            text: `\`🌊 CAPITÁN ASCENDIDO 🦈\`\nAhora gobiernas estas aguas @${senderNum}\n\n> ${config.BOT_NAME}`,
            mentions: [sender]
        }, { quoted: m })
    } catch (e) {
        console.log('❌ ERROR AUTOADMIN:', e)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, {
            text: '`❌ No se pudo asignar el rango`'
        }, { quoted: m })
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['owner']
handler.menu = true

export default handler
