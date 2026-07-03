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

// Detectar prácticamente cualquier link/domino
const regexLink =
    /((https?:\/\/)|(www\.))\S+|([a-zA-Z0-9-]+\.(com|net|org|io|gg|app|dev|me|co|mx|xyz|tv|info|biz|site|online|store|edu|gov|us|uk|es|br|ar|jp|ru|de|fr)(\/\S*)?)|chat\.whatsapp\.com\/\S+|wa\.me\/\S+/i

export async function antiLink(sock, m) {
    try {
        const from = m.key.remoteJid
        if (!from?.endsWith('@g.us')) return false

        const texto =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            ''

        if (!texto) return false

        const db = leerDB()
        if (!db[from]) return false
        if (!regexLink.test(texto)) return false

        const sender =
            m.key.participant || m.key.remoteJid

        // Verificar admin
        const metadata = await sock.groupMetadata(from)
        const participantes = metadata.participants || []

        const userInfo = participantes.find(
            p => p.id === sender || p.jid === sender
        )

        const isAdmin =
            userInfo?.admin === 'admin' ||
            userInfo?.admin === 'superadmin'

        // Admins pueden mandar links
        if (isAdmin) return false

        // Borrar mensaje
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
                `👤 Usuario: @${sender.split('@')[0]}\n` +
                `🌊 No se permiten enlaces en este océano\n`,
            mentions: [sender]
        })

        return true
    } catch (e) {
        console.log('ANTILINK ERROR:', e.message)
        return false
    }
}