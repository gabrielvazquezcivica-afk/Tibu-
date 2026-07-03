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

const limpioSender = sender.split(':')[0]

const adminInfo = participantes.find(p => {
    const jid = (p.id || p.jid || '').split(':')[0]
    return jid === limpioSender
})

const isAdmin =
    adminInfo?.admin === 'admin' ||
    adminInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })
        return
    }

    const opcion = args?.[0]?.toLowerCase()

    if (!['on', 'off'].includes(opcion)) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                '`❌ Usa:`\n' +
                '`.modoadmin on`\n' +
                '`.modoadmin off`'
        }, { quoted: m })
    }

    const db = leerDB()
    const activo = !!db[from]

    if (opcion === 'on') {
        if (activo) {
            await sock.sendMessage(from, {
                react: { text: '⚠️', key: m.key }
            })

            return sock.sendMessage(from, {
                text: '`⚠️ El modo admin ya está activado`'
            }, { quoted: m })
        }

        db[from] = true
        guardarDB(db)

        await sock.sendMessage(from, {
            react: { text: '🔒', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                `🌊 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 🔒\n\n` +
                `🦈 Solo capitanes pueden usar comandos\n\n` +
                `> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    if (!activo) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`⚠️ El modo admin ya está desactivado`'
        }, { quoted: m })
    }

    delete db[from]
    guardarDB(db)

    await sock.sendMessage(from, {
        react: { text: '🔓', key: m.key }
    })

    await sock.sendMessage(from, {
        text:
            `🌊 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 🔓\n\n` +
            `🛶 Todos pueden usar comandos\n\n` +
            `> ${config.BOT_NAME}`
    }, { quoted: m })
}

handler.command = ['modoadmin']
handler.help = ['modoadmin on/off']
handler.tags = ['on-off']
handler.menu = true

export default handler