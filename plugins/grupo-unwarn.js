import fs from 'fs'
import path from 'path'
import config from '../config.js'

function limpiarNumero(num = '') {
    return String(num).replace(/[^0-9]/g, '')
}

const rutaAdvertencias = path.join(process.cwd(), 'database', 'advertencias.json')

function leerAdvertencias() {
    try {
        return JSON.parse(fs.readFileSync(rutaAdvertencias, 'utf8'))
    } catch {
        return {}
    }
}

function guardarAdvertencias(datos) {
    fs.writeFileSync(rutaAdvertencias, JSON.stringify(datos, null, 2))
}

// Comando WARN
let handlerWarn = {}

handlerWarn.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, { text: '`🌊 Solo funciona en grupos`' }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return sock.sendMessage(from, { text: '`❌ No pude leer el grupo`' }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const userInfo = participantes.find(p => p.id === sender || p.jid === sender)
    const isAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo administradores pueden advertir`' }, { quoted: m })
    }

    const quotedParticipant = m.message?.extendedTextMessage?.contextInfo?.participant
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    let objetivo = quotedParticipant || mentioned[0] || null

    if (!objetivo) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, {
            text: '`❌ Ejemplos de uso:`\n> .warn @usuario o responde a un mensaje',
            quoted: m
        })
    }

    const targetInfo = participantes.find(p => p.id === objetivo || p.jid === objetivo)
    if (targetInfo?.admin === 'admin' || targetInfo?.admin === 'superadmin') {
        await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 No puedes advertir a otro administrador`' }, { quoted: m })
    }

    const datos = leerAdvertencias()
    if (!datos[from]) datos[from] = {}
    if (!datos[from][objetivo]) datos[from][objetivo] = 0

    datos[from][objetivo] += 1
    const cantidad = datos[from][objetivo]
    guardarAdvertencias(datos)

    const numUsuario = limpiarNumero(objetivo)

    try {
        if (cantidad < 3) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
            return sock.sendMessage(from, {
                text: `⚠️ ` + '`ADVERTENCIA`' + `\n\n👤 Usuario: @${numUsuario}\n🔢 Advertencias: ${cantidad}/3\n\n> ${config.BOT_NAME}`,
                mentions: [objetivo]
            }, { quoted: m })
        } else {
            delete datos[from][objetivo]
            guardarAdvertencias(datos)

            await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
            await sock.sendMessage(from, {
                text: `🚫 ` + '`EXPULSADO POR ADVERTENCIAS`' + `\n\n👤 Usuario: @${numUsuario}\n❌ Acumuló 3 advertencias\n\n> ${config.BOT_NAME}`,
                mentions: [objetivo]
            }, { quoted: m })

            await sock.groupParticipantsUpdate(from, [objetivo], 'remove')
        }
    } catch (e) {
        console.log('ERROR WARN:', e)
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        await sock.sendMessage(from, { text: '`❌ No pude procesar la advertencia`' }, { quoted: m })
    }
}

handlerWarn.command = ['warn']
handlerWarn.help = ['warn @usuario', 'warn (responder mensaje)']
handlerWarn.tags = ['grupo']
handlerWarn.menu = true

// Comando UNWARN
let handlerUnwarn = {}

handlerUnwarn.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, { text: '`🌊 Solo funciona en grupos`' }, { quoted: m })
    }

    let metadata
    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        return sock.sendMessage(from, { text: '`❌ No pude leer el grupo`' }, { quoted: m })
    }

    const participantes = metadata.participants || []

    const userInfo = participantes.find(p => p.id === sender || p.jid === sender)
    const isAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, { react: { text: '🚫', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo administradores pueden quitar advertencias`' }, { quoted: m })
    }

    const quotedParticipant = m.message?.extendedTextMessage?.contextInfo?.participant
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    let objetivo = quotedParticipant || mentioned[0] || null

    if (!objetivo) {
        await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
        return sock.sendMessage(from, {
            text: '`❌ Ejemplos de uso:`\n> .unwarn @usuario o responde a un mensaje',
            quoted: m
        })
    }

    const datos = leerAdvertencias()
    if (!datos[from] || !datos[from][objetivo]) {
        await sock.sendMessage(from, { react: { text: 'ℹ️', key: m.key } })
        return sock.sendMessage(from, {
            text: `ℹ️ ` + '`INFORMACIÓN`' + `\n\n👤 @${limpiarNumero(objetivo)}\n🔢 No tiene advertencias registradas.`,
            mentions: [objetivo]
        }, { quoted: m })
    }

    // Quitar una advertencia
    datos[from][objetivo] -= 1
    if (datos[from][objetivo] <= 0) delete datos[from][objetivo]
    guardarAdvertencias(datos)

    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
    await sock.sendMessage(from, {
        text: `✅ ` + '`ADVERTENCIA QUITADA`' + `\n\n👤 @${limpiarNumero(objetivo)}\n🔢 Advertencias restantes: ${datos[from][objetivo] || 0}/3`,
        mentions: [objetivo]
    }, { quoted: m })
}

handler.command = ['unwarn']
handler.help = ['unwarn @usuario']
handler.tags = ['grupo']
handler.menu = true

export default handler
