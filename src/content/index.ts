import type { GlossaryTerm, Lesson, Part, SceneAction } from './types'
import { parts } from './parts'

export * from './types'
export { glossary } from './glossary'

export const course: Part[] = parts

function actorRefs(a: SceneAction): string[] {
  return a.type === 'moveAlong' ? [a.actor, ...a.path] : [a.actor]
}

function validateReady(l: Lesson, glossaryIds: Set<string>, errs: string[]): void {
  const id = l.id
  if (l.videos.length === 0) errs.push(`บท ${id}: ยังไม่มีคลิปวิดีโอ`)
  if (!l.scenes || l.scenes.scenes.length === 0) errs.push(`บท ${id}: ยังไม่มีภาพเคลื่อนไหว (scenes)`)
  if (!l.lab) errs.push(`บท ${id}: ยังไม่มีห้องทดลอง (lab)`)

  if (!l.quiz || l.quiz.length === 0) {
    errs.push(`บท ${id}: ยังไม่มีคำถาม (quiz)`)
  } else {
    if (!l.quiz.some((q) => q.layer === 'th')) errs.push(`บท ${id}: quiz ไม่มีคำถามชั้นภาษาไทย (th)`)
    if (!l.quiz.some((q) => q.layer === 'en')) errs.push(`บท ${id}: quiz ไม่มีคำถามชั้นภาษาอังกฤษ (en)`)
    for (const q of l.quiz) {
      if (q.layer === 'en' && !q.promptTh) errs.push(`บท ${id}: คำถาม ${q.id} (en) ไม่มีคำแปลไทย promptTh`)
      const choiceIds = new Set(q.choices.map((c) => c.id))
      for (const c of q.correct) {
        if (!choiceIds.has(c)) errs.push(`บท ${id}: คำถาม ${q.id} มีคำตอบที่ถูกอ้างถึง choice "${c}" ซึ่งไม่มีอยู่`)
      }
    }
  }

  for (const t of l.terms ?? []) {
    if (!glossaryIds.has(t)) errs.push(`บท ${id}: อ้างศัพท์ "${t}" ที่ไม่มีใน glossary`)
  }

  if (l.scenes) {
    const actorIds = new Set(l.scenes.actors.map((a) => a.id))
    for (const a of l.scenes.actors) {
      if (a.to && !actorIds.has(a.to)) errs.push(`บท ${id}: actor "${a.id}" ต่อสายไปหา "${a.to}" ซึ่งไม่มีอยู่`)
    }
    for (const s of l.scenes.scenes) {
      for (const act of s.actions) {
        for (const ref of actorRefs(act)) {
          if (!actorIds.has(ref)) errs.push(`บท ${id}: ฉาก ${s.id} อ้างถึง actor "${ref}" ซึ่งไม่มีอยู่`)
        }
      }
    }
  }
}

/** คืนรายการปัญหาเป็นภาษาไทย; ว่าง = ผ่าน */
export function validateCourse(parts: Part[], glossary: GlossaryTerm[]): string[] {
  const errs: string[] = []
  const glossaryIds = new Set(glossary.map((g) => g.id))
  const seen = new Set<string>()
  for (const p of parts) {
    for (const l of p.lessons) {
      if (seen.has(l.id)) errs.push(`บท ${l.id}: รหัสบทซ้ำกัน`)
      seen.add(l.id)
      if (l.status === 'ready') validateReady(l, glossaryIds, errs)
    }
  }
  return errs
}
