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

    const metadata = await sock.groupMetadata(from).catch(() => null)
    if (!metadata) {
        return sock.sendMessage(from, {
            text: '`❌ No pude leer el grupo`'
        }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const userInfo = participantes.find(
        p => p.id === sender || p.jid === sender
    )

    const isAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })

        return sock.sendMessage(from, {
            text: '`🚫 Solo capitanes pueden usarlo`'
        }, { quoted: m })
    }

    const db = leerDB()

    if (!args[0]) {
        return sock.sendMessage(from, {
            text: '`Uso: .antilink on / off`'
        }, { quoted: m })
    }

    const opcion = args[0].toLowerCase()

    if (opcion === 'on') {
        db[from] = true
        guardarDB(db)

        await sock.sendMessage(from, {
            react: { text: '🛡️', key: m.key }
        })

        return sock.sendMessage(from, {
            text: `🛡️ 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n\n> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    if (opcion === 'off') {
        delete db[from]
        guardarDB(db)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(from, {
            text: `❌ 𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎\n\n> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['antilink']
handler.help = ['antilink on/off']
handler.tags = ['on-off']
handler.menu = true

export default handler