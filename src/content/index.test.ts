import { describe, it, expect } from 'vitest'
import { course, validateCourse, firstTaughtIn } from './index'
import { build } from './parts'
import { glossary } from './glossary'
import type { Lesson, Part, PrecheckQuestion, GlossaryTerm, QuizQuestion, Scene, SceneSet } from './types'

describe('course outline', () => {
  it('has 7 parts (0-6) and 46 lessons', () => {
    expect(course.map((p) => p.part)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(course.map((p) => p.lessons.length)).toEqual([6, 9, 8, 5, 7, 7, 4])
    expect(course.flatMap((p) => p.lessons)).toHaveLength(46)
  })

  it('uses spec 6.3 titles and ids', () => {
    expect(course[0].lessons.map((l) => l.titleTh)).toEqual([
      'Network คืออะไร',
      'อุปกรณ์มีอะไรบ้าง',
      'ข้อมูลเดินทางยังไง',
      'คอมพูดภาษา 0 กับ 1',
      'ที่อยู่ 2 แบบ: MAC กับ IP',
      'การห่อของเป็นชั้น ๆ',
    ])
    expect(course[0].lessons[0].analogyTh).toBe('ถนนกับรถส่งของ')
    expect(course[1].lessons[0].titleTh).toBe('ฝึกแปลงเลขฐานสอง')
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

  it('keeps the 45 original ids and adds p0-bits before p0-l4', () => {
    const expected = [5, 9, 8, 5, 7, 7, 4].flatMap((n, p) => Array.from({ length: n }, (_, i) => `p${p}-l${i + 1}`))
    expected.splice(3, 0, 'p0-bits')
    expect(course.flatMap((p) => p.lessons).map((l) => l.id)).toEqual(expected)
  })

  it('passes validation', () => {
    expect(validateCourse(course, glossary)).toEqual([])
  })

  it('glossary cards have distinct Thai titles (ignoring the bracket note)', () => {
    const heads = glossary.map((g) => g.th.split(' (')[0])
    expect(heads.filter((h, i) => heads.indexOf(h) !== i)).toEqual([])
  })

  it('no lesson text names another lesson by number (numbers shift when a lesson is added)', () => {
    const texts: string[] = []
    const walk = (v: unknown) => {
      if (typeof v === 'string') texts.push(v)
      else if (v && typeof v === 'object') Object.values(v).forEach(walk)
    }
    walk(course.flatMap((p) => p.lessons).filter((l) => l.status === 'ready'))
    const byNumber = /บทที่\s*([0-9]|หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า|สิบ)/
    for (const t of ['บทที่ 4 เล่า', 'บทที่4', 'บทที่สี่', 'บทที่ สี่']) expect(byNumber.test(t), t).toBe(true)
    expect(byNumber.test('บทที่แล้ว')).toBe(false)
    expect(texts.filter((t) => byNumber.test(t))).toEqual([])
  })

  it('lesson order matches its position in the part', () => {
    for (const p of course) p.lessons.forEach((l, i) => expect(l.order, l.id).toBe(i + 1))
  })
})

const lesson = (over: Partial<Lesson> = {}): Lesson => ({
  id: 'p9-l1', part: 9, order: 1, status: 'building', titleTh: 't', analogyTh: '', ciscoModules: [], videos: [], ...over,
})
const parts = (...lessons: Lesson[]): Part[] => [{ part: 9, titleTh: 'x', examDomain: 'y', lessons }]
const q = (over: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id: 'q1', layer: 'th', prompt: 'p', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correct: ['a'], explainTh: 'e', ...over,
})
// ฉากแบบ v2 ที่ผ่านกฎ: มี chipTh/lifeTh และไม่มีของทับกันหรือชิดขอบ
const scene = (over: Partial<Scene> = {}): Scene => ({ id: 's1', narrationTh: 'n', chipTh: 'ฉาก', lifeTh: 'ชีวิตจริง', actions: [{ type: 'show', actor: 'a1' }], ...over })
const scenes = (over: Partial<SceneSet> = {}): SceneSet => ({
  style: 'v2',
  stage: { width: 960, height: 540 },
  actors: [{ id: 'a1', kind: 'pc', x: 100, y: 100 }],
  scenes: [scene()],
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

  it('requireEnglishQuiz: false ยอมให้บท ready ไม่มีชั้น en แต่ค่าเริ่มต้นยังบังคับ', () => {
    const onlyTh = parts(readyOk({ quiz: [q()] }))
    expect(validateCourse(onlyTh, gl, { requireEnglishQuiz: false })).toEqual([])
    expect(has(validateCourse(onlyTh, gl), '(en)')).toBe(true)
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
    const bad = scenes({ scenes: [scene({ actions: [
      { type: 'show', actor: 'ghost' },
      { type: 'moveAlong', actor: 'a1', path: ['a1', 'ghost2'], msPerHop: 10 },
    ] })] })
    const errs = validateCourse(parts(readyOk({ scenes: bad })), gl)
    expect(has(errs, 'ghost')).toBe(true)
    expect(has(errs, 'ghost2')).toBe(true)
  })

  it('ready lesson with old-style scenes must switch to v2', () => {
    const errs = validateCourse(parts(readyOk({ scenes: scenes({ style: undefined }) })), gl)
    expect(errs).toEqual(['บท p9-l1: ต้องใช้ภาพเคลื่อนไหวแบบใหม่ (v2)'])
    expect(validateCourse(parts(lesson({ scenes: scenes({ style: undefined }) })), gl)).toEqual([])
  })

  describe('ฉากแบบ v2', () => {
    const v2 = (sceneOver: object, actors = [{ id: 'a1', kind: 'pc' as const, x: 100, y: 100 }]) => scenes({
      style: 'v2', actors, stage: { width: 960, height: 540 },
      scenes: [{ id: 's1', narrationTh: 'n', chipTh: 'ถาม', lifeTh: 'ชีวิตจริง', actions: [{ type: 'show', actor: 'a1' }], ...sceneOver }],
    })
    it('ผ่านเมื่อมี chipTh lifeTh และไม่มีของทับกัน', () => {
      expect(validateCourse(parts(readyOk({ scenes: v2({}) })), gl)).toEqual([])
    })
    it('ฉากไม่มี chipTh หรือ lifeTh', () => {
      expect(has(validateCourse(parts(readyOk({ scenes: v2({ chipTh: undefined }) })), gl), 'chipTh')).toBe(true)
      expect(has(validateCourse(parts(readyOk({ scenes: v2({ lifeTh: '' }) })), gl), 'lifeTh')).toBe(true)
    })
    it('สภาพตอนจบของฉากมีของทับกัน', () => {
      const two = [{ id: 'a1', kind: 'pc' as const, x: 100, y: 100 }, { id: 'a2', kind: 'pc' as const, x: 120, y: 110 }]
      const errs = validateCourse(parts(readyOk({ scenes: v2({}, two) })), gl)
      expect(has(errs, 'ซ้อนกัน') && has(errs, 'a2')).toBe(true)
    })
    it('ของห่างขอบเวทีไม่ถึง 8 px', () => {
      const errs = validateCourse(parts(readyOk({ scenes: v2({}, [{ id: 'a1', kind: 'pc' as const, x: 20, y: 100 }]) })), gl)
      expect(has(errs, 'ซ้อนกัน') && has(errs, 'ขอบเวที')).toBe(true)
    })
    it('อ้าง actor ที่ไม่มีใน setup, trail และ say', () => {
      const errs = validateCourse(parts(readyOk({ scenes: v2({
        setup: [{ type: 'show', actor: 'ghost1' }],
        actions: [{ type: 'trail', path: ['a1', 'ghost2'], tone: 'bcast' }, { type: 'say', actor: 'ghost3', text: 'x', mood: 'no' }],
      }) })), gl)
      for (const g of ['ghost1', 'ghost2', 'ghost3']) expect(has(errs, g)).toBe(true)
    })
  })

  describe('foundations-first data', () => {
    const l1 = (over: Partial<Lesson> = {}) => readyOk({ id: 'p9-l1', order: 1, ...over })
    const l2 = (over: Partial<Lesson> = {}) => readyOk({ id: 'p9-l2', order: 2, ...over })
    const pre = (over: Partial<PrecheckQuestion> = {}): PrecheckQuestion => ({ ...q({ id: 'pq' }), layer: 'th', reviewLesson: 'p9-l1', ...over })
    const req = [{ lesson: 'p9-l1', useTh: 'ใช้ที่อยู่' }]

    it('reports requires pointing to a missing lesson', () => {
      const errs = validateCourse(parts(l1(), l2({ requires: [{ lesson: 'p9-zz', useTh: 'x' }] })), gl)
      expect(has(errs, 'requires') && has(errs, 'p9-zz')).toBe(true)
    })

    it('reports requires pointing to itself or a later lesson', () => {
      expect(has(validateCourse(parts(l1({ requires: [{ lesson: 'p9-l1', useTh: 'x' }] })), gl), 'ต้องเป็นบทก่อนหน้า')).toBe(true)
      expect(has(validateCourse(parts(l1({ requires: [{ lesson: 'p9-l2', useTh: 'x' }] }), l2()), gl), 'ต้องเป็นบทก่อนหน้า')).toBe(true)
    })

    it('reports precheck without requires or with reviewLesson outside requires', () => {
      expect(has(validateCourse(parts(l1(), l2({ precheck: [pre()] })), gl), 'reviewLesson')).toBe(true)
      expect(has(validateCourse(parts(l1(), l2({ requires: req, precheck: [pre({ reviewLesson: 'p9-l0' })] })), gl), 'reviewLesson')).toBe(true)
      expect(validateCourse(parts(l1(), l2({ requires: req, precheck: [pre()] })), gl)).toEqual([])
    })

    it('reports reviewLesson that is still building', () => {
      const errs = validateCourse(parts(lesson({ id: 'p9-l1', order: 1 }), l2({ requires: req, precheck: [pre()] })), gl)
      expect(has(errs, 'ยังไม่พร้อม')).toBe(true)
    })

    it('reports precheck with an en question', () => {
      const errs = validateCourse(parts(l1(), l2({ requires: req, precheck: [{ ...pre(), layer: 'en' } as never] })), gl)
      expect(has(errs, 'precheck ต้องเป็นภาษาไทย')).toBe(true)
    })

    it('reports bits8 goals outside 0-255 or non-integer', () => {
      const tryIt = (goals: number[]) => l1({ tryIt: { kind: 'bits8', introTh: 'i', goals } })
      expect(validateCourse(parts(tryIt([0, 255, 128])), gl)).toEqual([])
      for (const g of [256, -1, 1.5]) expect(has(validateCourse(parts(tryIt([g])), gl), '0 ถึง 255')).toBe(true)
    })

    it('reports a term used before the lesson that first teaches it', () => {
      const early = l1({ scenes: scenes({ scenes: [scene({ narrationTh: 'ใช้ mac นะ' })] }) })
      const errs = validateCourse(parts(early, l2({ terms: ['mac'] })), gl)
      expect(has(errs, 'ใช้ศัพท์ "MAC" ก่อนบทที่สอน')).toBe(true)
      expect(validateCourse(parts(l1({ terms: ['mac'] }), l2({ scenes: early.scenes })), gl)).toEqual([])
      const macaroni = l1({ scenes: scenes({ scenes: [scene({ narrationTh: 'macaroni' })] }) })
      expect(validateCourse(parts(macaroni, l2({ terms: ['mac'] })), gl)).toEqual([])
    })

    it('scans activity lab items, explainTh, rightTh and video noteTh for terms used too early', () => {
      const later = l2({ terms: ['mac'] })
      const early = [
        l1({ lab: { ...lab, items: [{ id: 'a', textTh: 'ป้าย MAC' }] } }),
        l1({ lab: { ...lab, explainTh: 'ดู MAC' } }),
        l1({ lab: { ...lab, rightTh: 'ใช่ MAC' } }),
        l1({ videos: [{ ...video, noteTh: 'จับแค่ MAC' }] }),
      ]
      for (const e of early) expect(has(validateCourse(parts(e, later), gl), 'ใช้ศัพท์ "MAC" ก่อนบทที่สอน')).toBe(true)
    })

    it('scans requires useTh, tryIt introTh and deep-dive boxes for terms used too early', () => {
      const later = l2({ terms: ['mac'] })
      const early = [
        l1({ requires: [{ lesson: 'p9-l0', useTh: 'ใช้ MAC' }] }),
        l1({ tryIt: { kind: 'bits8', introTh: 'กดหา MAC', goals: [1] } }),
        l1({ deepDives: [{ titleTh: 'MAC ลึก', bodyTh: 'x' }] }),
        l1({ deepDives: [{ titleTh: 'ลึก', bodyTh: 'เรื่อง MAC' }] }),
      ]
      for (const e of early) expect(has(validateCourse(parts(e, later), gl), 'ใช้ศัพท์ "MAC" ก่อนบทที่สอน')).toBe(true)
    })

    it('checks precheck choices like quiz choices', () => {
      const errs = validateCourse(parts(l1(), l2({ requires: req, precheck: [pre({ correct: ['zzz'] })] })), gl)
      expect(has(errs, 'pq') && has(errs, 'zzz')).toBe(true)
    })

    it('firstTaughtIn maps each term to its first lesson', () => {
      const m = firstTaughtIn(parts(l1({ terms: ['mac'] }), l2({ terms: ['mac', 'ip'] })))
      expect(m.get('mac')).toBe('p9-l1')
      expect(m.get('ip')).toBe('p9-l2')
    })
  })
})
