import type { QuizQuestion } from '../content/types'

export const PASS_RATIO = 0.8

export function isCorrect(q: QuizQuestion, selected: string[]): boolean {
  const a = new Set(selected)
  const b = new Set(q.correct)
  return a.size === b.size && [...b].every((id) => a.has(id))
}

export function grade(
  qs: QuizQuestion[],
  answers: Record<string, string[]>,
): { correct: number; total: number; passed: boolean } {
  const correct = qs.filter((q) => isCorrect(q, answers[q.id] ?? [])).length
  const total = qs.length
  return { correct, total, passed: total > 0 && correct / total >= PASS_RATIO }
}
