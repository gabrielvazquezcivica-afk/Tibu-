import config from '../config.js'

if (!global.adivinanzasActivas) {
    global.adivinanzasActivas = new Map()
}

const adivinanzas = [
{ pregunta: '🦈 Tengo dientes pero no muerdo. ¿Qué soy?', respuesta: 'peine' },
{ pregunta: '🌙 Mientras más me quitas, más grande soy.', respuesta: 'agujero' },
{ pregunta: '🔥 Vuelo sin alas, lloro sin ojos.', respuesta: 'nube' },
{ pregunta: '🌊 Tiene agujas pero no cose.', respuesta: 'reloj' },
{ pregunta: '⚓ Blanco por dentro, verde por fuera.', respuesta: 'pera' },
{ pregunta: '🐚 Oro parece, plata no es.', respuesta: 'platano' },
{ pregunta: '🏝️ Cuanto más seca, más moja.', respuesta: 'toalla' },
{ pregunta: '🦜 Tiene cuello pero no cabeza.', respuesta: 'botella' },

{ pregunta: '🐟 Tiene ojos y no ve, tiene agua y no bebe.', respuesta: 'pez' },
{ pregunta: '☀️ Sale de noche y desaparece de día.', respuesta: 'luna' },
{ pregunta: '📖 Tiene hojas pero no es árbol.', respuesta: 'libro' },
{ pregunta: '🚪 Cuanto más grande es, menos se ve.', respuesta: 'oscuridad' },
{ pregunta: '🎩 Siempre corre pero nunca camina.', respuesta: 'agua' },
{ pregunta: '🎈 Tiene patas pero no camina.', respuesta: 'mesa' },
{ pregunta: '🕯️ Mientras más trabajo, más delgado me vuelvo.', respuesta: 'lapiz' },
{ pregunta: '🎮 Tiene teclas pero no abre puertas.', respuesta: 'teclado' },
{ pregunta: '🚢 Tiene corona y no es rey.', respuesta: 'piña' },
{ pregunta: '🍳 Tiene yema pero no es huevo.', respuesta: 'dedo' },
{ pregunta: '📦 Tiene ciudades pero no casas, ríos pero no agua.', respuesta: 'mapa' },
{ pregunta: '🌧️ Baja y nunca sube.', respuesta: 'lluvia' },

{ pregunta: '🧊 Cuanto más caliente estoy, más frío me vuelvo.', respuesta: 'refrigerador' },
{ pregunta: '📱 Lo rompes al nombrarlo.', respuesta: 'silencio' },
{ pregunta: '🎭 Tiene boca pero no habla.', respuesta: 'rio' },
{ pregunta: '🚲 Tiene manos pero no dedos.', respuesta: 'reloj' },
{ pregunta: '🌎 Da la vuelta al mundo sin salir de un rincón.', respuesta: 'sello' },
{ pregunta: '🐢 Siempre está delante de ti pero no puedes verlo.', respuesta: 'futuro' },
{ pregunta: '🍞 Si me nombras desaparezco.', respuesta: 'silencio' },
{ pregunta: '💡 Tiene cabeza y cola pero no cuerpo.', respuesta: 'moneda' },
{ pregunta: '🌴 Cuanto más le quitas, más grande es.', respuesta: 'hoyo' },
{ pregunta: '📸 Tiene un ojo pero no puede ver.', respuesta: 'aguja' },

{ pregunta: '⚽ Tiene cuatro patas por la mañana, dos al mediodía y tres por la noche.', respuesta: 'hombre' },
{ pregunta: '🎲 Subo cuando la lluvia baja.', respuesta: 'paraguas' },
{ pregunta: '📺 Tiene pantalla pero no es cine.', respuesta: 'television' },
{ pregunta: '🚗 Tiene motor pero no es coche.', respuesta: 'ventilador' },
{ pregunta: '🎧 Cuanto más compartes, menos tienes.', respuesta: 'secreto' },
{ pregunta: '📡 Puede viajar por todo el mundo mientras permanece en una esquina.', respuesta: 'sello' },
{ pregunta: '🍉 Verde por fuera, roja por dentro.', respuesta: 'sandia' },
{ pregunta: '🐓 Canta sin garganta.', respuesta: 'gallo' },
{ pregunta: '🧠 Siempre viene pero nunca llega.', respuesta: 'mañana' },
{ pregunta: '🏆 Tiene alas pero no vuela.', respuesta: 'molino' }
]

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    if (global.adivinanzasActivas.has(from)) {
        return sock.sendMessage(from, {
            text:
`⚠️ \`Ya hay una adivinanza activa.\`

💡 Usa:
\`.respuesta <respuesta>\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    const dato =
        adivinanzas[
            Math.floor(Math.random() * adivinanzas.length)
        ]

    global.adivinanzasActivas.set(
        from,
        dato.respuesta.toLowerCase()
    )

    await sock.sendMessage(from, {
        react: {
            text: '🤔',
            key: m.key
        }
    })

    await sock.sendMessage(from, {
        text:
`╭━━━〔 🤔 ADIVINANZA 〕━━━⬣

\`${dato.pregunta}\`

💡 Responde con:

\`.respuesta <respuesta>\`

╰━━━━━━━━━━━━━━⬣

> ${config.BOT_NAME}`
    }, { quoted: m })
}

handler.command = ['adivinanza']
handler.help = ['adivinanza']
handler.tags = ['diversión']
handler.menu = true

export default handler