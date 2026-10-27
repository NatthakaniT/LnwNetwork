import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlossaryPage } from './GlossaryPage'
import { glossary } from '../content/glossary'
import { OSI_LAYERS, OSI_OTHER_IDS, OSI_SECTION_IDS, TCPIP_LAYERS } from '../content/osi'

const byId = (id: string) => glossary.find((g) => g.id === id)!
const layers = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>('.osi-layer')]
const rowStart = (el: HTMLElement) => Number(el.style.gridRow.split('/')[0].trim())
const rowSpan = (el: HTMLElement) => {
  const m = el.style.gridRow.match(/span\s+(\d+)/)
  return m ? Number(m[1]) : 1
}

describe('GlossaryPage: ส่วน OSI', () => {
  it('แถบ 7 ชั้นเรียง 7 → 1 พร้อมคำสั้น และเป็นปุ่ม', () => {
    const { container } = render(<GlossaryPage />)
    const bars = layers(container)
    expect(bars.map((b) => b.dataset.layer)).toEqual(['7', '6', '5', '4', '3', '2', '1'])
    bars.forEach((b, i) => {
      expect(b.tagName).toBe('BUTTON')
      expect(b).toHaveTextContent(OSI_LAYERS[i].shortTh)
    })
    // แถวเรียงจากบนลงล่างด้วย grid-row
    const rows = bars.map(rowStart)
    expect(new Set(rows).size).toBe(7)
    expect(rows).toEqual([...rows].sort((a, b) => a - b))
  })

  it('กรอบ TCP/IP 4 กรอบอยู่แถว grid เดียวกับชั้น OSI ที่มันครอบ', () => {
    const { container } = render(<GlossaryPage />)
    const rowOf = new Map(layers(container).map((b) => [Number(b.dataset.layer), rowStart(b)]))
    const boxes = [...container.querySelectorAll<HTMLElement>('.tcp-box')]
    expect(boxes).toHaveLength(4)
    boxes.forEach((box, i) => {
      const spec = TCPIP_LAYERS[i]
      expect(box.dataset.term).toBe(spec.termId)
      const rows = spec.osi.map((n) => rowOf.get(n)!)
      expect(rowStart(box)).toBe(Math.min(...rows))
      expect(rowSpan(box)).toBe(spec.osi.length)
    })
  })

  it('เริ่มต้นเลือกชั้น 3 และกดชั้นอื่นแล้วเห็นคำอธิบายของชั้นนั้น', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    const detail = screen.getByRole('region', { name: 'คำอธิบายชั้นที่เลือก' })
    const net = byId('network-layer')
    expect(within(detail).getByText(net.th)).toBeInTheDocument()
    expect(within(detail).getByText(net.explainTh)).toBeInTheDocument()
    const l3 = container.querySelector<HTMLElement>('.osi-layer[data-layer="3"]')!
    expect(l3).toHaveAttribute('aria-pressed', 'true')

    const l7 = container.querySelector<HTMLElement>('.osi-layer[data-layer="7"]')!
    await u.click(l7)
    expect(l7).toHaveAttribute('aria-pressed', 'true')
    expect(l3).toHaveAttribute('aria-pressed', 'false')
    expect(within(detail).getByText(byId('application-layer').explainTh)).toBeInTheDocument()

    await u.click(l3)
    expect(within(detail).getByText(net.th)).toBeInTheDocument()
    expect(within(detail).getByText(net.explainTh)).toBeInTheDocument()
  })

  it('กดกรอบ TCP/IP แล้วเห็นคำอธิบายของชั้น TCP/IP นั้น', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    const box = container.querySelector<HTMLElement>('.tcp-box[data-term="internet-layer"]')!
    expect(box.tagName).toBe('BUTTON')
    await u.click(box)
    expect(box).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.osi-layer[data-layer="3"]')).toHaveAttribute('aria-pressed', 'false')
    const detail = screen.getByRole('region', { name: 'คำอธิบายชั้นที่เลือก' })
    expect(within(detail).getByText(byId('internet-layer').th)).toBeInTheDocument()
    expect(within(detail).getByText(byId('internet-layer').explainTh)).toBeInTheDocument()
  })

  it('ใช้คีย์บอร์ดเลือกชั้นได้', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    const l1 = container.querySelector<HTMLElement>('.osi-layer[data-layer="1"]')!
    l1.focus()
    await u.keyboard('{Enter}')
    expect(l1).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('GlossaryPage: ทุกคำมีการ์ดพร้อมคำอธิบาย', () => {
  it('ทุกคำ (42) มีการ์ดครั้งเดียว และการ์ดแสดง th กับ explainTh ให้เห็นโดยไม่ต้องกด', () => {
    const { container } = render(<GlossaryPage />)
    const cards = [...container.querySelectorAll<HTMLElement>('.g-card')]
    expect(glossary).toHaveLength(42)
    expect(cards).toHaveLength(42)
    const ids = cards.map((c) => c.dataset.term)
    expect(new Set(ids).size).toBe(42)
    expect([...ids].sort()).toEqual(glossary.map((g) => g.id).sort())
    for (const c of cards) {
      const t = byId(c.dataset.term!)
      expect(c).toHaveTextContent(t.en)
      expect(c).toHaveTextContent(t.th)
      expect(c).toHaveTextContent(t.explainTh)
      expect(c).toHaveClass('reveal')
    }
  })

  it('คำในส่วน OSI อยู่ในส่วน OSI เท่านั้น ศัพท์ OSI อื่น ๆ อยู่กลุ่มของมัน ไม่ซ้ำในกลุ่มตามภาค', () => {
    const { container } = render(<GlossaryPage />)
    const osi = screen.getByRole('region', { name: 'OSI Model · 7 ชั้น' })
    const other = screen.getByRole('region', { name: 'ศัพท์ OSI อื่น ๆ' })
    const idsIn = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('.g-card')].map((c) => c.dataset.term).sort()
    expect(idsIn(osi)).toEqual([...OSI_SECTION_IDS].sort())
    expect(idsIn(other)).toEqual([...OSI_OTHER_IDS].sort())
    const rest = [...container.querySelectorAll<HTMLElement>('.g-group .g-card')].map((c) => c.dataset.term!)
    expect(rest).toHaveLength(42 - 20)
    for (const id of [...OSI_SECTION_IDS, ...OSI_OTHER_IDS]) expect(rest).not.toContain(id)
  })
})

