import type { GlossaryTerm, Lesson, LessonId, Part, QuizQuestion, SceneAction } from './types'
import { parts } from './parts'
import { stateAfterScene } from '../scenes/timeline'
import { overlaps } from '../scenes/layout'

export * from './types'
export { glossary } from './glossary'

export const course: Part[] = parts

function actorRefs(a: SceneAction): string[] {
  if (a.type === 'trail') return a.path
  return a.type === 'moveAlong' ? [a.actor, ...a.path] : [a.actor]
}

/** ข้อความที่ผู้เรียนเห็นในฉาก (ไม่รวมบทพูด) */
function actionTexts(a: SceneAction): string[] {
  if (a.type === 'setLabel') return [a.label]
  if (a.type === 'say') return [a.text]
  if (a.type === 'setRows') return a.rows.flat()
  return []
}

const inOrder = (parts: Part[]): Lesson[] =>
  parts.flatMap((p) => p.lessons).sort((a, b) => a.part - b.part || a.order - b.order)

/** ศัพท์แต่ละคำ (glossary id) สอนครั้งแรกในบทไหน: บท ready แรกตามลำดับที่ใส่ศัพท์นั้นใน terms */
export function firstTaughtIn(parts: Part[]): Map<string, LessonId> {
  const m = new Map<string, LessonId>()
  for (const l of inOrder(parts)) {
    if (l.status !== 'ready') continue
    for (const t of l.terms ?? []) if (!m.has(t)) m.set(t, l.id)
  }
  return m
}

const quizTexts = (qs: QuizQuestion[]): string[] =>
  qs.flatMap((q) => [q.prompt, q.promptTh ?? '', q.explainTh, ...q.choices.flatMap((c) => [c.text, c.textTh ?? ''])])

