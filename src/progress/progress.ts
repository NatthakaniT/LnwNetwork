import type { LessonId, Part } from '../content/types'

export type StepKey = 'video' | 'scenes' | 'lab' | 'quiz'
export interface Progress { version: 1; completed: LessonId[]; lastLesson?: LessonId; lastStep?: StepKey }

export const STORAGE_KEY = 'lnw-ccna-progress-v1'

const STEPS: StepKey[] = ['video', 'scenes', 'lab', 'quiz']
const emptyProgress = (): Progress => ({ version: 1, completed: [] })

function defaultStorage(): Storage | undefined {
  try { return globalThis.localStorage } catch { return undefined }
}

export function loadProgress(storage: Storage | undefined = defaultStorage()): Progress {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const d = JSON.parse(raw)
    if (!d || typeof d !== 'object' || d.version !== 1) return emptyProgress()
    if (!Array.isArray(d.completed) || !d.completed.every((x: unknown) => typeof x === 'string')) return emptyProgress()
    const p: Progress = { version: 1, completed: [...d.completed] }
    if (typeof d.lastLesson === 'string') p.lastLesson = d.lastLesson
    if (STEPS.includes(d.lastStep)) p.lastStep = d.lastStep
    return p
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: Progress, storage: Storage | undefined = defaultStorage()): void {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(p)) } catch { /* storage full/blocked: ignore */ }
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
  if (p.completed.includes(id)) return true // เรียนผ่าน/สอบข้ามแล้ว เปิดได้เสมอ
  return i === 0 || p.completed.includes(ids[i - 1])
}

export function markCompleted(id: LessonId, p: Progress): Progress {
  return { ...p, completed: p.completed.includes(id) ? [...p.completed] : [...p.completed, id] }
}

function allLessonIds(parts: Part[]): LessonId[] {
  return parts.flatMap(pt => pt.lessons).map(l => l.id)
}

export function totalLessons(parts: Part[]): number {
  return allLessonIds(parts).length
}

/** จำนวนบทที่เรียนผ่านแล้ว (นับเฉพาะบทที่มีในแผนที่) */
export function countCompleted(parts: Part[], p: Progress): number {
  return allLessonIds(parts).filter(id => p.completed.includes(id)).length
}

/** แถบความคืบหน้า = บทที่ผ่านแล้ว / ทุกบท (รวมบทที่ยังทำไม่เสร็จ) */
export function percentComplete(parts: Part[], p: Progress): number {
  const total = totalLessons(parts)
  if (total === 0) return 0
  return Math.round((countCompleted(parts, p) / total) * 100)
}

/** บทที่พร้อมเรียนบทแรกที่เปิดแล้วและยังไม่ผ่าน (บทที่ติดเครื่องหมาย ▶ บนแผนที่) */
export function firstOpenLesson(parts: Part[], p: Progress): LessonId | undefined {
  return readyLessonIds(parts).find(id => !p.completed.includes(id) && isUnlocked(id, parts, p))
}
