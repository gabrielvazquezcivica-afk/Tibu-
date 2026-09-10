const acertijos = [
    {
        pregunta: 'Tengo agujas pero no sé coser. Tengo números pero no sé contar. ¿Qué soy?',
        respuestas: ['reloj']
    },
    {
        pregunta: 'Cuanto más me quitas, más grande me hago. ¿Qué soy?',
        respuestas: ['agujero']
    },
    {
        pregunta: 'Tengo dientes pero no puedo comer. ¿Qué soy?',
        respuestas: ['peine']
    },
    {
        pregunta: 'Vuelo sin alas, lloro sin ojos. ¿Qué soy?',
        respuestas: ['nube']
    },
    {
        pregunta: 'Siempre está delante de ti, pero nunca puedes verlo. ¿Qué es?',
        respuestas: ['futuro']
    },
    {
        pregunta: 'Tiene cuello pero no cabeza. ¿Qué es?',
        respuestas: ['botella']
    },
    {
        pregunta: 'Sube y baja, pero nunca se mueve de su lugar. ¿Qué es?',
        respuestas: ['escalera']
    },
    {
        pregunta: 'Cuanto más seca, más mojada se vuelve. ¿Qué es?',
        respuestas: ['toalla']
    },
    {
        pregunta: 'Tiene manos pero no puede aplaudir. ¿Qué es?',
        respuestas: ['reloj']
    },
    {
        pregunta: 'Me puedes romper sin tocarme ni verme. ¿Qué soy?',
        respuestas: ['promesa']
    },
    {
        pregunta: 'Tiene ciudades, pero no casas; tiene montañas, pero no árboles; tiene agua, pero no peces. ¿Qué es?',
        respuestas: ['mapa']
    },
    {
        pregunta: 'Mientras más hay, menos puedes ver. ¿Qué es?',
        respuestas: ['oscuridad']
    },
    {
        pregunta: 'Es tuyo, pero otras personas lo usan más que tú. ¿Qué es?',
        respuestas: ['nombre']
    },
    {
        pregunta: 'Tiene muchas hojas pero no es un árbol. ¿Qué soy?',
        respuestas: ['libro']
    },
    {
        pregunta: 'Tiene ojos pero no puede ver. ¿Qué es?',
        respuestas: ['papa', 'patata']
    },
    {
        pregunta: 'Pasa por el agua y no se moja. ¿Qué es?',
        respuestas: ['luz']
    },
    {
        pregunta: 'No puedes atraparme, pero siempre estoy detrás de ti. ¿Qué soy?',
        respuestas: ['pasado']
    },
    {
        pregunta: 'Tengo una sola pierna y un sombrero. ¿Qué soy?',
        respuestas: ['hongo']
    },
    {
        pregunta: 'Cuanto más corres, más atrás dejas. ¿Qué dejas?',
        respuestas: ['huellas']
    },
    {
        pregunta: 'No tengo vida, pero puedo crecer. No tengo pulmones, pero necesito aire. ¿Qué soy?',
        respuestas: ['fuego']
    }
]

// ─────────────────────────────────────
// ACERTIJOS ACTIVOS
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
// HANDLER
// ─────────────────────────────────────

const handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    const usuario = limpiarId(
        m.key.participant ||
        m.key.remoteJid
    )

    // La clave depende del usuario y grupo
    const clave = from + ':' + usuario

    try {

        // ─────────────────────────────
        // SI YA TIENE ACERTIJO
        // ─────────────────────────────

        const activo =
            global.acertijoActivo.get(clave)

        if (activo) {

            return await sock.sendMessage(
                from,
                {
                    text: [
                        '`🧩 YA TIENES UN ACERTIJO ACTIVO`',
                        '',
                        '❓ ' + activo.pregunta,
                        '',
                        '`💡 Usa .op seguido de tu respuesta.`',
                        '`Ejemplo: .op reloj`',
                        '',
                        '`🔢 Intentos restantes: ' +
                            (3 - activo.intentos) +
                            '`'
                    ].join('\n')
                },
                { quoted: m }
            )
        }

        // ─────────────────────────────
        // ELEGIR ACERTIJO
        // ─────────────────────────────

        const indice = Math.floor(
            Math.random() * acertijos.length
        )

        const acertijo = acertijos[indice]

        global.acertijoActivo.set(
            clave,
            {
                pregunta: acertijo.pregunta,
                respuestas: acertijo.respuestas,
                intentos: 0
            }
        )

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🧩',
                    key: m.key
                }
            }
        )

        const texto = [
            '`🧩 ACERTIJO`',
            '',
            '❓ ' + acertijo.pregunta,
            '',
            '`💡 Tienes 3 intentos.`',
            '`📝 Responde usando .op`',
            '',
            '`Ejemplo: .op reloj`'
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
            'ERROR ACERTIJO:',
            e
        )

        await sock.sendMessage(
            from,
            {
                text:
                    '`❌ Ocurrió un error al crear el acertijo.`'
            },
            { quoted: m }
        )
    }
}

// ─────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────

handler.command = [
    'acertijo',
    'acertijos'
]

handler.help = [
    'acertijo'
]

handler.tags = [
    'diversión'
]

handler.menu = true

export default handler