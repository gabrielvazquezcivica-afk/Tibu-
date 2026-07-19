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

        const search =
            await fetch(
                `https://api.evogb.org/search/apk?query=${encodeURIComponent(query)}&key=${apiKey}`
            )

        const data =
            await search.json()

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

        await sock.sendMessage(
            from,
            {
                image: {
                    url: app.banner
                },
                caption:
`╭━━━〔 📦 𝐀𝐏𝐊 〕━━━⬣
┃ 📱 Nombre:
┃ ${app.name}
┃
┃ ⚖️ Tamaño:
┃ ${app.size}
┃
┃ 📅 Actualizado:
┃ ${app.lastUpdated}
┃
┃ ⏳ Preparando APK...
╰━━━━━━━━━━━━━━━━⬣`
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

        const apk =
            await fetch(
                `https://api.delirius.store/download/apk?query=${encodeURIComponent(app.name)}`
            )

        const apkData =
            await apk.json()

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