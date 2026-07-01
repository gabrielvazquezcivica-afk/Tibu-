import { connect } from './lib/connection.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import chalk from 'chalk'
import config from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let commands = new Map()

// ───── QUOTED PRO ─────
const sistema = async (sock, from, titulo = config.BOT_NAME + ' 🤖') => {
  let nombreGrupo = 'Chat'
  let thumbnail = null

  try {
    if (from.endsWith('@g.us')) {
      const metadata = await sock.groupMetadata(from)
      nombreGrupo = metadata.subject || 'Grupo'

      try {
        const pp = await sock.profilePictureUrl(from, 'image')
        const res = await fetch(pp)
        const buffer = await res.arrayBuffer()
        thumbnail = Buffer.from(buffer)
      } catch {}
    }
  } catch {}

  return {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    },
    message: {
      extendedTextMessage: {
        text: titulo,
        title: config.BOT_NAME,
        description: nombreGrupo,
        jpegThumbnail: thumbnail,
        previewType: 0
      }
    }
  }
}

// Cargar plugins
async function loadPlugins() {
    commands.clear()
    const pluginsDir = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir)

    console.log(chalk.magentaBright('📂 Cargando Plugins...\n'))
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

    let totalComandos = 0

    for (const file of files) {
        try {
            const plugin = await import(`./plugins/${file}`)
            const handler = plugin.default
            if (handler && Array.isArray(handler.command) && Array.isArray(handler.help)) {
                for (const cmd of handler.command) {
                    commands.set(cmd.toLowerCase(), handler)
                }
                totalComandos += handler.help.length
                console.log(chalk.greenBright(`✅ ${file}`))
            }
        } catch (err) {
            console.log(chalk.redBright(`❌ ${file} → ${err.message}`))
        }
    }

    console.log(chalk.blueBright(`\n🔌 Total de comandos cargados: ${totalComandos}\n`))
}

// Ejecutar comando
async function runCommand(sock, msg, comando, args) {
    const cmd = commands.get(comando.toLowerCase())
    if (!cmd) return
    try {
        await cmd.run(sock, msg, args)
    } catch (err) {
        console.log(chalk.redBright(`⚠️ Error al ejecutar ${comando}: ${err.message}`))
    }
}

function mostrarCabecera() {
    console.clear()
    console.log(chalk.blueBright.bold(`
╔══════════════════════════════════════╗
║           🤖 TIBU BOT 🤖            ║
║     Automatización y Comandos        ║
╚══════════════════════════════════════╝
`))
    console.log(chalk.cyanBright(`🔹 Prefijo: ${config.PREFIX} | 🔹 Bot: ${config.BOT_NAME} | 🔹 Dueño: ${config.OWNER_NAME}\n`))
}

async function startBot() {
    try {
        mostrarCabecera()
        const sock = await connect()

        await loadPlugins()

        // 📢 DETECCIÓN DE CAMBIOS EN GRUPOS
        sock.ev.on('groups.update', async (eventos) => {
            for (const ev of eventos) {
                const { id, subject, desc, announce, restrict, author } = ev
                let mensaje = ''

                // Obtener nombre de quien hizo el cambio
                let quien = author ? `@${author.split('@')[0]}` : 'Desconocido'

                if (subject) {
                    mensaje = `\`📝 NOMBRE DEL GRUPO CAMBIADO\`
Nuevo: \`${subject}\`
Por: \`${quien}\``
                }
                if (desc) {
                    mensaje = `\`ℹ️ DESCRIPCIÓN ACTUALIZADA\`
Por: \`${quien}\``
                }
                if (typeof announce !== 'undefined') {
                    const estado = announce ? '🔒 CERRADO (solo admins envían)' : '🔓 ABIERTO (todos envían)'
                    mensaje = `\`🔧 ESTADO DE ENVÍO CAMBIADO\`
Ahora: \`${estado}\`
Por: \`${quien}\``
                }
                if (typeof restrict !== 'undefined') {
                    const permiso = restrict ? '🛡️ SOLO ADMIN EDITAN' : '✏️ TODOS PUEDEN EDITAR'
                    mensaje = `\`⚙️ PERMISOS DE EDICIÓN CAMBIADOS\`
Ahora: \`${permiso}\`
Por: \`${quien}\``
                }

                if (mensaje) {
                    const citado = await sistema(sock, id, '🔔 NOTIFICACIÓN DE GRUPO')
                    await sock.sendMessage(id, { text: mensaje, quoted: citado })
                }
            }
        })

        // 🤝 DETECTAR CAMBIOS DE ADMINISTRADORES
        sock.ev.on('group-participants.update', async (ev) => {
            const { id, participants, action, author } = ev
            let mensaje = ''
            let quien = author ? `@${author.split('@')[0]}` : 'Desconocido'
            let usuarios = participants.map(p => `@${p.split('@')[0]}`).join(', ')

            if (action === 'promote') {
                mensaje = `\`👑 NUEVO ADMINISTRADOR\`
Usuarios: \`${usuarios}\`
Por: \`${quien}\``
            }
            if (action === 'demote') {
                mensaje = `\`📉 SE QUITÓ DE ADMIN\`
Usuarios: \`${usuarios}\`
Por: \`${quien}\``
            }

            if (mensaje) {
                const citado = await sistema(sock, id, '🔔 NOTIFICACIÓN DE GRUPO')
                await sock.sendMessage(id, { text: mensaje, quoted: citado, mentions: participants })
            }
        })

        // 📩 MENSAJES SOLO CON PREFIJO
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return

            const m = messages[0]
            if (!m || m.key.fromMe || !m.message) return

            const texto = m.message.conversation ||
                          m.message.extendedTextMessage?.text || ''

            if (!texto.startsWith(config.PREFIX)) return

            await sock.readMessages([m.key])

            const [comando, ...args] = texto.slice(config.PREFIX.length).trim().split(' ')

            const nombreUsuario = m.pushName || 'Desconocido'
            const esGrupo = m.key.remoteJid?.endsWith('@g.us')
            let nombreGrupo = 'Chat Privado'

            if (esGrupo) {
                try {
                    nombreGrupo = (await sock.groupMetadata(m.key.remoteJid)).subject
                } catch {
                    nombreGrupo = 'Grupo'
                }
            }

            console.log(chalk.yellowBright('╔══════════════════════════════════════╗'))
            console.log(chalk.yellowBright(`║ 📥 COMANDO: ${config.PREFIX}${comando.padEnd(26)} ║`))
            console.log(chalk.white(`║ 👤 USUARIO: ${nombreUsuario.padEnd(28)} ║`))
            console.log(chalk.white(`║ 📍 EN: ${esGrupo ? `GRUPO: ${nombreGrupo}` : 'CHAT PRIVADO'}`.padEnd(38) + '║'))
            console.log(chalk.yellowBright('╚══════════════════════════════════════╝\n'))

            await runCommand(sock, m, comando, args)
        })

        // 🔄 RECONEXIÓN
        sock.ev.on('connection.update', ({ connection }) => {
            if (connection === 'close') {
                console.log(chalk.redBright('\n🔌 Conexión perdida. Reintentando en 5 segundos...\n'))
                setTimeout(startBot, 5000)
            }
        })

    } catch (err) {
        console.log(chalk.redBright(`\n❌ Error fatal: ${err.message}. Reintentando en 5 segundos...\n`))
        setTimeout(startBot, 5000)
    }
}

startBot()
