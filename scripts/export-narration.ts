import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Part } from '../src/content/types'

export interface NarrationItem { lessonId: string; sceneId: string; text: string }

/** เก็บบทพูดของฉากในบทที่ status = 'ready' เท่านั้น (ไม่เอาข้อความว่าง / ฉากซ้ำ) */
export function collectNarration(parts: Part[]): NarrationItem[] {
  const out: NarrationItem[] = []
  const seen = new Set<string>()
  for (const part of parts) {
    for (const lesson of part.lessons) {
      if (lesson.status !== 'ready' || !lesson.scenes) continue
      for (const scene of lesson.scenes.scenes) {
        const text = scene.narrationTh.trim()
        const key = `${lesson.id}/${scene.id}`
        if (!text || seen.has(key)) continue
        seen.add(key)
        out.push({ lessonId: lesson.id, sceneId: scene.id, text })
      }
    }
  }
  return out
}

const isCli = !process.env.VITEST // vite-node ไม่ใส่ชื่อสคริปต์ใน argv จึงเช็คว่าไม่ได้รันใต้ vitest
if (isCli) {
  const { courses } = await import('../src/content/courses')
  const items = courses.flatMap((c) => collectNarration(c.parts))
  const target = resolve(dirname(fileURLToPath(import.meta.url)), '../tools/tts/narration.json')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, JSON.stringify(items, null, 2) + '\n', 'utf8')
  console.log(`wrote ${items.length} scenes -> ${target}`)
}
