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

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

let handler = {}

handler.run = async (sock, m, args, { isAdmin }) => {
    const from = m.key.remoteJid
    const sender = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Solo funciona en grupos`'
        }, { quoted: m })
    }

    if (!await isAdmin(sock, from, sender)) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })
        return
    }

    let target = null

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.participant

    const mentioned =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid

    if (quoted) target = quoted
    if (!target && mentioned?.length) target = mentioned[0]

    if (!target) {
        return sock.sendMessage(from, {
            text: '`❌ Responde o menciona un usuario`'
        }, { quoted: m })
    }

    target = limpiarJid(target)

    const db = leerDB()

    if (!db[from]) db[from] = []

    if (!db[from].includes(target)) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`⚠️ Ese usuario no estaba muteado`'
        }, { quoted: m })
    }

    // Quitar de la base de datos
    db[from] = db[from].filter(
        user => limpiarJid(user) !== target
    )
    guardarDB(db)

    // ✅ QUITAR DE LA LISTA RÁPIDA EN MEMORIA
    if (global.silenciadosCache) {
        global.silenciadosCache.delete(target)
    }

    const numero = target.split('@')[0]
    const adminNum = sender.split('@')[0]

    await sock.sendMessage(from, {
        react: { text: '🔊', key: m.key }
    })

    await sock.sendMessage(from, {
        text:
            `🌊 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐃𝐄𝐒𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎 🔊\n\n` +
            `👤 Usuario: @${numero}\n` +
            `🦈 Activado por: @${adminNum}\n\n` +
            `> ${config.BOT_NAME}`,
        mentions: [target, sender]
    }, { quoted: m })
}

handler.command = ['unmute']
handler.help = ['unmute @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler
