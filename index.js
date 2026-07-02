import { connect } from './lib/connection.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import chalk from 'chalk'
import config from './config.js'
import { muteWatcher } from './lib/muteWatcher.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let commands = new Map()

// ─── CACHÉ MEJORADO ───
const cache = {
  admins: new Map(),
  groupMeta: new Map(),
  citados: new Map(),
  contadores: null, // Caché para contadores de mensajes
  baneados: null,   // Caché para lista de baneados
  limpiarJid: jid => jid.replace(/[:].*@/, '@').trim()
}

setInterval(() => {
  cache.admins.clear()
  cache.groupMeta.clear()
  cache.citados.clear()
}, 10 * 60 * 1000)

// ─── SISTEMA DE BANEOS OPTIMIZADO ───
const rutaBaneados = path.join(process.cwd(), 'database', 'baneados.json')
function iniciarBaneados() {
  try {
    if (!fs.existsSync(rutaBaneados)) fs.writeFileSync(rutaBaneados, JSON.stringify([], null, 2))
    cache.baneados = JSON.parse(fs.readFileSync(rutaBaneados, 'utf8'))
  } catch {
    cache.baneados = []
  }
}
function estaBaneado(numero) {
  if (!cache.baneados) iniciarBaneados()
  return cache.baneados.includes(String(numero).replace(/[^0-9]/g, ''))
}
iniciarBaneados()

// ─── SISTEMA DE CONTADOR CON CACHÉ ───
const rutaMsgCount = path.join(process.cwd(), 'database', 'msgcount.json')
function leerContadores() {
  if (cache.contadores) return cache.contadores
  try {
    cache.contadores = JSON.parse(fs.readFileSync(rutaMsgCount, 'utf8'))
    return cache.contadores
  } catch {
    return {}
  }
}
function guardarContadores(datos) {
  cache.contadores = datos
  fs.writeFile(rutaMsgCount, JSON.stringify(datos, null, 2), () => {}) // Escritura no bloqueante
}

// ─── FUNCIONES DE VERIFICACIÓN OPTIMIZADAS ───
async function isAdmin(sock, groupId, userJid) {
  const clave = `${groupId}-${cache.limpiarJid(userJid)}`
  if (cache.admins.has(clave)) return cache.admins.get(clave)

  try {
    let metadata = cache.groupMeta.get(groupId)
    if (!metadata) {
      metadata = await sock.groupMetadata(groupId)
      cache.groupMeta.set(groupId, metadata)
    }
    const limpioUser = cache.limpiarJid(userJid)
    const esAdmin = metadata.participants.some(p =>
      cache.limpiarJid(p.id) === limpioUser && p.admin
    )
    cache.admins.set(clave, esAdmin)
    return esAdmin
  } catch {
    return false
  }
}

async function isBotAdmin(sock, groupId) {
  const botJid = cache.limpiarJid(sock.user.id)
  return isAdmin(sock, groupId, botJid)
}

// ───── QUOTED PRO CON CACHÉ ─────
const sistema = async (sock, from, titulo = `${config.BOT_NAME} 🦈`) => {
  const clave = `${from}-${titulo}`
  if (cache.citados.has(clave)) return cache.citados.get(clave)

  let nombreGrupo = 'Chat'
  let thumbnail = null

  try {
    if (from.endsWith('@g.us')) {
      let metadata = cache.groupMeta.get(from)
      if (!metadata) {
        metadata = await sock.groupMetadata(from)
        cache.groupMeta.set(from, metadata)
      }
      nombreGrupo = metadata.subject || 'Grupo'

      try {
        const pp = await sock.profilePictureUrl(from, 'image')
        const res = await fetch(pp, { signal: AbortSignal.timeout(2000) }) // Tiempo menor
        const buffer = await res.arrayBuffer()
        thumbnail = Buffer.from(buffer)
      } catch {}
    }
  } catch {}

  const mensaje = {
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

  cache.citados.set(clave, mensaje)
  return mensaje
}

// ─── CARGA DE PLUGINS MEJORADA ───
async function loadPlugins() {
  commands.clear()
  const pluginsDir = path.join(__dirname, 'plugins')
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir)

  console.log(chalk.magentaBright('📂 Cargando Plugins...\n'))
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  let totalComandos = 0
  const cargas = files.map(async file => {
    try {
      const plugin = await import(`./plugins/${file}`)
      const handler = plugin.default
      if (handler && Array.isArray(handler.command) && Array.isArray(handler.help)) {
        for (const cmd of handler.command) {
          commands.set(cmd.toLowerCase(), handler)
        }
        totalComandos += handler.help.length
      }
    } catch (err) {
      console.log(chalk.redBright(`❌ ${file} → ${err.message}`))
    }
  })

  await Promise.allSettled(cargas) // Carga paralela
  console.log(chalk.blueBright(`\n🔌 Total de comandos cargados: ${totalComandos}\n`))
}

// Ejecutar comando SIN BLOQUEAR
async function runCommand(sock, msg, comando, args) {
  const usuario = msg.key.participant || msg.key.remoteJid
  if (estaBaneado(usuario)) return

  const cmd = commands.get(comando.toLowerCase())
  if (!cmd) return
  try {
    cmd.run(sock, msg, args, { isAdmin, isBotAdmin, limpiarJid: cache.limpiarJid })
  } catch (err) {
    console.log(chalk.redBright(`⚠️ Error al ejecutar ${comando}: ${err.message}`))
  }
}

