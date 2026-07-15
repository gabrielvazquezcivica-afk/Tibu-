import {
    proto,
    generateWAMessageFromContent
} from '@whiskeysockets/baileys'

let handler = {}

handler.run = async (sock, m) => {

    const msg = generateWAMessageFromContent(
        m.key.remoteJid,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {},
                    interactiveMessage:
                    proto.Message.InteractiveMessage.create({

                        body: {
                            text: '🧪 Prueba de botones Tibu'
                        },

                        footer: {
                            text: 'Tibu Bot'
                        },

                        header: {
                            title: 'Botones',
                            hasMediaAttachment: false
                        },

                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📋 MENU',
                                        id: '.menu'
                                    })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '🎵 PLAYLIST',
                                        id: '.playlist mc davo'
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
        m.key.remoteJid,
        msg.message,
        { messageId: msg.key.id }
    )
}

handler.command = ['t']
handler.help = ['t']
handler.menub= false
export default handler