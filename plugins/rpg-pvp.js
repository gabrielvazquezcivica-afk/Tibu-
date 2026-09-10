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
    fs.writeFileSync(
        dbPath,
        JSON.stringify(db, null, 2),
        'utf8'
    )
}

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

function obtenerMencion(m) {
    const mencionados = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    return mencionados[0] ? limpiarJid(mencionados[0]) : null
}

function daño(atacante, defensor) {
    const variacion = Math.floor(Math.random() * 11) - 5

    let cantidad =
        atacante.ataque -
        Math.floor(defensor.defensa / 2) +
        variacion

    return Math.max(5, cantidad)
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const atacanteId = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    try {
        const db = leerDB()

        const atacante = db[atacanteId]

        if (!atacante) {
            return sock.sendMessage(
                from,
                {
                    text: '`❌ No estás registrado en TIBU RPG.`\n\n`🏴‍☠️ Usa .registrar para crear tu personaje.`'
                },
                { quoted: m }
            )
        }

        const defensorId = obtenerMencion(m)

        if (!defensorId) {
            return sock.sendMessage(
                from,
                {
                    text: `╭━━━〔 🌊 𝐓𝐈𝐁𝐔 𝐑𝐏𝐆 〕━━━╮
┃
┃ ⚔️ 𝐃𝐄𝐒𝐀𝐅Í𝐎
┃
┃ Debes mencionar al jugador
┃ que quieres retar.
┃
╰━━━━━━━━━━━━━━━━━━╯

💡 Ejemplo:
.duelo @usuario`
                },
                { quoted: m }
            )
        }

        if (defensorId === atacanteId) {
            return sock.sendMessage(
                from,
                {
                    text: '`❌ No puedes luchar contra ti mismo.`'
                },
                { quoted: m }
            )
        }

        const defensor = db[defensorId]

        if (!defensor) {
            return sock.sendMessage(
                from,
                {
                    text: '`❌ Ese jugador no está registrado en TIBU RPG.`\n\n`🏴‍☠️ Primero debe usar .registrar`'
                },
                { quoted: m }
            )
        }

        // Evitar duelos simultáneos con los mismos jugadores
        global.duelosActivos = global.duelosActivos || new Set()

        if (
            global.duelosActivos.has(atacanteId) ||
            global.duelosActivos.has(defensorId)
        ) {
            return sock.sendMessage(
                from,
                {
                    text: '`⚠️ Uno de los jugadores ya está participando en otro duelo.`'
                },
                { quoted: m }
            )
        }

        global.duelosActivos.add(atacanteId)
        global.duelosActivos.add(defensorId)

        try {
            await sock.sendMessage(from, {
                react: {
                    text: '⚔️',
                    key: m.key
                }
            })

            const nombre1 = atacante.nombre || 'Pirata'
            const nombre2 = defensor.nombre || 'Pirata'

            const nivel1 = atacante.nivel ?? 1
            const nivel2 = defensor.nivel ?? 1

            const hp1Original = atacante.hp ?? atacante.hpMax ?? 100
            const hp2Original = defensor.hp ?? defensor.hpMax ?? 100

            // HP temporal para el duelo
            let hp1 = atacante.hpMax ?? 100
            let hp2 = defensor.hpMax ?? 100

            const ataque1 = atacante.ataque ?? 10
            const ataque2 = defensor.ataque ?? 10

            const defensa1 = atacante.defensa ?? 10
            const defensa2 = defensor.defensa ?? 10

            const velocidad1 = atacante.velocidad ?? 10
            const velocidad2 = defensor.velocidad ?? 10

            const clase1 = atacante.clase || 'Sin elegir'
            const clase2 = defensor.clase || 'Sin elegir'

            // Determinar quién comienza
            let turno

            if (velocidad1 > velocidad2) {
                turno = 1
            } else if (velocidad2 > velocidad1) {
                turno = 2
            } else {
                turno = Math.random() < 0.5 ? 1 : 2
            }

            let textoInicio = `╭━━━〔 ⚔️ 𝐃𝐔𝐄𝐋𝐎 𝐑𝐏𝐆 〕━━━╮
┃
┃ 🏴‍☠️ ${nombre1}
┃ ⭐ Nivel: ${nivel1}
┃ 🗡️ ${clase1}
┃ ❤️ HP: ${hp1}/${atacante.hpMax ?? 100}
┃
┃          ⚔️ VS ⚔️
┃
┃ 🏴‍☠️ ${nombre2}
┃ ⭐ Nivel: ${nivel2}
┃ 🗡️ ${clase2}
┃ ❤️ HP: ${hp2}/${defensor.hpMax ?? 100}
┃
┣━━━━━━━━━━━━━━━━━━
┃
┃ ${
                turno === 1
                    ? `⚡ ${nombre1} comienza`
                    : `⚡ ${nombre2} comienza`
            }
┃
╰━━━━━━━━━━━━━━━━━━╯`

            await sock.sendMessage(
                from,
                {
                    text: textoInicio,
                    mentions: [atacanteId, defensorId]
                },
                { quoted: m }
            )

            await esperar(1200)

            let ronda = 0
            let historial = []

            while (hp1 > 0 && hp2 > 0 && ronda < 30) {
                ronda++

                if (turno === 1) {
                    const golpe = daño(
                        {
                            ataque: ataque1
                        },
                        {
                            defensa: defensa2
                        }
                    )

                    hp2 = Math.max(0, hp2 - golpe)

                    historial.push(
                        `⚔️ ${nombre1} golpeó a ${nombre2} (-${golpe} HP)`
                    )

                    turno = 2
                } else {
                    const golpe = daño(
                        {
                            ataque: ataque2
                        },
                        {
                            defensa: defensa1
                        }
                    )

                    hp1 = Math.max(0, hp1 - golpe)

                    historial.push(
                        `⚔️ ${nombre2} golpeó a ${nombre1} (-${golpe} HP)`
                    )

                    turno = 1
                }

                // Mostrar cada ronda
                const ultimo = historial[historial.length - 1]

                const textoRonda = `⚔️ 𝐑𝐎𝐍𝐃𝐀 ${ronda}

${ultimo}

❤️ ${nombre1}: ${hp1}/${atacante.hpMax ?? 100}
❤️ ${nombre2}: ${hp2}/${defensor.hpMax ?? 100}`

                await sock.sendMessage(
                    from,
                    {
                        text: textoRonda
                    },
                    { quoted: m }
                )

                await esperar(900)
            }

            let ganador
            let perdedor

            if (hp1 <= 0 && hp2 <= 0) {
                // Empate extremadamente raro
                ganador = null
                perdedor = null
            } else if (hp2 <= 0) {
                ganador = atacante
                perdedor = defensor
            } else {
                ganador = defensor
                perdedor = atacante
            }

            // Restaurar HP normal
            atacante.hp = Math.min(
                hp1Original,
                atacante.hpMax ?? 100
            )

            defensor.hp = Math.min(
                hp2Original,
                defensor.hpMax ?? 100
            )

            if (!ganador) {
                guardarDB(db)

                return sock.sendMessage(
                    from,
                    {
                        text: `╭━━━〔 ⚔️ 𝐃𝐔𝐄𝐋𝐎 〕━━━╮
┃
┃ 🤝 𝐄𝐌𝐏𝐀𝐓𝐄
┃
┃ Los dos piratas cayeron
┃ al mismo tiempo.
┃
╰━━━━━━━━━━━━━━━━━━╯`
                    },
                    { quoted: m }
                )
            }

            // Determinar IDs
            const ganadorId =
                ganador === atacante
                    ? atacanteId
                    : defensorId

            const perdedorId =
                perdedor === atacante
                    ? atacanteId
                    : defensorId

            // Recompensas
            const berriesGanados =
                Math.floor(Math.random() * 501) + 500

            const xpGanada =
                Math.floor(Math.random() * 31) + 30

            const xpPerdedor = 10

            ganador.berries =
                (ganador.berries ?? 0) + berriesGanados

            ganador.xp =
                (ganador.xp ?? 0) + xpGanada

            perdedor.xp =
                (perdedor.xp ?? 0) + xpPerdedor

            ganador.victorias =
                (ganador.victorias ?? 0) + 1

            perdedor.derrotas =
                (perdedor.derrotas ?? 0) + 1

            // Subir de nivel al ganador
            let nivelesGanador = 0

            if (!ganador.xpNecesaria) {
                ganador.xpNecesaria = 100
            }

            while (ganador.xp >= ganador.xpNecesaria) {
                ganador.xp -= ganador.xpNecesaria

                ganador.nivel =
                    (ganador.nivel ?? 1) + 1

                ganador.xpNecesaria =
                    Math.floor(
                        ganador.xpNecesaria * 1.25
                    )

                ganador.hpMax =
                    (ganador.hpMax ?? 100) + 10

                ganador.ataque =
                    (ganador.ataque ?? 10) + 2

                ganador.defensa =
                    (ganador.defensa ?? 10) + 2

                ganador.velocidad =
                    (ganador.velocidad ?? 10) + 1

                nivelesGanador++
            }

            // Subir de nivel al perdedor si corresponde
            let nivelesPerdedor = 0

            if (!perdedor.xpNecesaria) {
                perdedor.xpNecesaria = 100
            }

            while (perdedor.xp >= perdedor.xpNecesaria) {
                perdedor.xp -= perdedor.xpNecesaria

                perdedor.nivel =
                    (perdedor.nivel ?? 1) + 1

                perdedor.xpNecesaria =
                    Math.floor(
                        perdedor.xpNecesaria * 1.25
                    )

                perdedor.hpMax =
                    (perdedor.hpMax ?? 100) + 10

                perdedor.ataque =
                    (perdedor.ataque ?? 10) + 2

                perdedor.defensa =
                    (perdedor.defensa ?? 10) + 2

                perdedor.velocidad =
                    (perdedor.velocidad ?? 10) + 1

                nivelesPerdedor++
            }

            guardarDB(db)

            let subidaGanador = ''

            if (nivelesGanador > 0) {
                subidaGanador =
                    `\n\n🎉 ¡${ganador.nombre} subió ${nivelesGanador} nivel(es)!`
            }

            let subidaPerdedor = ''

            if (nivelesPerdedor > 0) {
                subidaPerdedor =
                    `\n🎉 ¡${perdedor.nombre} subió ${nivelesPerdedor} nivel(es)!`
            }

            const nombreGanador =
                ganador.nombre || 'Pirata'

            const nombrePerdedor =
                perdedor.nombre || 'Pirata'

            const resultado = `╭━━━〔 🏆 𝐃𝐔𝐄𝐋𝐎 𝐅𝐈𝐍𝐀𝐋 ━━━╮
┃
┃ 👑 𝐕𝐈𝐂𝐓𝐎𝐑𝐈𝐀
┃
┃ 🏴‍☠️ ${nombreGanador}
┃
┃ ⚔️ Derrotó a:
┃   ➜ ${nombrePerdedor}
┃
┣━━━━━━━━━━━━━━━━━━
┃
┃ 💰 Berries: +${berriesGanados.toLocaleString()}
┃ ✨ XP: +${xpGanada}
┃
┃ 🏆 Victorias: ${ganador.victorias}
┃ 💀 Derrotas: ${perdedor.derrotas}
┃
╰━━━━━━━━━━━━━━━━━━╯

🌊 ¡El combate ha terminado!
${subidaGanador}${subidaPerdedor}

> 🏴‍☠️ TIBU RPG`

            await sock.sendMessage(
                from,
                {
                    text: resultado,
                    mentions: [ganadorId, perdedorId]
                },
                { quoted: m }
            )

            await sock.sendMessage(from, {
                react: {
                    text: '🏆',
                    key: m.key
                }
            })

        } finally {
            global.duelosActivos.delete(atacanteId)
            global.duelosActivos.delete(defensorId)
        }

    } catch (e) {
        console.error('ERROR DUELO RPG:', e)

        global.duelosActivos?.delete(atacanteId)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text: '`❌ No pude iniciar el duelo.`'
            },
            { quoted: m }
        )
    }
}

handler.command = ['duelo', 'pvp']
handler.help = ['duelo']
handler.tags = ['rpg']
handler.menu = true

export default handler