import fs from 'fs'
import path from 'path'

const ruta = path.join(process.cwd(), 'database', 'afk.json')

function leerDB() {
    try {
        if (!fs.existsSync(ruta)) {
            fs.mkdirSync(path.dirname(ruta), { recursive: true })
            fs.writeFileSync(ruta, '{}')
        }

        return JSON.parse(fs.readFileSync(ruta, 'utf8'))
    } catch {
        return {}
    }
}

function guardarDB(db) {
    fs.mkdirSync(path.dirname(ruta), { recursive: true })
    fs.writeFileSync(ruta, JSON.stringify(db, null, 2))
}

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

function tiempoTranscurrido(timestamp) {
    const segundos = Math.max(
        0,
        Math.floor((Date.now() - timestamp) / 1000)
    )

    const dias = Math.floor(segundos / 86400)
    const horas = Math.floor((segundos % 86400) / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const seg = segundos % 60

    const partes = []

    if (dias) {
        partes.push(`${dias} día${dias !== 1 ? 's' : ''}`)
    }

    if (horas) {
        partes.push(`${horas} hora${horas !== 1 ? 's' : ''}`)
    }

    if (minutos) {
        partes.push(`${minutos} minuto${minutos !== 1 ? 's' : ''}`)
    }

    if (!partes.length) {
        partes.push(`${seg} segundo${seg !== 1 ? 's' : ''}`)
    }

    return partes.join(', ')
}

function obtenerMencionados(m) {
    const mensajes = [
        m.message?.extendedTextMessage,
        m.message?.imageMessage,
        m.message?.videoMessage,
        m.message?.documentMessage,
        m.message?.buttonsResponseMessage,
        m.message?.listResponseMessage
    ]

    for (const mensaje of mensajes) {
        if (mensaje?.contextInfo?.mentionedJid?.length) {
            return mensaje.contextInfo.mentionedJid.map(limpiarJid)
        }
    }

    return []
}

export async function afkWatcher(sock, m) {
    try {
        const from = m.key.remoteJid

        if (!from?.endsWith('@g.us')) {
            return false
        }

        if (m.key.fromMe) {
            return false
        }

        /*
         * Las reacciones NO cuentan como mensaje.
         */
        if (m.message?.reactionMessage) {
            return false
        }

        const sender = limpiarJid(
            m.key.participant || m.key.remoteJid
        )

        const db = leerDB()
        const grupo = db[from] || {}

        /*
         * ==========================================
         * USUARIO AFK QUE REGRESA
         * ==========================================
         */

        if (grupo[sender]) {
            const datos = grupo[sender]

            const tiempo = tiempoTranscurrido(
                datos.timestamp
            )

            delete grupo[sender]

            db[from] = grupo

            guardarDB(db)

            await sock.sendMessage(
                from,
                {
                    text:
`> 👋 *@${sender.split('@')[0]} ha vuelto*

> Estuvo en AFK durante *${tiempo}*.

> Motivo anterior:
> ${datos.razon}`,
                    mentions: [sender]
                },
                { quoted: m }
            )

            return false
        }

        /*
         * ==========================================
         * REVISAR MENCIONES
         * ==========================================
         */

        const mencionados = obtenerMencionados(m)

        if (!mencionados.length) {
            return false
        }

        let respondio = false

        for (const jid of mencionados) {
            const usuario = grupo[jid]

            if (!usuario) {
                continue
            }

            respondio = true

            const tiempo = tiempoTranscurrido(
                usuario.timestamp
            )

            await sock.sendMessage(
                from,
                {
                    text:
`> 💤 *@${jid.split('@')[0]} está en AFK*

> Motivo:
> ${usuario.razon}

> ⏱️ Lleva en AFK: *${tiempo}*`,
                    mentions: [jid]
                },
                { quoted: m }
            )
        }

        return respondio

    } catch (e) {
        console.log('AFK WATCHER ERROR:', e)
        return false
    }
}

export default afkWatcher