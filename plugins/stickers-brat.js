
import axios from 'axios';

const API_KEY = 'evogb-R1Mofv5G';

const handler = {};

handler.run = async (sock, m, args = []) => {
    const from = m.key.remoteJid;
    const text = args.join(' ').trim();

    if (!text) {
        return sock.sendMessage(from, {
            text: '📝 `ESCRIBE EL TEXTO`\n\n> Ejemplo: .brat Hola mundo'
        }, { quoted: m });
    }

    try {
        await sock.sendMessage(from, {
            react: { text: '📝', key: m.key }
        });

        const response = await axios.get(
            'https://api.evogb.org/tools/brat',
            {
                params: {
                    key: API_KEY,
                    text,
                    animated: 'false'
                },
                timeout: 60000
            }
        );

        const data = response.data;

        if (!data?.status || !data?.result_url) {
            throw new Error('La API no devolvió result_url');
        }

        const imageResponse = await axios.get(data.result_url, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        const imageBuffer = Buffer.from(imageResponse.data);

        await sock.sendMessage(from, {
            image: imageBuffer,
            mimetype: 'image/png',
            caption: '🎨 Brat generado'
        }, { quoted: m });

        await sock.sendMessage(from, {
            react: { text: '✅', key: m.key }
        });

    } catch (error) {
        await sock.sendMessage(from, {
            react: { text: '❌', key: m.key }
        }).catch(() => {});

        await sock.sendMessage(from, {
            text: `❌ *NO SE PUDO GENERAR EL BRAT*\n\n> ${error.response?.data?.message || error.message}`
        }, { quoted: m }).catch(() => {});
    }
};

handler.command = ['brat'];
handler.help = ['brat <texto>'];
handler.tags = ['sticker'];
handler.menu = true;

export default handler;
