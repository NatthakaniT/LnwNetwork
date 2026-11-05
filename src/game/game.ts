import type { Course, LessonId, Part } from '../content/types'
import type { Progress } from '../progress/progress'

/** ระบบเกม: คิดจากความคืบหน้าที่เก็บไว้แล้วทั้งหมด ไม่มีข้อมูลเกมแยก */

export const XP_PER_LESSON = 100
export const XP_PER_LEVEL = 500

/** ดาวของบทที่ผ่านแล้ว: เต็ม 3 ดาว, 90% ขึ้นไป 2 ดาว, ผ่าน 1 ดาว (บทที่ผ่านก่อนมีระบบคะแนนนับ 1 ดาว) */
export function stars(score: number | undefined): 1 | 2 | 3 {
  if (score === undefined) return 1
  return score >= 100 ? 3 : score >= 90 ? 2 : 1
}

/** XP ของบท: ผ่าน 100 + ดาวที่ 2 และ 3 ดวงละ 25 */
export const lessonXp = (score: number | undefined): number => XP_PER_LESSON + (stars(score) - 1) * 25

export function courseXp(parts: Part[], p: Progress): number {
  const ids = new Set(parts.flatMap((pt) => pt.lessons).map((l) => l.id))
  return p.completed.filter((id) => ids.has(id)).reduce((sum, id) => sum + lessonXp(p.scores?.[id]), 0)
}

export function levelOf(xp: number): { level: number; into: number; need: number } {
  return { level: Math.floor(xp / XP_PER_LEVEL) + 1, into: xp % XP_PER_LEVEL, need: XP_PER_LEVEL }
}

const prevDay = (day: string): string => {
  const [y, m, d] = day.split('-').map(Number)
  const t = new Date(y, m - 1, d - 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

/** วันติดกันที่เรียน นับถึงวันนี้ ถ้าวันนี้ยังไม่เรียนแต่เมื่อวานเรียน ไฟยังไม่ดับ */
export function currentStreak(days: string[], today: string): number {
  const set = new Set(days)
  let d = set.has(today) ? today : prevDay(today)
  let n = 0
  while (set.has(d)) { n++; d = prevDay(d) }
  return n
}

/** วันติดกันยาวที่สุดที่เคยทำได้ */
export function longestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort()
  let best = 0
  let run = 0
  sorted.forEach((d, i) => {
    run = i > 0 && prevDay(d) === sorted[i - 1] ? run + 1 : 1
    best = Math.max(best, run)
  })
  return best
}

/** ภาคที่ผ่านครบทุกบทที่พร้อมเรียนแล้ว (ภาคที่ยังไม่มีบทพร้อมไม่นับ) */
export function clearedParts(parts: Part[], p: Progress): number {
  return parts.filter((pt) => {
    const ready = pt.lessons.filter((l) => l.status === 'ready')
    return ready.length > 0 && ready.every((l) => p.completed.includes(l.id))
  }).length
}

export interface PlayerStats {
  xp: number
  completed: number
  perfect: number
  streak: number
  bestStreak: number
  partsCleared: number
  coursesStarted: number
}

/** รวมทุกวิชาเป็นสถิติผู้เล่นคนเดียว */
export function playerStats(list: { course: Course; progress: Progress }[], today: string): PlayerStats {
  const days = list.flatMap((x) => x.progress.days ?? [])
  const lessonIds = (c: Course): Set<LessonId> => new Set(c.parts.flatMap((pt) => pt.lessons).map((l) => l.id))
  let completed = 0
  let perfect = 0
  for (const { course, progress } of list) {
    const ids = lessonIds(course)
    const done = progress.completed.filter((id) => ids.has(id))
    completed += done.length
    perfect += done.filter((id) => (progress.scores?.[id] ?? 0) >= 100).length
  }
  return {
    xp: list.reduce((s, x) => s + courseXp(x.course.parts, x.progress), 0),
    completed,
    perfect,
    streak: currentStreak(days, today),
    bestStreak: longestStreak(days),
    partsCleared: list.reduce((s, x) => s + clearedParts(x.course.parts, x.progress), 0),
    coursesStarted: list.filter((x) => (x.progress.days?.length ?? 0) > 0 || x.progress.completed.length > 0).length,
  }
}

export interface Badge { id: string; code: string; titleTh: string; howTh: string; icon: string; unlocked: boolean }

/** เหรียญรางวัล: ปลดล็อกจากสถิติล้วน ๆ จึงไม่ต้องเก็บเพิ่ม และไม่มีวันหาย */
export function badges(s: PlayerStats): Badge[] {
  const b = (id: string, code: string, icon: string, titleTh: string, howTh: string, unlocked: boolean): Badge =>
    ({ id, code, icon, titleTh, howTh, unlocked })
  return [
    b('first', 'FIRST_CLEAR', '🚩', 'ด่านแรก', 'ผ่านบทเรียนบทแรก', s.completed >= 1),
    b('five', 'COMBO_x5', '⚡', 'คอมโบ 5', 'ผ่านบทเรียนครบ 5 บท', s.completed >= 5),
    b('ten', 'COMBO_x10', '🛰️', 'คอมโบ 10', 'ผ่านบทเรียนครบ 10 บท', s.completed >= 10),
    b('perfect', 'PERFECT', '💎', 'ไร้ที่ติ', 'ได้คะแนนเต็มในแบบทดสอบ', s.perfect >= 1),
    b('streak3', 'STREAK_3', '🔥', 'ไฟติด', 'เรียนติดกัน 3 วัน', s.bestStreak >= 3),
    b('streak7', 'STREAK_7', '☄️', 'ไฟลุก', 'เรียนติดกัน 7 วัน', s.bestStreak >= 7),
    b('stage', 'STAGE_CLEAR', '🏁', 'เคลียร์ภาค', 'ผ่านทุกบทที่เปิดแล้วของภาคใดภาคหนึ่ง', s.partsCleared >= 1),
    b('multi', 'MULTI_CLASS', '🧬', 'สองสาย', 'เริ่มเรียนครบทั้งสองวิชา', s.coursesStarted >= 2),
  ]
}
