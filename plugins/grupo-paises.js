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

    const texto =
        args.join(' ') ||
        '📢 Llamado general para toda la tripulación'

    const banderas = {
        '52': '🇲🇽',
        '57': '🇨🇴',
        '54': '🇦🇷',
        '51': '🇵🇪',
        '56': '🇨🇱',
        '58': '🇻🇪',
        '55': '🇧🇷',
        '34': '🇪🇸',
        '1': '🇺🇸',
        '502': '🇬🇹',
        '503': '🇸🇻',
        '504': '🇭🇳',
        '505': '🇳🇮',
        '506': '🇨🇷',
        '507': '🇵🇦',
        '593': '🇪🇨',
        '595': '🇵🇾',
        '598': '🇺🇾',
        '591': '🇧🇴'
    }

    function obtenerBandera(id) {
        const num = id.split('@')[0]

        for (const prefijo of Object.keys(banderas)
            .sort((a, b) => b.length - a.length)) {

            if (num.startsWith(prefijo)) {
                return `${banderas[prefijo]} +${prefijo}`
            }
        }

        return '🌎'
    }

    let mensaje =
`╭━━━〔 🌊 LISTA DE PAÍSES 🌊 〕━━⬣
┃
┃ 🦈 Grupo: ${metadata.subject}
┃ 👥 Miembros: ${participantes.length}
┃
┃ 📢 Mensaje:
┃ ${texto}
┃
┣━━━━━━━━━━━━━━━━━━⬣
┃ 🌎 Tripulación
┃`

    for (const user of participantes) {
        const jid = user.id || user.jid
        const info = obtenerBandera(jid)

        mensaje += `\n┃ ${info} @${jid.split('@')[0]}`
    }

    mensaje += `

╰━━━━━━━━━━━━━━━━━━⬣

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
        text: mensaje,
        mentions: participantes.map(
            p => p.id || p.jid
        )
    }, {
        quoted: fkontak
    })
}

handler.command = ['pais', 'paises', 'banderas']
handler.help = ['pais <mensaje>']
handler.tags = ['grupo']
handler.group = true
handler.menu = true

export default handler