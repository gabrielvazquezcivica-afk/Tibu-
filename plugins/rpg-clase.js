import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'Rpg.json')

function leerDB() {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    } catch {
        return {}
    }
}

function guardarDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8')
}

function limpiarJid(jid = '') {
    return String(jid).replace(/:\d+@/, '@').trim()
}

const clases = {
    guerrero: {
        nombre: '⚔️ Guerrero',
        descripcion: 'Especialista en combate cuerpo a cuerpo.',
        hpMax: 120,
        ataque: 20,
        defensa: 12,
        velocidad: 8
    },

    tanque: {
        nombre: '🛡️ Tanque',
        descripcion: 'Resistente y difícil de derrotar.',
        hpMax: 150,
        ataque: 8,
        defensa: 25,
        velocidad: 5
    },

    asesino: {
        nombre: '🗡️ Asesino',
        descripcion: 'Rápido y letal en ataques sorpresa.',
        hpMax: 100,
        ataque: 22,
        defensa: 7,
        velocidad: 25
    },

    cazador: {
        nombre: '🏹 Cazador',
        descripcion: 'Experto en velocidad y precisión.',
        hpMax: 110,
        ataque: 17,
        defensa: 10,
        velocidad: 20
    },

    mago: {
        nombre: '🔮 Mago',
        descripcion: 'Especialista en poder y habilidades especiales.',
        hpMax: 105,
        ataque: 25,
        defensa: 6,
        velocidad: 14
    }
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const jugadorId = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    try {
        const db = leerDB()
        const jugador = db[jugadorId]

        if (!jugador) {
            return sock.sendMessage(
                from,
                {
                    text: '`❌ No estás registrado en TIBU RPG.`\n\n`🏴‍☠️ Usa .registrar para comenzar.`'
                },
                { quoted: m }
            )
        }

        // Si no escribió una clase, mostrar las disponibles
        if (!args[0]) {
            const texto = `╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ 🗡️ 𝐒𝐄𝐋𝐄𝐂𝐂𝐈𝐎𝐍𝐀 𝐓𝐔 𝐂𝐋𝐀𝐒𝐄
┃
┃ ⚔️ Guerrero
┃   ➜ Mucho ataque y HP
┃
┃ 🛡️ Tanque
┃   ➜ Mucha defensa y HP
┃
┃ 🗡️ Asesino
┃   ➜ Ataque y velocidad
┃
┃ 🏹 Cazador
┃   ➜ Velocidad y equilibrio
┃
┃ 🔮 Mago
┃   ➜ Mucho ataque y velocidad
┃
╰━━━━━━━━━━━━━━━━━━╯

💡 Ejemplo:
.clase guerrero`

            return sock.sendMessage(
                from,
                { text: texto },
                { quoted: m }
            )
        }

        // No permitir cambiar de clase
        if (jugador.clase && jugador.clase !== 'Sin elegir') {
            return sock.sendMessage(
                from,
                {
                    text: `╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ ⚠️ 𝐘𝐀 𝐓𝐈𝐄𝐍𝐄𝐒 𝐔𝐍𝐀 𝐂𝐋𝐀𝐒𝐄
┃
┃ 🗡️ Clase actual:
┃   ➜ ${jugador.clase}
┃
┃ ❌ No puedes cambiar de clase.
┃
╰━━━━━━━━━━━━━━━━━━╯`
                },
                { quoted: m }
            )
        }

        const seleccion = String(args[0])
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

        const clase = clases[seleccion]

        if (!clase) {
            return sock.sendMessage(
                from,
                {
                    text: `\`❌ Clase no válida.\`\n\n\`🏴‍☠️ Clases disponibles:\`\n\n⚔️ guerrero\n🛡️ tanque\n🗡️ asesino\n🏹 cazador\n🔮 mago`
                },
                { quoted: m }
            )
        }

        // Asignar clase
        jugador.clase = clase.nombre

        // Estadísticas de la clase
        jugador.hpMax = clase.hpMax
        jugador.hp = clase.hpMax
        jugador.ataque = clase.ataque
        jugador.defensa = clase.defensa
        jugador.velocidad = clase.velocidad

        guardarDB(db)

        await sock.sendMessage(from, {
            react: {
                text: '⚔️',
                key: m.key
            }
        })

        const texto = `╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ 🏴‍☠️ 𝐂𝐋𝐀𝐒𝐄 𝐒𝐄𝐋𝐄𝐂𝐂𝐈𝐎𝐍𝐀𝐃𝐀
┃
┃ ${clase.nombre}
┃
┃ 📜 ${clase.descripcion}
┃
┣━━━━━━━━━━━━━━━━━━
┃
┃ ❤️ HP: ${jugador.hp}/${jugador.hpMax}
┃ ⚔️ Ataque: ${jugador.ataque}
┃ 🛡️ Defensa: ${jugador.defensa}
┃ ⚡ Velocidad: ${jugador.velocidad}
┃
╰━━━━━━━━━━━━━━━━━━╯

🌊 ¡Tu aventura comienza ahora!
🏴‍☠️ Entrena, consigue Berries y sube de nivel.

> Usa .perfil para ver tus estadísticas.`

        await sock.sendMessage(
            from,
            { text: texto },
            { quoted: m }
        )

    } catch (e) {
        console.error('ERROR CLASE RPG:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text: '`❌ No pude seleccionar tu clase RPG.`'
            },
            { quoted: m }
        )
    }
}

handler.command = ['clase', 'class']
handler.help = ['clase']
handler.tags = ['rpg']
handler.menu = true

export default handler