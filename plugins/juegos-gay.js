import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    let usuario =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!usuario && m.quoted) {
        usuario =
            m.quoted.key?.participant ||
            m.quoted.participant
    }

    if (!usuario && args[0]) {
        const numero = args[0].replace(/[^0-9]/g, '')

        if (numero) {
            usuario = `${numero}@s.whatsapp.net`
        }
    }

    if (!usuario) {
        await sock.sendMessage(from, {
            react: {
                text: '🏳️‍🌈',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text:
`🏳️‍🌈 𝐆𝐀𝐘𝐌𝐄𝐓𝐑𝐎 𝟑𝟎𝟎𝟎

👤 Menciona a alguien para analizarlo.

Ejemplo:
.gay @usuario`
            },
            { quoted: m }
        )
    }

    const porcentaje = Math.floor(Math.random() * 101)

    let diagnostico

    if (porcentaje <= 10) {
        diagnostico =
`🗿 Resultado tranquilo.
💪 El gayómetro apenas detectó señales.`
    } else if (porcentaje <= 30) {
        diagnostico =
`😏 Hay pequeñas sospechas...
🔎 La investigación continúa.`
    } else if (porcentaje <= 50) {
        diagnostico =
`👀 Resultado sospechoso.
📊 El laboratorio no sabe qué pensar.`
    } else if (porcentaje <= 70) {
        diagnostico =
`🌈 El gayómetro está subiendo.
💅 Se detectaron varias señales.`
    } else if (porcentaje <= 90) {
        diagnostico =
`🚨 ¡ALERTA MÁXIMA!

💅 El gayómetro está echando humo.
🌈 Demasiado arcoíris detectado.`
    } else {
        diagnostico =
`🌈💀 RESULTADO CRÍTICO

🔥 ¡EL GAYÓMETRO EXPLOTÓ!
💅 Ni el laboratorio puede explicar esto.
🚨 Se recomienda apagar el dispositivo.`
    }

    const nombre = usuario.split('@')[0]

    await sock.sendMessage(from, {
        react: {
            text: '🌈',
            key: m.key
        }
    })

    const texto =
`╭━━━━━━━━━━━━━━━━━━╮
   🏳️‍🌈 𝐆𝐀𝐘𝐌𝐄𝐓𝐑𝐎 𝟑𝟎𝟎𝟎
╰━━━━━━━━━━━━━━━━━━╯

👤 Analizado: @${nombre}

🌈 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐀𝐉𝐄:
        ${porcentaje}%

${diagnostico}

━━━━━━━━━━━━━━━━━━
🧪 Análisis 100% científico*
━━━━━━━━━━━━━━━━━━

*Bueno... probablemente no.

🦈 ${config.BOT_NAME} | Laboratorio Marino`

    await sock.sendMessage(
        from,
        {
            text: texto,
            mentions: [usuario]
        },
        { quoted: m }
    )
}

handler.command = ['gay', 'gayometro']
handler.help = ['gay @usuario']
handler.tags = ['juegos']
handler.menu = true

export default handler