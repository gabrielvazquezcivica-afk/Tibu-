import config from '../config.js'
import fs from 'fs'
import path from 'path'

const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerExtras() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

function normalizarId(id = '') {
    return String(id).replace(/:\d+@/, '@').trim()
}

function limpiarNumero(txt = '') {
    return String(txt).replace(/[^0-9]/g, '')
}

function esMismoUsuario(sender, participante) {
    const s = normalizarId(sender)

    const pid = normalizarId(participante?.id || '')
    const pjid = normalizarId(participante?.jid || '')

    return s === pid || s === pjid
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = limpiarNumero(sender)

    if (m.key.fromMe) return

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`🌊 Solo funciona en grupos`' },
            { quoted: m }
        )
    }

    // Owners fijos
    const owners = [
        ...config.owner.map(limpiarNumero).filter(Boolean),
        ...config.ownerLid.map(limpiarNumero).filter(Boolean)
    ]

    // Owners agregados
    const extras = leerExtras()
    for (const o of extras) {
        if (o?.number) owners.push(limpiarNumero(o.number))
        if (o?.id) owners.push(limpiarNumero(o.id))
    }

    if (!owners.includes(senderNum)) {
        await sock.sendMessage(from, {
            react: { text: '🦈', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`🚫 Solo capitanes pueden usarlo`' },
            { quoted: m }
        )
    }

    let participantes

    try {
        participantes = (await sock.groupMetadata(from)).participants || []
    } catch {
        await sock.sendMessage(from, {
            react: { text: '🪸', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`❌ No pude leer el grupo`' },
            { quoted: m }
        )
    }

    // Buscar BOT
    const botInfo = participantes.find(
        p =>
            esMismoUsuario(sock.user.id, p) ||
            esMismoUsuario(sock.user.lid, p)
    )

    const botEsAdmin =
        botInfo?.admin === 'admin' ||
        botInfo?.admin === 'superadmin'

    if (!botEsAdmin) {
        await sock.sendMessage(from, {
            react: { text: '⚠️', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`⚠️ No soy administrador aquí`' },
            { quoted: m }
        )
    }

    // Buscar USER
    const userInfo = participantes.find(
        p => esMismoUsuario(sender, p)
    )

    if (!userInfo) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`❌ No pude localizar tu usuario en el grupo`' },
            { quoted: m }
        )
    }

    const yaEsAdmin =
        userInfo.admin === 'admin' ||
        userInfo.admin === 'superadmin'

    if (yaEsAdmin) {
        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })
        return sock.sendMessage(
            from,
            { text: '`✅ Ya eres administrador`' },
            { quoted: m }
        )
    }

    const target = userInfo.jid || userInfo.id || sender

    await sock.sendMessage(from, {
        react: { text: '👑', key: m.key }
    })

    try {
        await sock.groupParticipantsUpdate(
            from,
            [target],
            'promote'
        )

        await sock.sendMessage(
            from,
            {
                text:
                    `\`🌊 CAPITÁN ASCENDIDO 🦈\`\n` +
                    `Ahora gobiernas estas aguas @${senderNum}\n\n` +
                    `> ${config.BOT_NAME}`,
                mentions: [target]
            },
            { quoted: m }
        )
    } catch (e) {
        console.log('❌ ERROR AUTOADMIN:', e)

        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        })

        return sock.sendMessage(
            from,
            { text: '`❌ No pude darte el rango`' },
            { quoted: m }
        )
    }
}

handler.command = ['autoadmin', 'micapitan']
handler.help = ['autoadmin']
handler.tags = ['owner', 'grupo']
handler.menu = true

export default handler