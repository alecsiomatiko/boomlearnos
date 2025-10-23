"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex justify-center">
            <Image
              src="/images/kalabasboom-logo.png"
              alt="Kalabasboom Logo"
              width={400}
              height={300}
              className="w-80 h-60 md:w-96 md:h-72 object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-brand-red hover:bg-brand-red/90 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <Link href="/register">
              PRE-REGISTRO
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            ©2025 KALABASBOOM
          </div>
          
          <div className="flex items-center gap-8">
            <Link 
              href="/terms-of-service" 
              className="text-sm text-gray-600 hover:text-brand-red transition-colors"
            >
              Términos de Servicio
            </Link>
            <Link 
              href="/privacy-policy" 
              className="text-sm text-gray-600 hover:text-brand-red transition-colors"
            >
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
