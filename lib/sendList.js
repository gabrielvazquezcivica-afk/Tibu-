import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'

export async function sendList(
    sock,
    jid,
    title,
    description,
    buttonText,
    sections
) {

    const msg = generateWAMessageFromContent(
        jid,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage:
                    proto.Message.InteractiveMessage.create({

                        body: {
                            text: description
                        },

                        footer: {
                            text: title
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