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
            text: '💞',
            key: m.key
        }
    })

    const metadata = await sock.groupMetadata(from)

    let participantes = metadata.participants
        .map(p => p.id)
        .filter(id => !id.includes(sock.user.id.split(':')[0]))

    participantes = participantes.sort(() => Math.random() - 0.5)

    const parejas = []
    const usados = new Set()

    for (const user of participantes) {
        if (usados.has(user)) continue

        const pareja = participantes.find(
            x => x !== user && !usados.has(x)
        )

        if (!pareja) continue

        usados.add(user)
        usados.add(pareja)

        parejas.push([user, pareja])

        if (parejas.length >= 5) break
    }

    const corazones = [
        '💖',
        '💘',
        '💕',
        '💝',
        '❤️'
    ]

    let texto = '💞 *TOP 5 PAREJAS DEL GRUPO* 💞\n\n'

    parejas.forEach((par, i) => {
        texto += `${i + 1}. ${corazones[i]}\n`
        texto += `👤 @${par[0].split('@')[0]}\n`
        texto += `💞\n`
        texto += `👤 @${par[1].split('@')[0]}\n\n`
    })

    texto += '🥰 ¡Qué bonitas parejas!'

    await sock.sendMessage(from, {
        text: texto,
        mentions: parejas.flat()
    }, { quoted: m })
}

handler.command = ['topparejas', 'parejas']
handler.help = ['topparejas']
handler.tags = ['diversión']
handler.menu = true

export default handler