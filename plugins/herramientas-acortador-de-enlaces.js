import axios from 'axios'

let handler = {}

handler.run = async (sock, m, args) => {

    const from = m.key.remoteJid

    const targetUrl = args[0]

    if (
        !targetUrl ||
        !targetUrl.startsWith('http')
    ) {
        return sock.sendMessage(from, {
            text:
`🔗 ACORTADOR

Acorta enlaces fácilmente.

Ejemplo:
.short https://google.com`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🔗',
                key: m.key
            }
        })

        const api =
            Buffer.from(
                'aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL3Rvb2xzL3Nob3J0bGluaw==',
                'base64'
            ).toString('utf-8')

        const key =
            Buffer.from(
                'c2FzdWtl',
                'base64'
            ).toString('utf-8')

        const { data } = await axios.get(
            `${api}?url=${encodeURIComponent(targetUrl)}&key=${key}`
        )

        if (
            !data ||
            !data.status ||
            !data.shorturl
        ) {

            await sock.sendMessage(from, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return sock.sendMessage(from, {
                text: '❌ No fue posible acortar el enlace.'
            }, { quoted: m })
        }

        const texto =
`╭━━━〔 🔗 𝐒𝐇𝐎𝐑𝐓 〕━━━⬣
┃ 🚀 Enlace acortado
┃
┃ 🔗 URL corta:
┃ ${data.shorturl}
┃
┃ 📌 URL original:
┃ ${data.original}
┃
┃ ⏳ Duración:
┃ ${data.duration}
╰━━━━━━━━━━━━━━━━⬣`

        await sock.sendMessage(from, {
            text: texto
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log(
            'SHORT ERROR:',
            e.response?.data || e
        )

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: `❌ ${e.message}`
        }, { quoted: m })
    }
}

handler.command = ['short','acortar','shortlink']
handler.help = ['short <url>']
handler.tags = ['herramientas']
handler.menu = true

export default handler