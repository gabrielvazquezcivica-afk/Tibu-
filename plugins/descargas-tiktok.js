import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const cmd =
        (m.body || '')
        .trim()
        .split(/\s+/)[0]
        .replace(/^\./, '')
        .toLowerCase()

    let query = args.join(' ').trim()

    if (!query) {
        const quoted =
            m.message?.extendedTextMessage?.contextInfo?.quotedMessage

        query =
            quoted?.conversation ||
            quoted?.extendedTextMessage?.text ||
            ''
    }

    if (!query) {
        return sock.sendMessage(from, {
            text:
'`🌊 DOWNLOADER TIBU`\n\n' +
'> Ingresa un enlace válido.\n\n' +
'> .ig <url>\n' +
'> .fb <url>\n' +
'> .tk <url>\n' +
'> .tw <url>\n' +
'> .tera <url>\n\n' +
`> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: { text: '⏳', key: m.key }
    })

    try {

        const key = Buffer
            .from('ZWt1c2Fz', 'base64')
            .toString('utf-8')
            .split('')
            .reverse()
            .join('')

        let endpoint = ''

        if (/^(ig|instagram)$/i.test(cmd)) {
            endpoint = `https://api.evogb.org/dl/instagram?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/^(fb|facebook)$/i.test(cmd)) {
            endpoint = `https://api.evogb.org/dl/facebook?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/^(tk|tiktok)$/i.test(cmd)) {
            endpoint = `https://api.evogb.org/dl/tiktok?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/^(tw|twitter|twdl)$/i.test(cmd)) {
            endpoint = `https://api.evogb.org/dl/twitter?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/^(tera|terabox)$/i.test(cmd)) {
            endpoint = `https://api.evogb.org/dl/terabox?url=${encodeURIComponent(query)}&key=${key}`
        }

        if (!endpoint) {
            throw new Error('Comando no reconocido')
        }

        console.log('ENDPOINT:', endpoint)

        const { data } = await axios.get(endpoint)

        console.log(data)


            await sock.sendMessage(from, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return sock.sendMessage(from, {
                text:
'`❌ No se pudo procesar el enlace.`\n\n' +
`> ${config.BOT_NAME}`
            }, { quoted: m })
        }

        let downloadUrl = ''
        let fileName = 'archivo'
        let isDocument = false

        if (/^(ig|instagram)$/i.test(command)) {
            downloadUrl = data?.data?.[0]?.url
        }

        else if (/^(fb|facebook)$/i.test(command)) {
            downloadUrl = data?.resultados?.[0]?.url
        }

        else if (/^(tk|tiktok)$/i.test(command)) {
            downloadUrl =
                data?.data?.dl ||
                data?.data?.url
        }

        else if (/^(tw|twitter|twdl)$/i.test(command)) {
            downloadUrl =
                data?.data?.result?.[0]?.url
        }

        else if (/^(tera|terabox)$/i.test(command)) {

            const file =
                data?.data?.[0]

            downloadUrl =
                file?.dlink ||
                file?.url

            fileName =
                file?.server_filename ||
                'archivo.apk'

            if (
                fileName.endsWith('.apk') ||
                file?.path?.includes('.apk')
            ) {
                isDocument = true
            }
        }

        if (!downloadUrl) {

            await sock.sendMessage(from, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return sock.sendMessage(from, {
                text:
'`❌ No encontré un enlace de descarga válido.`\n\n' +
`> ${config.BOT_NAME}`
            }, { quoted: m })
        }

        const info =
'`🌊 TIBU DOWNLOADER`\n\n' +
`> Plataforma: ${command.toUpperCase()}\n` +
'> Estado: Descarga completada\n\n' +
`> ${config.BOT_NAME}`

        if (isDocument) {

            await sock.sendMessage(from, {
                document: {
                    url: downloadUrl
                },
                fileName,
                mimetype:
'application/vnd.android.package-archive',
                caption: info
            }, {
                quoted: m
            })

        } else {

            await sock.sendMessage(from, {
                video: {
                    url: downloadUrl
                },
                mimetype: 'video/mp4',
                caption: info
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
            e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
'`❌ Error de conexión con la API.`\n\n' +
`> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = [
    'ig',
    'instagram',
    'fb',
    'facebook',
    'tt',
    'tiktok',
    'tw',
    'twitter',
    'twdl',
    'tera',
    'terabox'
]

handler.help = [
    'ig <url>',
    'fb <url>',
    'tt <url>',
    'tw <url>',
    'tera <url>'
]

handler.tags = ['descargas']
handler.menu = true

export default handler