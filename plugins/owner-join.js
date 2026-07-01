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

function limpiarNum(n) {
    return n.replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = limpiarNum(sender)

    // Verificar dueños: fijos + agregados
    const fijos = [...config.owner.map(limpiarNum), ...config.ownerLid.map(limpiarNum)]
    const extras = leerExtras().map(o => limpiarNum(o.number))
    const todosDueños = [...fijos, ...extras]

    if (!todosDueños.includes(senderNum)) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🚫 Solo los capitanes pueden usar este comando`'
        }, { quoted: m })
    }

    // Obtener link: por respuesta o argumento
    let link
    if (m.quoted && m.quoted.message) {
        const textoLink = m.quoted.message.conversation || m.quoted.message.extendedTextMessage?.text || ''
        link = textoLink.match(/chat.whatsapp.com\/([A-Za-z0-9_-]+)/)?.[0]
    } else if (args[0]) {
        link = args[0].match(/chat.whatsapp.com\/([A-Za-z0-9_-]+)/)?.[0]
    }

    if (!link) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Responde a un enlace o envíalo con el comando`\nEj: `.join enlace`'
        }, { quoted: m })
    }

    const codigo = link.split('/')[1]

    try {
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } })

        // Unirse al grupo
        const grupoId = await sock.acceptInvite(codigo)

        // Obtener datos del grupo
        const metadata = await sock.groupMetadata(grupoId)
        const nombreGrupo = metadata.subject || 'Grupo desconocido'
        const participantes = metadata.participants.map(p => p.id)

        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

        // Aviso al grupo mencionando a todos
        await sock.sendMessage(grupoId, {
            text: `\`🌊 HE ENTRADO A NAVEGAR 🦈\`\nSaludos a todos los miembros de este grupo.\n\n> ${config.BOT_NAME}`,
            mentions: participantes
        })

        // Aviso en el mismo chat donde se usó el comando
        await sock.sendMessage(from, {
            text: `\`✅ ENTRADA EXITOSA 🏴‍☠️\nHe ingresado al grupo:\n📌 ${nombreGrupo}\n🆔 ${grupoId}`
        }, { quoted: m })

    } catch (err) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        let mensajeError = 'No pude entrar al grupo.'
        if (err.message.includes('403')) mensajeError = '`❌ No tengo permiso o el enlace está revocado`'
        if (err.message.includes('409')) mensajeError = '`❌ Ya estoy en ese grupo`'
        return sock.sendMessage(from, { text: mensajeError }, { quoted: m })
    }
}

handler.command = ['join', 'unirme']
handler.help = ['join <enlace> o responde al enlace']
handler.tags = ['owner']
handler.menu = true

export default handler
