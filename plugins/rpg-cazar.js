import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'Rpg.json')

const COOLDOWN = 30 * 60 * 1000

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

const animales = [
    {
        nombre: 'un conejo',
        berriesMin: 100,
        berriesMax: 200,
        xp: 10
    },
    {
        nombre: 'un jabalí',
        berriesMin: 150,
        berriesMax: 300,
        xp: 15
    },
    {
        nombre: 'un ciervo',
        berriesMin: 200,
        berriesMax: 400,
        xp: 20
    },
    {
        nombre: 'un lobo',
        berriesMin: 300,
        berriesMax: 500,
        xp: 25
    },
    {
        nombre: 'un oso',
        berriesMin: 400,
        berriesMax: 700,
        xp: 35
    },
    {
        nombre: 'un tigre',
        berriesMin: 500,
        berriesMax: 900,
        xp: 45
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

        if (!jugador) {
            return sock.sendMessage(
                from,
                {
                    text:
                        '`❌ No estás registrado en TIBU RPG.`'
                },
                { quoted: m }
            )
        }

        const ahora = Date.now()
        const ultimoCazar = jugador.ultimoCazar || 0

        if (ahora - ultimoCazar < COOLDOWN) {
            const restante =
                COOLDOWN - (ahora - ultimoCazar)

            const minutos =
                Math.ceil(restante / 60000)

            return sock.sendMessage(
                from,
                {
                    text:
                        `\`⏳ Ya saliste de cacería recientemente.\`\n\n` +
                        `\`🕐 Podrás volver a cazar en ${minutos} minuto(s).\``
                },
                { quoted: m }
            )
        }

        await sock.sendMessage(from, {
            react: {
                text: '🏹',
                key: m.key
            }
        })

        jugador.ultimoCazar = ahora

        const animal =
            animales[
                Math.floor(
                    Math.random() * animales.length
                )
            ]

        const exito = Math.random() < 0.85

        if (!exito) {
            guardarDB(db)

            return sock.sendMessage(
                from,
                {
                    text:
                        '`🏹 Fuiste de cacería, pero no lograste atrapar nada.`\n\n' +
                        '`🌲 El animal escapó. Inténtalo de nuevo más tarde.`'
                },
                { quoted: m }
            )
        }

        const berries =
            Math.floor(
                Math.random() *
                (
                    animal.berriesMax -
                    animal.berriesMin +
                    1
                )
            ) + animal.berriesMin

        jugador.berries =
            (jugador.berries || 0) + berries

        jugador.xp =
            (jugador.xp || 0) + animal.xp

        let nivelesSubidos = 0

        if (!jugador.xpNecesaria) {
            jugador.xpNecesaria = 100
        }

        if (!jugador.nivel) {
            jugador.nivel = 1
        }

        while (
            jugador.xp >=
            jugador.xpNecesaria
        ) {
            jugador.xp -=
                jugador.xpNecesaria

            jugador.nivel++

            jugador.xpNecesaria =
                Math.floor(
                    jugador.xpNecesaria * 1.25
                )

            jugador.hpMax =
                (jugador.hpMax || 100) + 10

            jugador.ataque =
                (jugador.ataque || 10) + 2

            jugador.defensa =
                (jugador.defensa || 10) + 2

            jugador.velocidad =
                (jugador.velocidad || 10) + 1

            nivelesSubidos++
        }

        guardarDB(db)

        let nivel = ''

        if (nivelesSubidos > 0) {
            nivel =
                `\n\`🎉 Subiste ${nivelesSubidos} nivel(es).\``
        }

        await sock.sendMessage(
            from,
            {
                text:
                    `\`🏹 Saliste de cacería y encontraste ${animal.nombre}.\`\n\n` +
                    `\`🎯 Lograste atraparlo.\`\n` +
                    `\`💰 Ganaste ${berries.toLocaleString()} Berries.\`\n` +
                    `\`✨ Ganaste ${animal.xp} XP.\`` +
                    nivel
            },
            { quoted: m }
        )

    } catch (e) {
        console.error(
            'ERROR CAZAR RPG:',
            e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
                    '`❌ Ocurrió un error durante la cacería.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'cazar',
    'caza'
]

handler.help = [
    'cazar'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler