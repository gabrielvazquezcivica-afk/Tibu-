import axios from 'axios'

const API_KEY = 'evogb-R1Mofv5G'

const handler = {}

handler.run = async (sock, m, args = []) => {
  const from = m.key.remoteJid
  const text = args.join(' ').trim()

  if (!text) {
    return sock.sendMessage(from, {
      text: '📝 `ESCRIBE EL TEXTO`\n\n> Ejemplo: .brat Hola mundo'
    }, { quoted: m })
  }

  if (!API_KEY || API_KEY === 'PEGA_AQUI_TU_API_KEY_DE_EVOGB') {
    return sock.sendMessage(from, {
      text: '❌ `CONFIGURA TU API KEY EN brat.js`'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '📝', key: m.key }
    })

    const response = await axios.get(
      'https://api.evogb.org/tools/brat',
      {
        params: {
          key: API_KEY,
          text: text,
          animated: 'false'
        },
        timeout: 60000
      }
    )

    const data = response.data

    if (!data?.status || !data?.result_url) {
      throw new Error('La API no devolvió result_url')
    }

    const image = await axios.get(data.result_url, {
      responseType: 'arraybuffer',
      timeout: 60000
    })

    await sock.sendMessage(from, {
      sticker: Buffer.from(image.data)
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {
    console.error('[BRAT]', error.response?.data || error.message)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    const mensaje =
      error.response?.status === 401
        ? '❌ `LA API KEY FUE RECHAZADA`'
        : '❌ `NO SE PUDO GENERAR EL BRAT`'

    await sock.sendMessage(from, {
      text: mensaje
    }, { quoted: m }).catch(() => {})
  }
}

handler.command = ['brat']
handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.menu = true

export default handler