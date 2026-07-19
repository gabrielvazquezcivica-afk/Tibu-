import fetch from 'node-fetch'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(
            from,
            {
                text:
`📦 APK

Busca y descarga aplicaciones APK.

Ejemplo:
.apk WhatsApp`
            },
            {
                quoted: m
            }
        )
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        const apiKey = 'sasuke'

        const search = await fetch(
            `https://api.evogb.org/search/apk?query=${encodeURIComponent(query)}&key=${apiKey}`
        )

        const data = await search.json()

        if (
            !data?.status ||
            !data?.data
        ) {

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
                        '❌ No encontré esa aplicación'
                },
                {
                    quoted: m
                }
            )
        }

        const app = data.data

        const caption =
`╭━━━〔 📦 𝐀𝐏𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 〕━━━⬣
┃ 📱 Nombre:
┃ ${app.name || 'Desconocido'}
┃
┃ 👨‍💻 Desarrollador:
┃ ${app.developer || app.author || 'No disponible'}
┃
┃ 📦 Tamaño:
┃ ${app.size || 'No disponible'}
┃
┃ 📅 Última actualización:
┃ ${app.lastUpdated || 'No disponible'}
┃
┃ 📄 Información:
┃ ${app.description || app.packageName || 'No disponible'}
┃
┃ ⚙️ Versión:
┃ ${app.version || 'No disponible'}
┃
┃ ⏳ Preparando APK...
╰━━━━━━━━━━━━━━━━⬣`

        await sock.sendMessage(
            from,
            {
                image: {
                    url:
                        app.icon ||
                        app.banner ||
                        app.image
                },
                caption
            },
            {
                quoted: m
            }
        )

        await sock.sendMessage(from, {
            react: {
                text: '📥',
                key: m.key
            }
        })

        const apk = await fetch(
            `https://api.delirius.store/download/apk?query=${encodeURIComponent(app.name)}`
        )

        const apkData = await apk.json()

        if (
            !apkData?.status ||
            !apkData?.data?.download
        ) {
            throw new Error(
                'No se pudo obtener el APK'
            )
        }

        await sock.sendMessage(
            from,
            {
                document: {
                    url:
                        apkData.data.download
                },
                mimetype:
                    'application/vnd.android.package-archive',
                fileName:
                    `${app.name}.apk`
            },
            {
                quoted: m
            }
        )

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'APK ERROR:',
            e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(
            from,
            {
                text:
                    `❌ ${e.message}`
            },
            {
                quoted: m
            }
        )
    }
}

handler.command = [
    'apk',
    'dapk',
    'modapk'
]

handler.help = [
    'apk <nombre>'
]

handler.tags = [
    'descargas'
]

handler.menu = true

export default handler