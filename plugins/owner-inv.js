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

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = limpiarNumero(sender)

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
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
        return sock.sendMessage(from, {
            text:
`🚫 \`Solo capitanes pueden usar este comando\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const ownerNum = owners[0]
    const ownerJid = ownerNum + '@s.whatsapp.net'

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🦈',
                key: m.key
            }
        })

        try {

            await sock.groupParticipantsUpdate(
                from,
                [ownerJid],
                'add'
            )

            return sock.sendMessage(from, {
                text:
`🦈 \`Capitán agregado correctamente.\`

> ${config.BOT_NAME}`
            }, { quoted: m })

        } catch {

            const code = await sock.groupInviteCode(from)

            const link =
                `https://chat.whatsapp.com/${code}`

            await sock.sendMessage(ownerJid, {
                text:
`🌊 Has sido invitado a un grupo.

🔗 ${link}

> ${config.BOT_NAME}`
            }).catch(() => {})

            return sock.sendMessage(from, {
                text:
`📨 \`No pude agregar al capitán.\`

🔗 Se le envió la invitación por privado.

> ${config.BOT_NAME}`
            }, { quoted: m })
        }

    } catch (e) {

        console.log('INVOWNER ERROR:', e)

        return sock.sendMessage(from, {
            text:
`❌ \`Error al invitar al capitán.\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['invowner']
handler.help = ['invowner']
handler.tags = ['owner']
handler.group = true
handler.menu = true

export default handler