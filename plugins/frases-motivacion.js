const motivaciones = [

    `🔥 No importa qué tan lento avances,
lo importante es que no te detengas.
Cada paso cuenta.`,

    `💪 Los días difíciles no duran para siempre.
Sigue adelante, porque todavía quedan
muchas cosas buenas por vivir.`,

    `🌟 No necesitas ser perfecto.
Solo necesitas seguir intentando
y aprender de cada caída.`,

    `🚀 Confía en tu proceso.
Lo que hoy parece imposible
mañana puede convertirse en realidad.`,

    `🧠 No compares tu camino con el de los demás.
Cada persona tiene su propio ritmo,
sus propias metas y su propia historia.`,

    `⚡ Si fallaste, no significa que perdiste.
Significa que encontraste una forma
que no funcionó. Inténtalo de nuevo.`,

    `🌅 Cada día es una nueva oportunidad
para empezar de nuevo,
corregir errores y acercarte a tus sueños.`,

    `🏆 Las grandes cosas no suceden de un día para otro.
La constancia de hoy construye
los resultados de mañana.`,

    `💫 Aunque ahora no veas resultados,
sigue trabajando por aquello que quieres.
Tu esfuerzo no es en vano.`,

    `🔥 No dejes que un mal día
te haga pensar que tienes una mala vida.
Mañana puede ser diferente.`,

    `🌊 Aprende a avanzar incluso cuando
el camino no sea fácil.
Las olas también enseñan a navegar.`,

    `✨ Recuerda todo lo que ya has superado.
Si pudiste con aquello,
también podrás con lo que viene.`,

    `💎 Tu valor no depende de tus errores.
Equivocarte no te hace menos,
te da una oportunidad para aprender.`,

    `🌱 Todo crecimiento comienza
con un pequeño paso.
No tengas miedo de comenzar desde cero.`,

    `☀️ No necesitas tener todo resuelto hoy.
Haz lo mejor que puedas con lo que tienes
y sigue avanzando poco a poco.`,

    `🔥 No te rindas solo porque todavía no ves resultados.
A veces el progreso ocurre en silencio
antes de hacerse visible.`,

    `🌟 Lo que hoy parece un pequeño esfuerzo
puede convertirse mañana en algo enorme.
Sigue construyendo.`,

    `💪 Cada vez que eliges continuar
demuestras que eres más fuerte
que las dificultades del momento.`,

    `🚀 Empieza con lo que tienes,
desde donde estás
y avanza paso a paso.`,

    `🌱 No tengas prisa por llegar.
Disfruta también del proceso
de convertirte en quien quieres ser.`,

    `⚡ Tu pasado puede enseñarte,
pero no tiene que decidir
hacia dónde vas.`,

    `🏆 Los resultados llegan con paciencia,
constancia y ganas de seguir
incluso cuando cuesta.`,

    `🌅 Un día complicado no define
todo tu camino.
Siempre puedes volver a intentarlo mañana.`,

    `💎 No subestimes los pequeños avances.
Un paso pequeño sigue siendo
un paso hacia adelante.`,

    `🔥 Cuando tengas dudas,
recuerda por qué empezaste
y qué quieres conseguir.`,

    `🌊 No necesitas correr.
A veces avanzar despacio
también significa avanzar.`,

    `✨ Cree en las posibilidades
que todavía no puedes ver.
Tu historia aún tiene muchas páginas.`,

    `🧠 Cada error puede convertirse
en una lección si decides aprender
en lugar de quedarte ahí.`,

    `☀️ Levántate, respira
y vuelve a intentarlo.
No todo tiene que salir bien a la primera.`,

    `🚀 Tu futuro no se construye
con lo que deseas hacer,
sino con lo que decides hacer hoy.`,

    `🌟 No esperes a sentirte preparado.
A veces comenzar es justamente
lo que te prepara.`,

    `💪 Si algo te importa,
dale tiempo.
Las cosas importantes suelen necesitar paciencia.`,

    `🔥 No permitas que un fracaso
te convenza de que no puedes.
Un resultado no define tu capacidad.`,

    `🌱 Todo comienzo parece pequeño.
Incluso los grandes logros
alguna vez fueron solo una idea.`,

    `💫 Sigue aprendiendo,
sigue creciendo
y sigue intentando.
Tu esfuerzo de hoy importa.`,

    `🏆 La verdadera victoria
también está en no abandonar
cuando las cosas se ponen difíciles.`,

    `🌅 Cada mañana trae una oportunidad
para hacer algo diferente
y acercarte un poco más a tus metas.`,

    `⚡ No necesitas demostrarle nada a todos.
Concéntrate en crecer
y superarte a ti mismo.`,

    `💎 Ten paciencia contigo.
Aprender, mejorar y crecer
toma tiempo.`,

    `🌊 Habrá días buenos y días difíciles.
Lo importante es seguir navegando
sin perder de vista tu destino.`,

    `🔥 Puede que hoy no estés
donde quieres estar,
pero eso no significa que no estés avanzando.`,

    `🌟 Cada pequeño esfuerzo que haces hoy
es una inversión en la persona
que quieres ser mañana.`,

    `💪 No necesitas hacerlo todo de una vez.
Concéntrate en el siguiente paso
y continúa desde ahí.`,

    `🚀 Los sueños necesitan acción.
Empieza pequeño, mantente constante
y deja que el tiempo haga su parte.`,

    `☀️ Incluso después de una noche difícil,
el día vuelve a comenzar.
Siempre existe una nueva oportunidad.`,

    `💫 No abandones una meta
solo porque el camino se volvió difícil.
Los caminos importantes también tienen obstáculos.`,

    `🌱 Permítete aprender,
equivocarte y volver a empezar.
Crecer también significa tener paciencia contigo.`,

    `🏆 No midas tu progreso solamente
por lo que te falta.
Mira también todo lo que ya has conseguido.`,

    `🔥 Sigue adelante.
Quizá estés más cerca de conseguirlo
de lo que imaginas.`

]

const handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    try {

        const mensaje =
            motivaciones[
                Math.floor(
                    Math.random() * motivaciones.length
                )
            ]

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '🔥',
                    key: m.key
                }
            }
        )

        const texto = [
            '`🔥 MOTIVACIÓN`',
            '',
            mensaje,
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
            'ERROR MOTIVACION:',
            e
        )

        await sock.sendMessage(
            from,
            {
                text:
                    '`❌ Ocurrió un error al generar la motivación.`'
            },
            { quoted: m }
        )
    }
}

handler.command = [
    'motivacion',
    'motivar'
]

handler.help = [
    'motivacion'
]

handler.tags = [
    'frases'
]

handler.menu = true

export default handler