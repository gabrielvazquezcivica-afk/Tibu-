import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const numero = config.owner[0]
        .replace(/[^0-9]/g, '')

    const vcard =
`BEGIN:VCARD
VERSION:3.0
FN:OWNER ${config.BOT_NAME}
TEL;type=CELL;type=VOICE;waid=${numero}:${numero}
END:VCARD`

    await sock.sendMessage(from, {
        contacts: {
            displayName: 'OWNER',
            contacts: [{
                vcard
            }]
        }
    }, { quoted: m })

    await sock.sendMessage(from, {
        text:
`👑 *OWNER OFICIAL*

📞 Contacto enviado correctamente.

> ${config.BOT_NAME}`,
        contextInfo: {
            externalAdReply: {
                title: '👑 OWNER OFICIAL',
                body: `${config.BOT_NAME}`,
                sourceUrl: `https://wa.me/${numero}`,
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: false
            }
        }
    }, { quoted: m })
}

handler.command = ['owner', 'creador']
handler.help = ['owner']
handler.tags = ['informacion']
handler.menu = true

export default handler