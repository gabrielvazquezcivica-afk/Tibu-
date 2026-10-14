const API_URL = 'https://api.evogb.org/search/pinterestv3'
const API_KEY = process.env.EVOGB_API_KEY || 'TU_API_KEY'

const handler = {}

handler.run = async (sock, m, args = []) => {
    const from = m.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(from, {
            text: '📌 Escribe algo para buscar en Pinterest.\n\nEjemplo:\n.pin gatos'
        }, { quoted: m })
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '🔎', key: m.key }
        })

        const url = new URL(API_URL)
        url.searchParams.set('key', API_KEY)
        url.searchParams.set('query', query)

        const response = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(45000)
        })

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data?.status || !Array.isArray(data?.data?.images)) {
            throw new Error('La API devolvió una respuesta inválida.')
        }

        const resultados = data.data.images
            .filter(item => item?.images?.['736x'] || item?.images?.orig)
            .slice(0, 5)

        if (!resultados.length) {
            return sock.sendMessage(from, {
                text: `❌ No encontré imágenes para: *${query}*`
            }, { quoted: m })
        }

        await sock.sendMessage(from, {
            text: `📌 *PINTEREST*\n\n🔎 Búsqueda: ${query}\n🖼️ Resultados: ${resultados.length}`
        }, { quoted: m })

        for (const item of resultados) {
            const imageUrl = item.images['736x'] || item.images.orig

            try {
                await sock.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: item.title || ''
                }, { quoted: m })
            } catch (error) {
                console.error('Error enviando imagen:', error.message)
            }
        }

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        })

    } catch (error) {
        console.error('ERROR PINTEREST:', error)

        await sock.sendMessage(from, {
            text: `❌ Error al buscar en Pinterest.\n\n${error.message}`
        }, { quoted: m })
    }
}

handler.command = ['pin', 'pinterest']
handler.help = ['pin <texto>']
handler.tags = ['herramientas']
handler.menu = true

export default handler