import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'Rpg.json')

const COOLDOWN = 24 * 60 * 60 * 1000 // 24 horas

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
    const segundos = Math.ceil(ms / 1000)

    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)

    return `${horas}h ${minutos}min`
}

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
        const ultimoClaim = jugador.ultimoClaim || 0

        // ⏳ COMPROBAR COOLDOWN
        const restante =
            COOLDOWN - (ahora - ultimoClaim)

        if (restante > 0) {
            return sock.sendMessage(
                from,
                {
                    text:
`╭━━━〔 🎁 𝐂𝐋𝐀𝐈𝐌 〕━━━╮
┃
┃ 🛑 Ya reclamaste tu recompensa
┃ de hoy.
┃
┃ ⏰ Podrás reclamar nuevamente en:
┃ ➜ ${tiempoRestante(restante)}
┃
╰━━━━━━━━━━━━━━━━━━╯`
                },
                { quoted: m }
            )
        }

        // 🎲 RECOMPENSA ALEATORIA
        const recompensa =
            Math.floor(
                Math.random() * (5000 - 1000 + 1)
            ) + 1000

        // 💰 AGREGAR BERRIES
        jugador.berries =
            (jugador.berries || 0) + recompensa

        // ⏰ GUARDAR FECHA DEL CLAIM
        jugador.ultimoClaim = ahora

        guardarDB(db)

        // 🎁 REACCIÓN
        await sock.sendMessage(from, {
            react: {
                text: '🎁',
                key: m.key
            }
        })

        // 📋 MENSAJE
        const texto =
`╭━━━〔 🎁 𝐂𝐋𝐀𝐈𝐌 〕━━━╮
┃
┃ 🎉 ¡Recompensa diaria!
┃
┃ 👤 ${jugador.nombre || 'Pirata'}
┃
┃ 💰 Ganaste:
┃ ➜ +${recompensa.toLocaleString()} Berries
┃
┃ 💳 Saldo actual:
┃ ➜ ${(jugador.berries || 0).toLocaleString()} Berries
┃
╰━━━━━━━━━━━━━━━━━━╯

⏳ Regresa mañana para reclamar nuevamente.`

        await sock.sendMessage(
            from,
            {
                text: texto
            },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR CLAIM RPG:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text: '`❌ No pude entregar tu recompensa diaria.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'claim',
    'daily'
]

handler.help = [
    'claim'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler