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
    fs.writeFileSync(
        ruta,
        JSON.stringify(db, null, 2),
        'utf8'
    )
}

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(
            from,
            { text: '`🌊 Solo funciona en grupos`' },
            { quoted: m }
        )
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return sock.sendMessage(
            from,
            { text: '`❌ No pude leer el grupo`' },
            { quoted: m }
        )
    }

    const participantes = metadata.participants || []

    const adminInfo = participantes.find(
        p =>
            limpiarJid(p.id) === sender ||
            limpiarJid(p.jid) === sender
    )

    const isAdmin =
        adminInfo?.admin === 'admin' ||
        adminInfo?.admin === 'superadmin'

    if (!isAdmin) {
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
        return sock.sendMessage(
            from,
            { text: '`❌ Responde o menciona un usuario`' },
            { quoted: m }
        )
    }

    target = limpiarJid(target)

    const db = leerDB()

    if (!db[from]) db[from] = []

    if (db[from].includes(target)) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(
            from,
            {
                text:
                    `🌊 𝐘𝐀 𝐄𝐒𝐓𝐀 𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎 ⚠️\n\n` +
                    `👤 Usuario: @${target.split('@')[0]}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [target]
            },
            { quoted: m }
        )
    }

    db[from].push(target)
    guardarDB(db)

    const numero = target.split('@')[0]
    const adminNum = sender.split('@')[0]

    await sock.sendMessage(from, {
        react: { text: '🔇', key: m.key }
    })

    await sock.sendMessage(
        from,
        {
            text:
                `🌊 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎 🔇\n\n` +
                `👤 Usuario: @${numero}\n` +
                `🦈 Silenciado por: @${adminNum}\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [target, sender]
        },
        { quoted: m }
    )
}

handler.command = ['mute']
handler.help = ['mute @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler