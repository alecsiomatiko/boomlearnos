export function getLevelProgress(currentPoints: number, nextLevelPoints: number): number {
  if (nextLevelPoints === 0) return 0 // Avoid division by zero
  return (currentPoints / nextLevelPoints) * 100
}
