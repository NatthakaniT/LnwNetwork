import { describe, it, expect } from 'vitest'
import type { Lesson, Part } from '../content/types'
import {
  STORAGE_KEY, loadProgress, saveProgress, isUnlocked, markCompleted, percentComplete, type Progress,
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

describe('percentComplete', () => {
  it('counts only ready lessons', () => {
    expect(percentComplete(parts, empty)).toBe(0)
    expect(percentComplete(parts, { version: 1, completed: ['p0-l1'] })).toBe(25)
    expect(percentComplete(parts, { version: 1, completed: ['p0-l1', 'p1-l2'] })).toBe(25)
    expect(percentComplete(parts, { version: 1, completed: ['p0-l1', 'p0-l2', 'p1-l1', 'p1-l3'] })).toBe(100)
  })
  it('is 0 when there are no ready lessons', () => {
    expect(percentComplete([], empty)).toBe(0)
  })
})

describe('loadProgress / saveProgress', () => {
  it('round-trips', () => {
    const s = fakeStorage()
    const p: Progress = { version: 1, completed: ['p0-l1'], lastLesson: 'p0-l2', lastStep: 'quiz' }
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
