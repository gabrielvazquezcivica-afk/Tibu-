let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const remitente = m.key.participant || m.key.remoteJid

    const mencionados =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    let usuario = null

    if (mencionados.length >= 1) {
        usuario = mencionados[0]
    } else if (
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ) {
        usuario =
            m.message.extendedTextMessage.contextInfo.participant
    }

    if (!usuario) {
        return sock.sendMessage(from, {
            text: '`💞 Menciona o responde a alguien.`'
        }, { quoted: m })
    }

    if (usuario === remitente) {
        return sock.sendMessage(from, {
            text: '`🤨 No puedes usar este comando contigo mismo.`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '😏',
            key: m.key
        }
    })

    const porcentaje = Math.floor(Math.random() * 41) + 60

    const name1 = remitente.split('@')[0]
    const name2 = usuario.split('@')[0]

    const texto =
`🤤👅🥵 *ACABAS DE FOLLAR* 🥵👅🤤

@${name1} SE ACABA DE FOLLAR A LA PERRA DE @${name2} AH 4 PATAS MIENTRAS GEMIA COMO UNA MALDITA PERRA (Aaah...Aaah, no pares, sigue, sigue) Y LA HAS DEJADO TAN REVENTADA QUE NO PUEDE NI SOSTENER SU PROPIO CUERPO LA MALDITA PERRA 😳🔥

🤤 @${name2} YA TE HAN FOLLADO 🥵`

    await sock.sendMessage(from, {
        text: texto,
        mentions: [remitente, usuario]
    }, { quoted: m })
}

handler.command = ['follar']
handler.help = ['follar @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler