let handler = {}

handler.run = async (sock, m) => {
    await sock.sendMessage(
        m.key.remoteJid,
        { text: 'FUNCIONA' },
        { quoted: m }
    )
}

handler.command = ['ping2']
handler.help = ['ping2']
handler.tags = ['informacion']
handler.menu = true

export default handler