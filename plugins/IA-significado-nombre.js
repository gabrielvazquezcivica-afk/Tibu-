import axios from 'axios'

const API_URL = 'https://api-faa.my.id/faa/arti-nama'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const nombre = args.join(' ').trim()

  if (!nombre) {
    return sock.sendMessage(from, {
      text: 'Escribe un nombre para consultar su significado.\n\nEjemplo: .nombre Zahid'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '🔎', key: m.key }
    })

    const { data } = await axios.get(API_URL, {
      params: { nama: nombre },
      timeout: 45000,
      headers: {
        Accept: 'application/json'
      }
    })

    const resultado = data?.resultado || data?.result || data

    const estado = data?.estado ?? data?.status

    const nombreResultado =
      resultado?.nombre ||
      resultado?.name ||
      data?.nombre ||
      nombre

    const significado =
      resultado?.significado ||
      resultado?.meaning ||
      data?.significado

    const nota =
      resultado?.nota ||
      data?.nota ||
      ''

    if (estado === false || estado === 'false' || !significado) {
      throw new Error('La API no devolvió el significado')
    }

    const mensaje =
      '`significado de tu nombre`\n\n' +
      `> Nombre: *${nombreResultado}*\n` +
      `> Significado: *${String(significado).trim()}*` +
      (nota ? `\n\n${String(nota).trim()}` : '')

    await sock.sendMessage(from, {
      text: mensaje
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    let detalle = 'No se recibió una respuesta válida de la API.'

    if (error.response) {
      detalle = `La API respondió con el código HTTP ${error.response.status}.`
    } else if (error.code === 'ECONNABORTED') {
      detalle = 'La solicitud agotó el tiempo de espera.'
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      detalle = 'No se pudo conectar con el servidor de la API.'
    } else if (error.message) {
      detalle = error.message
    }

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    await sock.sendMessage(from, {
      text: `❌ *No se pudo consultar el significado del nombre.*\n\n> Motivo: ${detalle}`
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['nombre', 'artinombre', 'significadonombre']
handler.help = ['nombre <nombre>']
handler.tags = ['ia']
handler.menu = true

export default handler