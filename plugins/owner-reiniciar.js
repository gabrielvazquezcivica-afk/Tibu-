import config from '../config.js'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

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

handler.run = async (sock, m) => {
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
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`🚫 Solo capitanes pueden reiniciarme`' },
            { quoted: m }
        )
    }

    await sock.sendMessage(from, {
        react: { text: '🔄', key: m.key }
    })

    await sock.sendMessage(
        from,
        {
            text:
                `\`🔄 REINICIANDO BOT\`\n` +
                `Volviendo a navegar...\n\n` +
                `> ${config.BOT_NAME}`
        },
        { quoted: m }
    )

    setTimeout(() => {
        exec('pm2 restart Tibu')
    }, 1500)
}

handler.command = ['restart', 'reiniciar']
handler.help = ['restart']
handler.tags = ['owner']
handler.menu = true

export default handler