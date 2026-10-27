import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { course, glossary, validateCourse } from '../index'
import type { ActivityLab } from '../types'
import { LessonPage } from '../../pages/LessonPage'
import { memoryStorage } from '../../pages/fixture'
import { saveProgress } from '../../progress/progress'
import { ActivityView } from '../../lab/ActivityView'
import { lesson } from './p0-l3'

const lab = lesson.lab as ActivityLab
const textOf = (id: string) => lab.items.find((i) => i.id === id)!.textTh

/** เรียงรายการด้วยปุ่ม ⬆ อย่างเดียว ตามที่ผู้เรียนกดจริง */
async function solveWithButtons(u: ReturnType<typeof userEvent.setup>, root: HTMLElement) {
  const answer = lab.answer as string[]
  for (let i = 0; i < answer.length; i++) {
    const want = textOf(answer[i])
    const rows = () => within(root.querySelector('.activity-list') as HTMLElement).getAllByRole('listitem')
    let pos = rows().findIndex((r) => r.textContent?.includes(want))
    expect(pos).toBeGreaterThanOrEqual(0)
    while (pos > i) {
      await u.click(screen.getByLabelText(`เลื่อนขึ้น ${want}`))
      pos--
    }
  }
}

describe('lesson p0-l3', () => {
  it('อยู่ใน course เป็นบทที่สาม และ validateCourse ผ่าน', () => {
    const l = course[0].lessons[2]
    expect(l).toBe(lesson)
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('ข้อมูลเดินทางยังไง')
    expect(l.ciscoModules).toEqual(['ITN 3'])
    expect(l.videos[0]).toMatchObject({ youtubeId: 'jjs02wLiXmQ', channel: '9hua Training' })
    expect(validateCourse(course, glossary)).toEqual([])
  })

  it('ศัพท์ใหม่ packet, source, destination, DNS อยู่ในคลังศัพท์ และอยู่ใน terms ของบท', () => {
    for (const id of ['packet', 'source', 'destination', 'dns', 'gateway', 'domain-name', 'lan', 'end-device']) {
      expect(glossary.some((g) => g.id === id)).toBe(true)
      expect(lesson.terms).toContain(id)
    }
    // ใช้ gateway เดิม ไม่สร้างคำซ้ำ
    expect(glossary.some((g) => g.id === 'default-gateway')).toBe(false)
  })

  it('บทพูดทุกฉากไม่เกิน 180 ตัวอักษร ไม่มีตัวเลขหรือวงเล็บ และมี 6-18 ฉาก', () => {
    const scenes = lesson.scenes!.scenes
    expect(scenes.length).toBeGreaterThanOrEqual(6)
    expect(scenes.length).toBeLessThanOrEqual(18)
    for (const s of scenes) { expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(180); expect(s.narrationTh, s.id).not.toMatch(/[0-9()]/) }
  })

  it('ยังไม่ใช้เรื่องที่สอนบทหลัง (MAC, OSI, port, TCP)', () => {
    const texts: string[] = []
    const walk = (v: unknown) => {
      if (typeof v === 'string') texts.push(v)
      else if (v && typeof v === 'object') Object.values(v).forEach(walk)
    }
    walk(lesson)
    const all = texts.join('\n')
    for (const w of [/\bMAC\b/, /\bOSI\b/, /\bTCP\b/, /\bports?\b/i, /พอร์ต/, /\blayers?\b/i, /เลเยอร์/]) expect(all).not.toMatch(w)
  })

  it('บอกก่อนดูคลิปว่าช่วง Subnet mask ดูผ่าน ๆ ได้ (โน้ตเหนือคลิป ไม่ใช่บนเวทีฉาก 1)', () => {
    expect(lesson.videos[0].noteTh).toBe('คลิปนี้มีเรื่องเลข IP กับ Subnet mask แบบละเอียดด้วย ช่วงนั้นดูผ่าน ๆ ได้เลย ไม่ต้องเข้าใจตอนนี้ เดี๋ยวบท ที่อยู่ 2 แบบ กับภาค 1 เล่าให้ฟังทีละขั้น')
    const labels = lesson.scenes!.actors.map((a) => a.label ?? '').join(' ')
    expect(labels).not.toMatch(/Subnet mask/)
  })

  it('ฉาก 7 บอกชัดว่าที่อยู่ผู้รับไม่เปลี่ยนเป็น Gateway / ฉาก 8 เรียกเครื่อง DNS ว่า DNS server', () => {
    const [s7, s8] = ['s7', 's8'].map((id) => lesson.scenes!.scenes.find((s) => s.id === id)!)
    expect(s7.narrationTh).toContain('ไม่เปลี่ยนเป็น Gateway')
    expect(s8.narrationTh).toContain('เครื่อง DNS server')
    expect(s8.narrationTh).not.toMatch(/[()]/) // TTS อ่านวงเล็บตรง ๆ
    expect(s8.narrationTh).not.toContain('เครื่องที่ชื่อ DNS')
    expect(glossary.find((g) => g.id === 'dns')!.explainTh).toContain('สมุดของคอม ไม่ได้ให้เบอร์โทร แต่ให้เลขที่อยู่ของเว็บ')
  })

  it('เป็นฉากแบบ v2: คำถามกับคำตอบ เหตุกับผล แยกฉาก ของที่วิ่งเป็นซองมีป้ายหน้าซอง', () => {
    const set = lesson.scenes!
    expect(set.style).toBe('v2')
    for (const s of set.scenes) {
      expect(s.chipTh, s.id).toBeTruthy()
      expect(s.lifeTh, s.id).toBeTruthy()
      expect(s.lifeIcon, s.id).toBeTruthy()
      for (const a of s.actions) {
        if (a.type === 'moveAlong' || a.type === 'move') expect(set.actors.find((x) => x.id === a.actor)!.kind, `${s.id} ${a.actor}`).toBe('card')
      }
    }
    const ids = set.scenes.map((s) => s.id)
    // ถาม DNS → DNS ตอบ → ส่งกล่อง / กล่องหาย → ส่งใหม่ / ส่งไป → ตอบกลับ / สมุดผิด → สมุดอีกเล่ม
    for (const seq of [['s8', 's8b', 's8c'], ['s4', 's4b'], ['s6', 's6b'], ['s9', 's9b', 's9c'], ['s1', 's1b']]) {
      expect(ids.slice(ids.indexOf(seq[0]), ids.indexOf(seq[0]) + seq.length)).toEqual(seq)
    }
    // DNS: ถามและตอบเป็นการส่งหาเครื่องเดียว (ฟ้า) ส่วนกล่องที่ส่งของจริงใช้สีภาค
    const tones = (id: string) => set.scenes.find((s) => s.id === id)!.actions.flatMap((a) => (a.type === 'trail' ? [a.tone] : []))
    expect(tones('s8')).toEqual(['reply'])
    expect(tones('s8b')).toEqual(['reply'])
    expect(tones('s8c')).toEqual(['deliver'])
  })

  it('คำถาม: th 3-4 ข้อ, en 2-3 ข้อ มีคำแปลและ keywords ครบ', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    const en = lesson.quiz!.filter((q) => q.layer === 'en')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(en.length).toBeGreaterThanOrEqual(2)
    expect(en.length).toBeLessThanOrEqual(3)
    for (const q of en) {
      expect(q.promptTh).toBeTruthy()
      expect(q.keywords?.length).toBeGreaterThan(0)
      for (const c of q.choices) expect(c.textTh).toBeTruthy()
      for (const k of q.keywords!) expect(q.prompt).toContain(k)
    }
  })

  describe('กิจกรรมเรียงขั้นตอน', () => {
    it('เป็นแบบ order มี 5-7 ขั้น คำตอบใช้ครบทุกขั้น ไม่ซ้ำ', () => {
      expect(lab.kind).toBe('order')
      expect(lab.items.length).toBeGreaterThanOrEqual(5)
      expect(lab.items.length).toBeLessThanOrEqual(7)
      const answer = lab.answer as string[]
      expect([...answer].sort()).toEqual(lab.items.map((i) => i.id).sort())
      expect(new Set(lab.items.map((i) => i.textTh)).size).toBe(lab.items.length)
    })

    it('คำอธิบายสอนหลักคิด ไม่ได้ไล่คำตอบทั้งหมด', () => {
      const listed = lab.items.filter((i) => lab.explainTh.includes(i.textTh))
      expect(listed).toHaveLength(0)
    })

    it('เรียงถูกได้ด้วยปุ่ม ⬆/⬇ (เริ่มจากกลับหัว)', async () => {
      const onDone = vi.fn()
      const u = userEvent.setup()
      const { container } = render(<ActivityView lab={lab} onDone={onDone} shuffle={(a) => [...a].reverse()} termIds={lesson.terms} />)
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(onDone).not.toHaveBeenCalled()
      // ลองปุ่ม ⬇ ด้วย: เลื่อนข้อบนสุดลงหนึ่งที แล้วค่อยเรียง
      const top = within(container.querySelector('.activity-list') as HTMLElement).getAllByRole('listitem')[0]
      await u.click(within(top).getByRole('button', { name: /เลื่อนลง/ }))
      await solveWithButtons(u, container)
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(screen.getByText(/ถูกต้อง!/)).toBeInTheDocument()
      expect(onDone).toHaveBeenCalledTimes(1)
    })
  })

  describe('เล่นทั้งบท', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เล่นได้ครบ: คลิป → ภาพทบทวน → กิจกรรม → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['p0-l1', 'p0-l2'] }, storage)
      const { container } = render(<LessonPage id="p0-l3" storage={storage} />)

      // 1. คลิป (มีโน้ตเหนือคลิป)
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      expect(container.querySelector('.video-note')).toHaveTextContent(lesson.videos[0].noteTh!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 2. ภาพทบทวน
      const scenes = lesson.scenes!.scenes
      expect(container.querySelector('.sp-caption')).toHaveTextContent(scenes[0].narrationTh)
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      expect(screen.getAllByRole('button', { name: 'DNS' }).length).toBeGreaterThan(0) // ศัพท์ในคำบรรยายกดได้
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 3. กิจกรรมเรียงขั้นตอน: ยังไม่เรียง ไปขั้นต่อไปไม่ได้
      expect(screen.getByRole('button', { name: 'ไปขั้นต่อไป' })).toBeDisabled()
      for (const it of lab.items) expect(container.querySelector('.activity-list')).toHaveTextContent(it.textTh)
      await solveWithButtons(u, container)
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(screen.getByText(/ถูกต้อง!/)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 4. คำถาม: ข้อแรกเป็นชั้น th
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 20000)
  })
})
