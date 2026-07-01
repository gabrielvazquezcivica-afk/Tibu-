let handler = {}

handler.run = async (sock, msg, args) => {
    const inicio = Date.now()

    // Reacción de espera
    await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '⏳', key: msg.key }
    })

    const fin = Date.now()
    const velocidad = fin - inicio

    // Responde citando el mensaje original
    await sock.sendMessage(msg.key.remoteJid, {
        text: `🚀 Velocidad: *${velocidad} ms*`,
        quoted: msg
    })

    // Reacción de confirmación
    await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '✅', key: msg.key }
    })
}

// Todo va aquí abajo
handler.command = ['ping', 'velocidad']
handler.help = ['ping']
handler.tags = ['informacion']
handler.menu = true

export default handler
