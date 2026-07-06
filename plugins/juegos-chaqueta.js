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
            text: '`😂 Menciona o responde a alguien.`'
        }, { quoted: m })
    }

    if (usuario === remitente) {
        return sock.sendMessage(from, {
            text: '`🤨 Hazlo con alguien más.`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '😂',
            key: m.key
        }
    })

    const name1 = remitente.split('@')[0]
    const name2 = usuario.split('@')[0]

    const frames = [
'_Iniciando chaqueta..._',

`╭━━╮╭╭╭╮
┃▔╲┣╈╈╈╈━━━╮
┃┈┈▏.╰╯╯╯╭╮━┫
┃┈--.╭━━━━╈╈━╯
╰━━╯-.                ╰╯`,

`╭━━╮.    ╭╭╭╮
┃▔╲┣━━╈╈╈╈━━╮
┃┈┈▏.    .╰╯╯╯╭╮┫
┃┈--.╭━━━━━━╈╈╯
╰━━╯-.           . ╰╯`,

`              .               .   ╭
╭━━╮╭╭╭╮.           ╭ ╯
┃▔╲┣╈╈╈╈━━━╮╭╯╭
┃┈┈▏.╰╯╯╯╭╮━┫
┃┈--.╭━━━━╈╈━╯╰╮╰
╰━━╯-.        ╰╯...-    ╰ ╮
   .         . .  .  .. . . .  . .. .  ╰

*[ 🔥 ] @${name1} SE HA CORRIDO GRACIAS A @${name2}.*`
    ]

    const msg = await sock.sendMessage(from, {
        text: frames[0]
    }, { quoted: m })

    for (let i = 1; i < frames.length; i++) {
        await new Promise(r => setTimeout(r, 900))

        await sock.sendMessage(from, {
            text: frames[i],
            edit: msg.key,
            mentions: [remitente, usuario]
        })
    }
}

handler.command = ['chaqueta']
handler.help = ['chaqueta @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler