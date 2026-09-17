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
        // LEER REGISTROS
        // =========================

        const registros = leerJSON(regPath)

        if (registros[jugador]) {
            return sock.sendMessage(
                from,
                {
                    text: '`⚠️ Ya estás registrado en el RPG.`'
                },
                { quoted: m }
            )
        }

        // =========================
        // NOMBRE
        // =========================

        const nombre = m.pushName || 'Pirata'

        // =========================
        // GUARDAR REGISTRO
        // =========================

        registros[jugador] = {
            id: jugador,
            nombre: nombre,
            registrado: Date.now()
        }

        guardarJSON(regPath, registros)

        // =========================
        // CREAR PERSONAJE RPG
        // =========================

        const rpg = leerJSON(rpgPath)

        rpg[jugador] = {
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

        guardarJSON(rpgPath, rpg)

        // =========================
        // VERIFICAR GUARDADO
        // =========================

        const registrosCheck = leerJSON(regPath)
        const rpgCheck = leerJSON(rpgPath)

        if (!registrosCheck[jugador]) {
            throw new Error('No se pudo guardar el registro.')
        }

        if (!rpgCheck[jugador]) {
            throw new Error('No se pudo crear el personaje RPG.')
        }

        // =========================
        // REACCIÓN
        // =========================

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🏴‍☠️',
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
┃ 🏴‍☠️ ¡𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐎!
┃
┃ 👤 ${nombre}
┃
┃ ⭐ Nivel: 1
┃ ❤️ HP: 100/100
┃ 💰 Berries: 500
┃
┃ ⚔️ Ataque: 10
┃ 🛡️ Defensa: 10
┃ 💨 Velocidad: 10
┃
┃ 🗡️ Clase: Sin elegir
┃
╰━━━━━━━━━━━━━━━━━━╯

🌊 ¡Bienvenido al RPG!

> Usa .perfil para ver tu personaje.
> Usa .clase para elegir tu clase.`
            },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR REGISTRAR RPG:', e)

        await sock.sendMessage(
            from,
            {
                text:
`❌ Error al registrar tu personaje.

> ${e.message || 'Error desconocido'}`
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