function mostrarCabecera() {
  console.clear()
  console.log(chalk.blueBright.bold(`
╔══════════════════════════════════════╗
║           🦈 TIBU BOT 🦈            ║
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

    const botName = sock.user?.name || config.BOT_NAME

    /* ───── CAMBIOS DE ADMIN ───── */
    sock.ev.on('group-participants.update', async (update) => {
      try {
        const { id, participants, action, author } = update
        if (!id || !id.endsWith('@g.us') || !['promote', 'demote'].includes(action)) return

        const user = participants?.[0]
        if (typeof user !== 'string' || typeof author !== 'string') return

        cache.admins.delete(`${id}-${cache.limpiarJid(user)}`)
        cache.admins.delete(`${id}-${cache.limpiarJid(author)}`)

        const texto = action === 'promote'
          ? `🌊 ` + '`NUEVO ADMINISTRADOR`' + ` 🦈\n\n👤 @${user.split('@')[0]}\n👮 Por: @${author.split('@')[0]}`
          : `🫧 ` + '`ADMINISTRADOR REMOVIDO`' + ` 📉\n\n👤 @${user.split('@')[0]}\n👮 Por: @${author.split('@')[0]}`

        const citado = await sistema(sock, id, '🔔 ACTUALIZACIÓN DEL GRUPO')
        sock.sendMessage(id, {
          text: texto + `\n\n> ${botName}`,
          mentions: [user, author]
        }, { quoted: citado })
      } catch (e) {
        console.log(chalk.redBright('⚠️ AUTO-DETECT ADMIN ERROR:'), e.message)
      }
    })

    /* ───── CAMBIOS EN EL GRUPO ───── */
    sock.ev.on('groups.update', async (updates) => {
      for (const g of updates) {
        try {
          const { id, subject, desc, announce, restrict, picture, author } = g
          if (!id || !id.endsWith('@g.us')) continue

          cache.groupMeta.delete(id)

          let actor = author
          if (typeof actor !== 'string') actor = null

          let texto = ''
          let mentions = []

          if (announce === true)
            texto = '🔒 `MAR CERRADO` 🚧\nSolo administradores pueden navegar'
          else if (announce === false)
            texto = '🌊 `MAR ABIERTO` 🛶\nTodos pueden navegar libremente'
          else if (restrict === true)
            texto = '🛡️ `SOLO CAPITANES EDITAN` 🦈\nSolo administradores pueden modificar datos'
          else if (restrict === false)
            texto = '✏️ `TODOS PUEDEN TRAZAR RUTAS` 🗺️\nCualquier miembro puede modificar datos'
          else if (subject)
            texto = `🐠 ` + '`NOMBRE DEL OCÉANO CAMBIADO`' + `\nNuevo: ` + `\`${subject}\``
          else if (desc !== undefined)
            texto = '📜 `BITÁCORA ACTUALIZADA` 📝'
          else if (picture)
            texto = '🏞️ `FONDO DEL MAR RENOVADO` 🖼️'

          if (!texto) continue

          if (actor) {
            texto += `\n\n👮 Por: @${actor.split('@')[0]}`
            mentions.push(actor)
          }

          const citado = await sistema(sock, id, '🔔 ACTUALIZACIÓN DEL GRUPO')
          sock.sendMessage(id, {
            text: texto + `\n\n> ${botName}`,
            mentions
          }, { quoted: citado })
        } catch (e) {
          console.log(chalk.redBright('⚠️ AUTO-DETECT GROUP ERROR:'), e.message)
        }
      }
    })

    // 📩 MENSAJES: PROCESAR MÁS RÁPIDO
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return

      for (const m of messages) {
        if (!m || m.key.fromMe || !m.message) continue

        const muted = await muteWatcher(sock, m)
        if (muted) return

        // Contar mensajes con caché
        const from = m.key.remoteJid
        const remitente = m.key.participant || m.key.remoteJid
        if (from.endsWith('@g.us')) {
          const datos = leerContadores()
          if (!datos[from]) datos[from] = {}
          if (!datos[from][remitente]) datos[from][remitente] = 0
          datos[from][remitente] += 1
          guardarContadores(datos)
        }

        const texto = m.message.conversation || m.message.extendedTextMessage?.text || ''
        if (!texto.startsWith(config.PREFIX)) return

        sock.readMessages([m.key]).catch(() => {})

        const bloques = texto.split(config.PREFIX).filter(b => b.trim())
        const nombreUsuario = m.pushName || 'Desconocido'
        const esGrupo = m.key.remoteJid?.endsWith('@g.us')
        const nombreGrupo = esGrupo ? (cache.groupMeta.get(m.key.remoteJid)?.subject || 'Grupo') : 'Chat Privado'

        console.log(chalk.yellowBright('╔══════════════════════════════════════╗'))
        console.log(chalk.white(`║ 👤 USUARIO: ${nombreUsuario.padEnd(28)} ║`))
        console.log(chalk.white(`║ 📍 EN: ${esGrupo ? `GRUPO: ${nombreGrupo}` : 'CHAT PRIVADO'}`.padEnd(38) + '║'))

        const tareas = bloques.map(async bloque => {
          const [comando, ...args] = bloque.trim().split(' ')
          if (!comando) return
          console.log(chalk.yellowBright(`║ 📥 COMANDO: ${config.PREFIX}${comando.padEnd(26)} ║`))
          return runCommand(sock, m, comando, args)
        })

        console.log(chalk.yellowBright('╚══════════════════════════════════════╝\n'))
        Promise.allSettled(tareas)
      }
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
