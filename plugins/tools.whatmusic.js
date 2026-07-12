import axios from 'axios'
import config from '../config.js'

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const query = args.join(' ').trim()

    if (!query) {
        return sock.sendMessage(from, {
            text:
`🎵 \`Escribe el nombre de una canción.\`

Ejemplo:
.whatmusic Dakiti

> ${config.BOT_NAME}`
        }, { quoted: m })
    }

    try {

        await sock.sendMessage(from, {
            react: {
                text: '🎵',
                key: m.key
            }
        })

        const { data } = await axios.get(
            `https://api.lempi.lat/search/lyrics?apikey=lem948&q=${encodeURIComponent(query)}`
        )

        if (!data?.status) {
            return sock.sendMessage(from, {
                text:
`❌ \`No encontré resultados.\`

> ${config.BOT_NAME}`
            }, { quoted: m })
        }

        const texto =
`🎵 *WHATMUSIC*

> 📝 Título:
${data.titulo}

> 🎤 Artista:
${data.artista}

> 📅 Lanzamiento:
${data.lanzamiento || 'Desconocido'}

> 🔗 Genius:
${data.url}

> 📄 Letra:

${data.letra.slice(0, 3500)}

> ${config.BOT_NAME}`

        await sock.sendMessage(from, {
            image: {
                url: data.imagen
            },
            caption: texto
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('WHATMUSIC ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text:
`❌ \`Error al buscar la canción.\`

> ${config.BOT_NAME}`
        }, { quoted: m })
    }
}

handler.command = ['whatmusic']
handler.help = ['whatmusic <canción>']
handler.tags = ['buscador']
handler.menu = true

export default handler