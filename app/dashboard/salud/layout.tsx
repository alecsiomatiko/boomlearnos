import type { ReactNode } from "react"
import SaludSidebar from "@/components/salud/salud-sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { Home, LineChart, Settings, Wallet, FileText, MousePointerClick } from "lucide-react"

const navItems = [
  { href: "/dashboard/salud", icon: Home, label: "Resumen" },
  { href: "/dashboard/salud/ingreso-y-gasto", icon: Wallet, label: "Ingresos y Gastos" },
  { href: "/dashboard/salud/gastos-hormiga", icon: MousePointerClick, label: "Gastos Hormiga" },
  { href: "/dashboard/salud/reportes", icon: FileText, label: "Reportes" },
  { href: "/dashboard/salud/analisis", icon: LineChart, label: "Análisis IA" },
  { href: "/dashboard/salud/configuracion", icon: Settings, label: "Configuración" },
]

export default function SaludLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SaludSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden liquid-glass-effect rounded-b-lg">
          <MobileSidebar navItems={navItems} />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
