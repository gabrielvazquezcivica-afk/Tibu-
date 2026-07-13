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

Envía un enlace:

• Instagram
• Facebook
• Twitter / X
• Terabox

Ejemplo:
.dl https://...

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

        const key = 'sasuke'

        let endpoint = ''
        let tipo = ''

        if (
            url.includes('instagram.com') ||
            url.includes('instagr.am')
        ) {
            tipo = 'instagram'
            endpoint =
            `https://api.evogb.org/dl/instagram?url=${encodeURIComponent(url)}&key=${key}`
        }

        else if (
            url.includes('facebook.com') ||
            url.includes('fb.watch')
        ) {
            tipo = 'facebook'
            endpoint =
            `https://api.evogb.org/dl/facebook?url=${encodeURIComponent(url)}&key=${key}`
        }

        else if (
            url.includes('twitter.com') ||
            url.includes('x.com')
        ) {
            tipo = 'twitter'
            endpoint =
            `https://api.evogb.org/dl/twitter?url=${encodeURIComponent(url)}&key=${key}`
        }

        else if (
            url.includes('terabox') ||
            url.includes('1024tera') ||
            url.includes('terafiles')
        ) {
            tipo = 'terabox'
            endpoint =
            `https://api.evogb.org/dl/terabox?url=${encodeURIComponent(url)}&key=${key}`
        }

        else {
            return sock.sendMessage(from, {
                text:
'`❌ Plataforma no soportada`'
            }, { quoted: m })
        }

        const { data } = await axios.get(endpoint)

        let dl = ''
        let fileName = 'archivo'

        if (tipo === 'instagram') {
            dl = data?.data?.[0]?.url
        }

        if (tipo === 'facebook') {
            dl = data?.resultados?.[0]?.url
        }

        if (tipo === 'twitter') {
            dl = data?.data?.result?.[0]?.url
        }

        if (tipo === 'terabox') {

            const file = data?.data?.[0]

            dl =
                file?.dlink ||
                file?.url

            fileName =
                file?.server_filename ||
                'archivo'
        }

        if (!dl) {
            throw new Error(
                'No encontré enlace de descarga'
            )
        }

        if (
            fileName.endsWith('.apk')
        ) {

            await sock.sendMessage(from, {
                document: {
                    url: dl
                },
                fileName,
                mimetype:
                'application/vnd.android.package-archive'
            }, { quoted: m })

        } else {

            await sock.sendMessage(from, {
                video: {
                    url: dl
                },
                mimetype: 'video/mp4'
            }, { quoted: m })

        }

        await sock.sendMessage(from, {
            react: {
                text: '🔥',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'DL ERROR:',
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
`❌ Error al descargar

${e.response?.data?.message || e.message}`
        }, { quoted: m })
    }
}

handler.command = ['dl']
handler.help = ['dl <url>']
handler.tags = ['descargas']
handler.menu = true

export default handler