import { describe, expect, it } from 'vitest'
import { grade, isCorrect, PASS_RATIO } from './grade'
import type { QuizQuestion } from '../content/types'

const q = (id: string, correct: string[]): QuizQuestion => ({
  id, layer: 'th', prompt: id, explainTh: 'x', correct,
  choices: ['a', 'b', 'c'].map((c) => ({ id: c, text: c })),
})

describe('isCorrect', () => {
  const multi = q('m', ['a', 'c'])
  it('ต้องตรงทุกตัว ไม่สนลำดับ', () => {
    expect(isCorrect(multi, ['a'])).toBe(false)
    expect(isCorrect(multi, ['a', 'b', 'c'])).toBe(false)
    expect(isCorrect(multi, ['c', 'a'])).toBe(true)
  })
  it('ข้อเดียว', () => {
    expect(isCorrect(q('s', ['b']), ['b'])).toBe(true)
    expect(isCorrect(q('s', ['b']), [])).toBe(false)
  })
})

describe('grade', () => {
  const qs = ['1', '2', '3', '4', '5'].map((i) => q(i, ['a']))
  it('PASS_RATIO = 0.8', () => expect(PASS_RATIO).toBe(0.8))
  it('4/5 ผ่าน', () => {
    const r = grade(qs, { '1': ['a'], '2': ['a'], '3': ['a'], '4': ['a'], '5': ['b'] })
    expect(r).toEqual({ correct: 4, total: 5, passed: true })
  })
  it('3/5 ไม่ผ่าน', () => {
    const r = grade(qs, { '1': ['a'], '2': ['a'], '3': ['a'] })
    expect(r).toEqual({ correct: 3, total: 5, passed: false })
  })
})
