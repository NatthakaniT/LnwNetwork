import { describe, expect, it } from 'vitest'
import { renderRoadmap } from './export-roadmap'
import type { Part } from '../src/content/types'

const lesson = (id: string, status: 'ready' | 'building', extra = {}) =>
  ({ id, part: 9, order: 1, status, titleTh: `บท ${id}`, analogyTh: `เหมือน ${id}`, ciscoModules: [], videos: [], ...extra })

describe('renderRoadmap', () => {
  it('แสดงภาค สถานะ และ requires', () => {
    const parts = [{ part: 9, titleTh: 'x', examDomain: '', lessons: [
      lesson('a', 'ready'),
      lesson('b', 'ready', { requires: [{ lesson: 'a', useTh: 'ใช้เลขฐานสอง' }] }),
      lesson('c', 'building'),
    ] }] as Part[]
    const md = renderRoadmap(parts)
    expect(md).toContain('## ภาค 9 · x')
    expect(md).toContain('- บท a (เหมือน a) — พร้อมเรียน')
    expect(md).toContain('  - ต่อจาก: บท a · ใช้เลขฐานสอง')
    expect(md).toContain('- บท c (เหมือน c) — กำลังทำ')
  })
})
