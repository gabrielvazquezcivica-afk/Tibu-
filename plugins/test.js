let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🧪',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
`🧪 *PRUEBA DE BOTONES*

Si ves un botón debajo de este mensaje, los botones funcionan correctamente.

Presiona el botón para ejecutar:
.menu`,

                buttons: [
                    {
                        buttonId: '.menu',
                        buttonText: {
                            displayText: '📋 MENU'
                        },
                        type: 1
                    }
                ],

                headerType: 1
            },
            { quoted: m }
        )

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'TESTBTN ERROR:',
            e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ Error al enviar botones

${e.message || e}`
        }, { quoted: m })
    }
}

handler.command = ['test']
handler.help = ['testbtn']
handler.tags = ['owner']
handler.menu = false

export default handler