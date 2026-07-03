import fs from 'fs'
import path from 'path'
import config from '../config.js'

const ruta = path.join(process.cwd(), 'database', 'welcome.json')
const rutaWelcome = path.join(process.cwd(), 'database', 'setwelcome.json')
const rutaBye = path.join(process.cwd(), 'database', 'setbye.json')


const welcomeAudio = 'https://files.catbox.moe/9nyxfb.mp3'
const byeAudio = 'https://files.catbox.moe/swqi7e.mp3'

function leerJSON(file) {
    try {
        if (!fs.existsSync(file)) return {}
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    } catch {
        return {}
    }
}

function guardarJSON(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

async function esAdmin(sock, from, sender) {
    try {
        const meta = await sock.groupMetadata(from)
        const p = meta.participants.find(x => x.id === sender)
        return p?.admin === 'admin' || p?.admin === 'superadmin'
    } catch {
        return false
    }
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

    if (!(await esAdmin(sock, from, sender))) {
        return sock.sendMessage(from, {
            text: '`🚫 Solo capitanes pueden usarlo`'
        }, { quoted: m })
    }

    const db = leerJSON(ruta)
    if (!db[from]) db[from] = false

    const opcion = args[0]?.toLowerCase()

    if (!opcion) {
        return sock.sendMessage(from, {
            text:
`🌊 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐖𝐄𝐋𝐂𝐎𝐌𝐄

⚓ .welcome on
⚓ .welcome off`
        }, { quoted: m })
    }

    if (opcion === 'on') {
        if (db[from]) {
            return sock.sendMessage(from, {
                text: '`⚠️ Ya está activado`'
            }, { quoted: m })
        }

        db[from] = true
        guardarJSON(ruta, db)

        return sock.sendMessage(from, {
            text: '🌊 Bienvenidas activadas'
        }, { quoted: m })
    }

    if (opcion === 'off') {
        if (!db[from]) {
            return sock.sendMessage(from, {
                text: '`⚠️ Ya está desactivado`'
            }, { quoted: m })
        }

        db[from] = false
        guardarJSON(ruta, db)

        return sock.sendMessage(from, {
            text: '🌊 Bienvenidas desactivadas'
        }, { quoted: m })
    }
}

handler.command = ['welcome']
handler.help = ['welcome on/off']
handler.tags = ['on-off']
handler.menu = true

export default handler

export async function welcomeHandler(sock, update) {
    const db = leerJSON(ruta)
    const welcomeDB = leerJSON(rutaWelcome)
    const byeDB = leerJSON(rutaBye)

    if (!update?.id) return
    if (!db[update.id]) return

    const id = update.id

    let meta = {}
    try {
        meta = await sock.groupMetadata(id)
    } catch {}

    const groupName = meta.subject || 'Grupo'
    const members = meta.participants?.length || 0
    const users = update.participants || []

    for (const user of users) {
        let image = BOT_IMAGE

        try {
            image = await sock.profilePictureUrl(user, 'image')
        } catch {
            try {
                image = await sock.profilePictureUrl(id, 'image')
            } catch {}
        }

        if (update.action === 'add') {
            let text = welcomeDB[id] ||
`🌊 𝐍𝐔𝐄𝐕𝐎 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐍𝐓𝐄

👤 @user
👥 @members miembros
⚓ Bienvenido a @group`

            text = text
                .replace(/@user/g, `@${user.split('@')[0]}`)
                .replace(/@group/g, groupName)
                .replace(/@members/g, members)

            await sock.sendMessage(id, {
                image: { url: image },
                caption: text,
                mentions: [user]
            })

               try {
    await sock.sendMessage(id, {
        audio: { url: welcomeAudio },
        mimetype: 'audio/mpeg',
        ptt: false
    })
} catch (e) {
    console.log('WELCOME AUDIO ERROR:', e)
}
        }

        if (update.action === 'remove') {
            let text = byeDB[id] ||
`🌊 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐍𝐓𝐄 𝐒𝐀𝐋𝐈Ó

👤 @user
👥 @members miembros
⚓ Salió de @group`

            text = text
                .replace(/@user/g, `@${user.split('@')[0]}`)
                .replace(/@group/g, groupName)
                .replace(/@members/g, members)

            await sock.sendMessage(id, {
                image: { url: image },
                caption: text,
                mentions: [user]
            })
    
              try {
    await sock.sendMessage(id, {
        audio: { url: byeAudio },
        mimetype: 'audio/mpeg',
        ptt: false
    })
} catch (e) {
    console.log('BYE AUDIO ERROR:', e)
}

        }
    }
}