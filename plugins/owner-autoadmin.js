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

function limpiarNumero(texto = '') {
    return String(texto).replace(/[^0-9]/g, '')
}

// Obtiene el número REAL aunque venga en id/jid/lid
function obtenerNumero(obj) {
    if (!obj) return ''

    if (typeof obj === 'string') {
        if (obj.includes(':')) obj = obj.split(':')[0]
        return limpiarNumero(obj)
    }

    if (obj.jid) return obtenerNumero(obj.jid)
    if (obj.id) return obtenerNumero(obj.id)

    return ''
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = obtenerNumero(sender)

    if (m.key.fromMe) return

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`🌊 Solo funciona en grupos`' },
            { quoted: m }
        )
    }

    const fijos = [
        ...config.owner.map(limpiarNumero),
        ...config.ownerLid.map(limpiarNumero)
    ]

    const extras = leerExtras().map(o => limpiarNumero(o.number))
    const todosDueños = [...fijos, ...extras]

    if (!todosDueños.includes(senderNum)) {
        await sock.sendMessage(from, {
            react: { text: '🦈', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`🚫 Solo capitanes pueden usarlo`' },
            { quoted: m }
        )
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        await sock.sendMessage(from, {
            react: { text: '🪸', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`❌ No pude leer el grupo`' },
            { quoted: m }
        )
    }

    const participantes = metadata.participants || []

    // BOT
    const botNum = obtenerNumero(sock.user)
    const botInfo = participantes.find(
        p => obtenerNumero(p) === botNum
    )

    const botEsAdmin =
        botInfo?.admin === 'admin' ||
        botInfo?.admin === 'superadmin'

    if (!botEsAdmin) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`⚠️ No soy administrador aquí`' },
            { quoted: m }
        )
    }

    // USUARIO
    const userInfo = participantes.find(
        p => obtenerNumero(p) === senderNum
    )

    const yaEsAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'

    if (yaEsAdmin) {
        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`✅ Ya eres administrador`' },
            { quoted: m }
        )
    }

    const target =
        userInfo?.jid ||
        userInfo?.id ||
        sender

    await sock.sendMessage(from, {
        react: { text: '👑', key: m.key }
    })

    try {
        await sock.groupParticipantsUpdate(
            from,
            [target],
            'promote'
        )

        await sock.sendMessage(
            from,
            {
                text:
                    `\`🌊 CAPITÁN ASCENDIDO 🦈\`\n` +
                    `Ahora gobiernas estas aguas @${senderNum}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [target]
            },
            { quoted: m }
        )
    } catch (e) {
        console.log('❌ ERROR:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`❌ No pude darte el rango`' },
            { quoted: m }
        )
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['owner']
handler.menu = true

export default handler