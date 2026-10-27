import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { course, glossary, validateCourse } from '../index'
import type { ActivityLab } from '../types'
import { LessonPage } from '../../pages/LessonPage'
import { memoryStorage } from '../../pages/fixture'
import { saveProgress } from '../../progress/progress'
import { ActivityView } from '../../lab/ActivityView'
import { lesson } from './p0-l5'

const lab = lesson.lab as ActivityLab
const textOf = (id: string) => lab.items.find((i) => i.id === id)!.textTh
const narration = (id: string) => lesson.scenes!.scenes.find((s) => s.id === id)!.narrationTh

/** เรียงรายการด้วยปุ่ม ⬆ ตามที่ผู้เรียนกดจริง */
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

describe('lesson p0-l5', () => {
  it('อยู่ใน course เป็นบทสุดท้ายของภาค 0 และ validateCourse ผ่าน', () => {
    const l = course[0].lessons[5]
    expect(l).toBe(lesson)
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('การห่อของเป็นชั้น ๆ')
    expect(l.ciscoModules).toEqual(['ITN 3'])
    expect(l.videos.map((v) => v.youtubeId)).toEqual(['4DkRRKjFCsk', 'e7s_D4YZznA'])
    for (const v of l.videos) expect(v.channel).toBe('9hua Training')
    expect(l.videos[0].noteTh).toBeTruthy()
    expect(l.videos[1].noteTh).toContain('ดูผ่าน ๆ ได้')
    expect(validateCourse(course, glossary)).toEqual([])
  })

  it('ศัพท์ใหม่อยู่ในคลังศัพท์ (ไม่ซ้ำ) และอยู่ใน terms ของบท', () => {
    const ids = ['osi-model', 'presentation-layer', 'session-layer', 'tcp-ip-model', 'encapsulation', 'de-encapsulation', 'layer', 'port', 'pdu',
      'data', 'segment', 'packet', 'frame', 'bits',
      'application-layer', 'transport-layer', 'network-layer', 'internet-layer', 'data-link-layer', 'physical-layer', 'network-access-layer']
    for (const id of ids) {
      expect(glossary.filter((g) => g.id === id), id).toHaveLength(1)
      expect(lesson.terms, id).toContain(id)
    }
    expect(new Set(glossary.map((g) => g.en.toLowerCase())).size).toBe(glossary.length)
    for (const t of lesson.terms!) expect(glossary.some((g) => g.id === t), t).toBe(true)
    expect(glossary.find((g) => g.id === 'port')!.explainTh).toContain('โปรแกรม')
    // Application layer = ชั้นที่โปรแกรมใช้คุยกับ network ไม่ใช่ตัวโปรแกรม
    expect(glossary.find((g) => g.id === 'application-layer')!.explainTh).toContain('ชั้นที่โปรแกรมใช้คุยกับ network')
    expect(glossary.find((g) => g.id === 'tcp-ip-model')!.explainTh).toContain('บางตำราแบ่งเป็น 5 ชั้น')
    expect(lesson.scenes!.actors.find((a) => a.id === 'tInt')!.label).toBe('TCP/IP: Internet · IP = 3')
    expect(glossary.find((g) => g.id === 'data-link-layer')!.explainTh).toContain('MAC')
    expect(glossary.find((g) => g.id === 'network-layer')!.explainTh).toContain('IP')
    // TCP กับ UDP แค่บอกชื่อ เรียนจริงภาคหน้า
    expect(glossary.find((g) => g.id === 'transport-layer')!.explainTh).toMatch(/TCP กับ UDP[\s\S]*ภาค 1/)
  })

  it('บทพูด: 6-14 ฉาก ไม่เกิน 170 ตัวอักษร ไม่มีวงเล็บ ไม่มีตัวเลขให้ TTS อ่านเพี้ยน', () => {
    const scenes = lesson.scenes!.scenes
    expect(scenes.length).toBeGreaterThanOrEqual(6)
    expect(scenes.length).toBeLessThanOrEqual(14)
    for (const s of scenes) {
      expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(170)
      expect(s.narrationTh, s.id).not.toMatch(/[()]/)
      expect(s.narrationTh.replace(/IPv4/g, ''), s.id).not.toMatch(/\d/)
    }
  })

  it('เรื่องเล่า: ห่อจากในออกนอก → แกะย้อนกลับ → ทำไมแยกชั้น → เปลี่ยนถนนไม่ต้องห่อใหม่ → สองชุดชั้น → ปูทางภาค 1', () => {
    expect(narration('s1')).toContain('ลองนึกดูนะ')
    expect(narration('s2')).toContain('port')
    expect(narration('s2')).not.toContain('ชั้นแรก') // ชั้นที่หนึ่งคือถนน ห้ามสับสนกับห่อแรก
    expect(narration('s2')).toContain('segment')
    expect(narration('s3')).toContain('IP')
    expect(narration('s3')).toContain('packet')
    expect(narration('s4')).toContain('MAC')
    expect(narration('s4')).toContain('frame')
    expect(narration('s4')).toContain('Switch ดูแค่')
    expect(narration('s5')).toContain('bits')
    expect(narration('s5')).toContain('ทีละ bit') // เชื่อมกับบท p0-bits
    expect(narration('s5')).toContain('encapsulation')
    expect(narration('s6')).toContain('แกะย้อนกลับ')
    expect(narration('s6b')).toContain('de-encapsulation')
    expect(narration('s6')).not.toContain('de-encapsulation') // แกะชั้นนอกก่อน ค่อยได้ data กับชื่อเรียกในฉากถัดไป
    expect(narration('s6')).not.toContain('port')
    // ตาราง OSI บอกชื่อของที่ห่อแล้วของแต่ละชั้น (ข้อสอบถาม PDU ของ Data Link)
    for (const [id, pdu] of [['o4', 'segment'], ['o3', 'packet'], ['o2', 'frame'], ['o1', 'bits']]) expect(lesson.scenes!.actors.find((a) => a.id === id)!.label, id).toContain(pdu)
    expect(narration('s7')).toContain('ทำไม')
    expect(narration('s7')).toMatch(/สายแลน[\s\S]*ไวไฟ/)
    expect(narration('s7')).toContain('ไม่ต้อง')
    expect(narration('s8b')).toContain('TCP/IP model')
    expect(narration('s8')).toContain('OSI model')
    expect(narration('s8')).toContain('นับ')
    // ชั้น 1-4 ในตาราง OSI ติดสัญลักษณ์เดียวกับตอนห่อ (กล่อง ใบปะหน้า รถ ถนน)
    const marks: Record<string, string> = { o4: '📦', o3: '🏷️', o2: '🚚', o1: '〰️' }
    for (const [id, mark] of Object.entries(marks)) {
      expect(lesson.scenes!.actors.find((a) => a.id === id)!.label, id).toMatch(new RegExp(`^${mark} `))
    }
    // สะพานจาก p0-l4: MAC อยู่ชั้นนอก (รถ) ไม่ใช่บนกล่อง
    expect(narration('s4')).toContain('จริง ๆ ติดอยู่บนรถ')
    // TCP/IP สี่ชั้น ไม่ได้เท่ากับแถว OSI หนึ่งถึงสี่
    expect(narration('s8b')).toContain('รวมบางชั้นเข้าด้วยกัน')
    expect(narration('s8')).toContain('ข้อตกลง') // กฎ 4.3: บอกว่าจำนวนชั้นไม่มีสูตร
    expect(lesson.quiz!.find((q) => q.id === 'q7')!.choices[0].textTh).toBe('Application (ชั้นที่โปรแกรมใช้คุย บนสุด)')
    expect(narration('s9')).toMatch(/ชั้นที่สอง[\s\S]*MAC[\s\S]*Switch/)
    expect(narration('s9')).toMatch(/ชั้นที่สาม[\s\S]*IP[\s\S]*Router/)
    const last = lesson.scenes!.scenes[lesson.scenes!.scenes.length - 1].narrationTh
    expect(last).toMatch(/ภาค ?หนึ่ง|ภาคหน้า/)
    for (const w of ['เลขฐานสอง', 'IPv4', 'Subnet']) expect(last).toContain(w)
  })

  it('ถูกต้องตาม CCNA: Switch ดู MAC ไม่ดู IP / ตาราง OSI 7 ชั้นกับ TCP/IP 4 ชั้นครบ', () => {
    const all = lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')
    expect(all).not.toMatch(/Switch ดู IP|Switch ดู[^\n]{0,10}IP/)
    const labels = lesson.scenes!.actors.map((a) => a.label ?? '')
    for (const row of ['7 Application', '6 Presentation', '5 Session', '4 Transport', '3 Network', '2 Data Link', '1 Physical']) {
      expect(labels.some((l) => l.includes(row)), row).toBe(true)
    }
    for (const row of ['Application', 'Transport', 'Internet', 'Network Access']) {
      expect(labels.some((l) => l.startsWith(`TCP/IP: ${row}`)), row).toBe(true)
    }
  })

  it('เป็นฉากแบบ v2: เปิดด้วยปัญหา ทุกฉากมีชื่อฉากและแถบชีวิตจริง ของที่วิ่งเป็นซองมีป้ายหน้าซอง', () => {
    const set = lesson.scenes!
    expect(set.style).toBe('v2')
    expect(set.scenes[0].id).toBe('s0')
    expect(set.scenes[0].narrationTh).toMatch(/สายแลน[\s\S]*ไวไฟ[\s\S]*ใหม่หมดไหม/) // กฎ 4.4: ปัญหาที่การแยกชั้นแก้
    for (const s of set.scenes) {
      expect(s.chipTh, s.id).toBeTruthy()
      expect(s.lifeTh, s.id).toBeTruthy()
      expect(s.lifeIcon, s.id).toBeTruthy()
      for (const a of s.actions) {
        if (a.type === 'moveAlong' || a.type === 'move') expect(set.actors.find((x) => x.id === a.actor)!.kind, `${s.id} ${a.actor}`).toBe('card')
      }
    }
  })

  it('คำถาม: th 3-4 ข้อ, en 3 ข้อ มีคำแปลและ keywords ครบ และคำอธิบายไม่ไล่ข้อความตัวเลือก', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    const en = lesson.quiz!.filter((q) => q.layer === 'en')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(en.length).toBe(3)
    for (const q of en) {
      expect(q.promptTh).toBeTruthy()
      expect(q.keywords?.length).toBeGreaterThan(0)
      for (const c of q.choices) expect(c.textTh).toBeTruthy()
      for (const k of q.keywords!) expect(q.prompt).toContain(k)
    }
    for (const q of lesson.quiz!) {
      for (const c of q.choices) {
        expect(q.explainTh, `${q.id}/${c.id}`).not.toContain(c.textTh ?? c.text)
        if (q.layer === 'en') expect(q.explainTh, `${q.id}/${c.id} en`).not.toContain(c.text)
      }
    }
    const prompts = en.map((q) => q.prompt).join('\n')
    expect(prompts).toContain('logical addressing')
    expect(prompts).toContain('PDU')
    expect(prompts).toContain('5, 6, and 7')
  })

  describe('กิจกรรมเรียงการห่อ', () => {
    it('เป็นแบบ order มี 5 ขั้น จากในสุดถึงนอกสุด คำตอบใช้ครบทุกขั้น ไม่ซ้ำ', () => {
      expect(lab.kind).toBe('order')
      expect(lab.items).toHaveLength(5)
      const answer = lab.answer as string[]
      expect(answer).toEqual(['data', 'port', 'ip', 'mac', 'signal'])
      expect([...answer].sort()).toEqual(lab.items.map((i) => i.id).sort())
      expect(new Set(lab.items.map((i) => i.textTh)).size).toBe(lab.items.length)
      expect(lab.introTh.split('\n').length).toBeGreaterThanOrEqual(3)
    })

    it('คำอธิบายสอนหลักคิด ไม่ได้ไล่คำตอบ', () => {
      const listed = lab.items.filter((i) => lab.explainTh.includes(i.textTh))
      expect(listed).toHaveLength(0)
      expect(lab.explainTh).toContain('ในสุด')
      expect(lab.explainTh).toContain('ห่อทับ')
    })

    it('เรียงถูกได้ด้วยปุ่ม ⬆/⬇ (เริ่มจากกลับหัว)', async () => {
      const onDone = vi.fn()
      const u = userEvent.setup()
      const { container } = render(<ActivityView lab={lab} onDone={onDone} shuffle={(a) => [...a].reverse()} termIds={lesson.terms} />)
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(onDone).not.toHaveBeenCalled()
      const top = within(container.querySelector('.activity-list') as HTMLElement).getAllByRole('listitem')[0]
      await u.click(within(top).getByRole('button', { name: /เลื่อนลง/ }))
      await solveWithButtons(u, container)
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(screen.getByText(/ถูกต้อง!/)).toBeInTheDocument()
      expect(onDone).toHaveBeenCalledTimes(1)
    })
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เล่นได้ครบ: คลิป → ภาพทบทวน → กิจกรรม → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['p0-l1', 'p0-l2', 'p0-l3', 'p0-bits', 'p0-l4'] }, storage)
      const { container } = render(<LessonPage id="p0-l5" storage={storage} />)

      // 0. เช็กพื้นฐาน (ไม่บังคับตอบ) แล้วเริ่มเรียน
      expect(screen.getByRole('button', { name: /1. เช็กพื้นฐาน/ })).toHaveAttribute('aria-current', 'step')
      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))

      // 1. คลิป + โน้ตเหนือคลิป
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      expect(container.querySelector('.video-note')).toHaveTextContent(lesson.videos[0].noteTh!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 2. ภาพทบทวน
      const scenes = lesson.scenes!.scenes
      expect(container.querySelector('.sp-caption')).toHaveTextContent(scenes[0].narrationTh)
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 3. กิจกรรม: ยังไม่เรียง ไปขั้นต่อไปไม่ได้
      expect(container.querySelector('.lab-intro')).toHaveTextContent(/ตรวจคำตอบ/)
      expect(screen.getByRole('button', { name: 'ไปขั้นต่อไป' })).toBeDisabled()
      for (const it of lab.items) expect(container.querySelector('.activity-list')).toHaveTextContent(it.textTh)
      await solveWithButtons(u, container)
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(screen.getByText(/ถูกต้อง!/)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 4. คำถาม: ข้อแรกเป็นชั้น th
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
    expect(validateCourse(course, glossary)).toEqual([])
      expect(errSpy).not.toHaveBeenCalled()
    }, 30000)
  })
})

describe('lesson p0-l5 foundations', () => {
  it('มี requires และเช็กพื้นฐาน 2 ข้อชี้กลับบทใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(['p0-l4', 'p0-bits'])
    for (const r of lesson.requires!) expect(r.useTh.trim()).not.toBe('')
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(['p0-l4', 'p0-bits']).toContain(q.reviewLesson)
      expect(q.explainTh.trim()).not.toBe('')
    }
    expect(validateCourse(course, glossary)).toEqual([])
  })
})
