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
const dispositivos = [
'Android Mobile',
'iOS Device',
'Windows Desktop',
'Linux Device',
'Unknown Client'
]

const navegadores = [
    'Chrome',
    'Firefox',
    'Safari',
    'Edge',
    'Unknown Browser'
]

const estados = [
    'LOW',
    'MODERATE',
    'ELEVATED'
]

return {
    id: Math.random().toString(16).slice(2, 10).toUpperCase(),
    dispositivo: elegir(dispositivos),
    navegador: elegir(navegadores),
    riesgo: elegir(estados),
    sesiones: Math.floor(Math.random() * 5) + 1,
    eventos: Math.floor(Math.random() * 900) + 100,
    hora: new Date().toISOString()
}

}

handler.run = async (sock, m) => {
const from = m.key.remoteJid

if (!from?.endsWith('@g.us')) {
    return sock.sendMessage(from, {
        text: '⛔ Este comando solo funciona en grupos.'
    }, { quoted: m })
}

const target = obtenerUsuario(m)

if (!target) {
    return sock.sendMessage(from, {
        text:

`╔══════════════════════════╗
║     TIBU // CYBER SCAN   ║
╚══════════════════════════╝

┌─[ USO DEL SISTEMA ]
│
├─ .doxear @usuario
├─ Responde al mensaje de alguien
│  usando .doxear
│
└─ Estado: ESPERANDO OBJETIVO

⚠ Los resultados son simulados.

«${config.BOT_NAME || 'TIBU BOT'}`
}, { quoted: m })
}»

const numero = target.split('@')[0]
const usuario = `@${numero}`
const datos = generarDatos()

const reaccion = async (emoji, key = m.key) => {
    await sock.sendMessage(from, {
        react: { text: emoji, key }
    }).catch(() => {})
}

await reaccion('🛰️')

const mensaje = await sock.sendMessage(from, {
    text:

`╔══════════════════════════╗
║     TIBU // CYBER SCAN   ║
╚══════════════════════════╝

[SYS] Inicializando terminal...
[NET] Preparando análisis de prueba
[TGT] Objetivo: ${usuario}

[░░░░░░░░░░] 00%

«Cargando módulos...`,
mentions: [target]
}, { quoted: m })»

const actualizar = async texto => {
    await sock.sendMessage(from, {
        text: texto,
        edit: mensaje.key
    })
}

const etapas = [
    {
        progreso: '██░░░░░░░░',
        porcentaje: '20%',
        logs: [
            '[SYS] Módulos inicializados',
            '[NET] Simulando diagnóstico de conexión',
            '[OK] Entorno de prueba preparado'
        ]
    },
    {
        progreso: '████░░░░░░',
        porcentaje: '40%',
        logs: [
            '[SCAN] Analizando perfil ficticio',
            '[SYS] Preparando inventario simulado',
            '[OK] Datos de demostración generados'
        ]
    },
    {
        progreso: '██████░░░░',
        porcentaje: '60%',
        logs: [
            '[AUDIT] Creando eventos de prueba',
            '[NET] Sin acceso a la red privada del objetivo',
            '[OK] Registro temporal generado'
        ]
    },
    {
        progreso: '████████░░',
        porcentaje: '80%',
        logs: [
            '[RISK] Calculando indicador demostrativo',
            '[SYS] Organizando resultados',
            '[OK] Informe casi listo'
        ]
    },
    {
        progreso: '██████████',
        porcentaje: '100%',
        logs: [
            '[SYS] Procesamiento terminado',
            '[OK] Informe de demostración preparado',
            '[INFO] No se obtuvo información privada real'
        ]
    }
]

for (const etapa of etapas) {
    await sleep(850)

    await actualizar(

`╔══════════════════════════╗
║     TIBU // CYBER SCAN   ║
╚══════════════════════════╝

[TGT] Objetivo: ${usuario}

${etapa.progreso} ${etapa.porcentaje}

${etapa.logs.join('\n')}

«Procesando...`
)
}»

await reaccion('🖥️', mensaje.key)
await sleep(500)

const resultado =

`╔══════════════════════════╗
║      SCAN REPORT         ║
╚══════════════════════════╝

┌─[ TARGET ]
│ Usuario: ${usuario}
│ Scan ID: ${datos.id}
│ Fecha: ${datos.hora}
│ Estado: COMPLETADO
│
├─[ CLIENT SIMULATION ]
│ Dispositivo: ${datos.dispositivo}
│ Navegador: ${datos.navegador}
│ Sesiones de prueba: ${datos.sesiones}
│ Eventos ficticios: ${datos.eventos}
│
├─[ SECURITY ANALYSIS ]
│ Riesgo simulado: ${datos.riesgo}
│ Integridad: DEMO
│ Fuente: DATOS ALEATORIOS
│
├─[ LIMITACIONES ]
│ IP real: NO OBTENIDA
│ Ubicación real: NO OBTENIDA
│ Coordenadas: NO OBTENIDAS
│ Contraseñas: NO ACCEDIDAS
│
└─[ RESULT ]
Análisis de demostración finalizado.
━━━━━━━━━━━━━━━━━━━━━━━━
🦈 ${config.BOT_NAME || 'TIBU BOT'}`

await sock.sendMessage(from, {
    text: resultado,
    edit: mensaje.key,
    mentions: [target]
})

await reaccion('✅', mensaje.key)

}

handler.command = ['doxear', 'dox']
handler.help = ['doxear @usuario']
handler.tags = ['diversión']
handler.menu = true

export default handler