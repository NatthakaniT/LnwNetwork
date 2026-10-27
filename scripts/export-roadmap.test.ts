import { describe, expect, it } from 'vitest'
import { renderRoadmap } from './export-roadmap'
import type { GlossaryTerm, Part } from '../src/content/types'

const lesson = (id: string, status: 'ready' | 'building', extra = {}) =>
  ({ id, part: 9, order: 1, status, titleTh: `บท ${id}`, analogyTh: `เหมือน ${id}`, ciscoModules: [], videos: [], ...extra })
const g = (id: string, en: string): GlossaryTerm => ({ id, en, th: id, explainTh: id })

describe('renderRoadmap', () => {
  it('แสดงภาค สถานะ ศัพท์ที่สอน และ requires', () => {
    const parts = [{ part: 9, titleTh: 'x', examDomain: '', lessons: [
      lesson('a', 'ready', { order: 1, terms: ['bit', 'byte'] }),
      lesson('b', 'ready', { order: 2, terms: ['bit', 'ip'], requires: [{ lesson: 'a', useTh: 'ใช้เลขฐานสอง' }] }),
      lesson('c', 'building', { order: 3, terms: ['mac'] }),
    ] }] as Part[]
    const md = renderRoadmap(parts, [g('bit', 'Bit'), g('byte', 'Byte'), g('ip', 'IP address'), g('mac', 'MAC address')])
    expect(md).toContain('## ภาค 9 · x')
    expect(md).toContain('- บท a (เหมือน a) — พร้อมเรียน\n  - สอน: Bit, Byte')
    // bit สอนไปแล้วในบท a จึงไม่นับซ้ำในบท b
    expect(md).toContain('- บท b (เหมือน b) — พร้อมเรียน\n  - สอน: IP address\n  - ต่อจาก: บท a · ใช้เลขฐานสอง')
    // บทที่ยังไม่พร้อม ไม่บอกว่าสอนอะไร
    expect(md).toContain('- บท c (เหมือน c) — กำลังทำ\n')
    expect(md).not.toContain('MAC address')
  })
})
