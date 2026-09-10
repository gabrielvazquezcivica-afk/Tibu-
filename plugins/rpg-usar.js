import fs from 'fs'
import path from 'path'

const dbPath = path.join(
    process.cwd(),
    'database',
    'Rpg.json'
)

// ══════════════════════════════════════
// BASE DE DATOS
// ══════════════════════════════════════

function leerDB() {
    try {
        return JSON.parse(
            fs.readFileSync(dbPath, 'utf8')
        )
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

// ══════════════════════════════════════
// LIMPIAR JID
// ══════════════════════════════════════

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

// ══════════════════════════════════════
// ALIAS
// ══════════════════════════════════════

const alias = {

    talisman: 'talisman',
    amuleto: 'talisman',

    anillo: 'anillo',
    anillopirata: 'anillo',

    moneda: 'moneda',
    monedantigua: 'moneda',

    diamante: 'diamante',

    elixir: 'elixir',

    trofeo: 'trofeo',

    diente: 'diente',
    dientetiburon: 'diente',
    tiburon: 'diente',

    perla: 'perla',
    perlamarina: 'perla',

    corona: 'corona',
    coronapirata: 'corona',

    reliquia: 'reliquia',
    reliquiaantigua: 'reliquia'
}

// ══════════════════════════════════════
// NOMBRES
// ══════════════════════════════════════

const nombres = {

    talisman: '🧿 Talismán',
    anillo: '💍 Anillo pirata',
    moneda: '🪙 Moneda antigua',
    diamante: '💎 Diamante',
    elixir: '🧪 Elixir',
    trofeo: '🏆 Trofeo',
    diente: '🦈 Diente de tiburón',
    perla: '🐚 Perla marina',
    corona: '👑 Corona pirata',
    reliquia: '🗿 Reliquia antigua'

}

// ══════════════════════════════════════
// BUSCAR OBJETO
// ══════════════════════════════════════

function buscarObjeto(texto = '') {

    const nombre = String(texto)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')

    return alias[nombre] || null
}

// ══════════════════════════════════════
// BUSCAR EN INVENTARIO
// ══════════════════════════════════════

function buscarInventario(jugador, id) {

    if (!Array.isArray(jugador.inventario)) {
        jugador.inventario = []
    }

    return jugador.inventario.find(
        item => item?.id === id
    )
}

// ══════════════════════════════════════
// QUITAR OBJETO
// ══════════════════════════════════════

function consumirObjeto(jugador, id) {

    const item = buscarInventario(
        jugador,
        id
    )

    if (!item) return false

    item.cantidad =
        Number(item.cantidad || 0) - 1

    if (item.cantidad <= 0) {

        jugador.inventario =
            jugador.inventario.filter(
                objeto => objeto.id !== id
            )
    }

    return true
}

// ══════════════════════════════════════
// SUBIR NIVEL
// ══════════════════════════════════════

function subirNivel(jugador) {

    jugador.nivel =
        Number(jugador.nivel || 1) + 1

    jugador.xp = 0

    jugador.xpNecesaria =
        Math.floor(
            Number(jugador.xpNecesaria || 100) * 1.25
        )

    jugador.hpMax =
        Number(jugador.hpMax || 100) + 10

    jugador.hp =
        jugador.hpMax

    jugador.ataque =
        Number(jugador.ataque || 10) + 2

    jugador.defensa =
        Number(jugador.defensa || 10) + 2

    jugador.velocidad =
        Number(jugador.velocidad || 10) + 1
}

// ══════════════════════════════════════
// HANDLER
// ══════════════════════════════════════

const handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    const jugadorId = limpiarJid(
        m.key.participant ||
        m.key.remoteJid
    )

    try {

        const db = leerDB()

        const jugador = db[jugadorId]

        // ══════════════════════════════════
        // REGISTRO
        // ══════════════════════════════════

        if (!jugador) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ No estás registrado en TIBU RPG.`\n\n' +
                        '`🏴‍☠️ Usa .registrar para comenzar.`'
                },
                { quoted: m }
            )
        }

        // ══════════════════════════════════
        // SIN OBJETO
        // ══════════════════════════════════

        if (!args || !args.length) {

            const texto = [
                '`🎒 USAR OBJETO`',
                '',
                '`🧿 talisman → +10 XP`',
                '`💍 anillo → +2 Ataque`',
                '`🪙 moneda → +750 Berries`',
                '`💎 diamante → +4,000 Berries`',
                '`🧪 elixir → +1 Nivel`',
                '`🏆 trofeo → +1 Victoria`',
                '`🦈 diente → +2 Defensa`',
                '`🐚 perla → +1,500 Berries`',
                '`👑 corona → +3 Ataque y +3 Defensa`',
                '`🗿 reliquia → +50 XP`',
                '',
                '`💡 Ejemplo:`',
                '`.usar diamante`'
            ].join('\n')

            return await sock.sendMessage(
                from,
                {
                    text
                },
                { quoted: m }
            )
        }

        // ══════════════════════════════════
        // IDENTIFICAR OBJETO
        // ══════════════════════════════════

        const id = buscarObjeto(
            args.join(' ')
        )

        if (!id) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ Ese objeto no se puede usar.`\n\n' +
                        '`🎒 Usa .usar para ver los objetos disponibles.`'
                },
                { quoted: m }
            )
        }

        // ══════════════════════════════════
        // COMPROBAR INVENTARIO
        // ══════════════════════════════════

        const item =
            buscarInventario(
                jugador,
                id
            )

        if (
            !item ||
            Number(item.cantidad || 0) <= 0
        ) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ No tienes ese objeto en tu inventario.`\n\n' +
                        '`🛒 Puedes comprarlo usando .tienda`'
                },
                { quoted: m }
            )
        }

        // ══════════════════════════════════
        // EFECTOS
        // ══════════════════════════════════

        let resultado = ''

        let subioNivel = false

        switch (id) {

            case 'talisman': {

                jugador.xp =
                    Number(jugador.xp || 0) + 10

                resultado =
                    '✨ Has obtenido `+10 XP`.'

                break
            }

            case 'anillo': {

                jugador.ataque =
                    Number(jugador.ataque || 10) + 2

                resultado =
                    '⚔️ Tu Ataque aumentó `+2`.'

                break
            }

            case 'moneda': {

                jugador.berries =
                    Number(jugador.berries || 0) + 750

                resultado =
                    '💰 Has obtenido `+750 Berries`.'

                break
            }

            case 'diamante': {

                jugador.berries =
                    Number(jugador.berries || 0) + 4000

                resultado =
                    '💎 Has obtenido `+4,000 Berries`.'

                break
            }

            case 'elixir': {

                subirNivel(jugador)

                subioNivel = true

                resultado =
                    '🧪 El elixir te hizo subir `+1 Nivel`.'

                break
            }

            case 'trofeo': {

                jugador.victorias =
                    Number(jugador.victorias || 0) + 1

                resultado =
                    '🏆 Has obtenido `+1 Victoria`.'

                break
            }

            case 'diente': {

                jugador.defensa =
                    Number(jugador.defensa || 10) + 2

                resultado =
                    '🛡️ Tu Defensa aumentó `+2`.'

                break
            }

            case 'perla': {

                jugador.berries =
                    Number(jugador.berries || 0) + 1500

                resultado =
                    '🐚 Has obtenido `+1,500 Berries`.'

                break
            }

            case 'corona': {

                jugador.ataque =
                    Number(jugador.ataque || 10) + 3

                jugador.defensa =
                    Number(jugador.defensa || 10) + 3

                resultado =
                    '👑 Ataque `+3` y Defensa `+3`.'

                break
            }

            case 'reliquia': {

                jugador.xp =
                    Number(jugador.xp || 0) + 50

                resultado =
                    '🗿 Has obtenido `+50 XP`.'

                break
            }

            default:

                return await sock.sendMessage(
                    from,
                    {
                        text:
                            '`❌ Ese objeto no tiene un efecto.`'
                    },
                    { quoted: m }
                )
        }

        // ══════════════════════════════════
        // COMPROBAR XP
        // ══════════════════════════════════

        if (!subioNivel) {

            const xpNecesaria =
                Number(
                    jugador.xpNecesaria || 100
                )

            if (
                Number(jugador.xp || 0) >=
                xpNecesaria
            ) {

                subirNivel(jugador)

                subioNivel = true

                resultado +=
                    '\n\n🎉 ¡También subiste al nivel `' +
                    jugador.nivel +
                    '`!'
            }
        }

        // ══════════════════════════════════
        // CONSUMIR
        // ══════════════════════════════════

        consumirObjeto(
            jugador,
            id
        )

        guardarDB(db)

        // ══════════════════════════════════
        // REACCIÓN
        // ══════════════════════════════════

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '✨',
                    key: m.key
                }
            }
        )

        // ══════════════════════════════════
        // RESULTADO
        // ══════════════════════════════════

        const texto = [
            '`🎒 OBJETO UTILIZADO`',
            '',
            '`📦 ' +
                nombres[id] +
                '`',
            '',
            resultado,
            '',
            '`📦 El objeto fue consumido.`',
            '',
            '`💰 Berries: ' +
                Number(jugador.berries || 0)
                    .toLocaleString() +
                '`',
            '`⭐ Nivel: ' +
                jugador.nivel +
                '`',
            '`⚔️ Ataque: ' +
                jugador.ataque +
                '`',
            '`🛡️ Defensa: ' +
                jugador.defensa +
                '`'
        ].join('\n')

        await sock.sendMessage(
            from,
            {
                text
            },
            { quoted: m }
        )

    } catch (e) {

        console.error(
            'ERROR RPG-USAR:',
            e
        )

        try {

            await sock.sendMessage(
                from,
                {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                }
            )

        } catch {}

        try {

            await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ Ocurrió un error al usar el objeto.`'
                },
                { quoted: m }
            )

        } catch {}
    }
}

// ══════════════════════════════════════
// CONFIGURACIÓN
// ══════════════════════════════════════

handler.command = [
    'usar',
    'use'
]

handler.help = [
    'usar'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler