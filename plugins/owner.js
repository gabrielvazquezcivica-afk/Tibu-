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
ORG:${config.BOT_NAME};
TEL;type=CELL;type=VOICE;waid=${numero}:${numero}
END:VCARD`

    await sock.sendMessage(from, {
        contacts: {
            displayName: `👑 Owner ${config.BOT_NAME}`,
            contacts: [{
                vcard
            }]
        },
        caption:
`╭━━━〔 👑 OWNER 👑 〕━━━⬣
┃
┃ 📞 Contacto enviado
┃ 💬 Toca la tarjeta para guardar
┃ 🔗 O abre el chat directo abajo
┃
╰━━━━━━━━━━━━━━━━━━⬣

https://wa.me/${numero}

> ${config.BOT_NAME}`,
        contextInfo: {
            externalAdReply: {
                title: '👑 CONTACTAR OWNER',
                body: 'Toca aquí para abrir el chat',
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