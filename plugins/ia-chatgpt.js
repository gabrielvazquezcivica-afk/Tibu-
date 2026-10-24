import axios from 'axios'

const API_URL = 'https://api-faa.my.id/faa/gemini-ai'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const text = args.join(' ').trim()

  if (!text) {
    return sock.sendMessage(from, {
      text:
        '🤖 *GEMINI AI — TIBU BOT*\n\n' +
        'Escribe una pregunta o mensaje para la IA.\n\n' +
        '*Ejemplo:*\n' +
        '.gemini ¿Cuánto es 25 × 8?\n' +
        '.ia ¿Cómo puedo aprender JavaScript?'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '🤔', key: m.key }
    })

    const response = await axios.get(API_URL, {
      params: { text },
      timeout: 60000
    })

    const data = response.data
    const answer = data?.result

    if (!data?.status || typeof answer !== 'string' || !answer.trim()) {
      throw new Error('La API no devolvió una respuesta válida')
    }

    await sock.sendMessage(from, {
      text:
        `🤖 *GEMINI AI*\n\n` +
        `${answer.trim()}\n\n` +
        `> ✨ Powered by Tibu Bot`
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    let message = '❌ *GEMINI NO PUDO RESPONDER.*'

    if (error.code === 'ECONNABORTED') {
      message += '\n\nLa solicitud tardó demasiado. Inténtalo de nuevo.'
    } else if (error.response?.status === 429) {
      message += '\n\nHay demasiadas solicitudes. Espera un momento.'
    } else if (!error.response) {
      message += '\n\nNo se pudo conectar con la API.'
    }

    await sock.sendMessage(from, {
      text: message
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['gemini', 'ia']
handler.help = ['gemini <pregunta>', 'ia <pregunta>']
handler.tags = ['ia']
handler.menu = true

export default handler