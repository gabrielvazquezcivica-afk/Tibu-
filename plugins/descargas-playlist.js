let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // 🔍 Busca SOLO playlists en YouTube
        let result = await yts(text, { type: 'playlist' })
        let ytres = result.playlists

        if (ytres.length === 0) throw 'No se encontraron listas de reproducción 😿'

        let listSections = []
        for (let pl of ytres) {
            listSections.push({
                title: `${htki} 📻 𝙋𝙇𝘼𝙔𝙇𝙄𝙎𝙏 ${htka}`,
                rows: [
                    {
                        header: '🎵 𝘼𝙐𝘿𝙄𝙊 𝙏𝙊𝘿𝙊',
                        title: "",
                        description: `${pl.title}\n📊 ${pl.videoCount} canciones`,
                        id: `${usedPrefix}ytplmp3 ${pl.url}`
                    },
                    {
                        header: '🎬 𝙑𝙄𝘿𝙀𝙊 𝙏𝙊𝘿𝙊',
                        title: "",
                        description: `${pl.title}\n📊 ${pl.videoCount} videos`,
                        id: `${usedPrefix}ytplmp4 ${pl.url}`
                    },
                    {
                        header: '📄 𝘼𝙐𝘿𝙄𝙊 𝘿𝙊𝘾',
                        title: "",
                        description: `${pl.title}\n📊 ${pl.videoCount} archivos`,
                        id: `${usedPrefix}ytplmp3doc ${pl.url}`
                    },
                    {
                        header: '📄 𝙑𝙄𝘿𝙀𝙊 𝘿𝙊𝘾',
                        title: "",
                        description: `${pl.title}\n📊 ${pl.videoCount} archivos`,
                        id: `${usedPrefix}ytplmp4doc ${pl.url}`
                    }
                ]
            })
        }

        // 📋 Envía el menú interactivo
        await conn.sendList(m.chat, 
            `${htki} *📻 𝙍𝙀𝙎𝙐𝙇𝙏𝘼𝘿𝙊𝙎 𝙋𝙇𝘼𝙔𝙇𝙄𝙎𝙏* ${htka}\n`, 
            `\n🔎 Búsqueda: ${text}`, 
            `𝗩 𝗘 𝗥`, 
            listSections, 
            fkontak
        )
    } catch (e) {
        await conn.sendButton(m.chat, 
            `\n${wm}`, 
            lenguajeGB['smsMalError3']() + '#report ' + usedPrefix + command, 
            null, 
            [[lenguajeGB.smsMensError1(), `#reporte ${lenguajeGB['smsMensError2']()} *${usedPrefix + command}*`]], 
            null, 
            null, 
            m
        )
        console.log('❌ Error Playlist:', e)
    }
}


handler.command = ['playlist', 'ytplaylist', 'listareproduccion']
handler.help = ['playlist <nombre']
handler.tags = ['descargas']
handler.menu = true

export default handler
