import fs from 'fs'
import path from 'path'
import config from '../config.js'

function limpiarNumero(num = '') {
    return String(num).replace(/[^0-9]/g, '')
}

const rutaAdvertencias = path.join(process.cwd(), 'database', 'advertencias.json')

function leerAdvertencias() {
    try {
        return JSON.parse(fs.readFileSync(rutaAdvertencias, 'utf8'))
    } catch {
        return {}
    }
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, { text: '`🌊 Solo funciona en grupos`' }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return sock.sendMessage(from, { text: '`❌ No pude leer el grupo`' }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const userInfo = participantes.find(p => p.id === sender || p.jid === sender)
    const isAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo administradores pueden ver la lista`' }, { quoted: m })
    }

    const datos = leerAdvertencias()
    const grupo = datos[from] || {}

    const usuariosConWarn = Object.keys(grupo)
        .map(usuario => ({
            id: usuario,
            numero: limpiarNumero(usuario),
            cantidad: grupo[usuario]
        }))
        .sort((a, b) => b.cantidad - a.cantidad) // Ordenar de más a menos

    if (usuariosConWarn.length === 0) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`✅ NO HAY ADVERTENCIAS REGISTRADAS`\n\nNingún miembro tiene advertencias.',
            quoted: m
        })
    }

    const listaTexto = usuariosConWarn.map(u => `• @${u.numero} : ${u.cantidad}/3`).join('\n')

    await sock.sendMessage(from, { react: { text: '📋', key: m.key } })
    await sock.sendMessage(from, {
        text: `📋 ` + '`LISTA DE ADVERTENCIAS`' + `\n\n${listaTexto}\n\n> ${config.BOT_NAME}`,
        mentions: usuariosConWarn.map(u => u.id)
    }, { quoted: m })
}

handler.command = ['warnlist']
handler.help = ['warnlist']
handler.tags = ['grupo']
handler.menu = true

export default handler