describe('GlossaryPage: ค้นหา', () => {
  it('ค้น "ใบปะหน้า" แล้วชั้น 3 ยังเห็น (ค้นรวมคำสั้น) และชั้นที่ไม่ตรงหายไป', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    await u.type(screen.getByRole('searchbox'), 'ใบปะหน้า')
    expect(container.querySelector('.osi-layer[data-layer="3"]')).not.toBeNull()
    expect(container.querySelector('.osi-layer[data-layer="7"]')).toBeNull()
    expect(container.querySelector('.g-card[data-term="ip-address"]')).toBeNull()
  })

  it('ค้นคำสั้นอย่างเดียว (ไม่มีในศัพท์) ก็เจอชั้นนั้น', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    await u.type(screen.getByRole('searchbox'), 'เปิด-ปิดการคุย')
    expect(container.querySelector('.osi-layer[data-layer="5"]')).not.toBeNull()
    expect(container.querySelector('.g-card[data-term="session-layer"]')).not.toBeNull()
  })

  it('ค้น "network layer" แล้วเจอ Network layer', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    await u.type(screen.getByRole('searchbox'), 'network layer')
    expect(container.querySelector('.osi-layer[data-layer="3"]')).not.toBeNull()
    expect(container.querySelector('.g-card[data-term="network-layer"]')).not.toBeNull()
  })

  it('ค้นคำที่ไม่มี บอกว่าไม่เจอ และไม่เหลือชั้นหรือการ์ด', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    await u.type(screen.getByRole('searchbox'), 'zzzzqq')
    expect(screen.getByText('ไม่เจอคำที่ค้นหา ลองพิมพ์คำอื่นดู')).toBeInTheDocument()
    expect(layers(container)).toHaveLength(0)
    expect(container.querySelectorAll('.g-card')).toHaveLength(0)
    expect(container.querySelectorAll('.tcp-box')).toHaveLength(0)
  })

  it('ค้นแล้วกรอบ TCP/IP ที่เหลือยังตรงแถวกับชั้น OSI ที่เหลือ', async () => {
    const u = userEvent.setup()
    const { container } = render(<GlossaryPage />)
    await u.type(screen.getByRole('searchbox'), 'MAC')
    expect(layers(container).length).toBeGreaterThan(0)
    const rowOf = new Map(layers(container).map((b) => [Number(b.dataset.layer), rowStart(b)]))
    for (const box of container.querySelectorAll<HTMLElement>('.tcp-box')) {
      const spec = TCPIP_LAYERS.find((t) => t.termId === box.dataset.term)!
      const rows = spec.osi.filter((n) => rowOf.has(n)).map((n) => rowOf.get(n)!)
      expect(rows.length).toBeGreaterThan(0)
      expect(rowStart(box)).toBe(Math.min(...rows))
      expect(rowSpan(box)).toBe(rows.length)
      expect(Math.max(...rows) - Math.min(...rows) + 1).toBe(rows.length)
    }
  })
})

describe('glossary.css', () => {
  const read = async () => {
    const fsModule = 'node:fs'
    const urlModule = 'node:url'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
    const css: string = readFileSync(new NodeURL('./glossary.css', import.meta.url), 'utf-8')
    return css.replace(/\/\*[\s\S]*?\*\//g, '')
  }
  it('ไม่มีสี hex หรือ rgb ตรง ๆ (ใช้ token เท่านั้น)', async () => {
    const css = await read()
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(css).not.toMatch(/rgba?\(/)
  })
  it('ชี้แถบชั้นแล้วเลื่อนขวา 8px, มี focus-visible, และปิดการขยับเมื่อลดการเคลื่อนไหว', async () => {
    const css = await read()
    expect(css).toMatch(/\.osi-layer:hover[^{]*\{[^}]*translateX\(8px\)/)
    expect(css).toMatch(/\.osi-layer:focus-visible/)
    expect(css).toMatch(/\.tcp-box:focus-visible/)
    const rm = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*)\}\s*$/)
    expect(rm).not.toBeNull()
    expect(rm![1]).toMatch(/\.osi-layer:hover/)
    expect(rm![1]).toMatch(/transform:\s*none/)
  })
  it('แถบชั้นและกรอบใช้ grid คอลัมน์เดียวกัน', async () => {
    const css = await read()
    expect(css).toMatch(/\.osi-grid\s*\{[^}]*display:\s*grid/)
  })
})
