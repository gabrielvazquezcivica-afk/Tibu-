import { exec } from 'child_process'
import util from 'util'
import config from '../config.js'

const execPromise = util.promisify(exec)

let handler = {
  run: async (sock, m, args) => {
    const from = m.key.remoteJid
    const usuario = m.key.participant || m.key.remoteJid

    // Verificar que sea el dueño
    const numeroDueno = config.OWNER_NUMBER?.replace(/@s.whatsapp.net/, '')
    const numeroUsuario = usuario.replace(/:\d+/, '').replace(/@s.whatsapp.net/, '')
    
    if (numeroUsuario !== numeroDueno) {
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
      return sock.sendMessage(from, { text: '`⛔ Solo el dueño puede actualizarme`' }, { quoted: m })
    }

    await sock.sendMessage(from, { react: { text: '🔄', key: m.key } })

    try {
      // Ejecutar git pull
      const { stdout, stderr } = await execPromise('git pull')

      if (stderr && !stdout) {
        await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
        return sock.sendMessage(from, {
          text: `\`⚠️ Aviso al actualizar:\`\n${stderr.slice(0, 1500)}`
        }, { quoted: m })
      }

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
      await sock.sendMessage(from, {
        text: `\`✅ Actualización completada\`\n\n📥 Respuesta:\n${stdout.slice(0, 1500)}\n\n♻️ Reiniciando para aplicar cambios...`
      }, { quoted: m })

      // Pequeña pausa para enviar el mensaje antes de reiniciar
      setTimeout(() => {
        process.exit(0) // Tu gestor de procesos (PM2, nodemon) lo levantará de nuevo
      }, 1500)

    } catch (err) {
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
      return sock.sendMessage(from, {
        text: `\`❌ Error al actualizar:\`\n${err.message.slice(0, 1500)}`
      }, { quoted: m })
    }
  },

handler.command: ['update', 'actualizar'],
handler.help: ['update'],
handler.tags: ['owner'],
handler.owner: true
}

export default handler
