import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const numero = String(config.owner[0])
        .replace(/[^0-9]/g, '')

    const vcard =
`BEGIN:VCARD
VERSION:3.0
FN:👑 Owner ${config.BOT_NAME}
TEL;type=CELL;type=VOICE;waid=${numero}:${numero}
END:VCARD`

    // Contacto
    await sock.sendMessage(from, {
        contacts: {
            displayName: '👑 Owner',
            contacts: [{ vcard }]
        }
    }, { quoted: m })

    // Mensaje con enlace
    await sock.sendMessage(from, {
        text:
`╭━━━〔 👑 OWNER 👑 〕━━━⬣
┃ 📞 Contacto enviado
┃
┃ 🔗 Chat directo:
┃ https://wa.me/${numero}
╰━━━━━━━━━━━━━━━━━━⬣

> ${config.BOT_NAME}`,
        contextInfo: {
            externalAdReply: {
                title: '👑 CONTACTAR OWNER',
                body: 'Abrir chat del owner',
                sourceUrl: `https://wa.me/${numero}`,
                mediaType: 1,
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