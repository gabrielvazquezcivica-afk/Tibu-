import fs from 'fs'
import path from 'path'

const regPath = path.join(process.cwd(), 'database', 'reg.json')
const rpgPath = path.join(process.cwd(), 'database', 'Rpg.json')

function asegurarArchivos() {
    const carpeta = path.join(process.cwd(), 'database')

    if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true })
    }

    if (!fs.existsSync(regPath)) {
        fs.writeFileSync(regPath, '{}', 'utf8')
    }

    if (!fs.existsSync(rpgPath)) {
        fs.writeFileSync(rpgPath, '{}', 'utf8')
    }
}

function leerJSON(ruta) {
    asegurarArchivos()

    const contenido = fs.readFileSync(ruta, 'utf8').trim()

    if (!contenido) return {}

    return JSON.parse(contenido)
}

function guardarJSON(ruta, datos) {
    asegurarArchivos()

    fs.writeFileSync(
        ruta,
        JSON.stringify(datos, null, 2),
        'utf8'
    )
}

function obtenerJugador(m) {
    return String(
        m.key.participant ||
        m.participant ||
        m.key.remoteJid ||
        ''
    ).trim()
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const jugador = obtenerJugador(m)

    try {
        if (!jugador) {
            return sock.sendMessage(
                from,
                {
                    text: '`❌ No pude identificar tu usuario.`'
                },
                { quoted: m }
            )
        }

        // =========================
        // LEER AMBAS BASES
        // =========================

        const registros = leerJSON(regPath)
        const rpg = leerJSON(rpgPath)

        // =========================
        // COMPROBAR REGISTRO
        // =========================

        if (!registros[jugador] && !rpg[jugador]) {
            return sock.sendMessage(
                from,
                {
                    text:
`╭━━━〔 🌊 𝐑𝐏𝐆 〕━━━╮
┃
┃ ⚠️ No estás registrado.
┃
┃ Usa .registrar para comenzar.
┃
╰━━━━━━━━━━━━━━━━━━╯`
                },
                { quoted: m }
            )
        }

        // =========================
        // ELIMINAR REGISTRO
        // =========================

        delete registros[jugador]

        // =========================
        // ELIMINAR PERSONAJE RPG
        // =========================

        delete rpg[jugador]

        // =========================
        // GUARDAR AMBAS BASES
        // =========================

        guardarJSON(regPath, registros)
        guardarJSON(rpgPath, rpg)

        // =========================
        // REACCIÓN
        // =========================

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🗑️',
                    key: m.key
                }
            }
        )

        // =========================
        // MENSAJE
        // =========================

        await sock.sendMessage(
            from,
            {
                text:
`╭━━━〔 🌊 𝐑𝐏𝐆 〕━━━╮
┃
┃ 🗑️ ¡𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎!
┃
┃ Tu registro y personaje RPG
┃ fueron eliminados correctamente.
┃
╰━━━━━━━━━━━━━━━━━━╯

🌊 Puedes volver a registrarte cuando quieras.

> Usa .registrar para comenzar de nuevo.`
            },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR BORRAR REGISTRO RPG:', e)

        await sock.sendMessage(
            from,
            {
                text:
`❌ Ocurrió un error al borrar tu registro.

> ${e.message || 'Error desconocido'}`
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'borrarregistro',
    'borrarreg',
    'delregistro'
]

handler.help = [
    'borrarregistro'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler