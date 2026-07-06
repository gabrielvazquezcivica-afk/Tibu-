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
        return sock.sendMessage(from, { text: '🔒 Solo los administradores pueden modificar la etiqueta' }, { quoted: m })
    }

    const tag = args.join(' ').trim()

    if (!tag) {
        return sock.sendMessage(from, {
            text:
`🌊 *SETTAG*

Uso:
.settag MX

Ahora el comando .todos mencionará así:

MX @usuario
MX @usuario`
        }, { quoted: m })
    }

    const db = leerDB()
    db[from] = tag
    guardarDB(db)

    await sock.sendMessage(from, {
        react: {
            text: '✅',
            key: m.key
        }
    })

    await sock.sendMessage(from, {
        text: `\`✅ Prefijo de menciones cambiado a:\`\n${tag}`
    }, { quoted: m })
}

handler.command = ['settag']
handler.help = ['settag <texto>']
handler.tags = ['grupo']
handler.menu = true

export default handler

// 📤 Función para llamar desde tu comando .todos
export function obtenerTag(grupo) {
    const db = leerDB()
    return db[grupo] || '🦈'
}
