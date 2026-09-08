import config from '../config.js'
import fs from 'fs'
import path from 'path'

const dbPath = path.join(
    process.cwd(),
    'database',
    'db.json'
)

const afkPath = path.join(
    process.cwd(),
    'database',
    'afk.json'
)

function leerDB() {
    try {

        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(
                dbPath,
                JSON.stringify({}, null, 2)
            )
        }

        return JSON.parse(
            fs.readFileSync(dbPath, 'utf8')
        )

    } catch {
        return {}
    }
}

function leerAFK() {
    try {

        if (!fs.existsSync(afkPath)) {
            fs.writeFileSync(
                afkPath,
                JSON.stringify({}, null, 2)
            )
        }

        return JSON.parse(
            fs.readFileSync(afkPath, 'utf8')
        )

    } catch {
        return {}
    }
}

function limpiarJid(jid = '') {

    return String(jid)
        .replace(/:\d+@/, '@')
        .trim()
}

function obtenerTag(grupo) {

    const db = leerDB()

    return db[grupo] || '🦈'
}


/*
 * ==========================================
 * 🌎 BANDERA SEGÚN PREFIJO
 * ==========================================
 */

function obtenerBandera(numero = '') {

    const prefijos = {

        // 🇲🇽 México
        '52': '🇲🇽',

        // 🇺🇸 Estados Unidos / 🇨🇦 Canadá
        '1': '🇺🇸',

        // 🇨🇴 Colombia
        '57': '🇨🇴',

        // 🇦🇷 Argentina
        '54': '🇦🇷',

        // 🇧🇷 Brasil
        '55': '🇧🇷',

        // 🇨🇱 Chile
        '56': '🇨🇱',

        // 🇵🇪 Perú
        '51': '🇵🇪',

        // 🇻🇪 Venezuela
        '58': '🇻🇪',

        // 🇪🇨 Ecuador
        '593': '🇪🇨',

        // 🇬🇹 Guatemala
        '502': '🇬🇹',

        // 🇸🇻 El Salvador
        '503': '🇸🇻',

        // 🇭🇳 Honduras
        '504': '🇭🇳',

        // 🇳🇮 Nicaragua
        '505': '🇳🇮',

        // 🇨🇷 Costa Rica
        '506': '🇨🇷',

        // 🇵🇦 Panamá
        '507': '🇵🇦',

        // 🇧🇴 Bolivia
        '591': '🇧🇴',

        // 🇵🇾 Paraguay
        '595': '🇵🇾',

        // 🇺🇾 Uruguay
        '598': '🇺🇾',

        // 🇪🇸 España
        '34': '🇪🇸',

        // 🇫🇷 Francia
        '33': '🇫🇷',

        // 🇮🇹 Italia
        '39': '🇮🇹',

        // 🇬🇧 Reino Unido
        '44': '🇬🇧',

        // 🇩🇪 Alemania
        '49': '🇩🇪',

        // 🇵🇹 Portugal
        '351': '🇵🇹',

        // 🇮🇳 India
        '91': '🇮🇳',

        // 🇯🇵 Japón
        '81': '🇯🇵',

        // 🇰🇷 Corea del Sur
        '82': '🇰🇷',

        // 🇨🇳 China
        '86': '🇨🇳',

        // 🇷🇺 Rusia
        '7': '🇷🇺',

        // 🇹🇷 Turquía
        '90': '🇹🇷',

        // 🇮🇱 Israel
        '972': '🇮🇱',

        // 🇦🇪 Emiratos Árabes
        '971': '🇦🇪',

        // 🇸🇦 Arabia Saudita
        '966': '🇸🇦',

        // 🇪🇬 Egipto
        '20': '🇪🇬',

        // 🇿🇦 Sudáfrica
        '27': '🇿🇦',

        // 🇦🇺 Australia
        '61': '🇦🇺',

        // 🇳🇿 Nueva Zelanda
        '64': '🇳🇿'
    }

    /*
     * Revisar primero prefijos de 3 dígitos
     */
    const ordenados =
        Object.keys(prefijos)
            .sort((a, b) => b.length - a.length)

    for (const prefijo of ordenados) {

        if (numero.startsWith(prefijo)) {
            return prefijos[prefijo]
        }
    }

    return '🌎'
}


