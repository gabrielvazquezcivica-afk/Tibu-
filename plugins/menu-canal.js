import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    await sock.sendMessage(from, {
        newsletterAdminInviteMessage: {
            newsletterJid: '120363420000000000@newsletter',
            newsletterName: 'Canal Oficial Tibu',
            jpegThumbnail: Buffer.alloc(0),
            caption:
`📢 \`CANAL OFICIAL\`

> Únete al canal oficial
> Recibe novedades y actualizaciones

> ${config.BOT_NAME}`
        }
    }, { quoted: m })

}

handler.command = ['canal']
handler.help = ['canal']
handler.tags = ['informacion']
handler.menu = true

export default handler