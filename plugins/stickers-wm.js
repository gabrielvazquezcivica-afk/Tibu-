import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.stickerMessage) {
        return sock.sendMessage(
            from,
            {
                text: '`🌊 Responde a un sticker con .wm`'
            },
            { quoted: m }
        )
    }

    const sticker = quoted.stickerMessage

    /*
     * ==========================================
     * DETECTAR TIPO DE STICKER
     * ==========================================
     */

    const esAnimado =
        sticker.isAnimated === true ||
        sticker.isAnimated === 'true'

    /*
     * Sticker animado = 🔥
     * Sticker normal  = ❤️
     */

    const reaccionTipo = esAnimado
        ? '🔥'
        : '❤️'

    /*
     * ==========================================
     * NOMBRE
     * ==========================================
     */

    let texto = args.join(' ').trim()

    if (!texto) {
        texto = m.pushName || 'WhatsApp'
    }

    let input
    let output

    try {

        /*
         * ==========================================
         * REACCIÓN SEGÚN EL TIPO
         * ==========================================
         */

        await sock.sendMessage(from, {
            react: {
                text: reaccionTipo,
                key: m.key
            }
        })

        /*
         * ==========================================
         * DESCARGAR STICKER
         * ==========================================
         */

        const stream = await downloadContentFromMessage(
            sticker,
            'sticker'
        )

        let buffer = Buffer.alloc(0)

        for await (const chunk of stream) {
            buffer = Buffer.concat([
                buffer,
                chunk
            ])
        }

        /*
         * ==========================================
         * ARCHIVOS TEMPORALES
         * ==========================================
         */

        const tmp = os.tmpdir()

        input = path.join(
            tmp,
            `wm_in_${Date.now()}.webp`
        )

        output = path.join(
            tmp,
            `wm_out_${Date.now()}.webp`
        )

        fs.writeFileSync(input, buffer)

        /*
         * ==========================================
         * CARGAR STICKER
         * ==========================================
         */

        const img = new webp.Image()

        await img.load(input)

        /*
         * ==========================================
         * DATOS DEL STICKER
         * ==========================================
         */

        const exifData = {
            'sticker-pack-id': `tibu-${Date.now()}`,

            // Nombre mostrado
            'sticker-pack-name': texto,

            // Sin publisher
            'sticker-pack-publisher': '',

            emojis: [
                esAnimado
                    ? '🔥'
                    : '❤️'
            ]
        }

        const json = Buffer.from(
            JSON.stringify(exifData),
            'utf-8'
        )

        /*
         * ==========================================
         * EXIF
         * ==========================================
         */

        const exif = Buffer.concat([

            Buffer.from([
                0x49, 0x49, 0x2A, 0x00,
                0x08, 0x00, 0x00, 0x00
            ]),

            Buffer.from([
                0x01, 0x00
            ]),

            Buffer.from([
                0x41, 0x57,
                0x07, 0x00
            ]),

            Buffer.from([
                json.length & 0xff,
                (json.length >> 8) & 0xff,
                (json.length >> 16) & 0xff,
                (json.length >> 24) & 0xff
            ]),

            Buffer.from([
                0x16, 0x00, 0x00, 0x00
            ]),

            json
        ])

        img.exif = exif

        await img.save(output)

        /*
         * ==========================================
         * ENVIAR STICKER
         * ==========================================
         */

        await sock.sendMessage(
            from,
            {
                sticker: fs.readFileSync(output)
            },
            { quoted: m }
        )

        /*
         * ==========================================
         * REACCIÓN FINAL
         * ==========================================
         */

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'WM ERROR:',
            e?.message || e
        )

        await sock.sendMessage(
            from,
            {
                text: '`❌ Error al cambiar watermark`'
            },
            { quoted: m }
        )

    } finally {

        /*
         * ==========================================
         * LIMPIAR ARCHIVOS
         * ==========================================
         */

        try {
            if (input) {
                fs.unlinkSync(input)
            }
        } catch {}

        try {
            if (output) {
                fs.unlinkSync(output)
            }
        } catch {}
    }
}

handler.command = ['wm']
handler.help = ['wm <texto>']
handler.tags = ['stickers']
handler.menu = true

export default handler