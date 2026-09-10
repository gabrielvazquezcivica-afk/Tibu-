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
        const jugador = db[jugadorId]

        // 🚫 NO REGISTRADO
        if (!jugador) {
            return sock.sendMessage(
                from,
                {
                    text:
`╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ ❌ No estás registrado.
┃
┃ 🏴‍☠️ Usa .registrar
┃ para crear tu personaje.
┃
╰━━━━━━━━━━━━━━━━━━╯`
                },
                { quoted: m }
            )
        }

        // 🔎 REACCIÓN
        await sock.sendMessage(from, {
            react: {
                text: '🏴‍☠️',
                key: m.key
            }
        })

        const nivel = jugador.nivel ?? 1
        const xp = jugador.xp ?? 0
        const xpNecesaria = jugador.xpNecesaria ?? 100

        const hp = jugador.hp ?? 100
        const hpMax = jugador.hpMax ?? 100

        const ataque = jugador.ataque ?? 10
        const defensa = jugador.defensa ?? 10
        const velocidad = jugador.velocidad ?? 10

        const berries = jugador.berries ?? 500

        const victorias = jugador.victorias ?? 0
        const derrotas = jugador.derrotas ?? 0

        const clase = jugador.clase || 'Sin elegir'

        const inventario = Array.isArray(jugador.inventario)
            ? jugador.inventario.length
            : 0

        // 📊 BARRA DE XP
        const porcentaje = Math.min(
            100,
            Math.floor((xp / xpNecesaria) * 100)
        )

        const bloques = Math.floor(porcentaje / 10)

        const barraXP =
            '█'.repeat(bloques) +
            '░'.repeat(10 - bloques)

        const nombre =
            jugador.nombre ||
            m.pushName ||
            'Pirata'

        // 📋 PERFIL
        const texto =
`╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ 🏴‍☠️ 𝐏𝐄𝐑𝐅𝐈𝐋
┃
┃ 👤 ${nombre}
┃ 🗡️ Clase: ${clase}
┃ ⭐ Nivel: ${nivel}
┃
┣━━━━━━━━━━━━━━━━━━
┃ ❤️ HP: ${hp}/${hpMax}
┃
┃ ✨ XP: ${xp}/${xpNecesaria}
┃ ${barraXP} ${porcentaje}%
┃
┣━━━━━━━━━━━━━━━━━━
┃ ⚔️ Ataque: ${ataque}
┃ 🛡️ Defensa: ${defensa}
┃ ⚡ Velocidad: ${velocidad}
┃
┣━━━━━━━━━━━━━━━━━━
┃ 💰 Berries: ${berries.toLocaleString()}
┃
┃ 🏆 Victorias: ${victorias}
┃ 💀 Derrotas: ${derrotas}
┃
┃ 🎒 Objetos: ${inventario}
┃
╰━━━━━━━━━━━━━━━━━━╯
> 🌊 ¡Sigue avanzando, pirata!`

        await sock.sendMessage(
            from,
            {
                text: texto
            },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR PERFIL RPG:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text: '`❌ No pude cargar tu perfil RPG.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'perfil',
    'profile'
]

handler.help = [
    'perfil'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler