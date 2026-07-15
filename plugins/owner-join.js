import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerOwners() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

function limpiarNumero(num = '') {
    num = String(num).replace(/[^0-9]/g, '')
    if (num.startsWith('521') && num.length === 13) {
        num = '52' + num.slice(3)
    }
    return num
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = limpiarNumero(sender)

    const owners = [
        ...config.owner.map(limpiarNumero).filter(Boolean),
        ...config.ownerLid.map(limpiarNumero).filter(Boolean)
    ]
    for (const o of leerOwners()) {
        if (o?.number) owners.push(limpiarNumero(o.number))
        if (o?.id) owners.push(limpiarNumero(o.id))
    }

    if (!owners.includes(senderNum)) {
        await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo owners pueden usar este comando`' }, { quoted: m })
    }

    let texto = ''

    // 1. Si trae argumentos después del comando
    if (args && args.length > 0) {
        texto = args.join(' ')
    }
    // 2. Si es una respuesta a otro mensaje
    else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const q = m.message.extendedTextMessage.contextInfo.quotedMessage
        texto = q.conversation ||
                q.extendedTextMessage?.text ||
                q.imageMessage?.caption ||
                q.videoMessage?.caption || ''
    }
    // 3. Si el enlace está en el mismo mensaje
    else {
        texto = m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    }

    const match = texto.match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i)

    if (!match) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, {
            text: '`❌ No encontré ningún enlace válido`\nEjemplo:\n.join https://chat.whatsapp.com/abcd1234'
        }, { quoted: m })
    }

    const codigo = match[1]

    try {
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } })

        const grupoId = await sock.groupAcceptInvite(codigo)
        const info = await sock.groupMetadata(grupoId)

        await sock.sendMessage(grupoId, {
            text: `\`🌊 TIBU BOT CONECTADO 🦈\`\n\nFui agregado por @${senderNum}\nListo para navegar estas aguas.\n\n> ${config.BOT_NAME}`,
            mentions: [sender]
        })

        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        await sock.sendMessage(from, {
            text: `\`✅ GRUPO UNIDO\`\nEntré correctamente a:\n${info.subject}`
        }, { quoted: m })

    } catch (err) {
        console.error('ERROR JOIN:', err)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        await sock.sendMessage(from, {
            text: `\`❌ No pude entrar\`\n${err.message || err}`
        }, { quoted: m })
    }
}

handler.command = ['join']
handler.help = ['join <link>']
handler.tags = ['owner']
handler.menu = true

export default handler
