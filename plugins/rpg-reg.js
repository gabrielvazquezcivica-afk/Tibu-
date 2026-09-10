import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'Rpg.json')

function leerDB() {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    } catch {
        return {}
    }
}

function guardarDB(db) {
    fs.writeFileSync(
        dbPath,
        JSON.stringify(db, null, 2),
        'utf8'
    )
}

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const jugador = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    try {
        const db = leerDB()

        // ❌ YA ESTÁ REGISTRADO
        if (db[jugador]) {
            return sock.sendMessage(
                from,
                {
                    text: '`⚠️ Ya estás registrado en TIBU RPG.`'
                },
                { quoted: m }
            )
        }

        const nombre = m.pushName || 'Pirata'

        // 🏴‍☠️ CREAR PERSONAJE
        db[jugador] = {
            id: jugador,
            nombre: nombre,

            nivel: 1,
            xp: 0,
            xpNecesaria: 100,

            hp: 100,
            hpMax: 100,

            ataque: 10,
            defensa: 10,
            velocidad: 10,

            berries: 500,

            victorias: 0,
            derrotas: 0,

            clase: 'Sin elegir',

            inventario: [],

            creado: Date.now()
        }

        guardarDB(db)

        await sock.sendMessage(from, {
            react: {
                text: '🏴‍☠️',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
`╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ 🏴‍☠️ ¡𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐎!
┃
┃ 👤 ${nombre}
┃ ⭐ Nivel: 1
┃ ❤️ HP: 100/100
┃ 💰 Berries: 500
┃
┃ 🗡️ Clase: Sin elegir
┃
╰━━━━━━━━━━━━━━━━━━╯

🌊 ¡Bienvenido a TIBU RPG!

> Usa .perfil para ver tu personaje.`
            },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR REGISTRAR RPG:', e)

        await sock.sendMessage(
            from,
            {
                text: '`❌ No pude registrarte en el RPG.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'registrar',
    'registro'
]

handler.help = [
    'registrar'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler