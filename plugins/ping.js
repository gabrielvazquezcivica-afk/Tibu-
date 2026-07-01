import config from '../config.js'

const handler = async ({ sock, m, from }) => {
    const start = Date.now()

    // ⚡ Reacción inicial
    await sock.sendMessage(from, {
        react: { text: '⚡', key: m.key }
    })

    const speed = Date.now() - start

    // 🚀 Respuesta con diseño y nombre del bot
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

// ⚙️ Configuración del comando
handler.command = ['p', 'ping']
handler.help = ['p']
handler.tags = ['informacion']
handler.menu = true

export default handler
