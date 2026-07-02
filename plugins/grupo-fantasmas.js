import fs from 'fs'
import path from 'path'

function limpiarNumero(num = '') {
    return String(num).replace(/[^0-9]/g, '')
}

const rutaMsgCount = path.join(process.cwd(), 'database', 'msgcount.json')

function leerContadores() {
    try {
        return JSON.parse(fs.readFileSync(rutaMsgCount, 'utf8'))
    } catch {
        return {}
    }
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: { text: '🌊', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`🌊 Solo funciona en grupos`'
        }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return sock.sendMessage(from, {
            text: '`❌ No pude leer el grupo`'
        }, { quoted: m })
    }

    const participantes = metadata.participants || []

    // Verificación de Admin IGUAL a tu ejemplo
    const userInfo = participantes.find(
        p => p.id === sender || p.jid === sender
    )
    const isAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: { text: '🚫', key: m.key }
        })
        return sock.sendMessage(from, {
            text: '`🚫 Solo administradores pueden usar este comando`'
        }, { quoted: m })
    }

    const datos = leerContadores()
    const grupo = datos[from] || {}

    // Regla: menos de 10 mensajes o sin registro = fantasma
    const fantasmas = participantes
        .map(p => p.id)
        .filter(usuario => {
            const cuenta = grupo[usuario]
            return cuenta === undefined || cuenta < 10
        })

    if (fantasmas.length === 0) {
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
        return sock.sendMessage(from, {
            text: '`👻 SIN USUARIOS FANTASMAS`\n\nTodos tienen 10 o más mensajes registrados.',
            quoted: m
        })
    }

    await sock.sendMessage(from, { react: { text: '👻', key: m.key } })
    const lista = fantasmas.map(u => `• @${limpiarNumero(u)}`).join('\n')

    await sock.sendMessage(from, {
        text: `\`👻 USUARIOS FANTASMAS\`\n(Menos de 10 mensajes o sin actividad)\n\n${lista}`,
        mentions: fantasmas
    }, { quoted: m })
}

handler.command = ['fantasmas']
handler.help = ['fantasmas']
handler.tags = ['grupo']
handler.menu = true

export default handler
