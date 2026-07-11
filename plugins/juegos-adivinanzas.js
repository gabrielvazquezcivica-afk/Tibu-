import config from '../config.js'

const partidas = new Map()

const adivinanzas = [
{
pregunta: '🦈 Tengo dientes pero no muerdo. ¿Qué soy?',
respuesta: 'peine'
},
{
pregunta: '🌙 Mientras más me quitas, más grande soy. ¿Qué soy?',
respuesta: 'agujero'
},
{
pregunta: '🔥 Vuelo sin alas, lloro sin ojos. ¿Qué soy?',
respuesta: 'nube'
},
{
pregunta: '🌊 Tiene agujas pero no cose.',
respuesta: 'reloj'
},
{
pregunta: '⚓ Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera.',
respuesta: 'pera'
},
{
pregunta: '🐚 Oro parece, plata no es.',
respuesta: 'platano'
},
{
pregunta: '🏝️ Cuanto más seca, más moja.',
respuesta: 'toalla'
},
{
pregunta: '🦜 Tiene cuello pero no cabeza.',
respuesta: 'botella'
}
]

let handler = {}

handler.run = async (sock, m) => {
const from = m.key.remoteJid

if (partidas.has(from)) {
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

partidas.set(
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

export { partidas }
export default handler