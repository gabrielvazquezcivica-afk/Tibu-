import config from '../config.js'
import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'modoadmin.json')

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

    const metadata = await sock.groupMetadata(from).catch(() => null)
    if (!metadata) {
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
        return
    }

    const accion = args?.[0]?.toLowerCase()
    const db = leerDB()

    if (accion === 'on') {
        if (db[from]) {
            await sock.sendMessage(from, {
                react: { text: '⚠️', key: m.key }
            })
            return sock.sendMessage(from, {
                text: '`⚠️ Modo admin ya está activo`'
            }, { quoted: m })
        }

        db[from] = true
        guardarDB(db)

        await sock.sendMessage(from, {
            react: { text: '🔒', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                `🔒 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n\n` +
                `Solo admins podrán usar comandos\n\n` +
                `> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    if (accion === 'off') {
        if (!db[from]) {
            await sock.sendMessage(from, {
                react: { text: '⚠️', key: m.key }
            })
            return sock.sendMessage(from, {
                text: '`⚠️ Modo admin ya está apagado`'
            }, { quoted: m })
        }

        delete db[from]
        guardarDB(db)

        await sock.sendMessage(from, {
            react: { text: '🔓', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                `🔓 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n\n` +
                `Todos pueden usar comandos\n\n` +
                `> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    return sock.sendMessage(from, {
        text: '`Usa .modoadmin on / off`'
    }, { quoted: m })
}

handler.command = ['modoadmin']
handler.help = ['modoadmin on/off']
handler.tags = ['on-off']
handler.menu = true

export default handler