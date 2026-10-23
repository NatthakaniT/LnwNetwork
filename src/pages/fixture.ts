import type { Lesson, Part, SceneSet } from '../content/types'

export function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage
}

export const scenes:SceneSet = {
  stage: { width: 100, height: 100 },
  actors: [{ id: 'a', kind: 'pc', x: 1, y: 1 }],
  scenes: [{ id: 's1', narrationTh: 'ฉากหนึ่ง', actions: [{ type: 'show', actor: 'a' }] }],
}

export const mk = (id: string, part: number, order: number, extra: Partial<Lesson> = {}): Lesson => ({
  id, part, order, status: 'ready', titleTh: `บท ${id}`, analogyTh: `เหมือน ${id}`, ciscoModules: [],
  videos: [{ youtubeId: `yt-${id}`, titleTh: `คลิป ${id}`, channel: 'ช่อง' }],
  scenes,
  lab: { kind: 'order', introTh: 'เรียงให้ถูก', items: [{ id: 'x', textTh: 'หนึ่ง' }, { id: 'y', textTh: 'สอง' }], answer: ['x', 'y'], explainTh: 'เพราะ' },
  quiz: [
    { id: 'q1', layer: 'th', prompt: 'ข้อไทย', choices: [{ id: 'a', text: 'ก' }, { id: 'b', text: 'ข' }], correct: ['a'], explainTh: 'เพราะ ก' },
    { id: 'q2', layer: 'en', prompt: 'English?', promptTh: 'แปลไทย', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correct: ['b'], explainTh: 'เพราะ B' },
  ],
  ...extra,
})

export const fixture: Part[] = [
  { part: 0, titleTh: 'ภาคทดสอบ', examDomain: 'Test', lessons: [
    mk('f1', 0, 1, { ciscoModules: ['ITN 1', 'ITN 3'] }),
    mk('f2', 0, 2),
    mk('f3', 0, 3),
    mk('b1', 0, 4, { status: 'building', quiz: undefined, scenes: undefined, lab: undefined, videos: [] }),
  ] },
]
