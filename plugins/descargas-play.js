import axios from 'axios'
import yts from 'yt-search'

const API_KEY = 'lem_87eb6b2f8d1fd1a413de398cf37608cf36b68691'

const handler = {}

handler.run = async (sock, m, args) => {
  const query = args.join(' ').trim()

  if (!query) {  
    return sock.sendMessage(  
      m.key.remoteJid,  
      {  
        text: `🎵 \`Escribe el nombre de la canción.\`\n\n> Ejemplo: .play IMU`
      },  
      { quoted: m }  
    )  
  }  

  const from = m.key.remoteJid  

  try {  
    await sock.sendMessage(from, {  
      react: { text: '⏳', key: m.key }  
    })  

    const search = await yts(query)  

    if (!search.videos?.length) {  
      return sock.sendMessage(  
        from,  
        { text: `❌ \`No encontré resultados para esa búsqueda.\`` },  
        { quoted: m }  
      )  
    }  

    const video = search.videos[0]  

    // 📄 INFO + PORTADA DE LA CANCIÓN
    await sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: `
╭───────────────────────╮
│      🎵  REPRODUCCIÓN
╰───────────────────────╯

 📀 Título:  \`${video.title}\`
 👤 Artista: \`${video.author.name}\`
 ⏱️ Duración:\` ${video.duration}\`
 👁️ Vistas:  \`${video.views.toLocaleString()}\`
 📅 Fecha:   \`${video.uploadDate || 'Desconocida'}\`

🔗 ${video.url}

▸ \`Cargando audio...\`
      `,
      quoted: m
    })

    // ⬇️ DESCARGAR CON LEMPI
    const apiUrl =  
        `https://api.lempi.lat/dl/yta` +  
        `?url=${encodeURIComponent(video.url)}` +  
        `&apikey=${API_KEY}`  

    const response = await axios.get(apiUrl, { timeout: 60000 })  
    const data = response.data  

    if (!data?.status) {  
      console.log('LEMPi PLAY:', data)  
      return sock.sendMessage(  
        from,  
        { text: `❌ \`La API no pudo descargar esta canción.\`` },  
        { quoted: m }  
      )  
    }  

    const audioUrl = data?.datos?.url  

    if (!audioUrl) {  
      console.log('RESPUESTA SIN AUDIO:', data)  
      return sock.sendMessage(  
        from,  
        { text: `❌ \`La API no devolvió el archivo de audio.\`` },  
        { quoted: m }  
      )  
    }  

    // 📥 DESCARGAR Y ENVIAR AUDIO
    const audio = await axios.get(audioUrl, {  
      responseType: 'arraybuffer',  
      timeout: 60000  
    })  

    await sock.sendMessage(  
      from,  
      {  
        audio: Buffer.from(audio.data),  
        mimetype: 'audio/mp4',  
        fileName: `${video.title}.m4a`,  
        ptt: false  
      },  
      { quoted: m }  
    )  

    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (error) {  
    console.error('PLAY ERROR:', error)  
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })  
    await sock.sendMessage(  
      from,  
      { text: `❌ \`No se pudo descargar la música. Intenta nuevamente.\`` },  
      { quoted: m }  
    )  
  }
}

handler.command = ['play', 'mp3', 'musica']
handler.help = ['play <canción>']
handler.tags = ['descargas']
handler.menu = true

export default handler
