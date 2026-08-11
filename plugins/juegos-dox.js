import config from '../config.js'

let handler = {}

const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms))

function elegir(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function obtenerUsuario(m) {
    const context =
        m.message?.extendedTextMessage?.contextInfo

    return (
        context?.mentionedJid?.[0] ||
        context?.participant ||
        null
    )
}

function generarDatos() {
    const ciudades = [
        'Puerto Esmeralda',
        'Ciudad Marina',
        'Bahía Azul',
        'Villa Coral',
        'Puerto Tiburón',
        'Costa Dorada',
        'Isla Horizonte'
    ]

    const dispositivos = [
        'Android 14',
        'Android 13',
        'Android 12',
        'iPhone',
        'Windows PC',
        'Samsung Galaxy',
        'Xiaomi'
    ]

    const navegadores = [
        'Chrome Mobile',
        'Firefox Mobile',
        'Samsung Internet',
        'Chrome',
        'Edge'
    ]

    const operadores = [
        'Tibu Network',
        'Marino Telecom',
        'Ocean Mobile',
        'BlueWave',
        'Pacific Connect'
    ]

    const sistemas = [
        'Android',
        'Windows',
        'iOS',
        'Linux'
    ]

    const riesgos = [
        'BAJO',
        'MEDIO',
        'ELEVADO',
        'ALTO'
    ]

    return {
        ip: `192.0.2.${Math.floor(Math.random() * 254) + 1}`,
        ciudad: elegir(ciudades),
        dispositivo: elegir(dispositivos),
        navegador: elegir(navegadores),
        operador: elegir(operadores),
        sistema: elegir(sistemas),
        riesgo: elegir(riesgos),

        lat: (
            Math.random() * 180 - 90
        ).toFixed(4),

        lon: (
            Math.random() * 360 - 180
        ).toFixed(4),

        sesiones:
            Math.floor(Math.random() * 8) + 1,

        puertos:
            Math.floor(Math.random() * 6) + 1,

        actividad:
            Math.floor(Math.random() * 900) + 100
    }
}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    if (!from?.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
    }

    const target = obtenerUsuario(m)

    if (!target) {
        return sock.sendMessage(from, {
            text:
`☠️ 𝐃𝐎𝐗 𝐒𝐂𝐀𝐍𝐍𝐄𝐑

👤 Menciona a alguien o responde
a su mensaje.

Ejemplo:

.doxear @usuario`
        }, { quoted: m })
    }

    const numero = target.split('@')[0]
    const usuario = `@${numero}`

    const datos = generarDatos()

    // Reacción inicial
    await sock.sendMessage(from, {
        react: {
            text: '🔎',
            key: m.key
        }
    })

    // Primer mensaje
    const mensaje = await sock.sendMessage(from, {
        text:
`🔎 *OBTENIENDO INFORMACIÓN...*

🎯 Objetivo: ${usuario}

[░░░░░░░░░░] 0%

📡 Iniciando escaneo...`,
        mentions: [target]
    }, { quoted: m })

    // 20%
    await sleep(900)

    await sock.sendMessage(from, {
        text:
`🔎 *OBTENIENDO INFORMACIÓN...*

🎯 Objetivo: ${usuario}

[██░░░░░░░░] 20%

📡 Analizando conexión...
🔐 Buscando sesiones...`,
        edit: mensaje.key
    })

    // 50%
    await sleep(900)

    await sock.sendMessage(from, {
        text:
`🔎 *OBTENIENDO INFORMACIÓN...*

🎯 Objetivo: ${usuario}

[█████░░░░░] 50%

🌐 Analizando red...
💻 Identificando dispositivo...
📂 Buscando registros...`,
        edit: mensaje.key
    })

    // 80%
    await sleep(900)

    await sock.sendMessage(from, {
        text:
`🔎 *OBTENIENDO INFORMACIÓN...*

🎯 Objetivo: ${usuario}

[████████░░] 80%

🛰️ Procesando datos...
🔓 Consultando registros...
⚠️ Actividad detectada...`,
        edit: mensaje.key
    })

    // 100%
    await sleep(1200)

    await sock.sendMessage(from, {
        text:
`🔎 *OBTENIENDO INFORMACIÓN...*

🎯 Objetivo: ${usuario}

[██████████] 100%

☠️ *ESCANEO COMPLETADO*

📂 Preparando resultados...`,
        edit: mensaje.key
    })

    await sleep(700)

    // Reacción de resultado
    await sock.sendMessage(from, {
        react: {
            text: '☠️',
            key: mensaje.key
        }
    })

    const resultado =
`☠️ ═══ *DATABASE SCAN* ═══ ☠️

🎯 OBJETIVO: ${usuario}

━━━━━━━━━━━━━━━━━━━━
📡 IP: ${datos.ip}
🌐 RED: ${datos.operador}
📍 UBICACIÓN: ${datos.ciudad}

💻 DISPOSITIVO: ${datos.dispositivo}
⚙️ SISTEMA: ${datos.sistema}
🌐 NAVEGADOR: ${datos.navegador}

🔐 SESIONES: ${datos.sesiones}
📂 ACTIVIDAD: ${datos.actividad} registros
🔌 PUERTOS: ${datos.puertos}

🛰️ COORDENADAS:
${datos.lat}, ${datos.lon}

🚨 NIVEL DE RIESGO:
${datos.riesgo}

━━━━━━━━━━━━━━━━━━━━
📊 ESCANEO: 100%
━━━━━━━━━━━━━━━━━━━━

⚠️ *ANÁLISIS COMPLETADO*

🦈 ${config.BOT_NAME}`

    // Editar el mismo mensaje con el resultado
    await sock.sendMessage(from, {
        text: resultado,
        edit: mensaje.key
    })

    await sock.sendMessage(from, {
        react: {
            text: '✅',
            key: mensaje.key
        }
    })
}

handler.command = ['doxear', 'dox']
handler.help = ['doxear @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler