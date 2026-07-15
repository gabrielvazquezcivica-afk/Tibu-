import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerOwners() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

function guardarOwners(lista) {
    fs.mkdirSync(path.dirname(rutaOwners), { recursive: true })
    fs.writeFileSync(rutaOwners, JSON.stringify(lista, null, 4), 'utf8')
}

function limpiar(n) {
    return (n || '').replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = m.key.participant || m.key.remoteJid
    const remNum = limpiar(remitente)

    const esDueno =
        config.owner.some(n => limpiar(n) === remNum) ||
        config.ownerLid.some(l => limpiar(l) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, {
            react: { text: '🦈', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`🚫 Solo el owner principal puede agregar`' },
            { quoted: m }
        )
    }

    let usuarioJid, numero, nombre

    const isReply =
        !!m.quoted ||
        !!m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    // RESPUESTA
    if (isReply) {
        usuarioJid =
            m.quoted?.key?.participant ||
            m.quoted?.participant ||
            m.message?.extendedTextMessage?.contextInfo?.participant

        numero = limpiar(usuarioJid)
        nombre =
            args.join(' ').trim() ||
            m.quoted?.pushName ||
            `Capitán ${numero}`
    }

    // MENCIÓN
    else if (
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0
    ) {
        usuarioJid =
            m.message.extendedTextMessage.contextInfo.mentionedJid[0]

        numero = limpiar(usuarioJid)
        nombre =
            args.slice(1).join(' ').trim() ||
            `Capitán ${numero}`
    }

    // NÚMERO MANUAL
    else if (args[0]) {
        numero = limpiar(args[0])
        usuarioJid = `${numero}@s.whatsapp.net`
        nombre =
            args.slice(1).join(' ').trim() ||
            `Capitán ${numero}`
    }

    else {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })

        return sock.sendMessage(
            from,
            {
                text: '`🌊 Responde, menciona o escribe el número`\nEj: .addowner @Nombre'
            },
            { quoted: m }
        )
    }

    const lista = leerOwners()
    const existe = lista.some(
        o =>
            limpiar(o.number) === numero ||
            limpiar(o.id) === numero
    )

    if (existe) {
        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`🚢 Ya está en la flota`' },
            { quoted: m }
        )
    }

    lista.push({
        number: numero,
        id: usuarioJid,
        name: nombre
    })

    guardarOwners(lista)

    await sock.sendMessage(from, {
        react: { text: '🏴‍☠️', key: m.key }
    })

    // Mensaje al que responderá el bot
    let quotedMsg = m

    if (isReply) {
        quotedMsg = {
            key: {
                remoteJid: from,
                id:
                    m.quoted?.key?.id ||
                    m.message?.extendedTextMessage?.contextInfo?.stanzaId,
                participant:
                    usuarioJid
            },
            message:
                m.quoted?.message ||
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        }
    }

    await sock.sendMessage(
        from,
        {
            text:
                `\`🌊 NUEVO CAPITÁN AGREGADO 🦈\`\n` +
                `Nombre: ${nombre}\n` +
                `Número: @${numero}\n\n` +
                `> ${config.BOT_NAME}`,
            mentions: [usuarioJid]
        },
        {
            quoted: quotedMsg
        }
    )
}

handler.command = ['addowner', 'nuevocapitan']
handler.help = ['addowner <@/número> [nombre]']
handler.tags = ['owner']
handler.menu = true

export default handler