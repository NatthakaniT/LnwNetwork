import { describe, expect, it } from 'vitest'
import type { Lesson, Part } from '../src/content/types'
import { collectNarration } from './export-narration'

const lesson = (id: string, status: Lesson['status'], texts: [string, string][]): Lesson => ({
  id, part: 0, order: 1, status, titleTh: 't', analogyTh: '', ciscoModules: [], videos: [],
  scenes: { stage: { width: 100, height: 100 }, actors: [], scenes: texts.map(([sid, narrationTh]) => ({ id: sid, narrationTh, actions: [] })) },
})

const parts = (lessons: Lesson[]): Part[] => [{ part: 0, titleTh: 'p', examDomain: 'x', lessons }]

describe('collectNarration', () => {
  it('returns only scenes of ready lessons', () => {
    const out = collectNarration(parts([
      lesson('p0-l1', 'ready', [['s1', 'สวัสดี']]),
      lesson('p0-l2', 'building', [['s1', 'ยังไม่เสร็จ']]),
    ]))
    expect(out).toEqual([{ lessonId: 'p0-l1', sceneId: 's1', text: 'สวัสดี' }])
  })

  it('skips empty text and duplicate scenes, ignores lessons without scenes', () => {
    const noScenes: Lesson = { ...lesson('p0-l3', 'ready', []), scenes: undefined }
    const out = collectNarration(parts([
      lesson('p0-l1', 'ready', [['s1', 'ก'], ['s1', 'ซ้ำ'], ['s2', '   '], ['s3', ' ข ']]),
      noScenes,
    ]))
    expect(out).toEqual([
      { lessonId: 'p0-l1', sceneId: 's1', text: 'ก' },
      { lessonId: 'p0-l1', sceneId: 's3', text: 'ข' },
    ])
    expect(out.every((o) => o.text.length > 0)).toBe(true)
  })
})
