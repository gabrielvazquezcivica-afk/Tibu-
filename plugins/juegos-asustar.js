import config from '../config.js'

let handler = {}

const sustos = [
`🧸 ⚠️ *ATENCIÓN* ⚠️

@USER, 𝘁𝘂 𝗰𝘂𝗲𝗻𝘁𝗮 𝗱𝗲 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗵𝗮 𝗱𝗲𝘁𝗲𝗰𝘁𝗮𝗱𝗼 𝘂𝗻𝗮 𝗮𝗰𝘁𝗶𝘃𝗶𝗱𝗮𝗱 𝗶𝗻𝘂𝘀𝘂𝗮𝗹.

🔐 Estado: *REVISIÓN DE SEGURIDAD*
📡 Conexión desconocida
📂 Sesión no reconocida

⚠️ Se está verificando la actividad de tu cuenta.

⏳ *Analizando...*`,

`🚨 *ALERTA DE SEGURIDAD* 🚨

👤 @USER

𝗦𝗲 𝗱𝗲𝘁𝗲𝗰𝘁𝗼́ 𝘂𝗻 𝗶𝗻𝗶𝗰𝗶𝗼 𝗱𝗲 𝘀𝗲𝘀𝗶𝗼́𝗻 𝗾𝘂𝗲 𝗻𝗼 𝗰𝗼𝗶𝗻𝗰𝗶𝗱𝗲 𝗰𝗼𝗻 𝘁𝘂 𝗱𝗶𝘀𝗽𝗼𝘀𝗶𝘁𝗶𝘃𝗼.

🌐 Ubicación: *NO IDENTIFICADA*
📱 Dispositivo: *DESCONOCIDO*
🔑 Sesión: *SOSPECHOSA*

⚠️ @USER, mantente atento mientras termina la revisión.

⏳ *Verificación en curso...*`,

`👁️ ⚠️ *SISTEMA DE SEGURIDAD* ⚠️

@USER, hemos encontrado algo extraño en tu sesión.

📡 Actividad inusual detectada
🔐 Sesión desconocida
📂 Datos en revisión
🚨 Nivel de alerta: *ALTO*

━━━━━━━━━━━━━━
⚠️ @USER
━━━━━━━━━━━━━━

⏳ El sistema continúa analizando tu cuenta...`,

`☠️ *ALERTA DEL SISTEMA* ☠️

@USER

Se detectó actividad sospechosa asociada a tu cuenta.

📱 Dispositivo: *NO RECONOCIDO*
🌐 Conexión: *DESCONOCIDA*
🔐 Seguridad: *REVISIÓN ACTIVA*

🚨 *Nivel de riesgo: ELEVADO*

⚠️ @USER, la revisión continúa.

⏳ *Procesando información...*`,

`🧸 🚨 *ADVERTENCIA* 🚨

@USER, tu cuenta acaba de activar un protocolo automático de seguridad.

🔎 Motivo: *actividad inusual*
📡 Sesiones: *verificando*
🔐 Estado: *EN REVISIÓN*

⚠️ Se encontraron conexiones que necesitan ser verificadas.

━━━━━━━━━━━━━━
🚨 @USER
━━━━━━━━━━━━━━

⏳ *Esperando respuesta del sistema...*`
]

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    if (!from?.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
    }

    const context =
        m.message?.extendedTextMessage?.contextInfo

    // Si menciona a alguien
    const mentioned =
        context?.mentionedJid || []

    // Si responde al mensaje de alguien
    const quoted =
        context?.participant

    const target =
        mentioned[0] ||
        quoted

    if (!target) {
        return sock.sendMessage(from, {
            text:
`🧸 *ASUSTAR*

👤 Menciona a alguien o responde a su mensaje.

Ejemplo:
.asustar @usuario`
        }, { quoted: m })
    }

    const numero = target.split('@')[0]

    const elegido =
        sustos[Math.floor(Math.random() * sustos.length)]

    // Reemplaza @USER por la mención real
    const texto = elegido.replace(
        /@USER/g,
        `@${numero}`
    )

    await sock.sendMessage(from, {
        text: texto,
        mentions: [target]
    }, { quoted: m })
}

handler.command = ['asustar']
handler.help = ['asustar @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler