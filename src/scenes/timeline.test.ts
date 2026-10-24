import { describe, expect, it } from 'vitest'
import type { SceneSet } from '../content/types'
import { applyScene, audioUrl, fallbackDurationMs, initialState, stateBeforeScene } from './timeline'

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
