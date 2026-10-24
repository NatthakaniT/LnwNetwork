import { describe, expect, it } from 'vitest'
import { stickerText } from './sticker'
import { mk } from '../pages/fixture'
import type { Part } from '../content/types'

const parts: Part[] = [
  { part: 0, titleTh: 'ภาคศูนย์', examDomain: 'A', lessons: [mk('a1', 0, 1), mk('a2', 0, 2), mk('ab', 0, 3, { status: 'building' })] },
  { part: 1, titleTh: 'ภาคหนึ่ง', examDomain: 'B', lessons: [mk('b1', 1, 1), mk('b2', 1, 2)] },
  { part: 2, titleTh: 'ภาคสอง', examDomain: 'C', lessons: [mk('cb', 2, 1, { status: 'building' })] },
]
const prog = (completed: string[]) => ({ version: 1 as const, completed })

describe('stickerText', () => {
  it('ยังไม่จบสักบท -> เริ่มกันเลย', () => {
    expect(stickerText(parts, prog([]))).toBe('เริ่มกันเลย 💪')
    // บทที่ไม่มีในแผนที่ไม่นับ
    expect(stickerText(parts, prog(['zz']))).toBe('เริ่มกันเลย 💪')
  })
  it('จบบางบทแต่ยังไม่ครบภาค -> สู้ ๆ', () => {
    expect(stickerText(parts, prog(['a1']))).toBe('สู้ ๆ ทีละบท 🔥')
    expect(stickerText(parts, prog(['b1']))).toBe('สู้ ๆ ทีละบท 🔥')
  })
  it('จบครบทุกบทที่พร้อมของภาค (ไม่นับบทที่กำลังทำ) -> ผ่านภาค N', () => {
    expect(stickerText(parts, prog(['a1', 'a2']))).toBe('เก่งมาก ผ่านภาค 0 แล้ว 🎉')
  })
  it('ใช้ภาคล่าสุดที่จบ; ภาคที่ไม่มีบทพร้อมไม่นับว่าจบ', () => {
    expect(stickerText(parts, prog(['a1', 'a2', 'b1', 'b2']))).toBe('เก่งมาก ผ่านภาค 1 แล้ว 🎉')
    expect(stickerText(parts, prog(['b1', 'b2']))).toBe('เก่งมาก ผ่านภาค 1 แล้ว 🎉')
  })
})
