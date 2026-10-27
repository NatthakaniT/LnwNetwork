import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Part } from '../src/content/types'

/** แผนที่คอร์สเป็น Markdown ให้ครูใน Claude.ai รู้ว่าผู้เรียนเรียนอะไรมาแล้ว */
export function renderRoadmap(parts: Part[]): string {
  const title = new Map(parts.flatMap(p => p.lessons).map(l => [l.id, l.titleTh]))
  const out: string[] = []
  for (const part of parts) {
    out.push(`## ภาค ${part.part} · ${part.titleTh}`, '')
    for (const l of part.lessons) {
      out.push(`- ${l.titleTh}${l.analogyTh ? ` (${l.analogyTh})` : ''} — ${l.status === 'ready' ? 'พร้อมเรียน' : 'กำลังทำ'}`)
      for (const r of l.requires ?? []) out.push(`  - ต่อจาก: ${title.get(r.lesson) ?? r.lesson} · ${r.useTh}`)
    }
    out.push('')
  }
  return out.join('\n')
}

const isCli = !process.env.VITEST // vite-node ไม่ใส่ชื่อสคริปต์ใน argv จึงเช็คว่าไม่ได้รันใต้ vitest
if (isCli) {
  const { course } = await import('../src/content')
  const target = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/tutor/roadmap.md')
  mkdirSync(dirname(target), { recursive: true })
  const header = '# แผนที่คอร์ส LnwNetwork (สร้างจากสคริปต์ ห้ามแก้มือ)\n\nเรียงตามลำดับที่ผู้เรียนเรียน ผู้เรียนรู้เฉพาะเรื่องในบทก่อนหน้าบทที่เรียนอยู่เท่านั้น\n\n'
  writeFileSync(target, header + renderRoadmap(course), 'utf8')
  console.log(`wrote roadmap -> ${target}`)
}
