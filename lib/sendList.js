import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

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
            listMessage: {
                title,
                description: text,
                buttonText,
                footerText: 'Tibu Bot',
                listType: 1,
                sections
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