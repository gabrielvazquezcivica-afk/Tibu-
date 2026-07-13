import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {

    const canal =
    'https://whatsapp.com/channel/0029VbDISeq3QxS45JPaOh21'

    const texto =
`📢 \`CANAL OFICIAL\`

> 🚀 Únete al canal oficial de Tibu Bot
> 🔔 Recibe novedades y actualizaciones
> 📡 Nuevos comandos y funciones

> ${config.BOT_NAME}`

    await sock.sendMessage(
        m.key.remoteJid,
        {
            text: texto,
            contextInfo: {
                externalAdReply: {
                    title: '📢 CANAL OFICIAL DE TIBU',
                    body: 'Únete y mantente informado',
                    thumbnailUrl: 'https://i.imgur.com/4M34hi2.jpeg',
                    sourceUrl: canal,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        },
        { quoted: m }
    )

}

handler.command = ['canal']
handler.help = ['canal']
handler.tags = ['informacion']
handler.menu = true

export default handler