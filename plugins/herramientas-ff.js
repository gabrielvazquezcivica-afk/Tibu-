
import axios from 'axios'

const API_KEY = process.env.LEMPI_API_KEY || 'PON_AQUI_TU_API_KEY'

let handler = {}

handler.run = async (sock, m, args = []) => {
    const from = m.key.remoteJid
    const uid = args[0]

    if (!uid) {
        return sock.sendMessage(from, {
            text: '`🔥 FREE FIRE CHECKER`\n\n> Escribe el UID del jugador.\n\n> Ejemplo: .ff 123456789'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🔎', key: m.key }
        })

        const response = await axios.get(
            'https://api.lempi.lat/stalk/freefire',
            {
                params: {
                    apikey: API_KEY,
                    uid
                },
                timeout: 30000
            }
        )

        const data = response.data

        if (!data || data.status !== true) {
            throw new Error('La API no encontró información para ese UID.')
        }

        const header = data.header || {}
        const info = data.info || {}
        const passes = data.passes || {}
        const currentPass = passes.current || {}

        const texto = [
            '`🔥 FREE FIRE — PERFIL`',
            '',
            `> 👤 *Nick:* ${data.nick || 'Desconocido'}`,
            `> 🆔 *UID:* ${data.uid || uid}`,
            `> 🎚️ *Nivel:* ${header.level ?? info.level ?? 'No disponible'}`,
            `> 🌎 *Región:* ${info.region ?? info.región ?? 'No disponible'}`,
            `> 🏆 *Rango:* ${info.rank ?? 'No disponible'}`,
            `> ❤️ *Likes:* ${info.likes ?? 'No disponible'}`,
            `> 🛡️ *Gremio:* ${data.guild?.name ?? 'Sin gremio o no disponible'}`,
            `> 🎫 *Pase actual:* ${currentPass.season || 'No disponible'}`,
            `> 📊 *Nivel del pase:* ${currentPass.level || 'No disponible'}`,
            '',
            `> 🔗 *Fuente:* ${data.fuente || 'No disponible'}`,
            '',
            '_Los datos dependen de la información pública que entregue la API._'
        ].join('\n')

        await sock.sendMessage(from, {
            text: texto
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

    } catch (error) {
        console.error(
            'ERROR FREE FIRE:',
            error.response?.status || error.message
        )

        const aviso = error.response?.status >= 500
            ? 'El servidor de la API está fallando. Inténtalo más tarde.'
            : error.response?.status === 401 ||
              error.response?.status === 403
                ? 'La API rechazó la clave o el acceso.'
                : 'No se pudo consultar el UID. Revisa el número e inténtalo de nuevo.'

        await sock.sendMessage(from, {
            text: `\`❌ FREE FIRE\`\n\n> ${aviso}`
        }, { quoted: m })
    }
}

handler.command = ['ff', 'freefire']
handler.help = ['ff <UID>']
handler.tags = ['juegos']
handler.menu = true

export default handler
