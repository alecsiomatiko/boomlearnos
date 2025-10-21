"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Zap, Menu } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-brand-red text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-red via-brand-red/80 to-brand-dark" />
        <div
          className="absolute inset-0 animate-aurora opacity-20"
          style={{
            backgroundImage: `
             radial-gradient(ellipse at 20% 20%, hsl(358, 75%, 50%) 0%, transparent 50%),
             radial-gradient(ellipse at 80% 30%, hsl(358, 85%, 55%) 0%, transparent 50%),
             radial-gradient(ellipse at 50% 80%, hsl(358, 95%, 60%) 0%, transparent 50%)
           `,
          }}
        />
      </div>

      <header
        className={cn("sticky top-0 z-50 flex h-20 items-center justify-between px-4 md:px-8", "liquid-glass-effect")}
      >
        <Logo variant="light" />
        <nav className="hidden items-center gap-6 text-lg font-medium md:flex">
          <Button
            variant="ghost"
            className="transition-all duration-300 hover:bg-white/10 liquid-glass-effect border-transparent hover:border-white/20"
            asChild
          >
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Button
            variant="ghost"
            className="transition-all duration-300 hover:bg-white/10 liquid-glass-effect border-transparent hover:border-white/20"
            asChild
          >
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button
            className="text-brand-red transition-all duration-300 bg-white/80 hover:bg-white/100 liquid-glass-effect border-white/30"
            asChild
          >
            <Link href="/register">Empezar Gratis</Link>
          </Button>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className={cn("w-[300px] sm:w-[400px]", "liquid-glass-effect")}>
              <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                <Logo variant="light" />
                <div className="flex flex-col gap-4 mt-4">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button className="bg-white text-brand-red shadow-lg hover:bg-red-100" asChild>
                    <Link href="/register">Empezar Gratis</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto grid min-h-[calc(100vh-5rem)] items-center gap-8 px-4 py-16 lg:grid-cols-2 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 text-center lg:text-left"
          >
            <h1 className="font-display text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
              El Sistema Operativo para tu <span className="text-yellow-300">Impacto</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-red-200 md:text-xl lg:mx-0">
              Transforma tus ideas en resultados tangibles. Kalabasboom OS es la plataforma todo-en-uno que necesitas
              para diagnosticar, planificar y ejecutar tu visión de negocio.
            </p>
            <div className="mt-8 flex justify-center gap-4 lg:justify-start">
              <Link href="/register">
                <Button size="lg" className="bg-white text-brand-red shadow-xl hover:bg-red-100">
                  Comienza Ahora <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
            className="relative flex h-full w-full items-center justify-center"
          >
            <Image
              src="/images/mascot-walking.png"
              alt="Mascota de Kalabasboom"
              width={600}
              height={600}
              className="h-auto w-full max-w-md object-contain lg:max-w-full"
              priority
            />
          </motion.div>
        </section>




      </main>

      <footer className="w-full bg-brand-dark py-8">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 text-center text-neutral-400 md:flex-row">
          <Logo variant="light" />
          <p className="mt-4 text-sm md:mt-0">
            &copy; {new Date().getFullYear()} Kalabasboom. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
