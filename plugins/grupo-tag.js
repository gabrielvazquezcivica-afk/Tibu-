import config from '../config.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'

const afkPath = path.join(
    process.cwd(),
    'database',
    'afk.json'
)

function leerAFK() {
    try {
        if (!fs.existsSync(afkPath)) {
            return {}
        }

        return JSON.parse(
            fs.readFileSync(afkPath, 'utf8')
        )
    } catch {
        return {}
    }
}

function limpiarJid(jid = '') {
    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

function footer() {
    return `\n\n> ${config.BOT_NAME}`
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const sender = limpiarJid(
        m.key.participant || m.key.remoteJid
    )

    if (!from?.endsWith('@g.us')) {
        await sock.sendMessage(from, {
            react: {
                text: '🌊',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text: '`🌊 Solo funciona en grupos`'
            },
            { quoted: m }
        )
    }

    let metadata

    try {
        metadata = await sock.groupMetadata(from)
    } catch {
        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text: '`❌ No pude leer el grupo`'
            },
            { quoted: m }
        )
    }

    const participantes =
        metadata.participants || []

    const userInfo = participantes.find(
        p =>
            limpiarJid(p.id) === sender ||
            limpiarJid(p.jid) === sender
    )

    const isAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'

    if (!isAdmin) {
        await sock.sendMessage(from, {
            react: {
                text: '🚫',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text: '`🚫 Solo admins pueden usarlo`'
            },
            { quoted: m }
        )
    }

    await sock.sendMessage(from, {
        react: {
            text: '📢',
            key: m.key
        }
    })

    /*
     * ==========================================
     * USUARIOS AFK
     * ==========================================
     */

    const afkDB = leerAFK()
    const grupoAFK = afkDB[from] || {}

    /*
     * Todos los participantes del grupo
     */
    const todosLosUsuarios =
        participantes
            .map(p =>
                limpiarJid(
                    p.id || p.jid
                )
            )
            .filter(Boolean)

    /*
     * Quitamos a los usuarios que están AFK.
     *
     * Ellos NO recibirán la mención
     * de .n / .todos.
     */
    const mentions =
        todosLosUsuarios.filter(
            jid => !grupoAFK[jid]
        )

    /*
     * ==========================================
     * TEXTO DEL .N
     * ==========================================
     */

    const body =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        ''

    const text = body
        .replace(/^\.?n\s*/i, '')

    /*
     * ==========================================
     * MENSAJE CITADO
     * ==========================================
     */

    const quoted =
        m.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.quotedMessage

    /*
     * ==========================================
     * .N <TEXTO>
     * ==========================================
     */

    if (text.trim()) {
        return sock.sendMessage(
            from,
            {
                text: text + footer(),
                mentions
            },
            { quoted: m }
        )
    }

    /*
     * ==========================================
     * .N RESPONDIENDO A UN MENSAJE
     * ==========================================
     */

    if (quoted) {
        const type =
            Object.keys(quoted)[0]

        let msg = {}

        if (
            type === 'conversation' ||
            type === 'extendedTextMessage'
        ) {
            msg.text =
                (
                    quoted.conversation ||
                    quoted.extendedTextMessage?.text ||
                    ''
                ) + footer()
        } else {
            const mediaType =
                type.replace('Message', '')

            const stream =
                await downloadContentFromMessage(
                    quoted[type],
                    mediaType
                )

            let buffer = Buffer.from([])

            for await (const chunk of stream) {
                buffer = Buffer.concat([
                    buffer,
                    chunk
                ])
            }

            msg[mediaType] = buffer

            if (
                mediaType === 'image' ||
                mediaType === 'video' ||
                mediaType === 'document'
            ) {
                msg.caption =
                    (
                        quoted[type]?.caption ||
                        ''
                    ) + footer()
            }

            if (mediaType === 'audio') {
                msg.ptt =
                    quoted[type]?.ptt || false

                msg.mimetype =
                    quoted[type]?.mimetype ||
                    'audio/mp4'
            }

            if (mediaType === 'document') {
                msg.fileName =
                    quoted[type]?.fileName ||
                    'archivo'

                msg.mimetype =
                    quoted[type]?.mimetype
            }
        }

        /*
         * Menciones SIN usuarios AFK
         */
        msg.mentions = mentions

        return sock.sendMessage(
            from,
            msg,
            { quoted: m }
        )
    }

    /*
     * ==========================================
     * SIN TEXTO NI MENSAJE RESPONDIDO
     * ==========================================
     */

    await sock.sendMessage(from, {
        react: {
            text: '❌',
            key: m.key
        }
    })

    return sock.sendMessage(
        from,
        {
            text:
                '`❌ Usa .n <texto> o responde un mensaje`'
        },
        { quoted: m }
    )
}

handler.command = ['n']
handler.help = ['n <texto>']
handler.tags = ['grupo']
handler.menu = true

export default handler