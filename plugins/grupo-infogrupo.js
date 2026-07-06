import fs from 'fs'
import path from 'path'

const rutaWelcome = path.join(process.cwd(), 'database', 'welcome.json')
const rutaAntilink = path.join(process.cwd(), 'database', 'antilink.json')
const rutaModoAdmin = path.join(process.cwd(), 'database', 'modoadmin.json')

function leerDB(ruta) {
    try {
        if (!fs.existsSync(ruta)) return {}
        return JSON.parse(fs.readFileSync(ruta, 'utf8'))
    } catch {
        return {}
    }
}

let handler = {}

handler.run = async (sock, m, args, { isAdmin }) => {
    const from = m.key.remoteJid

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '`❌ Este comando solo funciona en grupos.`'
        }, { quoted: m })
    }

    const sender = m.key.participant || m.key.remoteJid

    if (!(await isAdmin(sock, from, sender))) {
        await sock.sendMessage(from, {
            react: {
                text: '🚫',
                key: m.key
            }
        })

        return sock.sendMessage(from, {
            text: '`🚫 Solo los administradores pueden usar este comando.`'
        }, { quoted: m })
    }

    await sock.sendMessage(from, {
        react: {
            text: '📊',
            key: m.key
        }
    })

    try {

        const metadata = await sock.groupMetadata(from)

        const welcome = leerDB(rutaWelcome)
        const antilink = leerDB(rutaAntilink)
        const modoadmin = leerDB(rutaModoAdmin)

        const creador = metadata.owner
            ? `@${metadata.owner.split('@')[0]}`
            : 'Desconocido'

        const texto =
`╭━━━━━━━━━━━━━━━━━━━━━━⬣
┃      🌊 𝗜𝗡𝗙𝗢 𝗗𝗘𝗟 𝗠𝗔𝗥 🌊
┣━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 🦈 𝗚𝗿𝘂𝗽𝗼
┃ ⤷ ${metadata.subject}
┃
┃ 👥 𝗧𝗿𝗶𝗽𝘂𝗹𝗮𝗰𝗶ó𝗻
┃ ⤷ ${metadata.participants.length} miembros
┃
┣━━━━━━━━━━━━━━━━━━━━━━⬣
┃ ⚓ 𝗦𝗶𝘀𝘁𝗲𝗺𝗮𝘀
┃
┃ 👋 Welcome
┃ ${welcome[from] ? '🟢 Activado' : '🔴 Desactivado'}
┃
┃ 🔗 Antilink
┃ ${antilink[from] ? '🟢 Activado' : '🔴 Desactivado'}
┃
┃ 🛡️ Modo Admin
┃ ${modoadmin[from] ? '🟢 Activado' : '🔴 Desactivado'}
┃
┣━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 👑 𝗖𝗮𝗽𝗶𝘁𝗮́𝗻 𝗱𝗲𝗹 𝗼𝗰𝗲́𝗮𝗻𝗼
┃ ⤷ ${creador}
┃
╰━━━━━━━━━━━━━━━━━━━━━━⬣`

        let imagen

        try {
            imagen = await sock.profilePictureUrl(from, 'image')
        } catch {
            imagen = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
        }

        await sock.sendMessage(from, {
            image: { url: imagen },
            caption: texto,
            mentions: metadata.owner ? [metadata.owner] : []
        }, { quoted: m })

        await sock.sendMessage(from, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {

        console.log('INFOGRUPO ERROR:', e)

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        await sock.sendMessage(from, {
            text: '`❌ No pude obtener la información del grupo.`'
        }, { quoted: m })
    }
}

handler.command = ['infogrupo']
handler.help = ['infogrupo']
handler.tags = ['grupo']
handler.menu = true

export default handler