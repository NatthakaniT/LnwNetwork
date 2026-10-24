import { describe, expect, it } from 'vitest'
import { PART_COLORS, contrastRatio } from './contrast'

const tokens = async () => {
  const fsModule = 'node:fs'
  const urlModule = 'node:url'
  const { readFileSync } = await import(/* @vite-ignore */ fsModule)
  const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
  const css: string = readFileSync(new NodeURL('../styles.css', import.meta.url), 'utf-8')
  const root = css.match(/:root\s*\{([^}]*)\}/)![1]
  const get = (n: string) => root.match(new RegExp('--' + n + ':\\s*(#[0-9a-fA-F]{6})'))![1]
  return get
}

describe('contrastRatio', () => {
  it('ดำบนขาว ≈ 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })
  it('ทุกสีภาคอ่านออก ≥ 4.5', () => {
    expect(Object.keys(PART_COLORS)).toHaveLength(7)
    for (const [i, c] of Object.entries(PART_COLORS)) {
      expect(contrastRatio(c.fg, c.bg), `part ${i}`).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('PART_COLORS ตรงกับ token --p0..--p6 ใน css', async () => {
    const get = await tokens()
    for (let i = 0; i <= 6; i++) expect(PART_COLORS[i].bg.toLowerCase()).toBe(get(`p${i}`).toLowerCase())
  })
  it('--text บน --bg ≥ 7 และ --text-muted บน --surface ≥ 4.5', async () => {
    const get = await tokens()
    expect(contrastRatio(get('text'), get('bg'))).toBeGreaterThanOrEqual(7)
    expect(contrastRatio(get('text-muted'), get('surface'))).toBeGreaterThanOrEqual(4.5)
  })
})