let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    const sender = limpiarJid(
        m.key.participant ||
        m.key.remoteJid
    )


    /*
     * ==========================================
     * 🚫 SOLO GRUPOS
     * ==========================================
     */

    if (!from?.endsWith('@g.us')) {

        await sock.sendMessage(from, {
            react: {
                text: '🌊',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text: '`🌊 Solo funciona en grupos`'
            },
            { quoted: m }
        )
    }


    /*
     * ==========================================
     * 📋 INFORMACIÓN DEL GRUPO
     * ==========================================
     */

    let metadata

    try {

        metadata =
            await sock.groupMetadata(from)

    } catch {

        await sock.sendMessage(from, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text:
                    '`❌ No pude leer el grupo`'
            },
            { quoted: m }
        )
    }


    const participantes =
        metadata.participants || []


    /*
     * ==========================================
     * 👑 COMPROBAR ADMIN
     * ==========================================
     */

    const userInfo =
        participantes.find(
            p =>
                limpiarJid(p.id) === sender ||
                limpiarJid(p.jid) === sender
        )


    const esAdmin =
        userInfo?.admin === 'admin' ||
        userInfo?.admin === 'superadmin'


    if (!esAdmin) {

        await sock.sendMessage(from, {
            react: {
                text: '🚫',
                key: m.key
            }
        })

        return sock.sendMessage(
            from,
            {
                text:
                    '`🚫 Solo administradores pueden usarlo`'
            },
            { quoted: m }
        )
    }


    /*
     * ==========================================
     * 🌅 REACCIÓN
     * ==========================================
     */

    await sock.sendMessage(from, {
        react: {
            text: '🌅',
            key: m.key
        }
    })


    const etiqueta =
        obtenerTag(from)


    /*
     * ==========================================
     * 💤 LEER AFK
     * ==========================================
     */

    const afkDB =
        leerAFK()

    const afkGrupo =
        afkDB[from] || {}


    let texto = ''

    let mentions = []


    /*
     * ==========================================
     * 👥 MENCIONAR PARTICIPANTES
     * ==========================================
     */

    for (const p of participantes) {

        const jid =
            limpiarJid(
                p.jid || p.id
            )

        if (!jid) continue


        /*
         * 🚫 NO MENCIONAR AFK
         */

        if (afkGrupo[jid]) {
            continue
        }


        const numero =
            jid.split('@')[0]


        /*
         * 🌎 OBTENER BANDERA
         */

        const bandera =
            obtenerBandera(numero)


        mentions.push(jid)


        /*
         * 🦈 DISEÑO DE CADA MENCIÓN
         */

        texto +=
            `┃ ${bandera} ${etiqueta} @${numero}\n`
    }


    /*
     * ==========================================
     * 🌊 MENSAJE FINAL
     * ==========================================
     */

    const mensaje =
`╭━━━〔 🌊 𝐓𝐎𝐃𝐎𝐒 〕━━━╮
┃
┃ 🦈 ${metadata.subject}
┃ 👥 ${participantes.length} miembros
┃
┣━━━━━━━━━━━━━━━━━━
${texto}┃
╰━━━━━━━━━━━━━━━━━━╯

       ⚓ 𝐍𝐢𝐧𝐠𝐮́𝐧 𝐭𝐢𝐛𝐮𝐫𝐨́𝐧
          𝐧𝐚𝐯𝐞𝐠𝐚 𝐬𝐨𝐥𝐨 🌊`


    /*
     * ==========================================
     * 📤 ENVIAR
     * ==========================================
     */

    await sock.sendMessage(
        from,
        {
            text: mensaje,
            mentions
        },
        { quoted: m }
    )
}


handler.command = [
    'todos',
    'tagall'
]

handler.help = [
    'todos'
]

handler.tags = [
    'grupo'
]

handler.menu = true

export default handler