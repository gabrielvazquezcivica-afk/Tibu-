import config from '../config.js'

let handler = {}

handler.run = async (sock, msg, args) => {
    const inicio = Date.now()

    // Reacción de espera
    await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '⏳', key: msg.key }
    })

    const fin = Date.now()
    const velocidad = fin - inicio

    // Texto con el pie de nombre del bot
    const texto = `🚀 Velocidad: *${velocidad} ms*\n\n> ${config.BOT_NAME}`

    // Responde citando el mensaje original
    await sock.sendMessage(msg.key.remoteJid, {
        text: texto,
        quoted: msg
    })

    // Reacción de confirmación
    await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '✅', key: msg.key }
    })
}


handler.command = ['ping', 'p']
handler.help = ['ping']
handler.tags = ['informacion']
handler.menu = true

export default handler
