// ─────────────────────────────────────
// RESPUESTAS DE ACERTIJOS
// ─────────────────────────────────────

global.acertijoActivo =
    global.acertijoActivo || new Map()

// ─────────────────────────────────────
// LIMPIAR ID
// ─────────────────────────────────────

function limpiarId(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

// ─────────────────────────────────────
// NORMALIZAR RESPUESTA
// ─────────────────────────────────────

function normalizar(texto = '') {

    return String(texto)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[¿?¡!.,;:]/g, '')
        .replace(/\s+/g, ' ')
}

// ─────────────────────────────────────
// HANDLER
// ─────────────────────────────────────

const handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    const usuario = limpiarId(
        m.key.participant ||
        m.key.remoteJid
    )

    // EXACTAMENTE LA MISMA CLAVE
    // QUE USA ACERTIJOS.JS
    const clave = from + ':' + usuario

    try {

        // ─────────────────────────────
        // BUSCAR ACERTIJO
        // ─────────────────────────────

        const activo =
            global.acertijoActivo.get(clave)

        if (!activo) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ No tienes ningún acertijo activo.`\n\n' +
                        '`🧩 Usa .acertijo para comenzar.`'
                },
                { quoted: m }
            )
        }

        // ─────────────────────────────
        // COMPROBAR RESPUESTA
        // ─────────────────────────────

        if (!args || !args.length) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ Escribe una respuesta.`\n\n' +
                        '`Ejemplo: .op reloj`'
                },
                { quoted: m }
            )
        }

        const respuesta =
            normalizar(
                args.join(' ')
            )

        const correcta =
            activo.respuestas.some(
                respuestaCorrecta =>
                    normalizar(respuestaCorrecta) ===
                    respuesta
            )

        // ─────────────────────────────
        // RESPUESTA CORRECTA
        // ─────────────────────────────

        if (correcta) {

            global.acertijoActivo.delete(
                clave
            )

            await sock.sendMessage(
                from,
                {
                    react: {
                        text: '🎉',
                        key: m.key
                    }
                }
            )

            return await sock.sendMessage(
                from,
                {
                    text: [
                        '`🎉 ¡RESPUESTA CORRECTA!`',
                        '',
                        '🧩 ' + activo.pregunta,
                        '',
                        '✅ ¡Excelente! Acertaste el acertijo.',
                        '',
                        '`🧠 Usa .acertijo para jugar otra vez.`'
                    ].join('\n')
                },
                { quoted: m }
            )
        }

        // ─────────────────────────────
        // RESPUESTA INCORRECTA
        // ─────────────────────────────

        activo.intentos =
            Number(activo.intentos || 0) + 1

        // ─────────────────────────────
        // SE TERMINARON LOS INTENTOS
        // ─────────────────────────────

        if (activo.intentos >= 3) {

            const respuestaCorrecta =
                activo.respuestas[0]

            global.acertijoActivo.delete(
                clave
            )

            return await sock.sendMessage(
                from,
                {
                    text: [
                        '`❌ SE TERMINARON LOS INTENTOS`',
                        '',
                        '🧩 ' + activo.pregunta,
                        '',
                        '✅ La respuesta era: `' +
                            respuestaCorrecta +
                            '`',
                        '',
                        '`🧩 Usa .acertijo para jugar otra vez.`'
                    ].join('\n')
                },
                { quoted: m }
            )
        }

        // ─────────────────────────────
        // TODAVÍA HAY INTENTOS
        // ─────────────────────────────

        const restantes =
            3 - activo.intentos

        return await sock.sendMessage(
            from,
            {
                text: [
                    '`❌ Respuesta incorrecta.`',
                    '',
                    '`💡 Intenta nuevamente.`',
                    '`🔢 Intentos restantes: ' +
                        restantes +
                        '`'
                ].join('\n')
            },
            { quoted: m }
        )

    } catch (e) {

        console.error(
            'ERROR OP ACERTIJO:',
            e
        )

        await sock.sendMessage(
            from,
            {
                text:
                    '`❌ Ocurrió un error al comprobar la respuesta.`'
            },
            { quoted: m }
        )
    }
}

// ─────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────

handler.command = [
    'op'
]

handler.help = [
    'op'
]

handler.tags = [
    'diversión'
]

handler.menu = false

export default handler