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
        if (o.number) owners.push(limpiarNumero(o.number))
        if (o.id) owners.push(limpiarNumero(o.id))
    }

    if (!owners.includes(senderNum)) {
        return sock.sendMessage(
            from,
            { text: '`🚫 Solo capitanes pueden usar este comando`' },
            { quoted: m }
        )
    }

    let texto = args.join(' ')

    if (!texto && m.quoted?.text) {
        texto = m.quoted.text
    }

    if (!texto && m.quoted?.message) {
        texto = JSON.stringify(m.quoted.message)
    }

    const match = texto.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)

    if (!match) {
        return sock.sendMessage(
            from,
            {
                text:
                    '`❌ Envíame o responde a un link de invitación`\n' +
                    'Ej:\n.join https://chat.whatsapp.com/...'
            },
            { quoted: m }
        )
    }

    const inviteCode = match[1]

    try {
        const grupo = await sock.groupAcceptInvite(inviteCode)
        const metadata = await sock.groupMetadata(grupo)

        const ownerMention = [sender]

        // Aviso en grupo al entrar
        await sock.sendMessage(
            grupo,
            {
                text:
                    `\`🌊 TIBU BOT CONECTADO 🦈\`\n\n` +
                    `Fui agregado por @${senderNum}\n` +
                    `Listo para navegar estas aguas.\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: ownerMention
            }
        )

        // Aviso al owner donde ejecutó comando
        await sock.sendMessage(
            from,
            {
                text:
                    `\`✅ GRUPO UNIDO\`\n` +
                    `Entré correctamente a:\n` +
                    `${metadata.subject}`
            },
            { quoted: m }
        )

    } catch (e) {
        console.log('ERROR JOIN:', e)

        await sock.sendMessage(
            from,
            {
                text:
                    `\`❌ No pude entrar al grupo\`\n` +
                    `${e.message || e}`
            },
            { quoted: m }
        )
    }
}

handler.command = ['join']
handler.help = ['join <link>']
handler.tags = ['owner']
handler.menu = true

export default handler