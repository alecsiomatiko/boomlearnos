import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  // Check if the date is today
  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  if (isToday) {
    return "Hoy"
  }

  // Check if the date is yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  if (isYesterday) {
    return "Ayer"
  }

  // Format date as dd/mm/yyyy for other dates
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
}

/**
 * Get the time remaining until a date in a human-readable format
 */
export function getTimeRemaining(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  // If the date is in the past
  if (diff <= 0) {
    return "Expirado"
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} día${days > 1 ? "s" : ""}`
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? "s" : ""}`
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes} minuto${minutes > 1 ? "s" : ""}`
  }
}
