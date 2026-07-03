import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'setwelcome.json')

function leer() {
    try {
        return JSON.parse(fs.readFileSync(ruta))
    } catch {
        return {}
    }
}

function guardar(data) {
    fs.mkdirSync(path.dirname(ruta), { recursive: true })
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const text = args.join(' ')

    if (!text) {
        return sock.sendMessage(from, {
            text:
`Usa:

.setbye texto

Variables:
@user
@group
@members`
        }, { quoted: m })
    }

    const db = leer()
    db[from] = text
    guardar(db)

    sock.sendMessage(from, {
        text:
`🌊 Bye configurado`
    }, { quoted: m })
}

handler.command = ['setbye']
handler.help = ['setbye <texto>']
handler.tags = ['grupo']

export default handler