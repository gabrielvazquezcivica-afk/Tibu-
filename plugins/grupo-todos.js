import config from '../config.js'
import fs from 'fs'
import path from 'path'
const dbPath = path.join(process.cwd(), 'database', 'tag.json')
function leerDB() {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}, null, 2))
    return JSON.parse(fs.readFileSync(dbPath))
}
function obtenerTag(grupo) {
    const db = leerDB()
    return db[grupo] || '📢'
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
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, { text: '`❌ No pude leer el grupo`' }, { quoted: m })
    }

    const participantes = metadata.participants || []
    const userInfo = participantes.find(p => p.id === sender || p.jid === sender)
    const esAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'

    if (!esAdmin) {
        await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo administradores pueden usarlo`' }, { quoted: m })
    }

    await sock.sendMessage(from, { react: { text: '📢', key: m.key } })
    const etiqueta = obtenerTag(from)
    let texto = ''
    let mentions = []

    for (const p of participantes) {
        const jid = p.jid || p.id
        const numero = jid.split('@')[0]
        mentions.push(jid)
        texto += `${etiqueta} @${numero}\n`
    }

    const mensaje =
`╭──────────────
│ 🌊 𝐓𝐎𝐃𝐎𝐒 - 𝐅𝐋𝐎𝐓𝐀
│
│ ⚓ Grupo: ${metadata.subject}
│ 👥 Miembros: ${participantes.length}
├──────────────
${texto}╰──────────────

> Ningún tiburón navega solo.`

    await sock.sendMessage(from, { text: mensaje, mentions }, { quoted: m })
}

handler.command = ['todos', 'tagall']
handler.help = ['todos']
handler.tags = ['grupo']
handler.menu = true

export default handler
