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

const regexLink =
    /(https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/)/i

export async function antiLink(sock, m) {
    try {
        const from = m.key.remoteJid
        if (!from?.endsWith('@g.us')) return false

        const texto =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            ''

        if (!texto) return false

        const db = leerDB()

        if (!db[from]) return false
        if (!regexLink.test(texto)) return false

        const sender =
            m.key.participant || m.key.remoteJid

        await sock.sendMessage(from, {
            delete: {
                remoteJid: from,
                id: m.key.id,
                participant: sender,
                fromMe: false
            }
        })

        await sock.sendMessage(from, {
            text:
                `🚫 𝐋𝐈𝐍𝐊 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎\n\n` +
                `👤 @${sender.split('@')[0]}\n` +
                `🌊 No se permiten enlaces`,
            mentions: [sender]
        })

        return true
    } catch {
        return false
    }
}