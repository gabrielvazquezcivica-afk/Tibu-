import {
    proto,
    generateWAMessageFromContent
} from '@whiskeysockets/baileys'

console.log(
    proto
        ? 'PROTO OK'
        : 'PROTO FAIL'
)

console.log(
    generateWAMessageFromContent
        ? 'GEN OK'
        : 'GEN FAIL'
)

export async function sendList(
    sock,
    jid,
    title,
    description,
    buttonText,
    sections
) {

    try {

        console.log('SENDLIST INICIO')

        const msg =
            generateWAMessageFromContent(
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

    header: {
        title: '',
        subtitle: '',
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

        console.log('SENDLIST MSG CREADO')

        await sock.relayMessage(
            jid,
            msg.message,
            {
                messageId: msg.key.id
            }
        )

        console.log('SENDLIST ENVIADO')

    } catch (e) {

        console.log(
            'SENDLIST ERROR:',
            e
        )

        throw e
    }
}