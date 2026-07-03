import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'setwelcome.json')

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    let db = {}

    try {
        db = JSON.parse(fs.readFileSync(ruta))
    } catch {}

    delete db[from]
    fs.writeFileSync(ruta, JSON.stringify(db, null, 2))

    sock.sendMessage(from, {
        text: '🌊 Welcome eliminado'
    }, { quoted: m })
}

handler.command = ['delwelcome']
handler.help = ['delwelcome']
handler.tags = ['grupo']

export default handler