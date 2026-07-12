import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const url = args.join(' ').trim()

    if (!url) {
        return sock.sendMessage(from, {
            text:
`📥 \`DOWNLOADER\`

✏️ Ingresa un enlace válido.

Ejemplos:
.ig https://instagram.com/...
.fb https://facebook.com/...
.tw https://x.com/...
.terabox https://terabox.com/...

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '⏳',
                key: m.key
            }
        })

        const key = Buffer
            .from('ZWt1c2Fz', 'base64')
            .toString('utf-8')
            .split('')
            .reverse()
            .join('')

        const cmd = m.body
            ?.slice(1)
            .split(' ')[0]
            .toLowerCase()

        let endpoint = ''

        if (
            cmd === 'ig' ||
            cmd === 'instagram'
        ) {
            endpoint =
                `https://api.evogb.org/dl/instagram?url=${encodeURIComponent(url)}&key=${key}`
        }

        else if (
            cmd === 'fb' ||
            cmd === 'facebook'
        ) {
            endpoint =
                `https://api.evogb.org/dl/facebook?url=${encodeURIComponent(url)}&key=${key}`
        }

        else if (
            cmd === 'tw' ||
            cmd === 'twitter' ||
            cmd === 'twdl'
        ) {
            endpoint =
                `https://api.evogb.org/dl/twitter?url=${encodeURIComponent(url)}&key=${key}`
        }

        else if (
            cmd === 'tera' ||
            cmd === 'terabox'
        ) {
            endpoint =
                `https://api.evogb.org/dl/terabox?url=${encodeURIComponent(url)}&key=${key}`
        }

        const { data } = await axios.get(endpoint)

        if (!data?.status) {
            throw new Error(
                data?.message ||
                'Sin respuesta'
            )
        }

        let downloadUrl = ''
        let fileName = 'archivo'
        let isDocument = false

        if (
            cmd === 'ig' ||
            cmd === 'instagram'
        ) {
            downloadUrl =
                data?.data?.[0]?.url
        }

        else if (
            cmd === 'fb' ||
            cmd === 'facebook'
        ) {
            downloadUrl =
                data?.resultados?.[0]?.url
        }

        else if (
            cmd === 'tw' ||
            cmd === 'twitter' ||
            cmd === 'twdl'
        ) {
            downloadUrl =
                data?.data?.result?.[0]?.url
        }

        else if (
            cmd === 'tera' ||
            cmd === 'terabox'
        ) {

            const file =
                data?.data?.[0]

            downloadUrl =
                file?.dlink ||
                file?.url

            fileName =
                file?.server_filename ||
                'archivo'

            if (
                fileName.endsWith('.apk')
            ) {
                isDocument = true
            }
        }

        if (!downloadUrl) {
            throw new Error(
                'No encontré enlace de descarga'
            )
        }

        if (isDocument) {

            await sock.sendMessage(from, {
                document: {
                    url: downloadUrl
                },
                fileName,
                mimetype:
                    'application/vnd.android.package-archive'
            }, {
                quoted: m
            })

        } else {

            await sock.sendMessage(from, {
                video: {
                    url: downloadUrl
                },
                mimetype: 'video/mp4'
            }, {
                quoted: m
            })

        }

        await sock.sendMessage(from, {
            react: {
                text: '🔥',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'DOWNLOADER ERROR:',
            e.response?.data || e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al descargar\`

${e.response?.data?.message || e.message}

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = [
    'ig',
    'instagram',
    'fb',
    'facebook',
    'tw',
    'twitter',
    'twdl',
    'tera',
    'terabox'
]

handler.help = [
    'ig <url>',
    'fb <url>',
    'tw <url>',
    'terabox <url>'
]

handler.tags = ['descargas']
handler.menu = true

export default handler