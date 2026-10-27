import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { firstTaughtIn } from '../src/content'
import type { Course, GlossaryTerm, Part } from '../src/content/types'

/** แผนที่คอร์สเป็น Markdown ให้ครูใน Claude.ai รู้ว่าผู้เรียนเรียนอะไรมาแล้ว */
export function renderRoadmap(parts: Part[], glossary: GlossaryTerm[]): string {
  const title = new Map(parts.flatMap(p => p.lessons).map(l => [l.id, l.titleTh]))
  const en = new Map(glossary.map(g => [g.id, g.en]))
  const taught = [...firstTaughtIn(parts)]
  const out: string[] = []
  for (const part of parts) {
    out.push(`## ภาค ${part.part} · ${part.titleTh}`, '')
    for (const l of part.lessons) {
      out.push(`- ${l.titleTh}${l.analogyTh ? ` (${l.analogyTh})` : ''} — ${l.status === 'ready' ? 'พร้อมเรียน' : 'กำลังทำ'}`)
      const terms = taught.filter(([, lid]) => lid === l.id).map(([tid]) => en.get(tid) ?? tid)
      if (terms.length > 0) out.push(`  - สอน: ${terms.join(', ')}`)
      for (const r of l.requires ?? []) out.push(`  - ต่อจาก: ${title.get(r.lesson) ?? r.lesson} · ${r.useTh}`)
    }
    out.push('')
  }
  return out.join('\n')
}

/** ชื่อไฟล์แผนที่ของแต่ละวิชา ใต้ docs/tutor */
export const roadmapFileName = (courseId: string): string => `roadmap-${courseId}.md`

/** ไฟล์แผนที่เต็มของหนึ่งวิชา: หัวเรื่อง + คำอธิบายการอ่าน + แผนที่ */
export function renderCourseRoadmap(course: Pick<Course, 'titleTh' | 'parts' | 'glossary'>): string {
  return `# แผนที่วิชา ${course.titleTh} ของ LnwNetwork (สร้างจากสคริปต์ ห้ามแก้มือ)\n\n`
    + 'เรียงตามลำดับที่ผู้เรียนเรียน ผู้เรียนรู้เรื่องในบทก่อนหน้าทั้งหมด รวมบทที่เรียนอยู่ตอนนี้ แต่ยังไม่รู้เรื่องในบทที่อยู่หลังบทนั้น\n\n'
    + '"สอน:" คือศัพท์ที่บทนั้นสอนเป็นครั้งแรก / "ต่อจาก:" คือบทก่อนหน้าที่บทนั้นต้องใช้ความรู้\n\n'
    + renderRoadmap(course.parts, course.glossary)
}

const isCli = !process.env.VITEST // vite-node ไม่ใส่ชื่อสคริปต์ใน argv จึงเช็คว่าไม่ได้รันใต้ vitest
if (isCli) {
  const { courses } = await import('../src/content/courses')
  const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/tutor')
  mkdirSync(dir, { recursive: true })
  rmSync(resolve(dir, 'roadmap.md'), { force: true }) // ไฟล์เดิมก่อนแยกตามวิชา
  for (const c of courses) {
    const target = resolve(dir, roadmapFileName(c.id))
    writeFileSync(target, renderCourseRoadmap(c), 'utf8')
    console.log(`wrote roadmap -> ${target}`)
  }
}
