import type { Lesson } from '../content/types'

/** เวลาเรียนของบทหนึ่ง (นาที) = คลิปหลักทั้งคลิป + เสียงบรรยายภาพทบทวน + เวลาลงมือทำ
 *  เสียงบรรยาย 0.08 วินาทีต่อตัวอักษร วัดจากไฟล์เสียงจริง 16 บท (เช่น 1357 ตัวอักษร = 107 วินาที)
 *  shortcut: เวลาลงมือทำเป็นค่าตายตัว (quiz ข้อละ 1 นาที, เช็กพื้นฐานข้อละครึ่งนาที, lab 4 นาที, tryIt 2 นาที)
 *  ถ้าจะแม่นกว่านี้ต้องเก็บเวลาที่ผู้เรียนใช้จริง */
export function lessonMinutes(l: Lesson): number {
  const v = l.videos[0]
  const video = v ? Math.max(0, (v.durationSec ?? 0) - (v.startSec ?? 0)) : 0
  const narration = (l.scenes?.scenes ?? []).reduce((s, x) => s + x.narrationTh.length, 0) * 0.08
  const doing = (l.quiz?.length ?? 0) * 60 + (l.precheck?.length ?? 0) * 30 + (l.lab ? 240 : 0) + (l.tryIt ? 120 : 0)
  return (video + narration + doing) / 60
}

/** เวลาเรียนรวมของบทที่เรียนได้จริง: ไม่ถึงชั่วโมงครึ่งบอกเป็นนาที (ปัดทีละ 5) นอกนั้นบอกเป็นชั่วโมง (ปัดทีละครึ่ง) */
export function studyTime(lessons: Lesson[]): string {
  const min = lessons.filter((l) => l.status === 'ready').reduce((s, l) => s + lessonMinutes(l), 0)
  if (min < 90) return `ประมาณ ${Math.max(5, Math.round(min / 5) * 5)} นาที`
  const halves = Math.round(min / 30)
  return `ประมาณ ${Math.floor(halves / 2)} ชั่วโมง${halves % 2 ? 'ครึ่ง' : ''}`
}
