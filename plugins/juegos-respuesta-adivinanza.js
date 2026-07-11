import config from '../config.js'
import { partidas } from './juegos-adivinanza.js'

let handler = {}

handler.run = async (sock, m, args) => {
const from = m.key.remoteJid

if (!partidas.has(from)) {
return sock.sendMessage(from, {
text:
`❌ \`No hay ninguna adivinanza activa.\`

💡 Usa:
\`.adivinanza\`

> ${config.BOT_NAME}`
}, { quoted: m })
}

const respuesta =
args.join(' ')
.toLowerCase()
.trim()

if (!respuesta) {
return sock.sendMessage(from, {
text:
`❌ \`Debes escribir una respuesta.\`

Ejemplo:
\`.respuesta reloj\`

> ${config.BOT_NAME}`
}, { quoted: m })
}

const correcta = partidas.get(from)

if (respuesta === correcta) {

partidas.delete(from)

await sock.sendMessage(from, {
react: {
text: '🎉',
key: m.key
}
})

return sock.sendMessage(from, {
text:
`🎉 \`¡Respuesta correcta!\`

🏆 La respuesta era:

\`${correcta}\`

> ${config.BOT_NAME}`
}, { quoted: m })
}

await sock.sendMessage(from, {
react: {
text: '❌',
key: m.key
}
})

return sock.sendMessage(from, {
text:
`❌ \`Respuesta incorrecta.\`

🔄 Sigue intentando.

> ${config.BOT_NAME}`
}, { quoted: m })
}

handler.command = ['respuesta']
handler.help = ['respuesta <texto>']
handler.tags = ['diversión']
handler.menu = false

export default handler