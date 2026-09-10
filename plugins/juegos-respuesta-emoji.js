global.emojiJuegos =
    global.emojiJuegos || new Map()

function limpiarId(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

function normalizar(texto = '') {
    return String(texto)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[¿?¡!.,;:]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

const handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    const usuario = limpiarId(
        m.key.participant ||
        m.key.remoteJid
    )

    const clave = from + ':' + usuario

    try {

        const activo =
            global.emojiJuegos.get(clave)

        if (!activo) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ No tienes ningún Emoji Quiz activo.`\n\n' +
                        '`🎮 Usa .emoji para comenzar.`'
                },
                { quoted: m }
            )
        }

        if (!args || !args.length) {

            return await sock.sendMessage(
                from,
                {
                    text:
                        '`❌ Escribe una respuesta.`\n\n' +
                        '`Ejemplo: .adivina batman`'
                },
                { quoted: m }
            )
        }

        const respuesta =
            normalizar(args.join(' '))

        const correcta =
            activo.respuestas.some(
                respuestaCorrecta =>
                    normalizar(respuestaCorrecta) ===
                    respuesta
            )

        // RESPUESTA CORRECTA
        if (correcta) {

            global.emojiJuegos.delete(clave)

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
                        activo.emojis,
                        '',
                        '✅ ¡Muy bien! Adivinaste.',
                        '',
                        '`🎮 Usa .emoji para jugar otra vez.`'
                    ].join('\n')
                },
                { quoted: m }
            )
        }

        // RESPUESTA INCORRECTA
        activo.intentos++

        if (activo.intentos >= 3) {

            global.emojiJuegos.delete(clave)

            return await sock.sendMessage(
                from,
                {
                    text: [
                        '`❌ SE TERMINARON LOS INTENTOS`',
                        '',
                        activo.emojis,
                        '',
                        '✅ La respuesta era: `' +
                            activo.respuestas[0] +
                            '`',
                        '',
                        '`🎮 Usa .emoji para jugar otra vez.`'
                    ].join('\n')
                },
                { quoted: m }
            )
        }

        const restantes =
            3 - activo.intentos

        return await sock.sendMessage(
            from,
            {
                text: [
                    '`❌ Respuesta incorrecta.`',
                    '',
                    '`💡 Intenta nuevamente.`',
                    '',
                    '`🔢 Intentos restantes: ' +
                        restantes +
                        '`'
                ].join('\n')
            },
            { quoted: m }
        )

    } catch (e) {

        console.error(
            'ERROR ADIVINA:',
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

handler.command = [
    'adivina'
]

handler.help = [
    'adivina'
]

handler.tags = [
    'diversión'
]

handler.menu = false

export default handler