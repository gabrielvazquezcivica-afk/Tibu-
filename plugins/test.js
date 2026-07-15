import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = {}

handler.run = async (sock, m) => {

    const jid = m.key.remoteJid

    const message = generateWAMessageFromContent(
        jid,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text: '🔥 Botón de prueba'
                        },
                        footer: {
                            text: 'Tibu Bot'
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'MENU',
                                        id: '.menu'
                                    })
                                }
                            ]
                        }
                    })
                }
            }
        },
        {}
    )

    await sock.relayMessage(
        jid,
        message.message,
        {
            messageId: message.key.id
        }
    )
}

handler.command = ['test']
handler.help = ['test']
handler.tags = ['informacion']
handler.menu = true

export default handler