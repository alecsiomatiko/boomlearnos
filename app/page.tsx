"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, BrainCircuit, Target, BarChart, Menu } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
  }

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
          <Link href="#features" className="transition-colors hover:text-red-200">
            Características
          </Link>
          <Link href="#testimonials" className="transition-colors hover:text-red-200">
            Testimonios
          </Link>
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
                <Link href="#features" className="transition-colors hover:text-red-200">
                  Características
                </Link>
                <Link href="#testimonials" className="transition-colors hover:text-red-200">
                  Testimonios
                </Link>
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

        <section id="features" className="py-24 sm:py-32 bg-brand-dark/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-red-300">Todo lo que necesitas</h2>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Una plataforma, control total
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <GlassCard
                icon={<BrainCircuit className="h-8 w-8 text-brand-red" />}
                title="Mega Diagnóstico"
                description="Obtén una radiografía completa de tu negocio. Identifica fortalezas, debilidades y oportunidades con nuestra metodología única."
              />
              <GlassCard
                icon={<Target className="h-8 w-8 text-brand-red" />}
                title="Panel de Control Gamificado"
                description="Visualiza tu progreso, gestiona misiones diarias y mantén el pulso de tus objetivos en un solo lugar."
              />
              <GlassCard
                icon={<BarChart className="h-8 w-8 text-brand-red" />}
                title="Salud Financiera con IA"
                description="Analiza tus finanzas con inteligencia artificial. Toma decisiones más inteligentes y asegura la rentabilidad de tu negocio."
              />
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-16 text-center text-4xl font-bold tracking-tighter sm:text-5xl">
              Amado por equipos de alto rendimiento
            </h2>
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  name: "Ana Sofía",
                  role: "CEO, TechCorp",
                  quote:
                    "Kalabasboom transformó nuestra forma de trabajar. La productividad se disparó y el equipo está más comprometido que nunca.",
                  avatar: "/placeholder.svg?width=64&height=64",
                },
                {
                  name: "Carlos Gutiérrez",
                  role: "Director, InnovateCo",
                  quote:
                    "Es el sistema operativo para negocios que siempre soñé. Intuitivo, potente y los resultados hablan por sí solos.",
                  avatar: "/placeholder.svg?width=64&height=64",
                },
                {
                  name: "Elena Rivera",
                  role: "Líder de Proyecto",
                  quote:
                    "Nunca había visto a mi equipo tan alineado. Las misiones diarias son un cambio de juego para la motivación.",
                  avatar: "/placeholder.svg?width=64&height=64",
                },
              ].map((testimonial, i) => (
                <motion.div key={i} custom={i} variants={featureVariants} initial="hidden" whileInView="visible">
                  <Card className={cn("h-full text-white", "liquid-glass-effect")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          width={64}
                          height={64}
                          className="rounded-full"
                        />
                        <div className="ml-4">
                          <p className="font-bold">{testimonial.name}</p>
                          <p className="text-sm text-red-200">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="mt-4 italic">"{testimonial.quote}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
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

function GlassCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className={cn("text-white", "liquid-glass-effect")}>
      <CardHeader>
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-red/10 mb-4">{icon}</div>
        <CardTitle className="font-display text-xl font-bold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}
