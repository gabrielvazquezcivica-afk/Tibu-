import fetch from 'node-fetch'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Solo funciona en grupos`'
        }, { quoted: m })
    }

    const metadata = await sock.groupMetadata(from)
    const participantes = metadata.participants || []

    const sender = m.key.participant || m.key.remoteJid

    const adminInfo = participantes.find(
        p => (p.id || p.jid) === sender
    )

    const isAdmin =
        adminInfo?.admin === 'admin' ||
        adminInfo?.admin === 'superadmin'

    if (!isAdmin) {
        return sock.sendMessage(from, {
            text: '`🚫 Solo capitanes pueden usarlo`'
        }, { quoted: m })
    }

    const texto = args.join(' ') || '📢 Llamado general para toda la tripulación'

    const banderas = {
        '52': '🇲🇽',
        '57': '🇨🇴',
        '54': '🇦🇷',
        '51': '🇵🇪',
        '56': '🇨🇱',
        '58': '🇻🇪',
        '55': '🇧🇷',
        '34': '🇪🇸',
        '1': '🇺🇸'
    }

    function obtenerBandera(id) {
        const num = id.split('@')[0]

        for (const prefijo of Object.keys(banderas).sort((a, b) => b.length - a.length)) {
            if (num.startsWith(prefijo)) {
                return `${banderas[prefijo]} +${prefijo}`
            }
        }

        return '🌎 Desconocido'
    }

    let mensaje =
`╭━━━〔 🌊 TIBU PAÍSES 🌊 〕━━⬣
┃
┃ 🦈 Grupo: ${metadata.subject}
┃ 👥 Miembros: ${participantes.length}
┃
┃ 📢 Mensaje:
┃ ${texto}
┃
┣━━━━━━━━━━━━━━⬣
┃ 🌎 Lista de países
┃`

    for (const user of participantes) {
        const info = obtenerBandera(user.id || user.jid)

        mensaje += `\n┃ ${info} @${(user.id || user.jid).split('@')[0]}`
    }

    mensaje += `

╰━━━━━━━━━━━━━━⬣

> ${config.BOT_NAME}`

    const fkontak = {
        key: {
            participants: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'TIBU'
        },
        message: {
            contactMessage: {
                displayName: config.BOT_NAME,
                vcard:
`BEGIN:VCARD
VERSION:3.0
FN:${config.BOT_NAME}
ORG:Tibu System;
TEL;type=CELL:+000000000
END:VCARD`
            }
        }
    }

    await sock.sendMessage(from, {
        image: {
            url: 'https://i.imgur.com/JP2jKzD.jpeg'
        },
        caption: mensaje,
        mentions: participantes.map(p => p.id || p.jid)
    }, {
        quoted: fkontak
    })
}

handler.command = ['paises', 'pais', 'banderas']
handler.help = ['paises <mensaje>']
handler.tags = ['grupo']
handler.menu = true

export default handler