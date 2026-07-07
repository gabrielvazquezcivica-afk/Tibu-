import config from '../config.js'
import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'muteados.json')

function leerDB() {
    try {
        return JSON.parse(fs.readFileSync(ruta, 'utf8'))
    } catch {
        return {}
    }
}

function guardarDB(db) {
    fs.mkdirSync(path.dirname(ruta), { recursive: true })
    fs.writeFileSync(ruta, JSON.stringify(db, null, 2))
}

function limpiarNumero(jid = '') {
    return String(jid).replace(/[^0-9]/g, '')
}

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender =
    m.key.participant || m.key.remoteJid

const senderNum = limpiarNumero(sender)

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`🌊 Solo funciona en grupos`'
        }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return sock.sendMessage(from, {
            text: '`❌ No pude leer el grupo`'
        }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const adminInfo = participantes.find(
    p => limpiarNumero(p.id || p.jid) === senderNum
)

    const isAdmin =
        adminInfo?.admin === 'admin' ||
        adminInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`🚫 Solo capitanes pueden liberarlo`'
        }, { quoted: m })
    }

    let target =
        m.message?.extendedTextMessage?.contextInfo?.participant ||
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!target) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`❌ Responde o menciona un usuario`'
        }, { quoted: m })
    }

    const numero = limpiarNumero(target)

    const db = leerDB()

    if (!db[from]) db[from] = []

    const existe = db[from].includes(numero)

    if (!existe) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`⚠️ Ese tripulante no está silenciado`'
        }, { quoted: m })
    }

    db[from] = db[from].filter(
    x => x !== numero
)

    guardarDB(db)

global.actualizarCache?.()

    await sock.sendMessage(from, {
        react: { text: '🔊', key: m.key }
    })

    await sock.sendMessage(from, {
        text:
            `🔊 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐍𝐓𝐄 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎\n\n` +
            `👤 Usuario: @${target.split('@')[0]}\n` +
            `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
            `🌊 Puede volver a navegar\n\n` +
            `> ${config.BOT_NAME}`,
        mentions: [target, sender]
    }, { quoted: m })
}

handler.command = ['unmute']
handler.help = ['unmute']
handler.tags = ['grupo']
handler.menu = true

export default handler