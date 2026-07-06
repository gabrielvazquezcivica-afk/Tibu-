let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`❌ Este comando solo funciona en grupos.`'
        }, { quoted: m })
    }

    const categoria = args.join(' ').trim()

    if (!categoria) {
        return sock.sendMessage(from, {
            text: '`📊 Ejemplo: .top guapos`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '🏆',
            key: m.key
        }
    })

    const metadata = await sock.groupMetadata(from)

    let participantes = metadata.participants
        .map(p => p.id)
        .filter(id => !id.includes(sock.user.id.split(':')[0]))

    participantes = participantes.sort(() => Math.random() - 0.5)

    const top = participantes.slice(0, Math.min(10, participantes.length))

    const emojis = [
        '🥇',
        '🥈',
        '🥉',
        '4️⃣',
        '5️⃣',
        '6️⃣',
        '7️⃣',
        '8️⃣',
        '9️⃣',
        '🔟'
    ]

    let texto = `🏆 *TOP 10 ${categoria.toUpperCase()}* 🏆\n\n`

    top.forEach((user, i) => {
        texto += `${emojis[i]} @${user.split('@')[0]}\n`
    })

    texto += `\n✨ ¿Estás de acuerdo con el ranking?`

    await sock.sendMessage(from, {
        text: texto,
        mentions: top
    }, { quoted: m })
}

handler.command = ['top']
handler.help = ['top <categoría>']
handler.tags = ['diversión']
handler.menu = true

export default handler