import { connect } from './lib/connection.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import config from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let commands = new Map()

// Cargar plugins, solo mostrar total
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
                // Solo mensaje sin listar comandos
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
