import type { MegaEtapa } from "@/types/mega-diagnostic"

export const modulo0PropositoBHAG: MegaEtapa = {
  id: "modulo0",
  titulo: "MÓDULO 0: PROPÓSITO DE VIDA Y BHAG",
  descripcion:
    "Identifica lo que realmente te motiva en tu vida personal, define tu BHAG (Big Hairy Audacious Goal) y alinea tu negocio con ese objetivo.",
  desbloquea: "etapa1", // Desbloquea el Diagnóstico Inicial
  questions: [
    // Módulo 0 se trata como una "etapa" con preguntas directas
    // Submódulo 0.1: Propósito de vida y motivación profunda
    {
      id: "m0s1q1",
      pregunta: "¿Qué te mueve realmente en la vida? (elige máximo 3)",
      ponderacionPregunta: 1, // Ponderación general, el análisis será más cualitativo
      tipo: "multiple",
      opciones: [
        { id: "o1", text: "Aprender cosas nuevas constantemente", ponderacion: 1, emoji: "🧠" },
        { id: "o2", text: "Generar riqueza y seguridad financiera", ponderacion: 1, emoji: "💰" },
        { id: "o3", text: "Viajar por el mundo y conocer culturas", ponderacion: 1, emoji: "✈️" },
        { id: "o4", text: "Pasar tiempo con mi familia", ponderacion: 1, emoji: "👨‍👩‍👧‍👦" },
        { id: "o5", text: "Sentirme libre y en paz", ponderacion: 1, emoji: "🧘‍♂️" },
        { id: "o6", text: "Lograr algo grande que me dé reconocimiento", ponderacion: 1, emoji: "🏆" },
        { id: "o7", text: "Aportar valor real al mundo", ponderacion: 1, emoji: "🌱" },
        { id: "o8", text: "Tener tiempo para mis pasiones o hobbies", ponderacion: 1, emoji: "🎨" },
      ],
    },
    {
      id: "m0s1q2",
      pregunta: "¿Qué pasaría si tuvieras éxito total en tu negocio?",
      ponderacionPregunta: 1,
      tipo: "single",
      opciones: [
        { id: "o1", text: "Podría retirarme joven y disfrutar la vida", ponderacion: 1 },
        { id: "o2", text: "Viajaría por el mundo sin preocuparme por dinero", ponderacion: 1 },
        { id: "o3", text: "Escalaría mi empresa para hacer historia", ponderacion: 1 },
        { id: "o4", text: "Tendría tiempo para mí y mi familia", ponderacion: 1 },
        { id: "o5", text: "No sé, solo quiero dejar de preocuparme por el dinero", ponderacion: 1 },
      ],
    },
    {
      id: "m0s1q3",
      pregunta: "¿Cuál de estas frases resuena más contigo?",
      ponderacionPregunta: 1,
      tipo: "single",
      opciones: [
        { id: "o1", text: "“Quiero ser libre, no rico.”", ponderacion: 1 },
        { id: "o2", text: "“Quiero ser rico para después ser libre.”", ponderacion: 1 },
        { id: "o3", text: "“Quiero dejar una huella imborrable.”", ponderacion: 1 },
        { id: "o4", text: "“Quiero vivir tranquilo y feliz.”", ponderacion: 1 },
      ],
    },
    // Submódulo 0.2: Definición de tu BHAG
    {
      id: "m0s2q1", // Anteriormente m0s2q4
      pregunta: "¿Cuál es tu BHAG (Big Hairy Audacious Goal)?",
      ponderacionPregunta: 1,
      tipo: "single",
      opciones: [
        { id: "o1", text: "Convertirme en millonario y retirarme antes de los 40", ponderacion: 1 },
        { id: "o2", text: "Vender mi empresa por más de $10 millones", ponderacion: 1 },
        { id: "o3", text: "Crear una empresa que impacte a millones de personas", ponderacion: 1 },
        { id: "o4", text: "Tener libertad de tiempo total en 5 años", ponderacion: 1 },
        { id: "o5", text: "Otro (especificar)", ponderacion: 1 }, // Considerar campo de texto si es "Otro"
      ],
    },
    {
      id: "m0s2q2", // Anteriormente m0s2q5
      pregunta: "¿Cuánto dinero necesitas realmente para cumplir ese sueño?",
      ponderacionPregunta: 1,
      tipo: "single",
      opciones: [
        { id: "o1", text: "Menos de $5M MXN", ponderacion: 1 },
        { id: "o2", text: "Entre $5M y $20M MXN", ponderacion: 1 },
        { id: "o3", text: "Entre $20M y $100M MXN", ponderacion: 1 },
        { id: "o4", text: "Más de $100M MXN", ponderacion: 1 },
        { id: "o5", text: "No lo sé", ponderacion: 1 },
      ],
    },
    {
      id: "m0s2q3", // Anteriormente m0s2q6
      pregunta: "¿Qué plazo te das para lograrlo?",
      ponderacionPregunta: 1,
      tipo: "single",
      opciones: [
        { id: "o1", text: "1 año", ponderacion: 1 },
        { id: "o2", text: "3 años", ponderacion: 1 },
        { id: "o3", text: "5 años", ponderacion: 1 },
        { id: "o4", text: "10 años o más", ponderacion: 1 },
      ],
    },
    // Submódulo 0.3: Estructura de vida alineada al propósito
    {
      id: "m0s3q1", // Anteriormente m0s3q7
      pregunta: "¿Cuánto tiempo dedicas semanalmente a avanzar en tu BHAG?",
      ponderacionPregunta: 1,
      tipo: "single",
      opciones: [
        { id: "o1", text: "Nada, solo sobrevivo", ponderacion: 1 },
        { id: "o2", text: "Menos de 5 horas", ponderacion: 1 },
        { id: "o3", text: "Entre 5 y 10 horas", ponderacion: 1 },
        { id: "o4", text: "Más de 10 horas de foco real", ponderacion: 1 },
      ],
    },
    {
      id: "m0s3q2", // Anteriormente m0s3q8
      pregunta: "¿Qué hábitos tienes para acercarte a tu objetivo? (elige todos los que apliquen)",
      ponderacionPregunta: 1,
      tipo: "multiple",
      opciones: [
        { id: "o1", text: "Leer libros o tomar cursos", ponderacion: 1 },
        { id: "o2", text: "Trabajar en mi negocio con foco", ponderacion: 1 },
        { id: "o3", text: "Visualizar / meditar / escribir metas", ponderacion: 1 },
        { id: "o4", text: "Ahorrar e invertir estratégicamente", ponderacion: 1 },
        { id: "o5", text: "Cuidar mi salud física y mental", ponderacion: 1 },
        { id: "o6", text: "Ninguno aún", ponderacion: 1 },
      ],
    },
    {
      id: "m0s3q3", // Anteriormente m0s3q9
      pregunta: "¿Cuál de estos caminos te gustaría explorar más para acercarte a tu BHAG?",
      ponderacionPregunta: 1,
      tipo: "single",
      opciones: [
        { id: "o1", text: "Escalar mi negocio actual", ponderacion: 1, emoji: "📈" },
        { id: "o2", text: "Emprender algo nuevo", ponderacion: 1, emoji: "💡" },
        { id: "o3", text: "Aprender de mentores o cursos", ponderacion: 1, emoji: "📚" },
        { id: "o4", text: "Aliarme con otras personas", ponderacion: 1, emoji: "🤝" },
        { id: "o5", text: "Mejorar mi bienestar personal primero", ponderacion: 1, emoji: "🧘‍♂️" },
        { id: "o6", text: "Entrar a una escuela de negocios como el IPADE", ponderacion: 1, emoji: "🧑‍🏫" },
      ],
    },
  ],
}
