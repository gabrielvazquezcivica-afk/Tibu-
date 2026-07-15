import config from '../config.js'
import fs from 'fs'
import path from 'path'

// 📁 Ruta de tu base de datos de owners (igual que tu ejemplo)
const rutaOwners = path.join(process.cwd(), 'database', 'owners.json')

function leerOwners() {
    try {
        return JSON.parse(fs.readFileSync(rutaOwners, 'utf8'))
    } catch {
        return []
    }
}

function limpiar(n) {
    return (n || '').replace(/[^0-9]/g, '')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const remitente = m.key.participant || m.key.remoteJid
    const remNum = limpiar(remitente)

    // 🔒 VERIFICACIÓN DE DUEÑO (igual que tu código)
    const ownersExtra = leerOwners()
    const esDueno =
        config.owner.some(n => limpiar(n) === remNum) ||
        config.ownerLid.some(l => limpiar(l) === remNum) ||
        ownersExtra.some(o => limpiar(o.number) === remNum || limpiar(o.id) === remNum)

    if (!esDueno) {
        await sock.sendMessage(from, { react: { text: '🦈', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 Solo el dueño de la flota puede enviar avisos`' }, { quoted: m })
    }

    // 📝 OBTENER EL MENSAJE DEL AVISO
    let textoAviso = args.join(' ').trim()
    if (!textoAviso) {
        await sock.sendMessage(from, { react: { text: '🌊', key: m.key } })
        return sock.sendMessage(from, {
            text: '`🌊 Escribe el aviso después del comando`\nEjemplo:\n.avisogeneral Mantenimiento programado mañana a las 10:00'
        }, { quoted: m })
    }

    // 📋 OBTENER TODOS LOS GRUPOS DONDE ESTÁ EL BOT
    const todosGrupos = await sock.groupFetchAllParticipating()
    const listaGrupos = Object.values(todosGrupos)

    // ❌ EXCLUIR EL GRUPO DESDE DONDE SE EJECUTA EL COMANDO
    const gruposEnviar = listaGrupos.filter(g => g.id !== from)

    if (gruposEnviar.length === 0) {
        await sock.sendMessage(from, { react: { text: '⚠️', key: m.key } })
        return sock.sendMessage(from, { text: '`🚫 No hay otros grupos registrados para enviar el aviso`' }, { quoted: m })
    }

    // ✅ CONFIRMACIÓN ANTES DE EMPEZAR
    await sock.sendMessage(from, {
        react: { text: '🏴‍☠️', key: m.key }
    })
    await sock.sendMessage(from, {
        text: `\`🌊 ENVIANDO AVISO A TODA LA FLOTA 🦈\`\n` +
              `Total grupos a notificar: *${gruposEnviar.length}*\n` +
              `(Se omite este grupo)\n\n` +
              `> El aviso se enviará en unos segundos...`
    }, { quoted: m })

    let enviados = 0
    let fallidos = 0

    // 🚀 RECORRER GRUPOS Y ENVIAR AVISO CON MENCIÓN A TODOS
    for (const grupo of gruposEnviar) {
        try {
            // OBTENER TODOS LOS MIEMBROS DEL GRUPO PARA MENCIONAR
            const miembros = grupo.participants.map(p => p.id)

            // TEXTO DEL AVISO CON TU ESTILO
            const avisoFinal = `\`🌊 📢 AVISO GENERAL DE LA FLOTA 🦈\`\n\n` +
                              `${textoAviso}\n\n` +
                              `> ⚠️ Aviso oficial del equipo de administración\n` +
                              `> ${config.BOT_NAME}`

            // ENVIAR CON MENCIONES A TODOS
            await sock.sendMessage(grupo.id, {
                text: avisoFinal,
                mentions: miembros
            })

            enviados++
            // PEQUEÑA PAUSA PARA NO SOBRECARGAR NI SER MARCADO COMO SPAM
            await new Promise(res => setTimeout(res, 1200))
        } catch (err) {
            fallidos++
            console.log(`❌ Falló en grupo ${grupo.id}:`, err.message)
            continue
        }
    }

    // 📊 RESUMEN FINAL AL DUEÑO
    await sock.sendMessage(from, {
        text: `\`🌊 ENVÍO DE AVISO COMPLETADO 🚢\`\n\n` +
              `✅ Enviados correctamente: ${enviados}\n` +
              `❌ Fallados / sin permiso: ${fallidos}\n\n` +
              `> ${config.BOT_NAME}`
    }, { quoted: m })
}

handler.command = ['avisogeneral', 'aviso', 'anunciogeneral']
handler.help = ['avisogeneral <mensaje del aviso>']
handler.tags = ['owner']
handler.menu = true

export default handler
