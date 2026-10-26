import { describe, expect, it } from 'vitest'
import type { Actor } from '../content/types'
import { boxOf, overlaps } from './layout'
import type { StageState } from './timeline'

const stage = (actors: Actor[], bubbles: StageState['bubbles'] = []): StageState => ({
  actors: Object.fromEntries(actors.map((a) => [a.id, a])), trails: [], bubbles,
})
const pc = (id: string, x: number, y: number, extra: Partial<Actor> = {}): Actor => ({ id, kind: 'pc', x, y, label: 'คอม', ...extra })

describe('layout', () => {
  it('pc สองเครื่องห่างกัน 100 ในแนวตั้งทับกัน ห่าง 260 ไม่ทับ', () => {
    expect(overlaps(stage([pc('a', 400, 100), pc('b', 400, 200)]))).toEqual([['a', 'b']])
    expect(overlaps(stage([pc('a', 400, 100), pc('b', 400, 360)]))).toEqual([])
  })

  it('ซองที่จอดด้วย offset dx -165 ข้าง pc ที่ x 760 ไม่ทับ pc นั้น', () => {
    const card: Actor = { id: 'c', kind: 'card', x: 760 - 165, y: 250, lines: ['ถึง: ทุกเครื่อง', 'ใครคือ .30 ?'], tone: 'bcast' }
    expect(overlaps(stage([pc('p', 760, 250, { labelSide: 'right' }), card]))).toEqual([])
    expect(overlaps(stage([pc('p', 760, 250), { ...card, x: 700 }]))).toEqual([['p', 'c']])
  })

  it('ไม่นับของที่ซ่อนและสาย แต่นับ label และป้ายพูด', () => {
    const cable: Actor = { id: 'w', kind: 'cable', x: 400, y: 100, to: 'a' }
    expect(overlaps(stage([pc('a', 400, 100), pc('b', 400, 120, { hidden: true }), cable]))).toEqual([])
    const lbl: Actor = { id: 'l', kind: 'label', x: 400, y: 100, label: 'ป้ายยาว ๆ' }
    expect(overlaps(stage([pc('a', 400, 100), lbl]))).toEqual([['a', 'l']])
    const bubbled = stage([pc('a', 400, 300), pc('b', 400, 120)], [{ actor: 'a', text: 'ไม่ใช่ฉัน', mood: 'no' }])
    expect(overlaps(bubbled)).toEqual([['b', 'a:bubble']])
  })

  it('กรอบของ card โตตามจำนวนบรรทัด table โตตามจำนวนแถว ป้ายข้างไอคอนอยู่ทางขวา', () => {
    const c1 = boxOf({ id: 'c', kind: 'card', x: 0, y: 0, lines: ['ก'] })
    const c3 = boxOf({ id: 'c', kind: 'card', x: 0, y: 0, lines: ['ก', 'ข', 'ค'] })
    expect(c3.h).toBeGreaterThan(c1.h)
    const t = (rows: [string, string][]) => boxOf({ id: 't', kind: 'table', x: 0, y: 0, titleTh: 'สมุด', columns: ['IP', 'MAC'], rows })
    expect(t([['a', 'b'], ['c', 'd']]).h).toBeGreaterThan(t([]).h)
    const side = boxOf(pc('p', 500, 200, { labelSide: 'right' }))
    const below = boxOf(pc('p', 500, 200))
    expect(side.x + side.w).toBeGreaterThan(below.x + below.w)
    expect(side.y + side.h).toBeLessThan(below.y + below.h)
  })
})
