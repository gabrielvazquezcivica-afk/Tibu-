import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = {}

handler.run = async (sock, m) => {

const msg = generateWAMessageFromContent(
m.key.remoteJid,
{
viewOnceMessage: {
message: {
interactiveMessage: proto.Message.InteractiveMessage.create({
body: {
text: '🧪 Prueba Interactive'
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
m.key.remoteJid,
msg.message,
{ messageId: msg.key.id }
)

}

handler.command = ['t']
export default handler