
let handler = {}

function normalizarJid(jid = '') {
    return String(jid).replace(/:\d+@/, '@')
}

function obtenerIds(p = {}) {
    return [
        p.id,
        p.jid,
        p.lid,
        p.phoneNumber
    ]
        .filter(Boolean)
        .map(normalizarJid)
}

function coinciden(idsA = [], idsB = []) {
    return idsA.some(id => idsB.includes(id))
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid

    if (!from?.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`❌ Este comando solo funciona en grupos.`'
        }, { quoted: m })
    }

    try {
        const metadata = await sock.groupMetadata(from)
        const participantes = metadata.participants || []

        const creadorJid = metadata.owner

        const creadorInfo = participantes.find(p =>
            creadorJid &&
            obtenerIds(p).includes(normalizarJid(creadorJid))
        ) || participantes.find(p =>
            p.admin === 'superadmin'
        )

        if (!creadorJid && !creadorInfo) {
            return sock.sendMessage(from, {
                text: '`❌ No pude identificar al creador del grupo.`'
            }, { quoted: m })
        }

        const idsCreador = [
            ...new Set([
                ...(creadorJid ? [normalizarJid(creadorJid)] : []),
                ...obtenerIds(creadorInfo || {})
            ])
        ]

        const sender = m.key.participant || m.participant || ''

        const usuarioInfo = participantes.find(p =>
            obtenerIds(p).includes(normalizarJid(sender))
        )

        const idsUsuario = [
            normalizarJid(sender),
            ...obtenerIds(usuarioInfo || {})
        ].filter(Boolean)

        const esCreador = coinciden(idsUsuario, idsCreador)

        const nombreCreador =
            creadorInfo?.notify ||
            creadorInfo?.name ||
            'Creador del grupo'

        const jidMencionCreador =
            creadorInfo?.id ||
            creadorInfo?.jid ||
            creadorJid

        const numeroCreador = String(
            jidMencionCreador || creadorJid || ''
        ).split('@')[0].split(':')[0]

        const lineaCreador =
            `> 👑 Creador: (@${numeroCreador || 'desconocido'})`

        if (!esCreador) {
            return sock.sendMessage(from, {
                text:
                    `\`❌ Solo el creador del grupo puede usar este comando.\`\n` +
                    lineaCreador,
                mentions: jidMencionCreador
                    ? [jidMencionCreador]
                    : []
            }, { quoted: m })
        }

        // Identificar al bot entre los participantes.
        const idsBot = [
            sock.user?.id,
            sock.user?.jid,
            sock.user?.lid
        ]
            .filter(Boolean)
            .map(normalizarJid)

        const botInfo = participantes.find(p =>
            coinciden(obtenerIds(p), idsBot)
        )

        if (!botInfo) {
            return sock.sendMessage(from, {
                text: '`❌ No pude identificar al bot dentro del grupo.`'
            }, { quoted: m })
        }

        const botEsAdmin =
            botInfo.admin === 'admin' ||
            botInfo.admin === 'superadmin'

        if (!botEsAdmin) {
            return sock.sendMessage(from, {
                text: '`❌ Necesito ser administrador para expulsar participantes.`'
            }, { quoted: m })
        }

        // Conservar al creador y al bot durante las expulsiones.
        const idsDelBot = obtenerIds(botInfo)

        const objetivos = participantes
            .filter(p => {
                const ids = obtenerIds(p)

                const esCreador = coinciden(ids, idsCreador)
                const esBot = coinciden(ids, idsDelBot)

                return !esCreador && !esBot
            })
            .map(p => p.id || p.jid)
            .filter(Boolean)

        // Aviso de inicio con el formato de la captura.
        await sock.sendMessage(from, {
            text:
                `\`⚠️ KICKALL INICIADO\`\n` +
                `${lineaCreador}\n` +
                `> 👥 Participantes seleccionados: ${objetivos.length}`,
            mentions: jidMencionCreador
                ? [jidMencionCreador]
                : []
        }, { quoted: m })

        let aceptados = 0
        let fallidos = 0

        if (objetivos.length > 0) {
            const resultados = await sock.groupParticipantsUpdate(
                from,
                objetivos,
                'remove'
            )

            if (Array.isArray(resultados)) {
                for (const r of resultados) {
                    if (
                        String(r.status) === '200' ||
                        String(r.status) === '201'
                    ) {
                        aceptados++
                    } else {
                        fallidos++
                    }
                }
            } else {
                aceptados = objetivos.length
            }
        }

        // Aviso final antes de que el bot salga.
        await sock.sendMessage(from, {
            text:
                `\`✅ KICKALL FINALIZADO\`\n` +
                `${lineaCreador}\n` +
                `> 👥 Participantes seleccionados: ${objetivos.length}\n` +
                `> ✅ Solicitudes aceptadas: ${aceptados}\n` +
                `> ❌ Errores reportados: ${fallidos}`,
            mentions: jidMencionCreador
                ? [jidMencionCreador]
                : []
        }, { quoted: m })

        // Despedida con el mismo formato.
        await sock.sendMessage(from, {
            text:
                `\`👋 TIBU BOT SE DESPIDE\`\n` +
                `${lineaCreador}\n` +
                `> 🦈 Gracias por usar TIBU BOT.\n` +
                `> ⏳ Saldré del grupo en 8 segundos.`,
            mentions: jidMencionCreador
                ? [jidMencionCreador]
                : []
        }, { quoted: m })

        // Dar tiempo para que se vean los avisos.
        await esperar(8000)

        // El bot intenta salir del grupo al final.
        const botIdParaSalir = botInfo.id || botInfo.jid

        if (botIdParaSalir) {
            await sock.groupParticipantsUpdate(
                from,
                [botIdParaSalir],
                'remove'
            )
        }

    } catch (e) {
        console.error('ERROR KICKALL:', e)

        try {
            await sock.sendMessage(from, {
                text: '`❌ Ocurrió un error al ejecutar kickall. Comprueba los permisos del bot y los identificadores de los participantes.`'
            }, { quoted: m })
        } catch {}
    }
}

handler.command = ['kickall', 'eliminaratodos', 'sacaratodos']
handler.help = ['kickall']
handler.tags = ['grupo']
handler.menu = true

export default handler
