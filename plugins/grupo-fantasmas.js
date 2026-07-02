import config from '../config.js'
import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'msgcount.json')

function leerDB() {
    try {
        return JSON.parse(fs.readFileSync(ruta, 'utf8'))
    } catch {
        return {}
    }
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })
        return
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return
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
        return
    }

    const db = leerDB()
    const grupoDB = db[from] || {}

    const fantasmas = participantes.filter(p => {
        const id = p.id || p.jid
        const count = grupoDB[id] || 0
        return count < 10
    })

    if (!fantasmas.length) {
        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

        return sock.sendMessage(from, {
            text:
                `👻 𝐅𝐀𝐍𝐓𝐀𝐒𝐌𝐀𝐒\n\n` +
                `No encontré fantasmas.\n\n` +
                `> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    let texto =
        `👻 𝐅𝐀𝐍𝐓𝐀𝐒𝐌𝐀𝐒 𝐃𝐄𝐓𝐄𝐂𝐓𝐀𝐃𝐎𝐒\n\n`

    const mentions = []

    for (const p of fantasmas) {
        const id = p.id || p.jid
        const numero = id.replace(/[^0-9]/g, '')
        const mensajes = grupoDB[id] || 0

        texto += `👤 @${numero} — ${mensajes} msj\n`
        mentions.push(id)
    }

    texto += `\n> ${config.BOT_NAME}`

    await sock.sendMessage(from, {
        react: { text: '👻', key: m.key }
    })

    await sock.sendMessage(from, {
        text: texto,
        mentions
    }, { quoted: m })
}

handler.command = ['fantasmas']
handler.help = ['fantasmas']
handler.tags = ['grupo']
handler.menu = true

export default handler