import { describe, it, expect } from 'vitest'
import { course, validateCourse } from './index'
import { build } from './parts'
import { glossary } from './glossary'
import type { Lesson, Part, GlossaryTerm, QuizQuestion, SceneSet } from './types'

describe('course outline', () => {
  it('has 7 parts (0-6) and 45 lessons', () => {
    expect(course.map((p) => p.part)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(course.map((p) => p.lessons.length)).toEqual([5, 9, 8, 5, 7, 7, 4])
    expect(course.flatMap((p) => p.lessons)).toHaveLength(45)
  })

  it('uses spec 6.3 titles and ids', () => {
    expect(course[0].lessons.map((l) => l.titleTh)).toEqual([
      'Network คืออะไร',
      'อุปกรณ์มีอะไรบ้าง',
      'ข้อมูลเดินทางยังไง',
      'ที่อยู่ 2 แบบ: MAC กับ IP',
      'การห่อของเป็นชั้น ๆ',
    ])
    expect(course[0].lessons[0].analogyTh).toBe('ถนนกับรถส่งของ')
    expect(course[1].lessons[0].titleTh).toBe('เลขฐานสอง')
    expect(course[6].lessons[3].titleTh).toBe('Ansible/Terraform')
    expect(course[0].lessons[0].id).toBe('p0-l1')
    expect(course[1].lessons[8].id).toBe('p1-l9')
    expect(course[6].lessons[3].id).toBe('p6-l4')
    expect(course[0].lessons[2].ciscoModules).toEqual(['ITN 3'])
  })

  it('lesson ids do not depend on position', () => {
    const ids = (rows: Parameters<typeof build>[1]) => build(9, rows).map((l) => l.id).sort()
    expect(ids([['p9-a', 'ก'], ['p9-b', 'ข']])).toEqual(['p9-a', 'p9-b'])
    expect(ids([['p9-b', 'ข'], ['p9-a', 'ก']])).toEqual(['p9-a', 'p9-b'])
  })

  it('keeps the 45 original ids', () => {
    const expected = [5, 9, 8, 5, 7, 7, 4].flatMap((n, p) => Array.from({ length: n }, (_, i) => `p${p}-l${i + 1}`))
    expect(course.flatMap((p) => p.lessons).map((l) => l.id)).toEqual(expected)
  })

  it('passes validation', () => {
    expect(validateCourse(course, glossary)).toEqual([])
  })
})

const lesson = (over: Partial<Lesson> = {}): Lesson => ({
  id: 'p9-l1', part: 9, order: 1, status: 'building', titleTh: 't', analogyTh: '', ciscoModules: [], videos: [], ...over,
})
const parts = (...lessons: Lesson[]): Part[] => [{ part: 9, titleTh: 'x', examDomain: 'y', lessons }]
const q = (over: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id: 'q1', layer: 'th', prompt: 'p', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correct: ['a'], explainTh: 'e', ...over,
})
const scenes = (over: Partial<SceneSet> = {}): SceneSet => ({
  stage: { width: 100, height: 100 },
  actors: [{ id: 'a1', kind: 'pc', x: 0, y: 0 }],
  scenes: [{ id: 's1', narrationTh: 'n', actions: [{ type: 'show', actor: 'a1' }] }],
  ...over,
})
const video = { youtubeId: 'abc', titleTh: 'v', channel: 'c' }
const lab = { kind: 'order' as const, introTh: 'i', items: [{ id: 'a', textTh: 'a' }], answer: ['a'], explainTh: 'e' }
const readyOk = (over: Partial<Lesson> = {}): Lesson =>
  lesson({
    status: 'ready', videos: [video], scenes: scenes(), lab,
    quiz: [q({ id: 'q1', layer: 'th' }), q({ id: 'q2', layer: 'en', promptTh: 'แปล' })], ...over,
  })
const gl: GlossaryTerm[] = [{ id: 'mac', en: 'MAC', th: 'ที่อยู่', explainTh: 'e' }]
const has = (errs: string[], needle: string) => errs.some((e) => e.includes(needle))

describe('validateCourse', () => {
  it('accepts a fully valid ready lesson', () => {
    expect(validateCourse(parts(readyOk()), gl)).toEqual([])
  })

  it('reports duplicate lesson ids (even for building lessons)', () => {
    const errs = validateCourse(parts(lesson(), lesson()), gl)
    expect(errs.length).toBeGreaterThan(0)
    expect(has(errs, 'p9-l1')).toBe(true)
  })

  it('reports ready lesson missing video, scenes, lab, quiz', () => {
    const errs = validateCourse(
      parts(readyOk({ videos: [], scenes: undefined, lab: undefined, quiz: undefined })), gl)
    expect(errs.length).toBeGreaterThanOrEqual(4)
    expect(errs.every((e) => e.includes('p9-l1'))).toBe(true)
  })

  it('does not require content for building lessons', () => {
    expect(validateCourse(parts(lesson()), gl)).toEqual([])
  })

  it('reports quiz missing th or en layer', () => {
    const onlyTh = validateCourse(parts(readyOk({ quiz: [q()] })), gl)
    expect(has(onlyTh, 'p9-l1')).toBe(true)
    expect(onlyTh.length).toBe(1)
    const onlyEn = validateCourse(parts(readyOk({ quiz: [q({ layer: 'en', promptTh: 'x' })] })), gl)
    expect(onlyEn.length).toBe(1)
  })

  it('reports en question without promptTh', () => {
    const errs = validateCourse(parts(readyOk({ quiz: [q(), q({ id: 'q2', layer: 'en' })] })), gl)
    expect(errs.length).toBe(1)
    expect(has(errs, 'q2')).toBe(true)
  })

  it('reports correct referencing unknown choice id', () => {
    const errs = validateCourse(parts(readyOk({ quiz: [q({ correct: ['zzz'] }), q({ id: 'q2', layer: 'en', promptTh: 'x' })] })), gl)
    expect(errs.length).toBe(1)
    expect(has(errs, 'zzz')).toBe(true)
  })

  it('reports unknown glossary term', () => {
    const errs = validateCourse(parts(readyOk({ terms: ['mac', 'nope'] })), gl)
    expect(errs.length).toBe(1)
    expect(has(errs, 'nope')).toBe(true)
  })

  it('reports a network lab goal without taskTh', () => {
    const net = (taskTh: string) => ({
      kind: 'network' as const, introTh: 'i', start: { devices: [], links: [] }, palette: [],
      goals: [{ type: 'deliver' as const, from: 'pc1', toIp: '192.168.1.2', hintTh: 'h', taskTh }],
    })
    expect(validateCourse(parts(readyOk({ lab: net('ส่งของ') })), gl)).toEqual([])
    const errs = validateCourse(parts(readyOk({ lab: net('  ') })), gl)
    expect(errs.length).toBe(1)
    expect(has(errs, 'taskTh')).toBe(true)
  })

  it('reports scene action referencing missing actor', () => {
    const bad = scenes({ scenes: [{ id: 's1', narrationTh: 'n', actions: [
      { type: 'show', actor: 'ghost' },
      { type: 'moveAlong', actor: 'a1', path: ['a1', 'ghost2'], msPerHop: 10 },
    ] }] })
    const errs = validateCourse(parts(readyOk({ scenes: bad })), gl)
    expect(has(errs, 'ghost')).toBe(true)
    expect(has(errs, 'ghost2')).toBe(true)
  })
})
