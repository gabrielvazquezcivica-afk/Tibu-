import fs from 'fs'
import path from 'path'
import config from '../config.js'

const ruta = path.join(process.cwd(), 'database', 'nsfw.json')

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
            react: {
                text: '🌊',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
    }

    let metadata

    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text: '`❌ No pude obtener la información del grupo`'
        }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const adminInfo = participantes.find(
        p =>
            (p.id || p.jid) === sender
    )

    const isAdmin =
        adminInfo?.admin === 'admin' ||
        adminInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: {
                text: '🚫',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text: '`🚫 Solo los capitanes pueden configurar el NSFW`'
        }, { quoted: m })
    }

    const opcion = (args[0] || '').toLowerCase()

    if (!['on', 'off'].includes(opcion)) {
        return sock.sendMessage(from, {
    text:
`🔞 *CONFIGURACIÓN NSFW*

> .nsfw on
> .nsfw off

> ${config.BOT_NAME}`
}, { quoted: m })
    }

    const db = leerDB()

    if (opcion === 'on' && db[from] === true) {
        await sock.sendMessage(from, {
            react: {
                text: '⚠️',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text:
`⚠️ 𝐍𝐒𝐅𝐖 𝐘𝐀 𝐄𝐒𝐓Á 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎

> Este grupo ya tiene el contenido NSFW habilitado.

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    if (opcion === 'off' && db[from] === false) {
        await sock.sendMessage(from, {
            react: {
                text: '⚠️',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text:
`⚠️ 𝐍𝐒𝐅𝐖 𝐘𝐀 𝐄𝐒𝐓Á 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎

> Este grupo ya tiene el contenido NSFW bloqueado.

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    db[from] = opcion === 'on'

    guardarDB(db)

    await sock.sendMessage(from, {
        react: {
            text: opcion === 'on'
                ? '🔞'
                : '✅',
            key: m.key
        }
    })

    if (opcion === 'on') {
        return sock.sendMessage(from, {
            text:
`🔞 𝐍𝐒𝐅𝐖 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎

> Los comandos NSFW ahora están permitidos en este grupo.

🦈 Capitán:
@${sender.split('@')[0]}

> ${config.BOT_NAME}`,
            mentions: [sender]
        }, { quoted: m })
    }

    return sock.sendMessage(from, {
        text:
`✅ 𝐍𝐒𝐅𝐖 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎

> Los comandos NSFW han sido bloqueados en este grupo.

🦈 Capitán:
@${sender.split('@')[0]}

> ${config.BOT_NAME}`,
        mentions: [sender]
    }, { quoted: m })
}

handler.command = ['nsfw']
handler.help = ['nsfw on/off']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler