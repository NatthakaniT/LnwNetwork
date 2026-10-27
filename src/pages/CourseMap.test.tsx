import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { CourseMap } from './CourseMap'
import { fixture, memoryStorage } from './fixture'
import { course } from '../content'
import { saveProgress } from '../progress/progress'
import { PART_COLORS, contrastRatio } from '../ui/contrast'
import type { Part } from '../content/types'
import { mk } from './fixture'

const readCss = async (rel: string) => {
  const fsModule = 'node:fs'
  const urlModule = 'node:url'
  const { readFileSync } = await import(/* @vite-ignore */ fsModule)
  const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
  return (readFileSync(new NodeURL(rel, import.meta.url), 'utf-8') as string).replace(/\/\*[\s\S]*?\*\//g, '')
}
const rulesFor = (css: string, sel: string) =>
  (css.match(/[^{}]*\{[^{}]*\}/g) ?? [])
    .filter((r) => r.split('{')[0].split(',').map((x) => x.trim()).includes(sel))
    .map((r) => r.slice(r.indexOf('{') + 1, -1))
    .join(' ')

let storage: Storage
beforeEach(() => { storage = memoryStorage(); window.location.hash = '' })

describe('CourseMap', () => {
  it('real course renders 7 parts; building chips match non-ready lessons', () => {
    render(<CourseMap storage={storage} />)
    expect(document.querySelectorAll('.part')).toHaveLength(7)
    const notReady = course.flatMap((p) => p.lessons).filter((l) => l.status !== 'ready').length
    expect(screen.queryAllByText('กำลังทำ')).toHaveLength(notReady)
    expect(screen.getByText(`เรียนแล้ว 0 จาก ${course.flatMap((p) => p.lessons).length} บท`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /คลังศัพท์/ })).toHaveAttribute('href', '#/c/ccna/glossary')
    expect(screen.queryByRole('link', { name: 'เรียนต่อ' })).toBeNull()
  })

  it('shows done / current / locked / building states and progress', () => {
    saveProgress({ version: 1, completed: ['f1'] }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByText('เรียนแล้ว 1 จาก 4 บท')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25')
    const done = screen.getByRole('link', { name: /✅ บท f1/ })
    expect(done).toHaveClass('done')
    const now = screen.getByRole('link', { name: /▶ บท f2/ })
    expect(now).toHaveClass('now')
    expect(now).toHaveAttribute('href', '#/lesson/f2')
    const lock = screen.getByText(/🔒 บท f3/).closest('.l') as HTMLElement
    expect(lock.tagName).not.toBe('A')
    expect(within(lock).queryByRole('button', { name: 'สอบข้ามบท' })).toBeNull()
    expect(within(lock).queryByRole('button')).toBeNull()
    const building = screen.getByText(/บท b1/).closest('.l') as HTMLElement
    expect(building.tagName).not.toBe('A')
    expect(within(building).getByText('กำลังทำ')).toBeInTheDocument()
    expect(within(building).queryByRole('button')).toBeNull()
  })

  it('continue button points at lastLesson', () => {
    saveProgress({ version: 1, completed: [], lastLesson: 'f1', lastStep: 'lab' }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '#/lesson/f1')
  })

  it('continue button goes to the first open lesson, not an already-finished lastLesson', () => {
    saveProgress({ version: 1, completed: ['f1'], lastLesson: 'f1', lastStep: 'quiz' }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '#/lesson/f2')
  })

  it('a completed lesson (previous one not done) is openable on the map', () => {
    saveProgress({ version: 1, completed: ['f3'] }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByRole('link', { name: /✅ บท f3/ })).toHaveAttribute('href', '#/lesson/f3')
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '#/lesson/f1')
  })

  it('notice is dismissible', () => {
    let n: string | null = 'ต้องเรียนบทก่อนหน้าก่อนนะ'
    const { rerender } = render(<CourseMap parts={fixture} storage={storage} notice={n} onDismissNotice={() => { n = null }} />)
    expect(screen.getByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ปิด' }))
    rerender(<CourseMap parts={fixture} storage={storage} notice={n} />)
    expect(screen.queryByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeNull()
  })

  it('one card per part, coloured by PART_COLORS; parts with nothing open are locked with a pill', () => {
    saveProgress({ version: 1, completed: ['p0-l1'] }, storage)
    render(<CourseMap storage={storage} />)
    const cards = [...document.querySelectorAll<HTMLElement>('.part-card')]
    expect(cards).toHaveLength(7)
    cards.forEach((c, i) => {
      expect(c.style.getPropertyValue('--part')).toBe(PART_COLORS[i].bg)
      expect(c.style.getPropertyValue('--part-fg')).toBe(PART_COLORS[i].fg)
    })
    expect(cards[0]).not.toHaveClass('locked')
    expect(within(cards[0]).queryByText('🔒 ยังไม่ถึง')).toBeNull()
    for (const c of cards.slice(1)) {
      expect(c).toHaveClass('locked')
      expect(within(c).getByText('🔒 ยังไม่ถึง')).toBeInTheDocument()
    }
  })

  it('a part whose only open lesson is done is not locked', () => {
    const parts: Part[] = [
      { part: 0, titleTh: 'ก', examDomain: 'A', lessons: [mk('x1', 0, 1)] },
      { part: 1, titleTh: 'ข', examDomain: 'B', lessons: [mk('y1', 1, 1)] },
      { part: 2, titleTh: 'ค', examDomain: 'C', lessons: [mk('z1', 2, 1)] },
      { part: 3, titleTh: 'ง', examDomain: 'D', lessons: [mk('w1', 3, 1)] },
    ]
    // y1 ผ่านแล้ว (x1 ยังไม่ผ่าน): ภาค 1 มีแต่บทที่จบแล้ว ก็ยังไม่ล็อก; z1 เปิดต่อได้; w1 ยังไม่ถึง
    saveProgress({ version: 1, completed: ['y1'] }, storage)
    render(<CourseMap parts={parts} storage={storage} />)
    const cards = [...document.querySelectorAll<HTMLElement>('.part-card')]
    expect(cards.map((c) => c.classList.contains('locked'))).toEqual([false, false, false, true])
  })

  it('sticker shows encouragement text', () => {
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByText('เริ่มกันเลย 💪')).toHaveClass('sticker')
  })

  it('map.css: locked cards are muted by a background token, not filter/opacity; text stays readable', async () => {
    const css = await readCss('./map.css')
    const locked = rulesFor(css, '.part-card.locked')
    expect(locked).toMatch(/background:\s*var\(--part-bg-muted\)/)
    expect(locked).not.toMatch(/filter|opacity/)
    // ไม่มี hex/rgba ใน map.css
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}\b|rgba?\(/)
    // สีพื้นที่จางลงยังอ่านตัวหนังสือดำออก (≥ 4.5) ทุกภาค
    const m = css.match(/--part-bg-muted:\s*color-mix\(in srgb,\s*var\(--part\)\s*(\d+)%,\s*var\(--text-muted\)\)/)
    expect(m).not.toBeNull()
    const w = Number(m![1]) / 100
    const muted = [0xa3, 0xa6, 0xb0]
    for (const [i, c] of Object.entries(PART_COLORS)) {
      const rgb = [1, 3, 5].map((k) => parseInt(c.bg.slice(k, k + 2), 16))
      const mix = '#' + rgb.map((v, j) => Math.round(v * w + muted[j] * (1 - w)).toString(16).padStart(2, '0')).join('')
      expect(contrastRatio(c.fg, mix), `part ${i}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('map.css: lesson rows keep dark text ≥ 4.5 at rest and on hover, on normal and locked cards', async () => {
    const css = await readCss('./map.css')
    const hex = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16))
    const toHex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
    const TOKENS: Record<string, number[]> = { text: hex('#f1f1ee'), bg: hex('#0e0f13'), 'text-muted': hex('#a3a6b0') }
    // พื้นแถว = color-mix(in srgb, var(--token) N%, transparent) วางทับสีการ์ด
    const overlay = (decl: string) => {
      const m = decl.match(/background:\s*color-mix\(in srgb,\s*var\(--([\w-]+)\)\s*(\d+)%,\s*transparent\)/)
      return m ? { c: TOKENS[m[1]], a: Number(m[2]) / 100 } : null
    }
    const rest = overlay(rulesFor(css, '.l'))
    expect(rest, '.l ต้องมีพื้นแบบ color-mix ทับสีการ์ด').not.toBeNull()
    const hoverDecl = rulesFor(css, 'a.l:hover')
    expect(hoverDecl).not.toMatch(/background:(?!\s*color-mix)/)
    const hover = overlay(hoverDecl) ?? rest!
    const w = Number(css.match(/--part-bg-muted:\s*color-mix\(in srgb,\s*var\(--part\)\s*(\d+)%/)![1]) / 100
    for (const [i, c] of Object.entries(PART_COLORS)) {
      const base = hex(c.bg)
      const muted = base.map((v, j) => v * w + TOKENS['text-muted'][j] * (1 - w))
      for (const [card, b] of [['normal', base], ['locked', muted]] as const) {
        for (const [state, o] of [['rest', rest!], ['hover', hover]] as const) {
          const bg = toHex(b.map((v, j) => v * (1 - o.a) + o.c[j] * o.a))
          expect(contrastRatio(c.fg, bg), `part ${i} ${card} ${state}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })

  it('map width is scoped to the home map, not every .map-page', async () => {
    const css = await readCss('./map.css')
    expect(css).not.toMatch(/(^|[\s,}])main\.map-page\s*[{,]/)
    expect(css).toMatch(/\.map-page--home[^{]*\{[^}]*max-width:\s*76rem/)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(document.querySelector('main')).toHaveClass('map-page', 'map-page--home')
  })

  it('styles.css no longer holds map rules (moved to map.css)', async () => {
    const css = await readCss('../styles.css')
    for (const sel of ['.part', '.l', '.l.now', '.bar', '.map', '.notice']) expect(rulesFor(css, sel), sel).toBe('')
  })
})
