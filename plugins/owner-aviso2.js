import config from '../config.js'

function limpiar(n) {
    return (n || '').replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const remitente =
        m.key.participant ||
        m.key.remoteJid

    const remNum = limpiar(remitente)

    const esDueno =
        config.owner.some(
            n => limpiar(n) === remNum
        ) ||
        config.ownerLid.some(
            l => limpiar(l) === remNum
        )

    if (!esDueno) {

        await sock.sendMessage(from, {
            react: {
                text: '🦈',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text:
                    '`🚫 Solo el owner principal puede usar este comando`'
            },
            {
                quoted: m
            }
        )
    }

    const link = args[0]

    if (
        !link ||
        !link.includes('chat.whatsapp.com/')
    ) {

        return sock.sendMessage(
            from,
            {
                text:
`📢 AVISO2

Uso:

.aviso2 <link> mensaje

O responde una imagen/video/documento:

.aviso2 <link>`
            },
            {
                quoted: m
            }
        )
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '📢',
                key: m.key
            }
        })

        const codigo =
            link.split('/').pop()

        const info =
            await sock.groupGetInviteInfo(
                codigo
            )

        const grupoId = info.id

        const metadata =
            await sock.groupMetadata(
                grupoId
            )

        const participantes =
            metadata.participants || []

        const mentions =
            participantes.map(
                p => p.id
            )

        const mensaje =
            args.slice(1).join(' ').trim()

        const quoted =
            m.message?.extendedTextMessage
                ?.contextInfo?.quotedMessage

        const stanzaId =
            m.message?.extendedTextMessage
                ?.contextInfo?.stanzaId

        const participant =
            m.message?.extendedTextMessage
                ?.contextInfo?.participant

        // TEXTO

        if (mensaje) {

            await sock.sendMessage(
                grupoId,
                {
                    text:
`📢 AVISO GENERAL

${mensaje}`,
                    mentions
                }
            )
        }

        // REENVIAR MENSAJE RESPONDIDO

        if (quoted) {

            const fakeMsg = {
                key: {
                    remoteJid: grupoId,
                    fromMe: false,
                    id: stanzaId,
                    participant
                },
                message: quoted
            }

            await sock.copyNForward(
                grupoId,
                fakeMsg,
                true
            )
        }

        // SI NO HAY TEXTO NI RESPUESTA

        if (!mensaje && !quoted) {

            await sock.sendMessage(
                grupoId,
                {
                    text:
`📢 AVISO GENERAL

Atención todos.`,
                    mentions
                }
            )
        }

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
`📢 Aviso enviado

👥 Grupo:
${metadata.subject}

👤 Miembros:
${participantes.length}`
            },
            {
                quoted: m
            }
        )

    } catch (e) {

        console.log(
            'AVISO2 ERROR:',
            e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
`❌ Error

${e.message}`
            },
            {
                quoted: m
            }
        )
    }
}

handler.command = ['aviso2']
handler.help = ['aviso2 <link>']
handler.tags = ['owner']
handler.menu = true

export default handler