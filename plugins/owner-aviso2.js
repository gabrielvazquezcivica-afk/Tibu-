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

o respondiendo un mensaje:

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

        let grupoId

        try {

            grupoId =
                await sock.groupAcceptInvite(
                    codigo
                )

        } catch {

            const grupos =
                await sock.groupFetchAllParticipating()

            grupoId =
                Object.keys(grupos).find(
                    id =>
                        grupos[id].inviteCode === codigo
                )
        }

        if (!grupoId) {
            throw new Error(
                'No pude entrar al grupo'
            )
        }

        const metadata =
            await sock.groupMetadata(
                grupoId
            )

        const mentions =
            metadata.participants.map(
                p => p.id
            )

        let aviso =
            args.slice(1).join(' ').trim()

        if (!aviso) {

            aviso =
                m.message?.extendedTextMessage
                    ?.contextInfo
                    ?.quotedMessage
                    ?.conversation ||

                m.message?.extendedTextMessage
                    ?.contextInfo
                    ?.quotedMessage
                    ?.extendedTextMessage
                    ?.text ||

                ''
        }

        if (!aviso) {
            aviso =
                '📢 Atención a todos.'
        }

        await sock.sendMessage(
            grupoId,
            {
                text:
`📢 *AVISO GENERAL*

${aviso}`,
                mentions
            }
        )

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
`✅ Aviso enviado a:

${metadata.subject}

👥 Participantes: ${mentions.length}`
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
handler.help = ['aviso2 <link> mensaje']
handler.tags = ['owner']
handler.menu = true

export default handler