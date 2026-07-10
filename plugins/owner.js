import config from '../config.js'
import fetch from 'node-fetch'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    const numero = String(config.owner[0])
        .replace(/[^0-9]/g, '')

    const ownerJid = `${numero}@s.whatsapp.net`

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:OWNER ${config.BOT_NAME}
ORG:${config.BOT_NAME};
TEL;type=CELL;type=VOICE;waid=${numero}:${numero}
END:VCARD`

    let thumbnail = null

    try {
        const fotoBot = await sock.profilePictureUrl(
            sock.user.id,
            'image'
        )

        const res = await fetch(fotoBot)
        thumbnail = Buffer.from(
            await res.arrayBuffer()
        )
    } catch {}

    // 📞 Contacto
    await sock.sendMessage(from, {
        contacts: {
            displayName: 'OWNER',
            contacts: [
                {
                    vcard
                }
            ]
        }
    }, { quoted: m })

    // 👑 Mensaje principal
    await sock.sendMessage(from, {
        text:
`╔══════════════════════╗
║      👑 OWNER 👑
╠══════════════════════╣
║ 🤖 Bot:
║ ${config.BOT_NAME}
║
║ 👤 Owner:
║ @${numero}
║
║ 📞 Número:
║ ${numero}
║
║ 💬 Pulsa la tarjeta
║ para guardar contacto
╚══════════════════════╝`,
        mentions: [ownerJid],

        contextInfo: {
            externalAdReply: {
                title: '👑 CONTACTAR OWNER',
                body: config.BOT_NAME,
                sourceUrl: `https://wa.me/${numero}`,
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: false,
                thumbnail
            }
        }
    }, { quoted: m })
}

handler.command = ['owner', 'creador']
handler.help = ['owner']
handler.tags = ['informacion']
handler.menu = true

export default handler