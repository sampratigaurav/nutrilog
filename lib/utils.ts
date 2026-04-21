import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNum(n: number | null | undefined, decimals = 1) {
  if (n == null) return '0'
  return Number(n).toFixed(decimals)
}

export function getMealEmoji(meal: string) {
  const map: Record<string, string> = {
    Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎', Dessert: '🍰'
  }
  return map[meal] ?? '🍽️'
}

export function today() {
  return new Date().toISOString().split('T')[0]
}