/** ข้อความที่ผู้เรียนเห็นในบท ready */
function learnerTexts(l: Lesson): string[] {
  const out = [l.analogyTh, ...quizTexts(l.quiz ?? []), ...quizTexts(l.precheck ?? []), ...l.videos.map((v) => v.noteTh ?? '')]
  out.push(...(l.requires ?? []).map((r) => r.useTh), l.tryIt?.introTh ?? '', ...(l.deepDives ?? []).flatMap((d) => [d.titleTh, d.bodyTh]))
  for (const a of l.scenes?.actors ?? []) {
    out.push(a.label ?? '', ...(a.lines ?? []), a.titleTh ?? '', ...(a.columns ?? []), ...(a.rows ?? []).flat())
  }
  for (const s of l.scenes?.scenes ?? []) {
    out.push(s.narrationTh, s.chipTh ?? '', s.lifeTh ?? '')
    for (const act of [...(s.setup ?? []), ...s.actions]) out.push(...actionTexts(act))
  }
  if (l.lab) out.push(l.lab.introTh)
  if (l.lab?.kind === 'network') for (const g of l.lab.goals) out.push(g.taskTh, g.hintTh)
  else if (l.lab) out.push(...l.lab.items.map((i) => i.textTh), l.lab.explainTh, l.lab.rightTh ?? '')
  return out
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function validateReady(l: Lesson, glossaryIds: Set<string>, errs: string[]): void {
  const id = l.id
  if (l.videos.length === 0) errs.push(`บท ${id}: ยังไม่มีคลิปวิดีโอ`)
  if (!l.scenes || l.scenes.scenes.length === 0) errs.push(`บท ${id}: ยังไม่มีภาพเคลื่อนไหว (scenes)`)
  if (!l.lab) errs.push(`บท ${id}: ยังไม่มีห้องทดลอง (lab)`)
  if (l.lab?.kind === 'network') {
    l.lab.goals.forEach((g, i) => {
      if (!g.taskTh?.trim()) errs.push(`บท ${id}: เป้าหมายที่ ${i + 1} ของห้องทดลอง ไม่มีคำบอกงาน (taskTh)`)
    })
  }

  if (!l.quiz || l.quiz.length === 0) {
    errs.push(`บท ${id}: ยังไม่มีคำถาม (quiz)`)
  } else {
    if (!l.quiz.some((q) => q.layer === 'th')) errs.push(`บท ${id}: quiz ไม่มีคำถามชั้นภาษาไทย (th)`)
    if (!l.quiz.some((q) => q.layer === 'en')) errs.push(`บท ${id}: quiz ไม่มีคำถามชั้นภาษาอังกฤษ (en)`)
    for (const q of l.quiz) {
      if (q.layer === 'en' && !q.promptTh) errs.push(`บท ${id}: คำถาม ${q.id} (en) ไม่มีคำแปลไทย promptTh`)
    }
  }
  for (const q of [...(l.quiz ?? []), ...(l.precheck ?? [])]) {
    const choiceIds = new Set(q.choices.map((c) => c.id))
    for (const c of q.correct) {
      if (!choiceIds.has(c)) errs.push(`บท ${id}: คำถาม ${q.id} มีคำตอบที่ถูกอ้างถึง choice "${c}" ซึ่งไม่มีอยู่`)
    }
  }

  for (const t of l.terms ?? []) {
    if (!glossaryIds.has(t)) errs.push(`บท ${id}: อ้างศัพท์ "${t}" ที่ไม่มีใน glossary`)
  }

  for (const q of l.precheck ?? []) {
    if ((q.layer as string) !== 'th') errs.push(`บท ${id}: precheck ต้องเป็นภาษาไทย (คำถาม ${q.id})`)
  }
  if (l.tryIt?.kind === 'bits8') {
    for (const g of l.tryIt.goals) {
      if (!Number.isInteger(g) || g < 0 || g > 255) errs.push(`บท ${id}: เป้าหมาย tryIt ต้องเป็นจำนวนเต็ม 0 ถึง 255 (เจอ ${g})`)
    }
  }

  if (l.scenes) {
    const actorIds = new Set(l.scenes.actors.map((a) => a.id))
    for (const a of l.scenes.actors) {
      if (a.to && !actorIds.has(a.to)) errs.push(`บท ${id}: actor "${a.id}" ต่อสายไปหา "${a.to}" ซึ่งไม่มีอยู่`)
    }
    for (const s of l.scenes.scenes) {
      for (const act of [...(s.setup ?? []), ...s.actions]) {
        for (const ref of actorRefs(act)) {
          if (!actorIds.has(ref)) errs.push(`บท ${id}: ฉาก ${s.id} อ้างถึง actor "${ref}" ซึ่งไม่มีอยู่`)
        }
      }
    }
    if (l.scenes.style !== 'v2') errs.push(`บท ${id}: ต้องใช้ภาพเคลื่อนไหวแบบใหม่ (v2)`)
    else {
      l.scenes.scenes.forEach((s, i) => {
        if (!s.chipTh?.trim()) errs.push(`บท ${id}: ฉาก ${s.id} ไม่มีชื่อฉาก (chipTh)`)
        if (!s.lifeTh?.trim()) errs.push(`บท ${id}: ฉาก ${s.id} ไม่มีแถบชีวิตจริง (lifeTh)`)
        for (const [a, b] of overlaps(stateAfterScene(l.scenes!, i), l.scenes!.stage)) errs.push(`บท ${id}: ฉาก ${s.id} ตอนจบมีของซ้อนกัน: ${a} กับ ${b}`)
      })
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
  validateOrder(parts, glossary, errs)
  return errs
}

/** ตรวจที่ต้องรู้ลำดับบท: requires/precheck และการใช้ศัพท์ก่อนบทที่สอน */
function validateOrder(parts: Part[], glossary: GlossaryTerm[], errs: string[]): void {
  const lessons = inOrder(parts)
  const pos = new Map(lessons.map((l, i) => [l.id, i]))
  const byId = new Map(lessons.map((l) => [l.id, l]))
  for (const l of lessons) {
    if (l.status !== 'ready') continue
    const reqIds = new Set((l.requires ?? []).map((r) => r.lesson))
    for (const r of l.requires ?? []) {
      if (!byId.has(r.lesson)) errs.push(`บท ${l.id}: requires ชี้ไปบท ${r.lesson} ซึ่งไม่มีอยู่`)
      else if (pos.get(r.lesson)! >= pos.get(l.id)!) errs.push(`บท ${l.id}: requires บท ${r.lesson} ต้องเป็นบทก่อนหน้า`)
    }
    for (const q of l.precheck ?? []) {
      if (!reqIds.has(q.reviewLesson)) errs.push(`บท ${l.id}: precheck ${q.id} มี reviewLesson ${q.reviewLesson} ที่ไม่อยู่ใน requires`)
      else if (byId.get(q.reviewLesson)?.status === 'building') errs.push(`บท ${l.id}: precheck ${q.id} ชี้ reviewLesson ${q.reviewLesson} ที่ยังไม่พร้อม`)
    }
  }

  const taught = firstTaughtIn(parts)
  const termById = new Map(glossary.map((g) => [g.id, g]))
  for (const l of lessons) {
    if (l.status !== 'ready') continue
    const text = learnerTexts(l).join('\n')
    for (const [tid, lid] of taught) {
      const term = termById.get(tid)
      if (!term || pos.get(lid)! <= pos.get(l.id)!) continue
      // ทั้งคำ ไม่สนตัวพิมพ์ เหมือน RichText
      if (new RegExp(`(?<![A-Za-z0-9])${escapeRe(term.en)}(?![A-Za-z0-9])`, 'i').test(text)) {
        errs.push(`บท ${l.id}: ใช้ศัพท์ "${term.en}" ก่อนบทที่สอน (${lid})`)
      }
    }
  }
}
