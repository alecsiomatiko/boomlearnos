"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import DashboardSidebar from "@/components/layout/dashboard-sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMobile()

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  // Calcular el ancho del sidebar dinámicamente
  const sidebarWidth = sidebarCollapsed ? 56 : 240

  if (isMobile) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="flex h-12 items-center justify-between bg-white border-b border-gray-200 px-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">kalabasboom</span>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <DashboardSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="flex-1 pt-12 overflow-auto">
          <div className="p-4 h-full">{children}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Siempre visible */}
      <div className="flex-shrink-0">
        <DashboardSidebar onToggle={handleSidebarToggle} />
      </div>

      {/* Main Content Area - Se adapta al sidebar */}
      <motion.div
        animate={{
          width: `calc(100vw - ${sidebarWidth}px)`,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <main className="flex-1 overflow-auto">
          <div className="p-4 h-full w-full">{children}</div>
        </main>
      </motion.div>
    </div>
  )
}
