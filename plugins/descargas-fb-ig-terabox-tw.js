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
                text: '`❌ Plataforma no soportada`'
            }, { quoted: m })

        }

        const { data } = await axios.get(endpoint)

        let dl = ''
        let fileName = 'archivo'

        let titulo = 'Desconocido'
        let autor = 'Desconocido'
        let duracion = 'Desconocida'

        if (tipo === 'instagram') {

            dl = data?.data?.[0]?.url

            titulo =
                data?.data?.[0]?.title ||
                'Video de Instagram'

        }

        if (tipo === 'facebook') {

            dl =
                data?.resultados?.[0]?.url

            titulo =
                data?.resultados?.[0]?.title ||
                'Video de Facebook'

        }

        if (tipo === 'twitter') {

            dl =
                data?.data?.result?.[0]?.url

            titulo =
                data?.data?.desc ||
                data?.data?.title ||
                'Video de Twitter'

        }

        if (tipo === 'terabox') {

            const file =
                data?.data?.[0]

            dl =
                file?.dlink ||
                file?.url

            fileName =
                file?.server_filename ||
                'archivo'

            titulo = fileName

        }

        if (!dl) {

            throw new Error(
                'No encontré enlace de descarga'
            )

        }

        await sock.sendMessage(from, {
            text:

tipo === 'instagram'

?

`📥 \`INSTAGRAM\`

> 📝 Título: ${titulo}
> 👤 Autor: ${autor}
> ⏱️ Duración: ${duracion}
> 🌐 Plataforma: Instagram
> ⚡ Descarga iniciada

> ${config.BOT_NAME}`

:

tipo === 'facebook'

?

`📥 \`FACEBOOK\`

> 📝 Título: ${titulo}
> 👤 Autor: ${autor}
> ⏱️ Duración: ${duracion}
> 🌐 Plataforma: Facebook
> ⚡ Descarga iniciada

> ${config.BOT_NAME}`

:

tipo === 'twitter'

?

`📥 \`TWITTER\`

> 📝 Título: ${titulo}
> 👤 Autor: ${autor}
> ⏱️ Duración: ${duracion}
> 🌐 Plataforma: Twitter/X
> ⚡ Descarga iniciada

> ${config.BOT_NAME}`

:

`📥 \`TERABOX\`

> 📄 Archivo: ${fileName}
> 🌐 Plataforma: Terabox
> ⚡ Descarga iniciada

> ${config.BOT_NAME}`

        }, { quoted: m })

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

        }

        else {

            await sock.sendMessage(from, {

                video: {
                    url: dl
                },

                mimetype: 'video/mp4',

                caption:

`📥 \`${tipo.toUpperCase()}\`

> 📝 Título: ${titulo}
> 🌐 Plataforma: ${tipo}
> ⚡ Descargado correctamente

> ${config.BOT_NAME}`

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

`❌ \`ERROR\`

> ${e.response?.data?.message || e.message}

> ${config.BOT_NAME}`

        }, { quoted: m })

    }

}

handler.command = ['dl']
handler.help = ['dl <url>']
handler.tags = ['descargas']
handler.menu = true

export default handler