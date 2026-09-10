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

// ══════════════════════════════════════
// LIMPIAR JID
// ══════════════════════════════════════

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

// ══════════════════════════════════════
// HANDLER
// ══════════════════════════════════════

const handler = {}

handler.run = async (sock, m) => {

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
        // INVENTARIO
        // ══════════════════════════════════

        const inventario =
            Array.isArray(jugador.inventario)
                ? jugador.inventario
                : []

        const berries =
            Number(jugador.berries || 0)

        // ══════════════════════════════════
        // INVENTARIO VACÍO
        // ══════════════════════════════════

        if (!inventario.length) {

            const texto = [
                '`📦 TU INVENTARIO`',
                '',
                '`🎒 No tienes ningún objeto.`',
                '',
                '`💰 Berries: ' +
                    berries.toLocaleString() +
                    '`',
                '',
                '`🛒 Usa .tienda para comprar objetos.`'
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
        // CREAR LISTA
        // ══════════════════════════════════

        let texto = [
            '`📦 TU INVENTARIO`',
            '',
            '`💰 Berries: ' +
                berries.toLocaleString() +
                '`',
            '',
            '`🎒 OBJETOS:`',
            ''
        ].join('\n')

        let totalObjetos = 0

        for (const item of inventario) {

            if (!item) continue

            const cantidad =
                Number(item.cantidad || 0)

            if (cantidad <= 0) continue

            const nombre =
                item.nombre ||
                item.id ||
                'Objeto desconocido'

            totalObjetos += cantidad

            texto +=
                '• ' +
                nombre +
                ' ×' +
                cantidad +
                '\n'
        }

        texto += [
            '',
            '`📦 Total de objetos: ' +
                totalObjetos +
                '`',
            '',
            '`🛒 Usa .tienda para conseguir más objetos.`'
        ].join('\n')

        // ══════════════════════════════════
        // ENVIAR
        // ══════════════════════════════════

        await sock.sendMessage(
            from,
            {
                text: texto
            },
            { quoted: m }
        )

    } catch (e) {

        console.error(
            'ERROR RPG-INVENTARIO:',
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
                        '`❌ Ocurrió un error al consultar tu inventario.`'
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
    'inventario',
    'inv',
    'mochila'
]

handler.help = [
    'inventario'
]

handler.tags = [
    'rpg'
]

handler.menu = true

export default handler