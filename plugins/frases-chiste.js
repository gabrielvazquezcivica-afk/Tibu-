const chistes = [

    `💀 Mi vida tiene tanto potencial...
lástima que nunca inicia sesión.`,

    `😂 Mi familia me enseñó que todo problema tiene solución.
Todavía estoy esperando que me expliquen cuál.`,

    `💀 Mi suerte no es mala.
Simplemente tiene una relación personal conmigo.`,

    `😂 —¿Qué haces cuando la vida te da la espalda?
—Le reviso los bolsillos.`,

    `💀 Mi futuro está asegurado.
No sé dónde, pero está asegurado.`,

    `😂 Mi sentido común salió del grupo
sin avisar.`,

    `💀 Tengo tanta mala suerte que hasta mis errores
me salen mal.`,

    `😂 —¿Tienes un propósito en la vida?
—Sí.
—¿Cuál?
—Llegar al final de la semana.`,

    `💀 Mi cerebro convierte cualquier problema pequeño
en una producción de Netflix de 8 temporadas.`,

    `😂 Cuando alguien dice "peor no puede ponerse":
Mi vida:
"¿Quieres apostar?"`,

    `💀 Mi confianza en mí mismo funciona como el saldo:
desaparece sin explicación.`,

    `😂 Mi familia:
"En esta casa nadie es normal."
Yo:
"Por fin algo en lo que destacamos."`,

    `💀 La vida me puso obstáculos.
Yo puse otro encima por si acaso.`,

    `😂 —¿Cómo manejas el estrés?
—No lo manejo.
Él maneja mi vida.`,

    `💀 Mi cerebro tiene una función increíble:
recordar lo que quería olvidar
y olvidar lo que necesitaba recordar.`,

    `😂 Mi futuro profesional:
"Se solicita experiencia."
Yo:
"¿Y si les ofrezco entusiasmo?"
"NO."`,

    `💀 Cada problema que soluciono desbloquea
dos problemas nuevos.
Excelente sistema.`,

    `😂 —¿Por qué estás tan tranquilo?
—Porque ya pasé la etapa de preocuparme.
Ahora estoy esperando el desastre.`,

    `💀 Mi vida no necesita enemigos.
Con mis decisiones es suficiente.`,

    `😂 Cuando todo sale bien durante más de 24 horas:
"Esto parece sospechoso."`,

    `💀 Tengo una habilidad especial:
hacer que una decisión de cinco segundos
tenga consecuencias durante meses.`,

    `😂 —¿Qué tal tu estabilidad?
—¿La emocional o la financiera?
—Cualquiera.
—Siguiente pregunta.`,

    `💀 Mi memoria selectiva es increíble:
olvido tareas,
pero recuerdo una vergüenza de primaria perfectamente.`,

    `😂 Mi cerebro antes de dormir:
"Hoy descansamos."
También mi cerebro:
"¿Recuerdas aquella vez que dijiste algo raro en 2018?"`,

    `💀 La vida adulta es un DLC
que nadie pidió.`,

    `😂 —¿Tienes experiencia bajo presión?
—Sí.
—¿Dónde?
—Cuando veo que queda 1% de batería.`,

    `💀 Mi economía está tan estable
que lleva meses en el mismo lugar: abajo.`,

    `😂 Me dijeron "sé positivo".
Ahora soy positivo de que todo va a salir raro.`,

    `💀 Mi motivación no murió.
Simplemente decidió no participar.`,

    `😂 Cuando alguien me dice "te entiendo":
Yo:
"Ni yo me entiendo."`,

    `💀 Mi vida tiene un narrador,
pero hasta él dice:
"Esto no estaba en el guion."`,

    `😂 —¿Qué haces cuando tienes miedo?
—Me hago el valiente.
—¿Funciona?
—No, pero queda bonito.`,

    `💀 Mi cerebro tiene más pestañas abiertas
que mi navegador.`,

    `😂 Mi plan B ya está cansado.
Lleva años haciendo horas extra.`,

    `💀 Tengo tanta mala suerte
que si me cae una estrella fugaz,
seguro era basura espacial.`,

    `😂 —¿Eres de los que aprende de sus errores?
—Sí.
—¿Y por qué los repites?
—Educación continua.`,

    `💀 Mi paciencia tiene modo ahorro de energía:
se apaga cuando más la necesitas.`,

    `😂 Cuando alguien dice "relájate":
Mi cerebro:
"Excelente, ahora preocupémonos con más intensidad."`,

    `💀 Mi vida parece un examen sorpresa
y olvidé estudiar mi propia vida.`,

    `😂 —¿Qué esperas de la vida?
—Que al menos me avise antes de actualizarse.`,

    `💀 Mis problemas tienen algo bonito:
nunca vienen solos.`,

    `😂 Mi cerebro después de tomar una decisión:
"¿Y si escogíamos la otra?"`,

    `💀 Mi vida social tiene modo avión permanente.`,

    `😂 Cuando finalmente entiendo lo que está pasando:
ya pasó.`,

    `💀 Tengo tanta experiencia sobreviviendo a mis decisiones
que ya podría dar cursos.`,

    `😂 —¿Cuál es tu estrategia?
—Improvisar.
—¿Y si falla?
—Improvisar mejor.`,

    `💀 Mi futuro me manda señales.
Yo las dejo en visto.`,

    `😂 Cuando alguien pregunta "¿qué podría salir mal?"
Mi historial de decisiones:
"Tenemos tiempo."`,

    `💀 Mi vida es como una contraseña:
cada vez más complicada
y nadie sabe cuál era.`,

    `😂 —¿Estás bien?
—Sí.
—¿Seguro?
—No arruines mi actuación.`,

    `💀 Si mis decisiones fueran inversiones,
ya estaría debiendo dinero.`,

    `😂 Mi cerebro:
"Tenemos que madurar."
Yo:
"Sí."
Mi cerebro:
"¿Empezamos mañana?"
Yo:
"Trato hecho."`,

    `💀 No necesito que la vida me dé una lección.
Ya tengo suficiente tarea.`,

    `😂 Mi estabilidad depende de cosas como:
"¿Contestó el mensaje?"`,

    `💀 La vida me dio una oportunidad.
No especificó que fuera buena.`,

    `😂 —¿Qué haces cuando todo se complica?
—Actúo como si supiera lo que hago.
—¿Y funciona?
—La gente todavía no se ha dado cuenta.`

]

let handler = {}

handler.run = async (sock, m) => {

    const from = m.key.remoteJid

    try {

        const chiste = chistes[Math.floor(Math.random() * chistes.length)]

        await sock.sendMessage(
            from,
            {
                react: {
                    text: '😂',
                    key: m.key
                }
            }
        )

        await sock.sendMessage(
            from,
            {
                text: chiste
            },
            {
                quoted: m
            }
        )

    } catch (e) {

        console.log('ERROR CHISTE:', e)

        await sock.sendMessage(
            from,
            {
                text: '`❌ Ocurrió un error al generar el chiste.`'
            },
            {
                quoted: m
            }
        )

    }
}

handler.command = ['chiste', 'chistes']
handler.help = ['chiste']
handler.tags = ['frases']
handler.menu = true

export default handler