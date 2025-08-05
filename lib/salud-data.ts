export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
}

export interface MonthlyFinancials {
  month: string
  income: number
  expenses: number
  profit: number
  transactions: Transaction[]
}

export const demoFinancialData: MonthlyFinancials[] = [
  {
    month: "Abril 2025",
    income: 185000,
    expenses: 112300,
    profit: 72700,
    transactions: [
      {
        id: "1",
        date: "2025-04-05",
        description: "Ingreso Proyecto A",
        amount: 90000,
        type: "income",
        category: "Ingresos por Proyectos",
      },
      { id: "2", date: "2025-04-10", description: "Nómina", amount: -60000, type: "expense", category: "Equipo" },
      {
        id: "3",
        date: "2025-04-15",
        description: "Ingreso Proyecto B",
        amount: 95000,
        type: "income",
        category: "Ingresos por Proyectos",
      },
      {
        id: "4",
        date: "2025-04-20",
        description: "Renta de oficina",
        amount: -25000,
        type: "expense",
        category: "Operaciones",
      },
      {
        id: "5",
        date: "2025-04-25",
        description: "Software y suscripciones",
        amount: -15000,
        type: "expense",
        category: "Herramientas y Software",
      },
      {
        id: "6",
        date: "2025-04-28",
        description: "Publicidad en redes",
        amount: -10000,
        type: "expense",
        category: "Marketing",
      },
      {
        id: "gh-1",
        date: "2025-04-12",
        description: "Café para la oficina",
        amount: -800,
        type: "expense",
        category: "Gastos Hormiga",
      },
      {
        id: "gh-2",
        date: "2025-04-22",
        description: "Pedido de comida Uber Eats",
        amount: -1500,
        type: "expense",
        category: "Gastos Hormiga",
      },
    ],
  },
  {
    month: "Mayo 2025",
    income: 165000,
    expenses: 107100,
    profit: 57900,
    transactions: [
      {
        id: "7",
        date: "2025-05-05",
        description: "Ingreso Proyecto C",
        amount: 165000,
        type: "income",
        category: "Ingresos por Proyectos",
      },
      { id: "8", date: "2025-05-10", description: "Nómina", amount: -60000, type: "expense", category: "Equipo" },
      {
        id: "9",
        date: "2025-05-18",
        description: "Pago a proveedores",
        amount: -20000,
        type: "expense",
        category: "Proveedores",
      },
      {
        id: "10",
        date: "2025-05-20",
        description: "Renta de oficina",
        amount: -25000,
        type: "expense",
        category: "Operaciones",
      },
      {
        id: "gh-3",
        date: "2025-05-08",
        description: "Suscripción a Spotify",
        amount: -200,
        type: "expense",
        category: "Gastos Hormiga",
      },
      {
        id: "gh-4",
        date: "2025-05-19",
        description: "Snacks para reuniones",
        amount: -1900,
        type: "expense",
        category: "Gastos Hormiga",
      },
    ],
  },
  {
    month: "Junio 2025",
    income: 192000,
    expenses: 124500,
    profit: 67500,
    transactions: [
      {
        id: "11",
        date: "2025-06-05",
        description: "Ingreso Proyecto A v2",
        amount: 100000,
        type: "income",
        category: "Ingresos por Proyectos",
      },
      { id: "12", date: "2025-06-10", description: "Nómina", amount: -65000, type: "expense", category: "Equipo" },
      {
        id: "13",
        date: "2025-06-15",
        description: "Ingreso Proyecto D",
        amount: 92000,
        type: "income",
        category: "Ingresos por Proyectos",
      },
      {
        id: "14",
        date: "2025-06-20",
        description: "Renta de oficina",
        amount: -25000,
        type: "expense",
        category: "Operaciones",
      },
      {
        id: "15",
        date: "2025-06-22",
        description: "Compra de equipo",
        amount: -32000,
        type: "expense",
        category: "Activos",
      },
      {
        id: "gh-5",
        date: "2025-06-18",
        description: "Suscripción a Netflix",
        amount: -250,
        type: "expense",
        category: "Gastos Hormiga",
      },
      {
        id: "gh-6",
        date: "2025-06-28",
        description: "Transporte Didi",
        amount: -2250,
        type: "expense",
        category: "Gastos Hormiga",
      },
    ],
  },
]
