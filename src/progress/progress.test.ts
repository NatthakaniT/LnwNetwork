import { describe, it, expect } from 'vitest'
import type { Lesson, Part } from '../content/types'
import { course } from '../content'
import {
  STORAGE_KEY, loadProgress, saveProgress, isUnlocked, markCompleted, percentComplete, countCompleted, totalLessons, firstOpenLesson, type Progress,
} from './progress'

const lesson = (id: string, part: number, order: number, status: 'ready' | 'building'): Lesson => ({
  id, part, order, status, titleTh: id, analogyTh: '', ciscoModules: [], videos: [],
})
const parts: Part[] = [
  { part: 0, titleTh: 'a', examDomain: 'x', lessons: [lesson('p0-l1', 0, 1, 'ready'), lesson('p0-l2', 0, 2, 'ready')] },
  { part: 1, titleTh: 'b', examDomain: 'x', lessons: [lesson('p1-l1', 1, 1, 'ready'), lesson('p1-l2', 1, 2, 'building'), lesson('p1-l3', 1, 3, 'ready')] },
]
const empty: Progress = { version: 1, completed: [] }

function fakeStorage(init: Record<string, string> = {}, opts: { getThrows?: boolean; setThrows?: boolean } = {}): Storage {
  const m = { ...init }
  return {
    getItem: (k: string) => { if (opts.getThrows) throw new Error('boom'); return k in m ? m[k] : null },
    setItem: (k: string, v: string) => { if (opts.setThrows) throw new Error('full'); m[k] = v },
    removeItem: (k: string) => { delete m[k] },
    clear: () => {}, key: () => null, length: 0,
  } as Storage
}

describe('isUnlocked', () => {
  it('progress เดิมที่เคยบันทึกไว้ ยังโหลดได้และบทถัดไปเปิดอยู่', () => {
    const raw = JSON.stringify({ version: 1, completed: ['p0-l1', 'p0-l2'] })
    const p = loadProgress(fakeStorage({ [STORAGE_KEY]: raw }))
    expect(p.completed).toEqual(['p0-l1', 'p0-l2'])
    expect(isUnlocked('p0-l3', course, p)).toBe(true)
  })
  it('first ready lesson is always unlocked; next is locked until it completes', () => {
    expect(isUnlocked('p0-l1', parts, empty)).toBe(true)
    expect(isUnlocked('p0-l2', parts, empty)).toBe(false)
    expect(isUnlocked('p0-l2', parts, { ...empty, completed: ['p0-l1'] })).toBe(true)
  })
  it('skips building lessons', () => {
    const p: Progress = { version: 1, completed: ['p0-l1', 'p0-l2', 'p1-l1'] }
    expect(isUnlocked('p1-l3', parts, p)).toBe(true)
    expect(isUnlocked('p1-l3', parts, { version: 1, completed: ['p0-l1', 'p0-l2'] })).toBe(false)
  })
  it('a completed lesson is always openable, even if the one before it is not completed', () => {
    const p: Progress = { version: 1, completed: ['p1-l1'] } // ผ่านบทนี้โดยไม่ผ่านบทก่อนหน้า
    expect(isUnlocked('p0-l2', parts, empty)).toBe(false)
    expect(isUnlocked('p1-l1', parts, p)).toBe(true)
    expect(isUnlocked('p1-l1', parts, empty)).toBe(false)
    // ของที่ยังไม่พร้อม/ไม่มี ก็ยังเปิดไม่ได้ แม้อยู่ใน completed
    expect(isUnlocked('p1-l2', parts, { version: 1, completed: ['p1-l2'] })).toBe(false)
    expect(isUnlocked('nope', parts, { version: 1, completed: ['nope'] })).toBe(false)
  })
  it('building lessons and unknown ids are never unlocked', () => {
    expect(isUnlocked('p1-l2', parts, { version: 1, completed: ['p0-l1', 'p0-l2', 'p1-l1'] })).toBe(false)
    expect(isUnlocked('nope', parts, empty)).toBe(false)
  })
  it('orders by part then order regardless of array order', () => {
    const shuffled: Part[] = [parts[1], parts[0]]
    expect(isUnlocked('p0-l1', shuffled, empty)).toBe(true)
    expect(isUnlocked('p1-l1', shuffled, empty)).toBe(false)
  })
})

