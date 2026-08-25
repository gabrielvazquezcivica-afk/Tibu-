import fetch from 'node-fetch'

const API_KEY = 'TU_API_KEY'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    let numero = args[0]?.replace(/\D/g, '')

    // También permite responder a un mensaje
    if (!numero) {
        const context =
            m.message?.extendedTextMessage?.contextInfo

        const participante = context?.participant

        if (participante) {
            numero = participante.split('@')[0]
        }
    }

    if (!numero) {
        return sock.sendMessage(from, {
            text:
`🔎 *BAN CHECK*

📱 Escribe un número para comprobarlo.

Ejemplo:
.bancheck 18549995761

También puedes responder al mensaje de una persona con:
.bancheck`
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '🔎',
            key: m.key
        }
    })

    try {
        const url =
            `https://api.lempi.lat/tools/wabancheck?number=${encodeURIComponent(numero)}&lang=es&apikey=${API_KEY}`

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()

        if (
            !data?.status ||
            !data?.resultado?.data
        ) {
            throw new Error(
                data?.mensaje || 'Respuesta inválida de la API'
            )
        }

        const resultado = data.resultado
        const info = resultado.data

        const baneado = info.isBanned
        const necesitaWA = info.isNeedOfficialWa

        let estado

        if (baneado) {
            estado = '🔴 *BANEADO*'
        } else {
            estado = '🟢 *NO BANEADO*'
        }

        let oficial

        if (necesitaWA) {
            oficial = '⚠️ Requiere WhatsApp oficial'
        } else {
            oficial = '✅ No requiere WhatsApp oficial'
        }

        const texto =
`╭──────────────⬣
│ 🔎 𝐁𝐀𝐍 𝐂𝐇𝐄𝐂𝐊
├──────────────
│ 📱 Número: +${resultado.number}
│
│ 🚨 Estado: ${estado}
│
│ 📲 WhatsApp:
│ ${oficial}
│
│ 👤 API: ${resultado.creator}
╰──────────────⬣`

        await sock.sendMessage(from, {
            text: texto
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: baneado ? '🔴' : '✅',
                key: m.key
            }
        })

    } catch (e) {
        console.log('BANCHECK ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ *BAN CHECK*

No se pudo comprobar el número.

> ${e.message || 'Error desconocido'}`
        }, { quoted: m })
    }
}

handler.command = ['bancheck', 'wabancheck']
handler.help = ['bancheck <número>']
handler.tags = ['tools']
handler.menu = true

export default handler