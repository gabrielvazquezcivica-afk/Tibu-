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
// OBJETOS DE LA TIENDA
// ══════════════════════════════════════

const objetos = {

    talisman: {
        nombre: '🧿 Talismán',
        precio: 2000,
        descripcion: 'Un objeto misterioso de colección.'
    },

    anillo: {
        nombre: '💍 Anillo pirata',
        precio: 3500,
        descripcion: 'Un antiguo anillo perteneciente a un pirata.'
    },

    moneda: {
        nombre: '🪙 Moneda antigua',
        precio: 1500,
        descripcion: 'Una vieja moneda de colección.'
    },

    diamante: {
        nombre: '💎 Diamante',
        precio: 8000,
        descripcion: 'Una piedra preciosa de gran valor.'
    },

    elixir: {
        nombre: '🧪 Elixir',
        precio: 4000,
        descripcion: 'Un extraño líquido de origen desconocido.'
    },

    trofeo: {
        nombre: '🏆 Trofeo',
        precio: 10000,
        descripcion: 'Un trofeo reservado para grandes aventureros.'
    },

    diente: {
        nombre: '🦈 Diente de tiburón',
        precio: 2500,
        descripcion: 'Un recuerdo de una aventura marítima.'
    },

    perla: {
        nombre: '🐚 Perla marina',
        precio: 5000,
        descripcion: 'Una hermosa perla encontrada en el océano.'
    },

    corona: {
        nombre: '👑 Corona pirata',
        precio: 15000,
        descripcion: 'Una antigua corona de un capitán pirata.'
    },

    reliquia: {
        nombre: '🗿 Reliquia antigua',
        precio: 20000,
        descripcion: 'Una misteriosa reliquia de tiempos antiguos.'
    }

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
// AGREGAR AL INVENTARIO
// ══════════════════════════════════════

function agregarInventario(jugador, id) {

    if (!Array.isArray(jugador.inventario)) {
        jugador.inventario = []
    }

    const existente = jugador.inventario.find(
        item => item.id === id
    )

    if (existente) {

        existente.cantidad =
            Number(existente.cantidad || 0) + 1

    } else {

        jugador.inventario.push({
            id: id,
            nombre: objetos[id].nombre,
            cantidad: 1
        })

    }
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
        // COMPROBAR REGISTRO
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
        // MOSTRAR TIENDA
        // ══════════════════════════════════

        if (!args || !args.length) {

            const berries = Number(
                jugador.berries || 0
            )

            const texto = [
                '`🛒 TIENDA TIBU RPG`',
                '',
                '`💰 Tus Berries: ' +
                    berries.toLocaleString() +
                    '`',
                '',
                '`🧿 talisman — 2,000 Berries`',
                '`💍 anillo — 3,500 Berries`',
                '`🪙 moneda — 1,500 Berries`',
                '`💎 diamante — 8,000 Berries`',
                '`🧪 elixir — 4,000 Berries`',
                '`🏆 trofeo — 10,000 Berries`',
                '`🦈 diente — 2,500 Berries`',
                '`🐚 perla — 5,000 Berries`',
                '`👑 corona — 15,000 Berries`',
                '`🗿 reliquia — 20,000 Berries`',
                '',
                '`💡 Para comprar:`',
                '`.comprar diamante`',
                '',
                '`📦 Los objetos se guardan en tu inventario.`'
            ].join('\n')

            return await sock.sendMessage(
                from,
                {
                    text: texto
                },
                { quoted: m }
            )
        }

        // ══════════════════════════════════
        // BUSCAR OBJETO
        // ══════════════════════════════════

        const itemId = buscarObjeto(
            args.join(' ')
        )

        if (!itemId) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ Ese objeto no existe en la tienda.`\n\n' +
                        '`🛒 Usa .tienda para ver los objetos disponibles.`'
                },
                { quoted: m }
            )
        }

        const item = objetos[itemId]

        // ══════════════════════════════════
        // BERRIES
        // ══════════════════════════════════

        const berries = Number(
            jugador.berries || 0
        )

        // ══════════════════════════════════
        // COMPROBAR DINERO
        // ══════════════════════════════════

        if (berries < item.precio) {

            const faltan =
                item.precio - berries

            return await sock.sendMessage(
                from,
                {
                    text: [
                        '`❌ No tienes suficientes Berries.`',
                        '',
                        '`💰 Tienes: ' +
                            berries.toLocaleString() +
                            ' Berries`',
                        '`💵 Precio: ' +
                            item.precio.toLocaleString() +
                            ' Berries`',
                        '`📉 Te faltan: ' +
                            faltan.toLocaleString() +
                            ' Berries`'
                    ].join('\n')
                },
                { quoted: m }
            )
        }

        // ══════════════════════════════════
        // REALIZAR COMPRA
        // ══════════════════════════════════

        jugador.berries =
            berries - item.precio

        agregarInventario(
            jugador,
            itemId
        )

        guardarDB(db)

        // ══════════════════════════════════
        // REACCIÓN
        // ══════════════════════════════════

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🛒',
                    key: m.key
                }
            }
        )

        // ══════════════════════════════════
        // CANTIDAD
        // ══════════════════════════════════

        const inventarioItem =
            jugador.inventario.find(
                item => item.id === itemId
            )

        const cantidad =
            Number(
                inventarioItem?.cantidad || 1
            )

        // ══════════════════════════════════
        // CONFIRMACIÓN
        // ══════════════════════════════════

        const texto = [
            '`🛒 COMPRA REALIZADA`',
            '',
            '`📦 Objeto: ' +
                item.nombre +
                '`',
            '',
            '`💰 Precio: ' +
                item.precio.toLocaleString() +
                ' Berries`',
            '',
            '`📦 Cantidad: ' +
                cantidad +
                '`',
            '',
            '`💵 Berries restantes: ' +
                jugador.berries.toLocaleString() +
                '`',
            '',
            '`✅ ' +
                item.descripcion +
                '`',
            '',
            '`📦 El objeto fue agregado a tu inventario.`'
        ].join('\n')

        await sock.sendMessage(
            from,
            {
                text: texto
            },
            { quoted: m }
        )

    } catch (e) {

        console.error(
            'ERROR RPG-TIENDA:',
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
                        '`❌ Ocurrió un error al procesar la tienda.`'
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
    'tienda',
    'comprar',
    'shop'
]

handler.help = [
    'tienda',
    'comprar'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler