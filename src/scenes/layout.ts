import type { ActorKind } from '../content/types'
import type { StageActor, StageState } from './timeline'

// ขนาดที่ใช้วาด (actors.tsx) กับขนาดที่ใช้ตรวจของทับกัน มาจากที่เดียวกัน
export const ICON_SCALE = 1.6
export const LABEL_BELOW_Y = 36 * ICON_SCALE + 26 // baseline ป้ายใต้ไอคอน
export const CARD = { font: 18, line: 26, pad: 12 }
export const TABLE = { w: 380, col2: 170, row: 34 }
export const BUBBLE = { font: 20, h: 44, gap: 32 }

/** ครึ่งกว้าง/ครึ่งสูงของไอคอนหลังขยาย ICON_SCALE */
export const HALF: Record<ActorKind, [number, number]> = {
  pc: [48, 48], laptop: [55, 45], switch: [61, 26], router: [58, 51], server: [45, 48], cloud: [64, 48],
  house: [55, 55], person: [32, 54], envelope: [38, 26], box: [38, 35], truck: [61, 38],
  commit: [29, 29], file: [29, 35],
  label: [0, 0], cable: [0, 0], card: [0, 0], table: [0, 0],
}

export interface Box { x: number; y: number; w: number; h: number }

// shortcut: กว้างโดยประมาณ (สระบน/ล่างของไทยไม่กินที่ อีโมจิกว้างกว่า) วัดจริงด้วย getBBox ถ้าเริ่มคลาดเคลื่อน
export function textWidth(s: string, font: number): number {
  let em = 0
  for (const ch of s) {
    const c = ch.codePointAt(0)!
    if (c === 0x0e31 || (c >= 0x0e34 && c <= 0x0e3a) || (c >= 0x0e47 && c <= 0x0e4e) || c === 0xfe0f) continue
    em += c > 0x2000 && !(c >= 0x0e00 && c <= 0x0e7f) ? 1.1 : 0.62
  }
  return em * font
}

export const cardSize = (lines: string[]) => ({
  w: Math.max(...lines.map((l) => textWidth(l, CARD.font)), 40) + CARD.pad * 2,
  h: lines.length * CARD.line + 18,
})
export const tableSize = (rows: number) => ({ w: TABLE.w, h: 94 + Math.max(rows, 1) * TABLE.row })

const union = (a: Box, b: Box): Box => {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y)
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}

/** กรอบของ actor รวมป้ายชื่อ (พิกัดเวที) */
export function boxOf(a: StageActor): Box {
  if (a.kind === 'card') {
    const { w, h } = cardSize(a.lines ?? [])
    return { x: a.x - w / 2, y: a.y - h / 2, w, h }
  }
  if (a.kind === 'table') {
    const { w, h } = tableSize(a.rows?.length ?? 0)
    return { x: a.x - w / 2, y: a.y - h / 2, w, h }
  }
  if (a.kind === 'label') {
    const w = textWidth(a.label ?? '', 26)
    return { x: a.x - w / 2, y: a.y - 21, w, h: 28 }
  }
  const [hw, hh] = HALF[a.kind]
  let box: Box = { x: a.x - hw, y: a.y - hh, w: hw * 2, h: hh * 2 }
  if (a.highlighted) box = union(box, { x: a.x - 80, y: a.y - 77, w: 160, h: 154 })
  if (!a.label) return box
  const lines = a.label.split('\n')
  const w = Math.max(...lines.map((l, i) => textWidth(l, i === 0 ? 24 : 20)))
  const h = 26 + (lines.length - 1) * 28 // บรรทัดแรก 20 เหนือ baseline + 6 ใต้, บรรทัดต่อไปห่าง 28
  return union(box, a.labelSide === 'right'
    ? { x: a.x + hw + 12, y: a.y - 24, w, h }
    : { x: a.x - w / 2, y: a.y + LABEL_BELOW_Y - 20, w, h })
}

/** ป้ายพูดอยู่เหนือไอคอน */
export function bubbleBox(a: StageActor, text: string): Box {
  const w = textWidth(text, BUBBLE.font) + 36
  const cy = a.y - HALF[a.kind][1] - BUBBLE.gap
  return { x: a.x - w / 2, y: cy - BUBBLE.h / 2, w, h: BUBBLE.h }
}

/** ระยะห่างน้อยสุดระหว่างของสองชิ้น และระหว่างของกับขอบเวที */
export const GAP = 8
const hit = (a: Box, b: Box) =>
  a.x < b.x + b.w + GAP && b.x < a.x + a.w + GAP && a.y < b.y + b.h + GAP && b.y < a.y + a.h + GAP

/** คู่ของที่มองเห็นแล้วกรอบห่างกันไม่ถึง GAP (ไม่นับสาย) ป้ายพูดใช้ id `<actor>:bubble`
 *  ส่ง stage มาด้วย = ตรวจขอบเวทีด้วย คืนคู่ [id, 'ขอบเวที'] */
export function overlaps(state: StageState, stage?: { width: number; height: number }): [string, string][] {
  const items: [string, Box][] = Object.values(state.actors)
    .filter((a) => !a.hidden && a.kind !== 'cable' && !(a.kind === 'label' && !a.label))
    .map((a) => [a.id, boxOf(a)])
  for (const b of state.bubbles) {
    const a = state.actors[b.actor]
    if (a) items.push([`${b.actor}:bubble`, bubbleBox(a, b.text)])
  }
  const out: [string, string][] = []
  if (stage) {
    for (const [id, b] of items) {
      if (b.x < GAP || b.y < GAP || b.x + b.w > stage.width - GAP || b.y + b.h > stage.height - GAP) out.push([id, 'ขอบเวที'])
    }
  }
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) if (hit(items[i][1], items[j][1])) out.push([items[i][0], items[j][0]])
  }
  return out
}
