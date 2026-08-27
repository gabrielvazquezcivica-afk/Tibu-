import fs from 'fs'
import path from 'path'

const ruta = path.join(
    process.cwd(),
    'database',
    'muteados.json'
)

// ==================================================
// 🔇 CACHE GLOBAL DE SILENCIADOS
// ==================================================

if (!global.silenciadosCache) {
    global.silenciadosCache = new Set()
}


// ==================================================
// 🗑️ COLAS DE BORRADO POR GRUPO
// ==================================================

if (!global.muteDeleteQueues) {
    global.muteDeleteQueues = new Map()
}


// ==================================================
// 📂 LEER DATABASE
// ==================================================

function leerDB() {

    try {

        if (!fs.existsSync(ruta))
            return {}

        return JSON.parse(
            fs.readFileSync(ruta, 'utf8')
        )

    } catch {

        return {}
    }
}


// ==================================================
// 💾 GUARDAR DATABASE
// ==================================================

function guardarDB(db) {

    fs.mkdirSync(
        path.dirname(ruta),
        { recursive: true }
    )

    fs.writeFileSync(
        ruta,
        JSON.stringify(db, null, 2)
    )
}


// ==================================================
// 🧹 LIMPIAR JID
// ==================================================

function limpiarJid(jid = '') {

    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}


// ==================================================
// 🔄 ACTUALIZAR CACHE
// ==================================================

function actualizarCache() {

    const db = leerDB()

    global.silenciadosCache.clear()

    for (const grupo in db) {

        const usuarios =
            Array.isArray(db[grupo])
                ? db[grupo]
                : []

        for (const user of usuarios) {

            const numero =
                String(user)
                    .replace(/[^0-9]/g, '')

            if (!numero)
                continue

            global.silenciadosCache.add(
                `${grupo}|${numero}`
            )
        }
    }
}


global.actualizarCache =
    actualizarCache


// ==================================================
// 🗑️ BORRAR UN MENSAJE
// ==================================================

async function borrarMensaje(sock, m) {

    const from =
        m.key.remoteJid

    const id =
        m.key.id

    const participant =
        m.key.participant

    if (!from || !id)
        return


    try {

        await sock.sendMessage(
            from,
            {
                delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: id,
                    participant: participant
                }
            }
        )

    } catch (e) {

        console.log(
            `❌ Error borrando mensaje muteado en ${from}:`,
            e?.message || e
        )
    }
}


// ==================================================
// 🔄 PROCESAR COLA DE UN GRUPO
// ==================================================

async function procesarCola(sock, from) {

    const cola =
        global.muteDeleteQueues.get(from)

    if (!cola)
        return

    // Evita que dos procesadores trabajen
    // sobre la misma cola al mismo tiempo.
    if (cola.procesando)
        return

    cola.procesando = true

    try {

        while (cola.mensajes.length > 0) {

            const mensaje =
                cola.mensajes.shift()

            if (!mensaje)
                continue

            await borrarMensaje(
                sock,
                mensaje
            )

            // Pequeña pausa para evitar
            // mandar demasiadas eliminaciones
            // simultáneamente a WhatsApp.
            await new Promise(
                resolve => setTimeout(resolve, 80)
            )
        }

    } catch (e) {

        console.log(
            '❌ ERROR EN COLA MUTE:',
            e?.message || e
        )

    } finally {

        cola.procesando = false

        // Si llegaron mensajes mientras
        // terminábamos de procesar la cola,
        // volvemos a procesarlos.
        if (cola.mensajes.length > 0) {

            procesarCola(
                sock,
                from
            ).catch(() => {})

        } else {

            // Limpiamos la cola cuando
            // ya no quedan mensajes.
            global.muteDeleteQueues.delete(
                from
            )
        }
    }
}


// ==================================================
// ➕ AGREGAR MENSAJE A LA COLA
// ==================================================

function agregarACola(sock, m) {

    const from =
        m.key.remoteJid

    if (!from)
        return


    let cola =
        global.muteDeleteQueues.get(from)


    if (!cola) {

        cola = {

            mensajes: [],

            procesando: false

        }

        global.muteDeleteQueues.set(
            from,
            cola
        )
    }


    cola.mensajes.push(m)


    // Arrancar procesador.
    procesarCola(
        sock,
        from
    ).catch(() => {})
}


// ==================================================
// 🔇 MUTE WATCHER
// ==================================================

export async function muteWatcher(sock, m) {

    try {

        const from =
            m.key.remoteJid

        // Solo grupos
        if (!from?.endsWith('@g.us'))
            return false

        // No procesar mensajes del bot
        if (m.key.fromMe)
            return false


        // ==================================================
        // 👤 OBTENER PARTICIPANTE
        // ==================================================

        const participante =
            m.key.participant ||
            m.key.remoteJid


        const remitente =
            String(participante)
                .replace(/[^0-9]/g, '')


        if (!remitente)
            return false


        // ==================================================
        // 🔑 CLAVE CACHE
        // ==================================================

        const clave =
            `${from}|${remitente}`


        // ==================================================
        // ⚡ BUSCAR EN CACHE
        // ==================================================

        let estaMuteado =
            global.silenciadosCache.has(
                clave
            )


        // ==================================================
        // 📂 SI NO ESTÁ EN CACHE
        // ==================================================

        if (!estaMuteado) {

            const db =
                leerDB()

            const lista =
                Array.isArray(db[from])
                    ? db[from]
                    : []


            estaMuteado =
                lista.some(
                    user =>
                        String(user)
                            .replace(/[^0-9]/g, '') ===
                        remitente
                )


            if (estaMuteado) {

                global.silenciadosCache.add(
                    clave
                )
            }
        }


        // ==================================================
        // 🟢 NO ESTÁ MUTEADO
        // ==================================================

        if (!estaMuteado)
            return false


        // ==================================================
        // 🗑️ AGREGAR A COLA
        // ==================================================

        agregarACola(
            sock,
            m
        )


        // Importante:
        // El mensaje ya fue identificado
        // como perteneciente a un usuario muteado.
        return true


    } catch (e) {

        console.log(
            'MUTEWATCHER ERROR:',
            e?.message || e
        )

        return false
    }
}


// ==================================================
// 📤 EXPORTS
// ==================================================

export {
    limpiarJid,
    leerDB,
    guardarDB,
    actualizarCache
}