describe('markCompleted', () => {
  it('adds once and returns a new object', () => {
    const a = markCompleted('p0-l1', empty)
    expect(a).not.toBe(empty)
    expect(empty.completed).toEqual([])
    expect(a.completed).toEqual(['p0-l1'])
    const b = markCompleted('p0-l1', a)
    expect(b.completed).toEqual(['p0-l1'])
    expect(b).not.toBe(a)
  })
})

describe('percentComplete / countCompleted / totalLessons', () => {
  it('bar is completed / ALL lessons (building ones included)', () => {
    expect(totalLessons(parts)).toBe(5)
    expect(percentComplete(parts, empty)).toBe(0)
    expect(percentComplete(parts, { version: 1, completed: ['p0-l1'] })).toBe(20)
    expect(percentComplete(parts, { version: 1, completed: ['p0-l1', 'p0-l2', 'p1-l1', 'p1-l3'] })).toBe(80)
    expect(countCompleted(parts, { version: 1, completed: ['p0-l1', 'nope'] })).toBe(1)
  })
  it('is 0 when there are no lessons', () => {
    expect(percentComplete([], empty)).toBe(0)
  })
})

describe('firstOpenLesson', () => {
  it('is the first ready lesson that is unlocked and not completed', () => {
    expect(firstOpenLesson(parts, empty)).toBe('p0-l1')
    expect(firstOpenLesson(parts, { version: 1, completed: ['p0-l1'] })).toBe('p0-l2')
    expect(firstOpenLesson(parts, { version: 1, completed: ['p0-l1', 'p0-l2', 'p1-l1', 'p1-l3'] })).toBeUndefined()
  })
})

describe('loadProgress / saveProgress', () => {
  it('round-trips', () => {
    const s = fakeStorage()
    const p: Progress = { version: 1, completed: ['p0-l1'], lastLesson: 'p0-l2', lastStep: 'quiz' }
    saveProgress(p, s)
    expect(loadProgress(s)).toEqual(p)
  })
  it('round-trips lastStep check', () => {
    const s = fakeStorage()
    const p: Progress = { version: 1, completed: [], lastLesson: 'p0-l2', lastStep: 'check' }
    saveProgress(p, s)
    expect(loadProgress(s)).toEqual(p)
  })
  it('returns empty progress for missing, corrupt, wrong-version or throwing storage', () => {
    expect(loadProgress(fakeStorage())).toEqual(empty)
    expect(loadProgress(fakeStorage({ [STORAGE_KEY]: '{oops' }))).toEqual(empty)
    expect(loadProgress(fakeStorage({ [STORAGE_KEY]: JSON.stringify({ version: 2, completed: ['p0-l1'] }) }))).toEqual(empty)
    expect(loadProgress(fakeStorage({ [STORAGE_KEY]: JSON.stringify({ version: 1, completed: 'x' }) }))).toEqual(empty)
    expect(loadProgress(fakeStorage({}, { getThrows: true }))).toEqual(empty)
  })
  it('saveProgress does not throw when setItem throws', () => {
    expect(() => saveProgress(empty, fakeStorage({}, { setThrows: true }))).not.toThrow()
  })
})

describe('ความคืบหน้าแยกวิชา', () => {
  it('progress เดิมของ CCNA โหลดด้วย key ของ CCNA ได้ และไม่ปนกับวิชา Git', () => {
    const s = fakeStorage({ 'lnw-ccna-progress-v1': JSON.stringify({ version: 1, completed: ['p0-l1'] }) })
    expect(loadProgress(s, 'lnw-ccna-progress-v1').completed).toEqual(['p0-l1'])
    expect(loadProgress(s).completed).toEqual(['p0-l1'])
    expect(loadProgress(s, 'lnw-git-progress-v1').completed).toEqual([])
  })
  it('บันทึกด้วย key ของวิชา Git ไม่ทับของ CCNA', () => {
    const s = fakeStorage({ 'lnw-ccna-progress-v1': JSON.stringify({ version: 1, completed: ['p0-l1'] }) })
    saveProgress({ version: 1, completed: ['g0-l1'] }, s, 'lnw-git-progress-v1')
    expect(loadProgress(s, 'lnw-git-progress-v1').completed).toEqual(['g0-l1'])
    expect(loadProgress(s, 'lnw-ccna-progress-v1').completed).toEqual(['p0-l1'])
  })
})
