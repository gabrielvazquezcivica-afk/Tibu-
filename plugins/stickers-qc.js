import fetch from 'node-fetch'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    let text = args.join(' ')

    if (!text) {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

        text =
            quoted?.conversation ||
            quoted?.extendedTextMessage?.text ||
            quoted?.imageMessage?.caption ||
            quoted?.videoMessage?.caption ||
            ''
    }

    if (!text) {
        return sock.sendMessage(from, {
            text: '`✏️ Escribe un texto o responde a un mensaje.`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '🖌️',
            key: m.key
        }
    })

    try {
        const avatar = await sock.profilePictureUrl(
            m.key.participant || m.key.remoteJid,
            'image'
        ).catch(() => 'https://i.imgur.com/JP2jKzD.png')

        const body = {
            type: 'quote',
            format: 'webp',
            backgroundColor: '#1b1429',
            messages: [{
                avatar: true,
                from: {
                    id: 1,
                    name: m.pushName || 'Usuario',
                    photo: {
                        url: avatar
                    }
                },
                text
            }]
        }

        const res = await fetch('https://quotly.netorare.codes/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        const json = await res.json()

        if (!json.result?.image)
            throw new Error('Respuesta inválida')

        const sticker = Buffer.from(
            json.result.image,
            'base64'
        )

        await sock.sendMessage(from, {
            sticker
        }, {
            quoted: m
        })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {
        console.log(e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: '`❌ Error al generar el QC.`'
        }, {
            quoted: m
        })
    }
}

handler.command = ['qc']
handler.help = ['qc <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler