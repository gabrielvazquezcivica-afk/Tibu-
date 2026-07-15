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

    // México
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

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(
            from,
            { text: '`🌊 Este comando solo funciona en grupos`' },
            { quoted: m }
        )
    }

    const owners = [
        ...config.owner.map(limpiarNumero).filter(Boolean),
        ...config.ownerLid.map(limpiarNumero).filter(Boolean)
    ]

    for (const o of leerOwners()) {
        if (o?.number) owners.push(limpiarNumero(o.number))
        if (o?.id) owners.push(limpiarNumero(o.id))
    }

    if (!owners.includes(senderNum)) {
        return sock.sendMessage(
            from,
            { text: '`🚫 Solo owners pueden usar este comando`' },
            { quoted: m }
        )
    }

    try {
        await sock.sendMessage(
            from,
            {
                text:
                    `\`🌊 ZARPANDO... 🦈\`\n\n` +
                    `El capitán ordenó abandonar estas aguas.\n` +
                    `Hasta la próxima.\n\n` +
                    `> ${config.BOT_NAME}`
            },
            { quoted: m }
        )

        setTimeout(async () => {
            await sock.groupLeave(from)
        }, 1500)

    } catch (e) {
        console.log('ERROR LEAVE:', e)

        return sock.sendMessage(
            from,
            {
                text:
                    `\`❌ No pude salir del grupo\`\n` +
                    `${e.message || e}`
            },
            { quoted: m }
        )
    }
}

handler.command = ['salir', 'leave']
handler.help = ['salir']
handler.tags = ['owner']
handler.menu = true

export default handler