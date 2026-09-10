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

    const jugadorId = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    try {
        const db = leerDB()

        // ❌ NO EXISTE EL REGISTRO
        if (!db[jugadorId]) {
            return sock.sendMessage(
                from,
                {
                    text: '`⚠️ No tienes un registro RPG.`'
                },
                { quoted: m }
            )
        }

        // 🗑️ ELIMINAR REGISTRO
        delete db[jugadorId]

        guardarDB(db)

        await sock.sendMessage(from, {
            react: {
                text: '🗑️',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
`╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ 🗑️ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎
┃
┃ Tu personaje RPG ha sido
┃ eliminado correctamente.
┃
┃ 🏴‍☠️ Si quieres volver a jugar:
┃ usa .registrar
┃
╰━━━━━━━━━━━━━━━━━━╯`
            },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR BORRAR RPG:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text: '`❌ No pude eliminar tu registro RPG.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'borrarregistro',
    'borrarrpg',
    'eliminarrpg'
]

handler.help = [
    'borrarregistro'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler