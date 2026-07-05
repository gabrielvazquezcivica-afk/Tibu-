import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const mentions =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    let user1, user2

    if (mentions.length === 1) {
        user1 = m.key.participant || m.key.remoteJid
        user2 = mentions[0]
    } else if (mentions.length >= 2) {
        user1 = mentions[0]
        user2 = mentions[1]
    } else {
        return sock.sendMessage(from, {
            text: `❤️ Menciona uno o dos usuarios.

Ejemplos:
${config.PREFIX}ship @usuario
${config.PREFIX}ship @usuario1 @usuario2`
        }, { quoted: m })
    }

    const porcentaje = Math.floor(Math.random() * 101)

    let estado = '💔 No hay futuro...'

    if (porcentaje >= 20) estado = '🤍 Hay esperanza.'
    if (porcentaje >= 40) estado = '💞 Buena pareja.'
    if (porcentaje >= 60) estado = '💕 Se ven muy bien juntos.'
    if (porcentaje >= 80) estado = '💖 Pareja perfecta.'
    if (porcentaje >= 95) estado = '💍 ¡Destinados a estar juntos!'

    const barra =
        '█'.repeat(Math.floor(porcentaje / 10)) +
        '░'.repeat(10 - Math.floor(porcentaje / 10))

    const texto = `❤️ *SHIP TIBU BOT* ❤️

@${user1.split('@')[0]}
💞
@${user2.split('@')[0]}

📊 Compatibilidad

\`${barra}\`

*${porcentaje}%*

${estado}`

    await sock.sendMessage(from, {
        text: texto,
        mentions: [user1, user2]
    }, { quoted: m })

    await sock.sendMessage(from, {
        react: {
            text: '❤️',
            key: m.key
        }
    })
}

handler.command = ['ship']
handler.help = ['ship @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler