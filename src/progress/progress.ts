import type { LessonId, Part } from '../content/types'

export type StepKey = 'check' | 'video' | 'scenes' | 'lab' | 'quiz'
/** scores: คะแนนแบบทดสอบดีที่สุดของแต่ละบท (0–100)
 *  days: วันที่เข้ามาเรียน 'YYYY-MM-DD' ตามเวลาเครื่อง เรียงจากเก่าไปใหม่ (ใช้นับ streak) */
export interface Progress {
  version: 1; completed: LessonId[]; lastLesson?: LessonId; lastStep?: StepKey
  scores?: Record<LessonId, number>; days?: string[]
}

export const STORAGE_KEY = 'lnw-ccna-progress-v1'
// shortcut: เก็บวันเรียนล่าสุดไม่เกิน 400 วัน พอสำหรับ streak ยาวสุดที่นับได้ ถ้าจะทำปฏิทินย้อนหลังเกินปีต้องขยาย
const MAX_DAYS = 400
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

const STEPS: StepKey[] = ['check', 'video', 'scenes', 'lab', 'quiz']
const emptyProgress = (): Progress => ({ version: 1, completed: [] })

function parseScores(x: unknown): Record<LessonId, number> | undefined {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return undefined
  const out: Record<LessonId, number> = {}
  for (const [id, v] of Object.entries(x)) if (typeof v === 'number' && v >= 0 && v <= 100) out[id] = v
  return Object.keys(out).length ? out : undefined
}

const mergeDays = (a: string[] = [], b: string[] = []): string[] =>
  [...new Set([...a, ...b])].filter((d) => DAY_RE.test(d)).sort().slice(-MAX_DAYS)

function mergeScores(a: Progress['scores'], b: Progress['scores']): Progress['scores'] {
  if (!a && !b) return undefined
  const out = { ...a }
  for (const [id, v] of Object.entries(b ?? {})) out[id] = Math.max(out[id] ?? 0, v)
  return out
}

function defaultStorage(): Storage | undefined {
  try { return globalThis.localStorage } catch { return undefined }
}

export function loadProgress(storage: Storage | undefined = defaultStorage(), key: string = STORAGE_KEY): Progress {
  try {
    const raw = storage?.getItem(key)
    if (!raw) return emptyProgress()
    const d = JSON.parse(raw)
    if (!d || typeof d !== 'object' || d.version !== 1) return emptyProgress()
    if (!Array.isArray(d.completed) || !d.completed.every((x: unknown) => typeof x === 'string')) return emptyProgress()
    const p: Progress = { version: 1, completed: [...d.completed] }
    if (typeof d.lastLesson === 'string') p.lastLesson = d.lastLesson
    if (STEPS.includes(d.lastStep)) p.lastStep = d.lastStep
    const scores = parseScores(d.scores)
    if (scores) p.scores = scores
    if (Array.isArray(d.days)) {
      const days = mergeDays(d.days.filter((x: unknown): x is string => typeof x === 'string'))
      if (days.length) p.days = days
    }
    return p
  } catch {
    return emptyProgress()
  }
}

/** เขียนความคืบหน้า โดยรวมบทที่ผ่าน คะแนน และวันเรียนที่อยู่ใน storage เข้าไปด้วย
 *  (อีกแท็บอาจเพิ่งผ่านบทใหม่ ข้อมูลที่แท็บนี้ถืออยู่จึงเก่ากว่า) คืนค่าที่เขียนจริง */
export function saveProgress(p: Progress, storage: Storage | undefined = defaultStorage(), key: string = STORAGE_KEY): Progress {
  const s = loadProgress(storage, key)
  const merged: Progress = { ...p, completed: [...s.completed, ...p.completed.filter((id) => !s.completed.includes(id))] }
  const scores = mergeScores(s.scores, p.scores)
  if (scores) merged.scores = scores
  const days = mergeDays(s.days, p.days)
  if (days.length) merged.days = days
  try { storage?.setItem(key, JSON.stringify(merged)) } catch { /* storage full/blocked: ignore */ }
  return merged
}

function readyLessonIds(parts: Part[]): LessonId[] {
  return parts
    .flatMap(pt => pt.lessons)
    .filter(l => l.status === 'ready')
    .sort((a, b) => a.part - b.part || a.order - b.order)
    .map(l => l.id)
}

export function isUnlocked(id: LessonId, parts: Part[], p: Progress): boolean {
  const ids = readyLessonIds(parts)
  const i = ids.indexOf(id)
  if (i < 0) return false
  if (p.completed.includes(id)) return true // เรียนผ่านแล้ว เปิดได้เสมอ
  return i === 0 || p.completed.includes(ids[i - 1])
}

export function markCompleted(id: LessonId, p: Progress, score?: number): Progress {
  const next: Progress = { ...p, completed: p.completed.includes(id) ? [...p.completed] : [...p.completed, id] }
  if (score !== undefined) next.scores = mergeScores(p.scores, { [id]: score })
  return next
}

/** วันนี้ตามเวลาเครื่อง 'YYYY-MM-DD' (ไม่ใช้ toISOString เพราะเป็นเวลา UTC ตีหนึ่งไทยจะกลายเป็นเมื่อวาน) */
export function dayKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** บันทึกว่าวันนี้เข้ามาเรียน */
export function markStudied(p: Progress, today: string = dayKey()): Progress {
  return { ...p, days: mergeDays(p.days, [today]) }
}

/** จำนวนบทที่เรียนได้จริงตอนนี้ (บทที่ยังทำไม่เสร็จไม่นับ ไม่งั้นแถบความคืบหน้าไม่มีทางเต็ม) */
export function totalLessons(parts: Part[]): number {
  return readyLessonIds(parts).length
}

/** จำนวนบทที่ยังทำไม่เสร็จ */
export function buildingLessons(parts: Part[]): number {
  return parts.flatMap(pt => pt.lessons).length - totalLessons(parts)
}

/** ข้อความความคืบหน้าบนการ์ดวิชาและแผนที่ */
export function progressText(parts: Part[], p: Progress): string {
  const building = buildingLessons(parts)
  return `เรียนแล้ว ${countCompleted(parts, p)} จาก ${totalLessons(parts)} บท` + (building ? ` · อีก ${building} บทกำลังทำ` : '')
}

/** จำนวนบทที่เรียนผ่านแล้ว (นับเฉพาะบทที่เรียนได้จริงในแผนที่) */
export function countCompleted(parts: Part[], p: Progress): number {
  return readyLessonIds(parts).filter(id => p.completed.includes(id)).length
}

/** แถบความคืบหน้า = บทที่ผ่านแล้ว / บทที่เรียนได้จริง */
export function percentComplete(parts: Part[], p: Progress): number {
  const total = totalLessons(parts)
  if (total === 0) return 0
  return Math.round((countCompleted(parts, p) / total) * 100)
}

/** บทที่พร้อมเรียนบทแรกที่เปิดแล้วและยังไม่ผ่าน (บทที่ติดเครื่องหมาย ▶ บนแผนที่) */
export function firstOpenLesson(parts: Part[], p: Progress): LessonId | undefined {
  return readyLessonIds(parts).find(id => !p.completed.includes(id) && isUnlocked(id, parts, p))
}
