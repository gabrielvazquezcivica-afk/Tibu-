const API_URL = 'https://api.lempi.lat/s/pin'
const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

const handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid
    const query = args.join(' ').trim()

    if (!query) {
        await sock.sendMessage(
            from,
            {
                text: '📌 Escribe algo para buscar en Pinterest.\n\nEjemplo:\n.pin gatos'
            },
            { quoted: m }
        )
        return
    }

    try {
        // Reacción de búsqueda
        await sock.sendMessage(from, {
            react: {
                text: '🔎',
                key: m.key
            }
        })

        const url = `${API_URL}?q=${encodeURIComponent(query)}&limit=5&apikey=${API_KEY}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`API respondió con HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data?.status || !Array.isArray(data?.results) || data.results.length === 0) {
            await sock.sendMessage(
                from,
                {
                    text: `❌ No encontré resultados para: *${query}*`
                },
                { quoted: m }
            )
            return
        }

        const resultados = data.results
            .filter(item => item?.descarga)
            .slice(0, 5)

        if (resultados.length === 0) {
            await sock.sendMessage(
                from,
                {
                    text: '❌ No se encontraron imágenes disponibles.'
                },
                { quoted: m }
            )
            return
        }

        // Primero manda el texto de la búsqueda
        await sock.sendMessage(
            from,
            {
                text: `📌 *Búsqueda en Pinterest*\n\n🔎 ${query}\n\n🖼️ Resultados: ${resultados.length}`
            },
            { quoted: m }
        )

        // Después manda solamente las imágenes
        for (const item of resultados) {
            try {
                await sock.sendMessage(
                    from,
                    {
                        image: {
                            url: item.descarga
                        }
                    }
                )
            } catch (imageError) {
                console.error('Error enviando imagen:', imageError)
            }
        }

        // Reacción final
        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (error) {
        console.error('ERROR PINTEREST:', error)

        await sock.sendMessage(
            from,
            {
                text: `❌ Ocurrió un error al buscar en Pinterest.\n\n> ${error.message}`
            },
            { quoted: m }
        )
    }
}

handler.command = ['pin', 'pinterest']
handler.help = ['pin <texto>']
handler.tags = ['herramientas']
handler.menu = true

export default handler