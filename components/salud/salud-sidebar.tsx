"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LineChart, Settings, Wallet, FileText, MousePointerClick, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

const navItems = [
  { href: "/dashboard/salud", icon: Home, label: "Resumen" },
  { href: "/dashboard/salud/ingreso-y-gasto", icon: Wallet, label: "Ingresos y Gastos" },
  { href: "/dashboard/salud/gastos-hormiga", icon: MousePointerClick, label: "Gastos Hormiga" },
  { href: "/dashboard/salud/reportes", icon: FileText, label: "Reportes" },
  { href: "/dashboard/salud/analisis", icon: LineChart, label: "Análisis IA" },
  { href: "/dashboard/salud/configuracion", icon: Settings, label: "Configuración" },
]

export default function SaludSidebar() {
  const pathname = usePathname()

  return (
    <div className="liquid-glass-effect hidden md:flex flex-col rounded-none rounded-r-lg">
      <div className="relative z-10 flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
          <Logo href="/dashboard/salud" variant="light" />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard"
              className="mb-4 flex items-center gap-3 rounded-lg px-3 py-3 text-gray-400 transition-all hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Selector
            </Link>
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-300 ease-in-out hover:text-primary hover:bg-white/5",
                  pathname === href && "liquid-selection",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>¿Necesitas ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full bg-brand-red hover:bg-brand-red/80">
                Contactar Soporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
