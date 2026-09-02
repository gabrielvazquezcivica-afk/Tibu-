import { downloadContentFromMessage } from '@whiskeysockets/baileys'

function obtenerCitado(m) {
    const msg = m.message

    if (!msg) return null

    const tipos = [
        msg.extendedTextMessage,
        msg.imageMessage,
        msg.videoMessage,
        msg.documentMessage,
        msg.buttonsResponseMessage,
        msg.listResponseMessage
    ]

    for (const tipo of tipos) {
        if (tipo?.contextInfo?.quotedMessage) {
            return tipo.contextInfo.quotedMessage
        }
    }

    return null
}

function obtenerViewOnce(message) {
    if (!message) return null

    // ==========================================
    // FORMATO DIRECTO: imageMessage + viewOnce
    // ==========================================

    if (
        message.imageMessage &&
        message.imageMessage.viewOnce === true
    ) {
        return {
            tipo: 'image',
            media: message.imageMessage
        }
    }

    if (
        message.videoMessage &&
        message.videoMessage.viewOnce === true
    ) {
        return {
            tipo: 'video',
            media: message.videoMessage
        }
    }

    // ==========================================
    // FORMATOS viewOnceMessage
    // ==========================================

    if (message.viewOnceMessage?.message) {
        return obtenerViewOnce(
            message.viewOnceMessage.message
        )
    }

    if (message.viewOnceMessageV2?.message) {
        return obtenerViewOnce(
            message.viewOnceMessageV2.message
        )
    }

    if (message.viewOnceMessageV2Extension?.message) {
        return obtenerViewOnce(
            message.viewOnceMessageV2Extension.message
        )
    }

    // ==========================================
    // EPHEMERAL
    // ==========================================

    if (message.ephemeralMessage?.message) {
        return obtenerViewOnce(
            message.ephemeralMessage.message
        )
    }

    // ==========================================
    // DOCUMENT WITH CAPTION
    // ==========================================

    if (message.documentWithCaptionMessage?.message) {
        return obtenerViewOnce(
            message.documentWithCaptionMessage.message
        )
    }

    // ==========================================
    // POR SI EL PROPIO OBJETO YA ES LA MEDIA
    // ==========================================

    if (
        message.imageMessage?.viewOnce === true
    ) {
        return {
            tipo: 'image',
            media: message.imageMessage
        }
    }

    if (
        message.videoMessage?.viewOnce === true
    ) {
        return {
            tipo: 'video',
            media: message.videoMessage
        }
    }

    if (
        message.viewOnce === true &&
        message.mimetype?.startsWith('image/')
    ) {
        return {
            tipo: 'image',
            media: message
        }
    }

    if (
        message.viewOnce === true &&
        message.mimetype?.startsWith('video/')
    ) {
        return {
            tipo: 'video',
            media: message
        }
    }

    return null
}

async function descargarMedia(media, tipo) {

    const stream = await downloadContentFromMessage(
        media,
        tipo
    )

    const chunks = []

    for await (const chunk of stream) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}

let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    // ==========================================
    // OBTENER MENSAJE CITADO
    // ==========================================

    const quoted = obtenerCitado(m)

    // DEBUG
    console.log(
        'QUOTED:',
        JSON.stringify(quoted, null, 2)
    )

    if (!quoted) {

        return sock.sendMessage(
            from,
            {
                text:
`👁️ *VER UNA VEZ*

Responde directamente a una foto o video de *ver una vez* usando:

> *.ver*

🦈 *Tibu Bot*`
            },
            { quoted: m }
        )
    }

    // ==========================================
    // DETECTAR VIEW ONCE
    // ==========================================

    const viewOnce = obtenerViewOnce(quoted)

    // DEBUG
    console.log(
        'VIEW ONCE:',
        JSON.stringify(viewOnce, null, 2)
    )

    if (!viewOnce) {

        return sock.sendMessage(
            from,
            {
                text:
`❌ *No detecté una foto o video de ver una vez.*

> Responde directamente al mensaje de ver una vez.

🦈 *Tibu Bot*`
            },
            { quoted: m }
        )
    }

    try {

        const tipo = viewOnce.tipo
        const media = viewOnce.media

        const caption = media.caption || ''

        console.log(
            `📥 Descargando ${tipo} de ver una vez...`
        )

        // ==========================================
        // DESCARGAR
        // ==========================================

        const buffer = await descargarMedia(
            media,
            tipo
        )

        console.log(
            `📤 Enviando ${tipo} recuperado...`
        )

        // ==========================================
        // FOTO
        // ==========================================

        if (tipo === 'image') {

            await sock.sendMessage(
                from,
                {
                    image: buffer,
                    caption: caption || undefined
                },
                { quoted: m }
            )
        }

        // ==========================================
        // VIDEO
        // ==========================================

        else if (tipo === 'video') {

            await sock.sendMessage(
                from,
                {
                    video: buffer,
                    caption: caption || undefined
                },
                { quoted: m }
            )
        }

        console.log(
            '✅ Ver una vez recuperado correctamente'
        )

    } catch (error) {

        console.log(
            '❌ VER ERROR:',
            error?.message || error
        )

        await sock.sendMessage(
            from,
            {
                text:
`❌ *No pude recuperar el archivo.*

Puede que el archivo ya no esté disponible o WhatsApp haya impedido su descarga.

🦈 *Tibu Bot*`
            },
            { quoted: m }
        )
    }
}

handler.command = ['ver']
handler.help = ['ver']
handler.tags = ['herramientas']
handler.menu = true

export default handler