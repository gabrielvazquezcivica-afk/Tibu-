import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    let usuario = null

    const mentioned =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid

    if (mentioned?.length) {
        usuario = mentioned[0]
    }

    if (!usuario) {
        usuario =
            m.message?.extendedTextMessage?.contextInfo?.participant ||
            m.quoted?.key?.participant ||
            m.quoted?.participant ||
            null
    }

    if (!usuario) {
        await sock.sendMessage(from, {
            react: {
                text: '🏳️‍🌈',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text:
`🏳️‍🌈 𝐆𝐀𝐘𝐌𝐄𝐓𝐑𝐎 𝟑𝟎𝟎𝟎

👤 Menciona a alguien o responde a su mensaje.

Ejemplos:
.gay @usuario

O responde un mensaje con:
.gay`
        }, { quoted: m })
    }

    const porcentaje = Math.floor(Math.random() * 101)

    let diagnostico

    if (porcentaje <= 10) {
        diagnostico = '🗿 Casi nada. El gayómetro apenas reaccionó.'
    } else if (porcentaje <= 30) {
        diagnostico = '😏 Hay sospechas, pero todavía no hay pruebas.'
    } else if (porcentaje <= 50) {
        diagnostico = '👀 El resultado está bastante sospechoso.'
    } else if (porcentaje <= 70) {
        diagnostico = '🌈 El gayómetro empieza a calentarse.'
    } else if (porcentaje <= 90) {
        diagnostico = '🚨 ¡ALERTA! El gayómetro está echando humo.'
    } else {
        diagnostico = '🌈💀 ¡RESULTADO CRÍTICO! El gayómetro acaba de explotar.'
    }

    const numero = usuario.split('@')[0]

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

👤 Analizado: @${numero}

🌈 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐀𝐉𝐄:
        ${porcentaje}%

${diagnostico}

━━━━━━━━━━━━━━━━━━
🧪 Ciencia 100% dudosa
😂 No se aceptan reclamaciones

> ${config.BOT_NAME} | Laboratorio Marino`

    await sock.sendMessage(from, {
        text: texto,
        mentions: [usuario]
    }, { quoted: m })
}

handler.command = ['gay', 'gayometro']
handler.help = ['gay @usuario']
handler.tags = ['juegos']
handler.menu = true

export default handler