import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const start = Date.now()
    const from = m.key.remoteJid

    // ⚡ Reacción inicial
    await sock.sendMessage(from, {
        react: { text: '⚡', key: m.key }
    })

    const speed = Date.now() - start

    // 🚀 Respuesta con diseño
    await sock.sendMessage(from, {
        text: `╭━━━━━━━━━━━━━┓
┃  ⚡ *P O N G*  ⚡
┣━━━━━━━━━━━━━┫
┃ 📶 Velocidad: *${speed} ms*
┃ 🚀 Estado: ${speed < 200 ? '✅ RÁPIDO' : speed < 500 ? '⚖️ NORMAL' : '⚠️ LENTO'}
╰━━━━━━━━━━━━━┛

> ${config.BOT_NAME}`
    }, { quoted: m })
}

// ⚙️ Configuración
handler.command = ['p', 'ping', 'velocidad']
handler.help = ['p']
handler.tags = ['informacion']
handler.menu = true

export default handler
