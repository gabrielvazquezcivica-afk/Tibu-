import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'Rpg.json')

const COOLDOWN = 60 * 60 * 1000 // 1 hora

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

function tiempoRestante(ms) {
    const minutos = Math.ceil(ms / 60000)
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60

    if (horas > 0) {
        return `${horas}h ${mins}min`
    }

    return `${mins}min`
}

// 💼 TRABAJOS ALEATORIOS
const trabajos = [
    {
        nombre: '🎣 Pescador',
        minimo: 150,
        maximo: 350,
        xp: 20
    },
    {
        nombre: '⛏️ Minero',
        minimo: 250,
        maximo: 500,
        xp: 30
    },
    {
        nombre: '🌾 Granjero',
        minimo: 180,
        maximo: 400,
        xp: 25
    },
    {
        nombre: '💰 Mercader',
        minimo: 400,
        maximo: 750,
        xp: 40
    },
    {
        nombre: '🏹 Cazador',
        minimo: 500,
        maximo: 900,
        xp: 50
    },
    {
        nombre: '🏴‍☠️ Pirata',
        minimo: 700,
        maximo: 1200,
        xp: 70
    },
    {
        nombre: '⚓ Marinero',
        minimo: 300,
        maximo: 600,
        xp: 35
    }
]

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const jugadorId = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    try {
        const db = leerDB()
        const jugador = db[jugadorId]

        // ❌ NO REGISTRADO
        if (!jugador) {
            return sock.sendMessage(
                from,
                {
                    text: '`⚠️ Primero debes registrarte con .registrar`'
                },
                { quoted: m }
            )
        }

        const ahora = Date.now()
        const ultimoTrabajo = jugador.ultimoTrabajo || 0

        // ⏳ COMPROBAR COOLDOWN
        const restante =
            COOLDOWN - (ahora - ultimoTrabajo)

        if (restante > 0) {
            return sock.sendMessage(
                from,
                {
                    text:
`╭━━━〔 ⏳ 𝐖𝐎𝐑𝐊 〕━━━╮
┃
┃ 🛑 Ya trabajaste recientemente.
┃
┃ ⏰ Disponible en:
┃ ➜ ${tiempoRestante(restante)}
┃
╰━━━━━━━━━━━━━━━━━━╯`
                },
                { quoted: m }
            )
        }

        // 🎲 ELEGIR TRABAJO ALEATORIO
        const trabajo =
            trabajos[
                Math.floor(
                    Math.random() * trabajos.length
                )
            ]

        // 💰 RECOMPENSA ALEATORIA
        const recompensa =
            Math.floor(
                Math.random() *
                (trabajo.maximo - trabajo.minimo + 1)
            ) + trabajo.minimo

        // ✨ XP
        const xpGanada = trabajo.xp

        // 💰 AGREGAR BERRIES
        jugador.berries =
            (jugador.berries || 0) + recompensa

        // ✨ AGREGAR XP
        jugador.xp =
            (jugador.xp || 0) + xpGanada

        // ⏰ GUARDAR COOLDOWN
        jugador.ultimoTrabajo = ahora

        // ⭐ COMPROBAR NIVEL
        let subioNivel = false

        while (
            jugador.xp >=
            (jugador.xpNecesaria || 100)
        ) {
            jugador.xp -=
                jugador.xpNecesaria || 100

            jugador.nivel =
                (jugador.nivel || 1) + 1

            jugador.xpNecesaria =
                Math.floor(
                    (jugador.xpNecesaria || 100) * 1.5
                )

            jugador.hpMax =
                (jugador.hpMax || 100) + 20

            jugador.hp =
                jugador.hpMax

            jugador.ataque =
                (jugador.ataque || 10) + 5

            jugador.defensa =
                (jugador.defensa || 10) + 5

            jugador.velocidad =
                (jugador.velocidad || 10) + 3

            subioNivel = true
        }

        guardarDB(db)

        // 💼 REACCIÓN
        await sock.sendMessage(from, {
            react: {
                text: '💼',
                key: m.key
            }
        })

        // 📋 MENSAJE
        let texto =
`╭━━━〔 💼 𝐖𝐎𝐑𝐊 〕━━━╮
┃
┃ 👤 ${jugador.nombre || 'Pirata'}
┃
┃ 💼 Trabajo:
┃ ➜ ${trabajo.nombre}
┃
┃ 💰 Recompensa:
┃ ➜ +${recompensa.toLocaleString()} Berries
┃
┃ ✨ XP:
┃ ➜ +${xpGanada} XP
┃`

        if (subioNivel) {
            texto +=
`┃
┃ 🎉 ¡𝐒𝐔𝐁𝐈𝐒𝐓𝐄 𝐃𝐄 𝐍𝐈𝐕𝐄𝐋!
┃
┃ ⭐ Nivel: ${jugador.nivel}
┃ ❤️ HP máximo: +20
┃ ⚔️ Ataque: +5
┃ 🛡️ Defensa: +5
┃ ⚡ Velocidad: +3
┃`
        }

        texto +=
`┃
╰━━━━━━━━━━━━━━━━━━╯

⏳ Podrás volver a trabajar en 1 hora.`

        await sock.sendMessage(
            from,
            {
                text: texto
            },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR WORK RPG:', e)

        await sock.sendMessage(
            from,
            {
                text: '`❌ Ocurrió un error al trabajar.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'work',
    'trabajar'
]

handler.help = [
    'work'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler