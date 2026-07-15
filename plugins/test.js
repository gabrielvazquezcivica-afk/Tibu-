let handler = {}

handler.run = async (sock, m) => {

    await sock.sendMessage(m.key.remoteJid, {
        text: 'Prueba de botones',
        buttons: [
            {
                buttonId: '.menu',
                buttonText: { displayText: 'MENU' },
                type: 1
            }
        ],
        headerType: 1
    }, { quoted: m })
}

handler.command = ['testbtn']

export default handler