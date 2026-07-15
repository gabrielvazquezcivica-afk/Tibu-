import { connect } from './lib/connection.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import chalk from 'chalk'
import config from './config.js'
import { muteWatcher } from './lib/muteWatcher.js'
import { antiLink } from './lib/antilink.js'
import { welcomeHandler } from './plugins/on-off-welcome.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let commands = new Map()

// ─── CACHÉ ───
const cache = {
  admins: new Map(),
  groupMeta: new Map(),
  citados: new Map(),
  contadores: null,
  baneados: null,
  limpiarJid: jid => jid.replace(/[:].*@/, '@').trim()
}

setInterval(() => {
  cache.admins.clear()
  cache.groupMeta.clear()
  cache.citados.clear()
}, 10 * 60 * 1000)

// ─── SISTEMA DE BANEOS ───
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
  try {
    const lista = JSON.parse(
      fs.readFileSync(rutaBaneados, 'utf8')
    )

    return lista.includes(
      String(numero).replace(/[^0-9]/g, '')
    )
  } catch {
    return false
  }
}

iniciarBaneados()

// ─── CONTADORES DE MENSAJES ───
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
  fs.writeFile(rutaMsgCount, JSON.stringify(datos, null, 2), () => {})
}

// ─── VERIFICACIONES ───
async function isAdmin(sock, groupId, userJid) {
  try {
    const metadata = await sock.groupMetadata(groupId)

    const limpioUser = cache
      .limpiarJid(userJid)
      .split(':')[0]

    const participante = metadata.participants.find(p => {
      const jid = cache
        .limpiarJid(p.id || p.jid)
        .split(':')[0]

      return jid === limpioUser
    })

    return (
      participante?.admin === 'admin' ||
      participante?.admin === 'superadmin'
    )
  } catch (e) {
    console.log('isAdmin error:', e)
    return false
  }
}

async function isBotAdmin(sock, groupId) {
  const botJid = cache
    .limpiarJid(sock.user.id)
    .split(':')[0]

  return isAdmin(sock, groupId, botJid)
}

const rutaModoAdmin = path.join(
  process.cwd(),
  'database',
  'modoadmin.json'
)

function modoAdminActivo(grupo) {
  try {
    const db = JSON.parse(
      fs.readFileSync(rutaModoAdmin, 'utf8')
    )
    return !!db[grupo]
  } catch {
    return false
  }
}


// ─── MENSAJE CITADO ───
const sistema = async (sock, from, titulo = `${config.BOT_NAME} 🦈`) => {
  const clave = `${from}-${titulo}`
  if (cache.citados.has(clave)) return cache.citados.get(clave)
  let nombreGrupo = 'Chat', thumbnail = null
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
        const res = await fetch(pp, { signal: AbortSignal.timeout(2000) })
        thumbnail = Buffer.from(await res.arrayBuffer())
      } catch {}
    }
  } catch {}
  const mensaje = {
    key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
    message: { extendedTextMessage: { text: titulo, title: config.BOT_NAME, description: nombreGrupo, jpegThumbnail: thumbnail, previewType: 0 } }
  }
  cache.citados.set(clave, mensaje)
  return mensaje
}

// ─── CARGAR PLUGINS ───
async function loadPlugins() {
  commands.clear()
  global.plugins = []
  const pluginsDir = path.join(__dirname, 'plugins')
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir)
  console.log(chalk.magentaBright('📂 Cargando Plugins...\n'))
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
  let totalComandos = 0
  await Promise.allSettled(files.map(async file => {
    try {
      const plugin = await import(`./plugins/${file}`)
      const handler = plugin.default

      if (handler) {
  global.plugins.push(handler)
}

      if (handler && Array.isArray(handler.command) && Array.isArray(handler.help)) {
        handler.command.forEach(cmd => commands.set(cmd.toLowerCase(), handler))
        totalComandos += handler.help.length
      }
    } catch (err) {
      console.log(chalk.redBright(`❌ ${file} → ${err.message}`))
    }
  }))
  console.log(chalk.blueBright(`\n🔌 Total de comandos cargados: ${totalComandos}\n`))
}

