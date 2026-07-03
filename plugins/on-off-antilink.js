import config from '../config.js'
import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'antilink.json')

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

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
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
            text: '`🚫 Solo admins pueden usarlo`'
        }, { quoted: m })
    }

    const accion = args?.[0]?.toLowerCase()
    const db = leerDB()

    if (accion === 'on') {
        if (db[from]) {
            await sock.sendMessage(from, {
                react: { text: '⚠️', key: m.key }
            })

            return sock.sendMessage(from, {
                text:
                    `⚠️ 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐘𝐀 𝐄𝐒𝐓Á 𝐀𝐂𝐓𝐈𝐕𝐎\n\n` +
                    `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [sender]
            }, { quoted: m })
        }

        db[from] = true
        guardarDB(db)

        await sock.sendMessage(from, {
            react: { text: '🛡️', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                `🛡️ 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n\n` +
                `🚫 Se borrarán todos los enlaces\n` +
                `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [sender]
        }, { quoted: m })
    }

    if (accion === 'off') {
        if (!db[from]) {
            await sock.sendMessage(from, {
                react: { text: '⚠️', key: m.key }
            })

            return sock.sendMessage(from, {
                text:
                    `⚠️ 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐘𝐀 𝐄𝐒𝐓Á 𝐀𝐏𝐀𝐆𝐀𝐃𝐎\n\n` +
                    `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [sender]
            }, { quoted: m })
        }

        delete db[from]
        guardarDB(db)

        await sock.sendMessage(from, {
            react: { text: '🔓', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                `🔓 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n\n` +
                `🌊 Los enlaces vuelven a permitirse\n` +
                `🦈 Capitán: @${sender.split('@')[0]}\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [sender]
        }, { quoted: m })
    }

    return sock.sendMessage(from, {
        text:
            '`Usa:`\n' +
            '• .antilink on\n' +
            '• .antilink off'
    }, { quoted: m })
}

handler.command = ['antilink']
handler.help = ['antilink on/off']
handler.tags = ['grupo']
handler.menu = true

export default handler