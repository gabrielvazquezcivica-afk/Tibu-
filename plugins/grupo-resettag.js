import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'tag.json')

function leerDB() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}, null, 2))
    }
    return JSON.parse(fs.readFileSync(dbPath))
}

function guardarDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

let handler = {}

handler.run = async (sock, m, args, { isAdmin }) => {
    const from = m.key.remoteJid
    const usuario = m.key.participant || m.key.remoteJid

    // 🔒 Solo en grupos
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '⚠️ Este comando solo funciona en grupos' }, { quoted: m })
    }

    // 🔒 Solo administradores
    if (!await isAdmin(sock, from, usuario)) {
        return sock.sendMessage(from, { text: '🔒 Solo los administradores pueden restablecer la etiqueta' }, { quoted: m })
    }

    const db = leerDB()

    // Verificar si tiene etiqueta personalizada
    if (!db[from]) {
        return sock.sendMessage(from, {
            text: 'ℹ️ Este grupo no tiene ninguna etiqueta personalizada configurada',
            quoted: m
        })
    }

    // Eliminar la etiqueta
    delete db[from]
    guardarDB(db)

    await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
    })

    return sock.sendMessage(from, {
        text: '`✅ Etiqueta restablecida`\nAhora .todos usará el prefijo por defecto: 🦈',
        quoted: m
    })
}

handler.command = ['resettag', 'borrartag', 'restablecertag']
handler.help = ['resettag']
handler.tags = ['grupo']
handler.menu = true

export default handler
