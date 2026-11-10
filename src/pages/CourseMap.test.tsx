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
    const all = course.flatMap((p) => p.lessons).length
    expect(screen.getByText(`เรียนแล้ว 0 จาก ${all - notReady} บท · อีก ${notReady} บทกำลังทำ`)).toBeInTheDocument()
    expect(screen.getByText('0/1')).toBeInTheDocument() // เคลียร์ได้เฉพาะภาคที่มีบทพร้อม
    expect(document.querySelectorAll('.part-time')).toHaveLength(1) // ภาคที่ยังไม่มีบทพร้อมไม่บอกเวลาเรียน
    expect(screen.getByRole('link', { name: /คลังศัพท์/ })).toHaveAttribute('href', '#/c/ccna/glossary')
    expect(screen.queryByRole('link', { name: 'เรียนต่อ' })).toBeNull()
  })

  it('shows done / current / locked / building states and progress', () => {
    saveProgress({ version: 1, completed: ['f1'] }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByText('เรียนแล้ว 1 จาก 3 บท · อีก 1 บทกำลังทำ')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33')
    const done = screen.getByRole('link', { name: /✅ บท f1/ })
    expect(done).toHaveClass('done')
    const now = screen.getByRole('link', { name: /▶ บท f2/ })
    expect(now).toHaveClass('now')
    expect(now).toHaveAttribute('href', '#/lesson/f2')
    expect(document.querySelectorAll('.l-time')).toHaveLength(3) // บทที่เรียนได้บอกเวลา บทที่กำลังทำไม่บอก
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

  it('map.css: locked cards dim their glow with a token, not filter/opacity; no raw colours', async () => {
    const css = await readCss('./map.css')
    const locked = rulesFor(css, '.part-card.locked')
    expect(locked).toMatch(/--glow:\s*var\(--text-muted\)/)
    expect(locked).not.toMatch(/filter|opacity/)
    // ไม่มี hex/rgba ใน map.css สีมาจาก token เท่านั้น
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}\b|rgba?\(/)
  })

  it('map.css: dark cards keep text readable ≥ 4.5 (body text, muted text and every neon part colour)', async () => {
    const css = await readCss('./map.css')
    const root = (await readCss('../styles.css')).match(/:root\s*\{([^}]*)\}/)![1]
    const token = (n: string) => root.match(new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{6})`))![1]
    // การ์ดเป็นพื้น --surface ตัวหนังสือหลัก --text ป้ายภาคและแถวที่เปิดอยู่ใช้สีภาค (--glow)
    expect(rulesFor(css, '.part-card')).toMatch(/background:\s*color-mix\(in srgb,\s*var\(--surface\)/)
    expect(rulesFor(css, '.l')).toMatch(/color:\s*var\(--text\)/)
    expect(rulesFor(css, '.part-no')).toMatch(/color:\s*var\(--glow\)/)
    const surface = token('surface')
    for (const fg of [token('text'), token('text-muted'), token('p4')]) {
      expect(contrastRatio(fg, surface), fg).toBeGreaterThanOrEqual(4.5)
    }
    for (const [i, c] of Object.entries(PART_COLORS)) {
      expect(contrastRatio(c.bg, surface), `part ${i}`).toBeGreaterThanOrEqual(4.5)
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
