import config from '../config.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = {}

handler.run = async (sock, m) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    // Solo grupos
    if (!from?.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`🌊 Este comando solo funciona en grupos`'
        }, { quoted: m })
    }

    try {
        // Obtener información del grupo
        const metadata = await sock.groupMetadata(from)

        // Verificar administrador
        const admin = metadata.participants.find(
            p => p.id === sender || p.jid === sender
        )

        if (!admin?.admin) {
            return sock.sendMessage(from, {
                text: '`🚫 Solo los admins pueden cambiar la foto del grupo`'
            }, { quoted: m })
        }

        // Obtener mensaje citado
        const contextInfo =
            m.message?.extendedTextMessage?.contextInfo

        const quotedMessage = contextInfo?.quotedMessage

        // Buscar imagen citada
        let imageMessage = quotedMessage?.imageMessage

        // Compatibilidad con mensajes viewOnce
        if (!imageMessage) {
            imageMessage =
                quotedMessage?.viewOnceMessage?.message?.imageMessage
        }

        if (!imageMessage) {
            return sock.sendMessage(from, {
                text:
`🌊 𝐒𝐄𝐓 𝐅𝐎𝐓𝐎 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎

📸 Responde directamente a una imagen con:

.setfotogp

⚓ Solo los administradores pueden utilizar este comando.`
            }, { quoted: m })
        }

        // Reacción mientras procesa
        await sock.sendMessage(from, {
            react: {
                text: '⏳',
                key: m.key
            }
        })

        // Descargar imagen usando Baileys
        const stream = await downloadContentFromMessage(
            imageMessage,
            'image'
        )

        const chunks = []

        for await (const chunk of stream) {
            chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)

        if (!buffer.length) {
            throw new Error('La imagen está vacía')
        }

        // Cambiar foto del grupo
        await sock.updateProfilePicture(
            from,
            buffer
        )

        // Éxito
        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`🌊 𝐅𝐎𝐓𝐎 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐀

🖼️ La foto del grupo fue cambiada correctamente.

⚓ Actualización realizada por:
@${sender.split('@')[0]}

> ${config.BOT_NAME}`,
            mentions: [sender]
        }, { quoted: m })

    } catch (e) {
        console.log('SETFOTOGP ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ 𝐍𝐎 𝐒𝐄 𝐏𝐔𝐃𝐎 𝐂𝐀𝐌𝐁𝐈𝐀𝐑 𝐋𝐀 𝐅𝐎𝐓𝐎

Puede que:
• El bot no sea administrador.
• La imagen no pueda descargarse.
• WhatsApp haya rechazado la actualización.

⚠️ Revisa la consola para ver el error exacto.`
        }, { quoted: m })
    }
}

handler.command = ['setfotogp']
handler.help = ['setfotogp <responde a una foto>']
handler.tags = ['grupo']
handler.menu = true

export default handler