// ─── EJECUTAR COMANDO ───
async function runCommand(sock, msg, comando, args) {
  const usuario = cache.limpiarJid(
    msg.key.participant || msg.key.remoteJid
  )

  const from = msg.key.remoteJid

  if (estaBaneado(usuario)) return

  const cmd = commands.get(comando.toLowerCase())
  if (!cmd) return

  if (from.endsWith('@g.us') && modoAdminActivo(from)) {
    const admin = await isAdmin(sock, from, usuario)

    if (!admin) {
      const excluir =
        cmd.tags?.includes('owner') ||
        cmd.tags?.includes('grupo')

      if (!excluir) return
    }
  }

  try {
    cmd.run(sock, msg, args, {
      commands,
      isAdmin,
      isBotAdmin,
      limpiarJid: cache.limpiarJid
    })
  } catch (err) {
    console.log(
      chalk.redBright(`⚠️ Error al ejecutar ${comando}: ${err.message}`)
    )
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
        sock.sendMessage(id, { text: texto + `\n\n> ${botName}`, mentions: [user, author] }, { quoted: citado })
      } catch (e) {
        console.log(chalk.redBright('⚠️ AUTO-DETECT ADMIN ERROR:'), e.message)
      }
    })

    sock.ev.on('groups.update', async (updates) => {
      for (const g of updates) {
        try {
          const { id, subject, desc, announce, restrict, picture, author } = g
          if (!id || !id.endsWith('@g.us')) continue
          cache.groupMeta.delete(id)
          let actor = author
          if (typeof actor !== 'string') actor = null
          let texto = '', mentions = []
          if (announce === true) texto = '🔒 `MAR CERRADO` 🚧\nSolo administradores pueden navegar'
          else if (announce === false) texto = '🌊 `MAR ABIERTO` 🛶\nTodos pueden navegar libremente'
          else if (restrict === true) texto = '🛡️ `SOLO CAPITANES EDITAN` 🦈\nSolo administradores pueden modificar datos'
          else if (restrict === false) texto = '✏️ `TODOS PUEDEN TRAZAR RUTAS` 🗺️\nCualquier miembro puede modificar datos'
          else if (subject) texto = `🐠 ` + '`NOMBRE DEL OCÉANO CAMBIADO`' + `\nNuevo: ` + `\`${subject}\``
          else if (desc !== undefined) texto = '📜 `BITÁCORA ACTUALIZADA` 📝'
          else if (picture) texto = '🏞️ `FONDO DEL MAR RENOVADO` 🖼️'
          if (!texto) continue
          if (actor) { texto += `\n\n👮 Por: @${actor.split('@')[0]}`; mentions.push(actor) }
          const citado = await sistema(sock, id, '🔔 ACTUALIZACIÓN DEL GRUPO')
          sock.sendMessage(id, { text: texto + `\n\n> ${botName}`, mentions }, { quoted: citado })
        } catch (e) {
          console.log(chalk.redBright('⚠️ AUTO-DETECT GROUP ERROR:'), e.message)
        }
      }
    })

sock.ev.on('group-participants.update', async update => {
  try {
    await welcomeHandler(sock, update)
  } catch (e) {
    console.log('WELCOME EVENT ERROR:', e.message)
  }
})

    // 📩 MENSAJES
sock.ev.on('messages.upsert', async ({ messages, type }) => {
  if (type !== 'notify') return

  for (const m of messages) {
    if (!m || m.key.fromMe || !m.message) continue

    const remitente = cache.limpiarJid(
      m.key.participant || m.key.remoteJid
    )

    const muted = await muteWatcher(sock, m)
    if (muted) continue

    const bloqueado = await antiLink(sock, m)
if (bloqueado) continue

    if (m.message?.reactionMessage) {

    console.log('===================')
    console.log('REACCION DETECTADA')
    console.log(JSON.stringify(
        m.message.reactionMessage,
        null,
        2
    ))
    console.log('===================')

    const reaction = m.message.reactionMessage.text
    const targetId = m.message.reactionMessage.key?.id

    console.log('EMOJI:', reaction)
    console.log('TARGET:', targetId)

    const videos = global.playlistCache?.[targetId]

    console.log('VIDEOS:', videos?.length)

    if (videos) {

        const mapa = {
            '1️⃣': 0,
            '2️⃣': 1,
            '3️⃣': 2,
            '4️⃣': 3,
            '5️⃣': 4,
            '6️⃣': 5,
            '7️⃣': 6,
            '8️⃣': 7,
            '9️⃣': 8
        }

        const index = mapa[reaction]

        console.log('INDEX:', index)

        if (index !== undefined && videos[index]) {

            const url = videos[index].url

            console.log('URL:', url)
            console.log('EJECUTANDO PLAY')

            await runCommand(
                sock,
                m,
                'play',
                [url]
            )
        }
    }

    continue
}

const texto =
  m.message?.conversation ||
  m.message?.extendedTextMessage?.text ||
  m.message?.imageMessage?.caption ||
  m.message?.videoMessage?.caption ||
  ''

    if (!texto.startsWith(config.PREFIX)) {
      const from = m.key.remoteJid

      if (from.endsWith('@g.us')) {
        const datos = leerContadores()
        if (!datos[from]) datos[from] = {}
        if (!datos[from][remitente]) datos[from][remitente] = 0
        datos[from][remitente] += 1
        guardarContadores(datos)
      }

      continue
    }

    sock.readMessages([m.key]).catch(() => {})

    const sinPrefijo = texto.slice(config.PREFIX.length).trim()

const [comando, ...args] = sinPrefijo.split(/\s+/)

const nombreUsuario = m.pushName || 'Desconocido'
const esGrupo = m.key.remoteJid.endsWith('@g.us')

let nombreGrupo = 'Chat Privado'

if (esGrupo) {
  let metadata = cache.groupMeta.get(m.key.remoteJid)

  if (!metadata) {
    try {
      metadata = await sock.groupMetadata(m.key.remoteJid)
      cache.groupMeta.set(m.key.remoteJid, metadata)
    } catch {}
  }

  nombreGrupo = metadata?.subject || 'Grupo'
}

console.log(chalk.yellowBright('╔══════════════════════════════════════╗'))
console.log(
  chalk.white(
    `║ 👤 USUARIO: ${nombreUsuario.padEnd(28)} ║`
  )
)
console.log(
  chalk.white(
    `║ 👥 GRUPO : ${nombreGrupo.padEnd(28)} ║`
  )
)
console.log(
  chalk.yellowBright(
    `║ 📥 COMANDO: ${(config.PREFIX + comando).padEnd(30)} ║`
  )
)
console.log(chalk.yellowBright('╚══════════════════════════════════════╝\n'))

await runCommand(sock, m, comando, args)
  }
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
