import { describe, expect, it } from 'vitest'
import type { SceneSet } from '../content/types'
import { applyScene, audioUrl, fallbackDurationMs, initialState, stateAfterScene, stateBeforeScene } from './timeline'

const set: SceneSet = {
  stage: { width: 800, height: 400 },
  actors: [
    { id: 'a', kind: 'pc', x: 10, y: 20, label: 'A' },
    { id: 'sw', kind: 'switch', x: 100, y: 20 },
    { id: 'b', kind: 'pc', x: 200, y: 20 },
    { id: 'env', kind: 'envelope', x: 10, y: 60, hidden: true },
  ],
  scenes: [
    { id: 's0', narrationTh: 'หนึ่ง', actions: [{ type: 'show', actor: 'env' }, { type: 'move', actor: 'a', x: 50, y: 70, ms: 500 }] },
    { id: 's1', narrationTh: 'สอง', actions: [{ type: 'moveAlong', actor: 'env', path: ['a', 'sw', 'b'], msPerHop: 300 }, { type: 'highlight', actor: 'b' }] },
    { id: 's2', narrationTh: 'สาม', actions: [{ type: 'hide', actor: 'env' }, { type: 'setLabel', actor: 'b', label: 'B2' }, { type: 'unhighlight', actor: 'b' }] },
  ],
}

describe('timeline', () => {
  it('initialState copies actors by id', () => {
    const s = initialState(set)
    expect(s.actors.a).toMatchObject({ x: 10, y: 20 })
    expect(s.actors.env.hidden).toBe(true)
  })

  it('move changes x,y and show clears hidden, without mutating input', () => {
    const s0 = initialState(set)
    const s1 = applyScene(s0, set.scenes[0])
    expect(s1.actors.a).toMatchObject({ x: 50, y: 70 })
    expect(s1.actors.env.hidden).toBe(false)
    expect(s0.actors.a).toMatchObject({ x: 10, y: 20 })
  })

  it('hide sets hidden; setLabel and highlight work', () => {
    const s = applyScene(applyScene(applyScene(initialState(set), set.scenes[0]), set.scenes[1]), set.scenes[2])
    expect(s.actors.env.hidden).toBe(true)
    expect(s.actors.b.label).toBe('B2')
    expect(s.actors.b.highlighted).toBe(false)
  })

  it('moveAlong ends at the position of the last actor in the path', () => {
    const s = applyScene(applyScene(initialState(set), set.scenes[0]), set.scenes[1])
    expect(s.actors.env).toMatchObject({ x: 200, y: 20 })
    expect(s.actors.b.highlighted).toBe(true)
  })

  it('stateBeforeScene(set, 2) equals scenes 0 and 1 applied in order', () => {
    const expected = applyScene(applyScene(initialState(set), set.scenes[0]), set.scenes[1])
    expect(stateBeforeScene(set, 2)).toEqual(expected)
    expect(stateBeforeScene(set, 0)).toEqual(initialState(set))
  })

  it('fallbackDurationMs = (len*90+1500)/rate', () => {
    expect(fallbackDurationMs('ก'.repeat(100), 1)).toBe(10500)
    expect(fallbackDurationMs('ก'.repeat(100), 0.75)).toBe(14000)
  })

  it('audioUrl', () => {
    expect(audioUrl('p0-l1', 's1')).toBe('/audio/p0-l1/s1.mp3')
  })

  it('audioUrl อยู่ใต้ base path ของเว็บ (GitHub Pages)', () => {
    expect(audioUrl('p0-l1', 's1', '/LnwNetwork/')).toBe('/LnwNetwork/audio/p0-l1/s1.mp3')
  })
})

describe('timeline v2 (เวทีเริ่มใหม่ทุกฉาก)', () => {
  const v2: SceneSet = {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors: [
      { id: 'A', kind: 'pc', x: 100, y: 100, hidden: true },
      { id: 'B', kind: 'pc', x: 400, y: 100, hidden: true },
      { id: 'sw', kind: 'switch', x: 250, y: 300 },
      { id: 'card', kind: 'card', x: 100, y: 0, hidden: true, lines: ['ถึง: B'], tone: 'reply' },
      { id: 'nb', kind: 'table', x: 700, y: 400, titleTh: 'สมุด', columns: ['IP', 'MAC'], rows: [] },
    ],
    scenes: [
      { id: 'a', narrationTh: 'หนึ่ง', chipTh: 'หนึ่ง', lifeTh: 'ชีวิต', actions: [{ type: 'show', actor: 'A' }] },
      {
        id: 'b', narrationTh: 'สอง', chipTh: 'สอง', lifeTh: 'ชีวิต',
        setup: [{ type: 'show', actor: 'B' }],
        actions: [
          { type: 'ripple', actor: 'B', tone: 'bcast' },
          { type: 'trail', path: ['B', 'sw'], tone: 'bcast' },
          { type: 'say', actor: 'B', text: 'ฉันเอง', mood: 'yes' },
          { type: 'dim', actor: 'sw' },
          { type: 'glow', actor: 'B' },
          { type: 'setRows', actor: 'nb', rows: [['1.1.1.1', 'AA']] },
          { type: 'show', actor: 'card' },
          { type: 'moveAlong', actor: 'card', path: ['A', 'B'], msPerHop: 100, offset: { dx: -165, dy: 0 } },
        ],
      },
    ],
  }

  it('stateBeforeScene ใช้ initialState + setup ไม่เอาของจากฉากก่อน', () => {
    const s = stateBeforeScene(v2, 1)
    expect(s.actors.B.hidden).toBe(false)
    expect(s.actors.A.hidden).toBe(true)
    expect(s.trails).toEqual([])
    expect(s.bubbles).toEqual([])
  })

  it('stateAfterScene มี trail, bubble, dim, glow, rows และซองจอดตาม offset', () => {
    expect(stateAfterScene(v2, 0).actors.A.hidden).toBe(false)
    const s = stateAfterScene(v2, 1)
    expect(s.trails).toEqual([{ path: ['B', 'sw'], tone: 'bcast' }])
    expect(s.bubbles).toEqual([{ actor: 'B', text: 'ฉันเอง', mood: 'yes' }])
    expect(s.actors.sw.dimmed).toBe(true)
    expect(s.actors.B.glow).toBe(true)
    expect(s.actors.nb.rows).toEqual([['1.1.1.1', 'AA']])
    expect(s.actors.card).toMatchObject({ x: 235, y: 100, hidden: false })
  })

  it('SceneSet แบบเดิมยังสะสมสภาพจากฉากก่อน', () => {
    expect(stateBeforeScene(set, 1).actors.env.hidden).toBe(false)
    expect(stateAfterScene(set, 0)).toEqual(applyScene(initialState(set), set.scenes[0]))
  })
})
