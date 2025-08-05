import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "light" | "dark"
  href?: string
  className?: string
}

export function Logo({ variant = "dark", href = "/", className }: LogoProps) {
  const logoSrc =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2877%29-eM9vyfaC9F7LxuGQO3OVh8ZqZaL2Lu.png" // Nuevo logo rojo

  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold", className)}>
      <Image
        src={logoSrc || "/placeholder.svg"}
        alt="Kalabasboom Logo"
        width={32}
        height={32}
        className="rounded-full"
      />
      <span className={cn("font-bold text-lg", variant === "light" ? "text-white" : "text-slate-800")}>
        Kalabasboom
      </span>
    </Link>
  )
}
