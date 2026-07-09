import config from '../config.js'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const numero = String(config.owner[0]).replace(/[^0-9]/g, '')

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:OWNER ${config.BOT_NAME}
ORG:${config.BOT_NAME};
TEL;type=CELL;type=VOICE;waid=${numero}:${numero}
END:VCARD`

    const fotoOwner = 'https://i.imgur.com/JP2jKzD.jpeg' // cambia por tu foto

    await sock.sendMessage(from, {
        image: {
            url: fotoOwner
        },
        caption:
`╭━━━〔 👑 OWNER OFICIAL 〕━━⬣
┃
┃ 🤖 Bot: ${config.BOT_NAME}
┃ 👑 Owner: @${numero}
┃ 📞 Número: ${numero}
┃
┃ 💬 Pulsa la tarjeta
┃ para guardar contacto
┃
╰━━━━━━━━━━━━━━━━⬣`,
        mentions: [`${numero}@s.whatsapp.net`],

        contacts: {
            displayName: 'OWNER',
            contacts: [{
                vcard
            }]
        },

        contextInfo: {
            externalAdReply: {
                title: '👑 CONTACTAR OWNER',
                body: 'Toca aquí para abrir el chat',
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnailUrl: fotoOwner,
                sourceUrl: `https://wa.me/${numero}`,
                showAdAttribution: false
            }
        }
    }, {
        quoted: m
    })
}

handler.command = ['owner', 'creador']
handler.help = ['owner']
handler.tags = ['informacion']
handler.menu = true

export default handler