const poemas = [
    `🌹 A veces el corazón calla,
pero los ojos saben hablar,
y aunque los labios no digan nada,
hay sentimientos difíciles de ocultar.`,

    `🌙 La noche guarda secretos
que el día nunca podrá contar,
y entre estrellas y pensamientos
hay recuerdos que vuelven a brillar.`,

    `✨ No hace falta tener mucho
para encontrar felicidad,
a veces basta una sonrisa,
un abrazo y sinceridad.`,

    `🌊 Como las olas del mar,
los recuerdos vienen y van,
pero hay momentos especiales
que nunca se olvidarán.`,

    `🌸 Hay personas que llegan
sin saber cuánto cambiarán,
y dejan pequeñas huellas
que el tiempo no borrará.`,

    `☀️ Después de cada tormenta
siempre vuelve a salir el sol,
y después de los días difíciles
también vuelve la ilusión.`,

    `🖤 A veces perder también enseña,
a veces alejarse es crecer,
y algunas despedidas duelen
porque nos enseñan a querer.`,

    `🌌 Mira siempre hacia las estrellas,
aunque el camino sea incierto,
porque hasta en las noches más oscuras
puede existir un cielo lleno de sueños.`,

    `🍂 El tiempo cambia las historias,
las personas y los caminos,
pero algunos recuerdos permanecen
aunque cambien nuestros destinos.`,

    `💫 Que nunca te falten sueños,
ni razones para continuar,
porque cada pequeño paso
te puede acercar a donde quieres llegar.`
]

const handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    try {

        const poema =
            poemas[
                Math.floor(
                    Math.random() * poemas.length
                )
            ]

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '📜',
                    key: m.key
                }
            }
        )

        const texto = [
            '`📜 POEMA`',
            '',
            poema,
            '',
            '> 🌊 TIBU'
        ].join('\n')

        await sock.sendMessage(
            from,
            {
                text: texto
            },
            { quoted: m }
        )

    } catch (e) {

        console.error(
            'ERROR POEMA:',
            e
        )

        await sock.sendMessage(
            from,
            {
                text:
                    '`❌ Ocurrió un error al generar el poema.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'poema',
    'poemas'
]

handler.help = [
    'poema'
]

handler.tags = [
    'frases'
]

handler.menu = true

export default handler