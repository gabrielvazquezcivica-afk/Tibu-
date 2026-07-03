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

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo navega en grupos`'
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
        p => p.id === sender || p.jid === sender
    )

    const isAdmin =
        adminInfo?.admin === 'admin' ||
        adminInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`🚫 Solo los capitanes pueden usar esto`'
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
            text: '`❌ Responde o menciona un tripulante`'
        }, { quoted: m })
    }

    const db = leerDB()

    if (!db[from]) db[from] = []

    if (db[from].includes(target)) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                `⚠️ 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐍𝐓𝐄 𝐘𝐀 𝐄𝐒𝐓Á 𝐁𝐀𝐉𝐎 𝐀𝐆𝐔𝐀\n\n` +
                `👤 @${target.split('@')[0]}\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [target]
        }, { quoted: m })
    }

    db[from].push(target)
    guardarDB(db)

    await sock.sendMessage(from, {
        react: { text: '🔇', key: m.key }
    })

    await sock.sendMessage(from, {
        text:
            `🔇 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐍𝐓𝐄 𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎\n\n` +
            `👤 Usuario: @${target.split('@')[0]}\n` +
            `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
            `🌊 Ya no puede hablar en alta mar\n\n` +
            `> ${config.BOT_NAME}`,
        mentions: [target, sender]
    }, { quoted: m })
}

handler.command = ['mute']
handler.help = ['mute']
handler.tags = ['grupo']
handler.menu = true

export default handler