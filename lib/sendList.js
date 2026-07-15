import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

export async function sendList(
    sock,
    jid,
    title,
    text,
    buttonText,
    sections
) {

    const msg = generateWAMessageFromContent(
        jid,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {},
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text
                        },

                        footer: {
                            text: title
                        },

                        header: {
                            hasMediaAttachment: false
                        },

                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: buttonText,
                                        sections
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
        msg.message,
        {
            messageId: msg.key.id
        }
    )
}