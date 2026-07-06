import fetch from 'node-fetch'

function decode(str) {
    return Buffer.from(str, 'base64').toString('utf8')
}

let handler = {}

handler.run = async (sock, m, args) => {
    const from = m.key.remoteJid

    const text = args.join(' ').trim()

    if (!text) {
        return sock.sendMessage(from, {
            text:
                '`🎵 Ingresa el nombre o link de Spotify`\n\n' +
                'Ejemplo:\n' +
                '`.spotify Bad Bunny`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '🎧',
            key: m.key
        }
    })

    try {
        const api = decode('aHR0cHM6Ly9hcGkuZXZvZ2Iub3Jn')
        const key = decode('c2FzdWtl')

        let trackUrl = text

        const isUrl = /^(https?:\/\/)?(open\.spotify\.com|spotify\.link)\/.+$/i.test(text)

        if (!isUrl) {
            const res = await fetch(
                `${api}/search/spotify?query=${encodeURIComponent(text)}&key=${key}`
            )

            const json = await res.json()

            if (!json.status || !json.result?.length) {
                await sock.sendMessage(from, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return sock.sendMessage(from, {
                    text: '`❌ No encontré esa canción.`'
                }, { quoted: m })
            }

            trackUrl = json.result[0].link
        }

        const res = await fetch(
            `${api}/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=${key}`
        )

        const json = await res.json()

        if (!json.status) {
            throw new Error('No se pudo descargar.')
        }

        const info = json.data

        const caption =
`🎧 *SPOTIFY*

🎵 *Título:* ${info.name}
👤 *Artista:* ${info.artist}
💿 *Álbum:* ${info.album}
⏱️ *Duración:* ${info.duration}

> 🦈 ${info.artist}`

        await sock.sendMessage(from, {
            image: {
                url: info.imageHD || info.image
            },
            caption
        }, { quoted: m })

        await sock.sendMessage(from, {
            audio: {
                url: info.url
            },
            mimetype: 'audio/mpeg',
            fileName: `${info.name}.mp3`,
            ptt: false
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '🔥',
                key: m.key
            }
        })

    } catch (e) {
        console.log('SPOTIFY ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: '`❌ Error al descargar la canción.`'
        }, { quoted: m })
    }
}

handler.command = ['spotify']
handler.help = ['spotify <nombre>']
handler.tags = ['descargas']
handler.menu = true

export default handler