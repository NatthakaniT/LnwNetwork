import { describe, expect, it } from 'vitest'
import { renderCourseRoadmap, renderRoadmap, roadmapFileName } from './export-roadmap'
import { courses } from '../src/content/courses'
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

describe('แผนที่แยกตามวิชา', () => {
  it('ชื่อไฟล์เป็น roadmap-<รหัสวิชา>.md ทุกวิชา ไม่ซ้ำ และไม่ใช่ roadmap.md เดิม', () => {
    const names = courses.map((c) => roadmapFileName(c.id))
    expect(names).toEqual(['roadmap-ccna.md', 'roadmap-git.md'])
    expect(names).not.toContain('roadmap.md')
  })

  it('แต่ละไฟล์มีเฉพาะบทของวิชานั้น: CCNA ไม่มีบท Git และ Git ไม่มีบท CCNA', () => {
    const [ccna, git] = courses.map((c) => renderCourseRoadmap(c))
    expect(ccna).toContain('# แผนที่วิชา CCNA')
    expect(git).toContain('# แผนที่วิชา Git & GitHub')
    const titles = (id: string) => courses.find((c) => c.id === id)!.parts.flatMap((p) => p.lessons).map((l) => l.titleTh)
    for (const t of titles('ccna')) { expect(ccna).toContain(t); expect(git).not.toContain(t) }
    for (const t of titles('git')) { expect(git).toContain(t); expect(ccna).not.toContain(t) }
  })

  it('บท g2-l1 ขึ้นเป็นพร้อมเรียนในแผนที่ Git พร้อมศัพท์ใหม่และบทที่ต่อจาก', () => {
    const git = renderCourseRoadmap(courses.find((c) => c.id === 'git')!)
    expect(git).toMatch(/- push งานจริงครั้งแรก[^\n]*— พร้อมเรียน\n  - สอน: Collaborator, GCM\n  - ต่อจาก: /)
  })
})
