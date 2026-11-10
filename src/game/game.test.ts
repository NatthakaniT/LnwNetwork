import { describe, it, expect } from 'vitest'
import { badges, clearedParts, courseXp, currentStreak, levelOf, longestStreak, playerStats, stars, studyCalendar } from './game'
import type { Course, Part } from '../content/types'
import { mk } from '../pages/fixture'

const parts: Part[] = [
  { part: 0, titleTh: 'ก', examDomain: 'A', lessons: [mk('a1', 0, 1), mk('a2', 0, 2)] },
  { part: 1, titleTh: 'ข', examDomain: 'B', lessons: [mk('b1', 1, 1)] },
]
const course = (id: 'ccna' | 'git', ps: Part[]): Course =>
  ({ id, titleTh: id, taglineTh: '', parts: ps, glossary: [], storageKey: id, requireEnglishQuiz: false })

describe('game', () => {
  it('ดาว: เต็ม 3, ≥90 2, ผ่าน 1, ไม่มีคะแนน 1', () => {
    expect([stars(100), stars(90), stars(89), stars(80), stars(undefined)]).toEqual([3, 2, 1, 1, 1])
  })
  it('XP นับเฉพาะบทของวิชานี้ และเลเวลขึ้นทุก 500 XP', () => {
    const xp = courseXp(parts, { version: 1, completed: ['a1', 'a2', 'zz'], scores: { a1: 100, a2: 90 } })
    expect(xp).toBe(150 + 125)
    expect(levelOf(0)).toEqual({ level: 1, into: 0, need: 500 })
    expect(levelOf(1240)).toEqual({ level: 3, into: 240, need: 500 })
  })
  it('streak: นับถึงวันนี้ หรือเมื่อวานถ้าวันนี้ยังไม่เรียน, ข้ามเดือน/ปีได้, ขาดวันแล้วเริ่มใหม่', () => {
    const days = ['2025-12-30', '2025-12-31', '2026-01-01']
    expect(currentStreak(days, '2026-01-01')).toBe(3)
    expect(currentStreak(days, '2026-01-02')).toBe(3)
    expect(currentStreak(days, '2026-01-03')).toBe(0)
    expect(currentStreak([], '2026-01-01')).toBe(0)
    expect(longestStreak(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-05'])).toBe(3)
    expect(longestStreak([])).toBe(0)
  })
  it('ตารางวันเรียน: แถวละสัปดาห์เริ่มวันจันทร์ แถวสุดท้ายคือสัปดาห์นี้ ข้ามเดือนได้', () => {
    // 2026-11-05 เป็นวันพฤหัส สัปดาห์นี้คือ จ 2 ถึง อา 8
    const cal = studyCalendar(['2026-10-31', '2026-11-04', '2026-11-05', '2020-01-01'], '2026-11-05', 2)
    expect(cal.map((w) => w.map((c) => c.day))).toEqual([
      ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'],
      ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'],
    ])
    expect(cal.flat().filter((c) => c.studied).map((c) => c.day)).toEqual(['2026-10-31', '2026-11-04', '2026-11-05'])
    expect(cal.flat().filter((c) => c.today).map((c) => c.date)).toEqual([5])
    expect(cal.flat().filter((c) => c.future).map((c) => c.date)).toEqual([6, 7, 8])
    // วันนี้เป็นวันอาทิตย์ ต้องเป็นช่องสุดท้ายของแถว ไม่ใช่ช่องแรกของสัปดาห์ถัดไป
    expect(studyCalendar([], '2026-11-08', 1)[0][6]).toMatchObject({ day: '2026-11-08', today: true })
  })
  it('เคลียร์ภาค =ผ่านทุกบทที่พร้อม (ภาคที่ไม่มีบทพร้อมไม่นับ)', () => {
    const withBuilding: Part[] = [...parts, { part: 2, titleTh: 'ค', examDomain: 'C', lessons: [mk('c1', 2, 1, { status: 'building' })] }]
    expect(clearedParts(withBuilding, { version: 1, completed: ['b1'] })).toBe(1)
    expect(clearedParts(withBuilding, { version: 1, completed: ['a1'] })).toBe(0)
  })
  it('สถิติรวมสองวิชาและปลดเหรียญตามสถิติ', () => {
    const s = playerStats([
      { course: course('ccna', parts), progress: { version: 1, completed: ['a1', 'a2', 'b1'], scores: { b1: 100 }, days: ['2026-11-04', '2026-11-05'] } },
      { course: course('git', [{ part: 0, titleTh: 'g', examDomain: 'G', lessons: [mk('g1', 0, 1)] }]), progress: { version: 1, completed: [], days: ['2026-11-03'] } },
    ], '2026-11-05')
    expect(s).toMatchObject({ completed: 3, perfect: 1, streak: 3, bestStreak: 3, partsCleared: 2, coursesStarted: 2 })
    const got = Object.fromEntries(badges(s).map((b) => [b.id, b.unlocked]))
    expect(got).toEqual({ first: true, five: false, ten: false, perfect: true, streak3: true, streak7: false, stage: true, multi: true })
  })
})
