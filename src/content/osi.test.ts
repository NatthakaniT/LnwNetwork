import { describe, expect, it } from 'vitest'
import { glossary } from './glossary'
import { OSI_LAYERS, OSI_OTHER_IDS, OSI_SECTION_IDS, TCPIP_LAYERS } from './osi'
import { contrastRatio } from '../ui/contrast'

const ids = new Set(glossary.map((g) => g.id))

describe('osi', () => {
  it('ทุก termId มีอยู่ใน glossary', () => {
    for (const l of OSI_LAYERS) expect(ids.has(l.termId), l.termId).toBe(true)
    for (const t of TCPIP_LAYERS) expect(ids.has(t.termId), t.termId).toBe(true)
    for (const id of [...OSI_SECTION_IDS, ...OSI_OTHER_IDS]) expect(ids.has(id), id).toBe(true)
  })
  it('7 ชั้นเรียง 7 → 1 พร้อมคำสั้น', () => {
    expect(OSI_LAYERS.map((l) => l.no)).toEqual([7, 6, 5, 4, 3, 2, 1])
    expect(OSI_LAYERS.find((l) => l.no === 3)).toMatchObject({ termId: 'network-layer', shortTh: 'ใบปะหน้า · IP' })
    for (const l of OSI_LAYERS) expect(l.shortTh.trim()).not.toBe('')
  })
  it('TCP/IP 4 ชั้นครอบ OSI 7 → 1 ครบพอดี ไม่ซ้อนกัน', () => {
    expect(TCPIP_LAYERS.map((t) => t.termId)).toEqual(['application-layer', 'transport-layer', 'internet-layer', 'network-access-layer'])
    expect(TCPIP_LAYERS.flatMap((t) => t.osi)).toEqual([7, 6, 5, 4, 3, 2, 1])
  })
  it('OSI_SECTION_IDS กับ OSI_OTHER_IDS ไม่ซ้ำกัน และไม่ซ้ำในตัวเอง', () => {
    const all = [...OSI_SECTION_IDS, ...OSI_OTHER_IDS]
    expect(new Set(all).size).toBe(all.length)
    expect(OSI_SECTION_IDS).toHaveLength(9)
    expect(OSI_OTHER_IDS).toHaveLength(11)
    for (const l of OSI_LAYERS) expect(OSI_SECTION_IDS).toContain(l.termId)
    for (const t of TCPIP_LAYERS) expect(OSI_SECTION_IDS).toContain(t.termId)
  })
})

describe('osi: สีแถบชั้นอ่านออก', () => {
  const root = async () => {
    const fsModule = 'node:fs'
    const urlModule = 'node:url'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
    const css: string = readFileSync(new NodeURL('../styles.css', import.meta.url), 'utf-8')
    const block = css.match(/:root\s*\{([^}]*)\}/)![1]
    return (v: string): string => {
      const name = v.match(/^var\((--[\w-]+)\)$/)?.[1] ?? v
      const m = block.match(new RegExp(name + ':\\s*(#[0-9a-fA-F]{6})'))
      if (!m) throw new Error('ไม่มี token ' + name)
      return m[1]
    }
  }
  it('ทุกสีชั้นเป็น token และตัวหนังสือ --bg อ่านออก ≥ 4.5', async () => {
    const hex = await root()
    for (const l of OSI_LAYERS) {
      expect(l.color, `ชั้น ${l.no}`).toMatch(/^var\(--[\w-]+\)$/)
      expect(contrastRatio(hex('--bg'), hex(l.color)), `ชั้น ${l.no}`).toBeGreaterThanOrEqual(4.5)
    }
    expect(OSI_LAYERS.find((l) => l.no === 7)!.color).toBe('var(--p1)')
    expect(OSI_LAYERS.find((l) => l.no === 1)!.color).toBe('var(--p3)')
    expect(new Set(OSI_LAYERS.map((l) => l.color)).size).toBe(7)
  })
  it('กล่องคำอธิบาย (--surface) อ่านออก ≥ 4.5 ทั้ง --text และ --text-muted', async () => {
    const hex = await root()
    expect(contrastRatio(hex('--text'), hex('--surface'))).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(hex('--text-muted'), hex('--surface'))).toBeGreaterThanOrEqual(4.5)
  })
})
