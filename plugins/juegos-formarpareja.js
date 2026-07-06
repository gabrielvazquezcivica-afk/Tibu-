let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`❌ Este comando solo funciona en grupos.`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '💘',
            key: m.key
        }
    })

    const metadata = await sock.groupMetadata(from)

    let participantes = metadata.participants
        .map(p => p.id)
        .filter(id => !id.includes(sock.user.id.split(':')[0]))

    if (participantes.length < 2) {
        return sock.sendMessage(from, {
            text: '`❌ No hay suficientes participantes.`'
        }, { quoted: m })
    }

    participantes = participantes.sort(() => Math.random() - 0.5)

    const persona1 = participantes[0]
    const persona2 = participantes.find(x => x !== persona1)

    const porcentaje = Math.floor(Math.random() * 41) + 60 // 60-100%

    let emoji = '💖'
    if (porcentaje >= 95) emoji = '💍'
    else if (porcentaje >= 85) emoji = '💘'
    else if (porcentaje >= 75) emoji = '💕'

    const texto =
`${emoji} *PAREJA FORMADA* ${emoji}

💞 @${persona1.split('@')[0]}
❤️
💞 @${persona2.split('@')[0]}

💓 Compatibilidad: *${porcentaje}%*`

    await sock.sendMessage(from, {
        text: texto,
        mentions: [persona1, persona2]
    }, { quoted: m })
}

handler.command = ['formarpareja', 'pareja']
handler.help = ['formarpareja']
handler.tags = ['diversión']
handler.menu = true

export default handler