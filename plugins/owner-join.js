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

    // Verificar dueños
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
        return sock.sendMessage(from, { text: '`🚫 Solo capitanes pueden usar este comando`' }, { quoted: m })
    }

    let texto = ''

    // Caso 1: lo pasas como argumento .join enlace
    if (args.length > 0) {
        texto = args.join(' ')
    }
    // Caso 2: respondes a un mensaje
    else if (m.quoted) {
        texto = m.quoted.text || m.quoted.caption || m.quoted.conversation || ''
    }
    // Caso 3: viene en el mismo mensaje
    else {
        texto = m.text || m.caption || ''
    }

    // Buscar el enlace
    const match = texto.match(/(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)

    if (!match) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, {
            text: '`❌ Envíame o responde a un link de invitación`\nEj:\n.join https://chat.whatsapp.com/...'
        }, { quoted: m })
    }

    const inviteCode = match[1]

    try {
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } })

        const grupo = await sock.groupAcceptInvite(inviteCode)
        const metadata = await sock.groupMetadata(grupo)

        // Mensaje en el grupo
        await sock.sendMessage(grupo, {
            text: `\`🌊 TIBU BOT CONECTADO 🦈\`\n\nFui agregado por @${senderNum}\nListo para navegar estas aguas.\n\n> ${config.BOT_NAME}`,
            mentions: [sender]
        })

        // Confirmación
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        await sock.sendMessage(from, {
            text: `\`✅ GRUPO UNIDO\`\nEntré correctamente a:\n${metadata.subject}`
        }, { quoted: m })

    } catch (e) {
        console.log('ERROR JOIN:', e)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        await sock.sendMessage(from, {
            text: `\`❌ No pude entrar al grupo\`\n${e.message || e}`
        }, { quoted: m })
    }
}

handler.command = ['join']
handler.help = ['join <link>']
handler.tags = ['owner']
handler.menu = true

export default handler
