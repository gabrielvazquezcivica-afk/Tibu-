let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    const uptime =
        process.uptime()

    const dias =
        Math.floor(
            uptime / 86400
        )

    const horas =
        Math.floor(
            uptime % 86400 / 3600
        )

    const minutos =
        Math.floor(
            uptime % 3600 / 60
        )

    const segundos =
        Math.floor(
            uptime % 60
        )

    const texto =
`╭━━━〔 ⏳ 𝐔𝐏𝐓𝐈𝐌𝐄 〕━━━⬣
┃ 🚀 Bot encendido:
┃
┃ 📅 ${dias} días
┃ ⏰ ${horas} horas
┃ 🕐 ${minutos} minutos
┃ ⏱️ ${segundos} segundos
╰━━━━━━━━━━━━━━━━⬣`

    await sock.sendMessage(
        from,
        {
            text: texto
        },
        {
            quoted: m
        }
    )
}

handler.command = [
    'uptime',
    'runtime',
    'tiempo'
]

handler.help = [
    'uptime'
]

handler.tags = [
    'informacion'
]

handler.menu = true

export default handler