import type { MegaEtapa } from "@/types/mega-diagnostic"

// Contenido actualizado según el nuevo texto proporcionado por el usuario.
// Se mantiene la estructura, pero se ajusta el texto de preguntas y opciones.
// Se eliminan las propiedades 'justificacion'.
export const etapa1DiagnosticoInicial: MegaEtapa = {
  id: "etapa1",
  titulo: "ETAPA 1 – MAPEO TOTAL DEL NEGOCIO",
  descripcion:
    "Este es el primer paso para conocerte y sentar las bases de tu plan de crecimiento. ¡Contesta con sinceridad!",
  desbloquea: "etapa2",
  questions: [
    {
      id: "q1_antiguedad",
      pregunta: "¿Cuánto tiempo lleva tu negocio operando?",
      ponderacionPregunta: 3,
      tipo: "single",
      opciones: [
        { id: "q1a", text: "Menos de 6 meses", ponderacion: 2, emoji: "🍼" },
        { id: "q1b", text: "Entre 6 meses y 1 año", ponderacion: 3, emoji: "🚶" },
        { id: "q1c", text: "Entre 1 y 3 años", ponderacion: 4, emoji: "🏃" },
        { id: "q1d", text: "Más de 3 años", ponderacion: 5, emoji: "🏆" },
      ],
      feedbackImmediato: "¡Buen dato! Saber la antigüedad nos indica si estás iniciando o si ya buscas optimización.",
    },
    {
      id: "q2_equipo",
      pregunta: "¿Cuántas personas trabajan actualmente en tu negocio (incluyéndote a ti)?",
      ponderacionPregunta: 3,
      tipo: "single",
      opciones: [
        { id: "q2a", text: "Solo yo", ponderacion: 2, emoji: "👤" },
        { id: "q2b", text: "De 2 a 5 personas", ponderacion: 3, emoji: "👥" },
        { id: "q2c", text: "De 6 a 10 personas", ponderacion: 4, emoji: "👨‍👩‍👧‍👦" },
        { id: "q2d", text: "Más de 10 personas", ponderacion: 5, emoji: "🏢" },
      ],
      feedbackImmediato:
        "Perfecto, saber si eres solitario o tienes un equipo amplio cambia las estrategias de organización.",
    },
    {
      id: "q3_giro",
      pregunta: "¿Cuál es el giro principal de tu negocio?",
      ponderacionPregunta: 4,
      tipo: "single",
      opciones: [
        { id: "q3a", text: "Productos", ponderacion: 3, emoji: "📦" },
        { id: "q3b", text: "Servicios", ponderacion: 4, emoji: "🛠️" },
        { id: "q3c", text: "Ambos (productos y servicios)", ponderacion: 5, emoji: "🛍️" },
        { id: "q3d", text: "Otro (especificar)", ponderacion: 2, emoji: "❓" },
      ],
      feedbackImmediato: "¡Excelente! Conocer tu giro y modelo de venta nos ayuda a enfocar las soluciones.",
    },
    {
      id: "q3_1_modelo_op",
      pregunta: "¿Cuentas con un local físico, vendes en línea o utilizas un modelo mixto?",
      ponderacionPregunta: 3,
      tipo: "single",
      opcional: true,
      subPreguntaDe: "q3_giro",
      opciones: [
        { id: "q3_1a", text: "Local físico", ponderacion: 2, emoji: "🏪" },
        { id: "q3_1b", text: "Tienda en línea", ponderacion: 4, emoji: "💻" },
        { id: "q3_1c", text: "Mixto (ambos)", ponderacion: 5, emoji: "🌐" },
        { id: "q3_1d", text: "Otro", ponderacion: 3, emoji: "🤔" },
      ],
    },
    {
      id: "q4_ventas",
      pregunta: "¿Cuál es tu promedio de ventas mensuales en los últimos 3 meses?",
      ponderacionPregunta: 5,
      tipo: "single",
      opciones: [
        { id: "q4a", text: "Menos de $50,000", ponderacion: 2, emoji: "💸" },
        { id: "q4b", text: "De $50,000 a $100,000", ponderacion: 3, emoji: "💰" },
        { id: "q4c", text: "De $100,000 a $500,000", ponderacion: 4, emoji: "🤑" },
        { id: "q4d", text: "Más de $500,000", ponderacion: 5, emoji: "🚀" },
      ],
    },
    {
      id: "q4_1_clientes",
      pregunta: "¿Cómo describirías a tus clientes?",
      ponderacionPregunta: 4,
      tipo: "single",
      subPreguntaDe: "q4_ventas",
      opciones: [
        { id: "q4_1a", text: "Constantes (recurrentes)", ponderacion: 5, emoji: "🔄" },
        { id: "q4_1b", text: "Por temporadas", ponderacion: 3, emoji: "☀️❄️" },
        { id: "q4_1c", text: "Esporádicos", ponderacion: 2, emoji: "🎲" },
        { id: "q4_1d", text: "Aún no tengo clientes", ponderacion: 1, emoji: "🤷" },
      ],
      feedbackImmediato:
        "Si no tienes clientes, enfocaremos esfuerzos en prospección. Si son constantes, buscaremos fidelización.",
    },
    {
      id: "q5_margenes",
      pregunta: "¿Cuál es tu margen de ganancia aproximado por venta?",
      ponderacionPregunta: 5,
      tipo: "single",
      opciones: [
        { id: "q5a", text: "Menos de 20%", ponderacion: 2, emoji: "📉" },
        { id: "q5b", text: "20% – 40%", ponderacion: 3, emoji: "📊" },
        { id: "q5c", text: "Más de 40%", ponderacion: 5, emoji: "📈" },
        { id: "q5d", text: "No lo sé", ponderacion: 1, emoji: "🤔" },
      ],
      feedbackImmediato:
        "¡Atención! Si no conoces tu margen, es vital para tu rentabilidad. Revisaremos esto en el diagnóstico.",
    },
    {
      id: "q5_1_herramientas",
      pregunta: "¿Qué herramientas utilizas para gestionar tu negocio? (Selecciona todas las que apliquen)",
      ponderacionPregunta: 4,
      tipo: "multiple",
      subPreguntaDe: "q5_margenes",
      opciones: [
        { id: "q5_1a", text: "Excel/Google Sheets", ponderacion: 2, emoji: "📊" },
        { id: "q5_1b", text: "Libretas / Anotaciones en papel", ponderacion: 1, emoji: "📝" },
        { id: "q5_1c", text: "WhatsApp (gestión de pedidos/ventas)", ponderacion: 2, emoji: "📱" },
        { id: "q5_1d", text: "Plataformas de pago (Clip, MercadoPago, etc.)", ponderacion: 3, emoji: "💳" },
        { id: "q5_1e", text: "CRM / ERP", ponderacion: 4, emoji: "⚙️" },
        { id: "q5_1f", text: "Sistemas de contabilidad (QuickBooks, Contpaqi, etc.)", ponderacion: 4, emoji: "🧾" },
        { id: "q5_1g", text: "Ninguna", ponderacion: 0 }, // Ponderación 0 si no usa ninguna, pero la pregunta en sí tiene peso.
      ],
    },
    {
      id: "q6_financiamiento",
      pregunta: "¿Has recibido inversión o crédito antes?",
      ponderacionPregunta: 2,
      tipo: "single",
      opciones: [
        { id: "q6a", text: "Sí, inversión", ponderacion: 4, emoji: "🤝" },
        { id: "q6b", text: "Sí, crédito", ponderacion: 3, emoji: "🏦" },
        { id: "q6c", text: "No", ponderacion: 2, emoji: "🚫" },
        { id: "q6d", text: "Prefiero no decir", ponderacion: 1, emoji: "🤫" },
      ],
      feedbackImmediato:
        "Si ya tuviste inversión, hay experiencia de escalamiento. Si no, podemos explorar esas opciones.",
    },
    {
      id: "q6_1_deuda",
      pregunta: "¿Actualmente tienes alguna deuda o compromiso financiero relevante para el negocio?",
      ponderacionPregunta: 2,
      tipo: "single",
      opcional: true,
      subPreguntaDe: "q6_financiamiento",
      opciones: [
        { id: "q6_1a", text: "No", ponderacion: 4, emoji: "✅" },
        { id: "q6_1b", text: "Sí, con institución bancaria", ponderacion: 2, emoji: "🏦" },
        { id: "q6_1c", text: "Sí, con fintech u otro", ponderacion: 3, emoji: "💻" },
        { id: "q6_1d", text: "Prefiero no decir", ponderacion: 1, emoji: "🤫" },
      ],
    },
    {
      id: "q7_asesoria",
      pregunta: "¿Estarías dispuesto(a) a recibir consultoría externa para hacer crecer tu negocio?",
      ponderacionPregunta: 5,
      tipo: "single",
      opciones: [
        { id: "q7a", text: "Sí, totalmente", ponderacion: 5, emoji: "💯" },
        { id: "q7b", text: "Sí, con condiciones", ponderacion: 4, emoji: "👍" },
        { id: "q7c", text: "No estoy seguro", ponderacion: 2, emoji: "🤔" },
        { id: "q7d", text: "No", ponderacion: 1, emoji: "👎" },
      ],
      feedbackImmediato: "¡Excelente! Tu apertura a consultoría puede ser un gran catalizador de crecimiento.",
    },
    {
      id: "q7_1_inversion_equity",
      pregunta: "¿Aceptarías compartir un porcentaje de tu empresa a cambio de inversión y asesoría?",
      ponderacionPregunta: 4,
      tipo: "single",
      subPreguntaDe: "q7_asesoria",
      opciones: [
        { id: "q7_1a", text: "Sí", ponderacion: 4, emoji: "🤝" },
        { id: "q7_1b", text: "Depende", ponderacion: 3, emoji: "🧐" },
        { id: "q7_1c", text: "No lo he pensado", ponderacion: 2, emoji: "🤔" },
        { id: "q7_1d", text: "No", ponderacion: 1, emoji: "🚫" },
      ],
    },
    {
      id: "q8_uso_capital",
      pregunta: "¿En qué destinarías principalmente el capital, en caso de recibir inversión o financiamiento?",
      ponderacionPregunta: 4,
      tipo: "single",
      opciones: [
        { id: "q8a", text: "Inventario", ponderacion: 2, emoji: "📦" },
        { id: "q8b", text: "Expansión (nuevas sucursales, mercados)", ponderacion: 4, emoji: "🌍" },
        { id: "q8c", text: "Tecnología (software, equipos)", ponderacion: 5, emoji: "💻" },
        { id: "q8d", text: "Marketing (publicidad, branding)", ponderacion: 5, emoji: "📢" },
        { id: "q8e", text: "Personal (contrataciones, capacitación)", ponderacion: 3, emoji: "👥" },
        { id: "q8f", text: "Otro", ponderacion: 2, emoji: "❓" },
      ],
      feedbackImmediato:
        "Perfecto. Si priorizas tech y marketing, podemos enfocar estrategias en digitalización y embudos de venta.",
    },
    {
      id: "q9_garantias",
      pregunta: "¿Tienes algún aval o activo para ofrecer como garantía en un crédito?",
      ponderacionPregunta: 2,
      tipo: "single",
      opciones: [
        { id: "q9a", text: "Propiedad inmueble", ponderacion: 4, emoji: "🏠" },
        { id: "q9b", text: "Vehículo/maquinaria", ponderacion: 3, emoji: "🚗" },
        { id: "q9c", text: "Cuentas por cobrar", ponderacion: 3, emoji: "🧾" },
        { id: "q9d", text: "Solo aval(es)", ponderacion: 2, emoji: "🙋" },
        { id: "q9e", text: "Ninguna", ponderacion: 1, emoji: "🤷‍♀️" },
      ],
      feedbackImmediato:
        "Si cuentas con aval, el camino a un préstamo bancario puede ser más viable. Si no, hay otras opciones.",
    },
  ],
}
