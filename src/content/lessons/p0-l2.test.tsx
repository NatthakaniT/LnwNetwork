import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { course, glossary, validateCourse } from '../index'
import type { Link, NetworkLab, Topology } from '../types'
import { LessonPage } from '../../pages/LessonPage'
import { memoryStorage } from '../../pages/fixture'
import { saveProgress } from '../../progress/progress'
import { LabView } from '../../lab/LabView'
import { simulateSend } from '../../lab/sim'
import { checkGoal } from '../../lab/goals'
import { lesson } from './p0-l2'

const lab = lesson.lab as NetworkLab
const cable = (t: Topology, a: string, aIf: string, b: string, bIf: string): Topology => {
  const l: Link = { a: { device: a, iface: aIf }, b: { device: b, iface: bIf } }
  return { ...t, links: [...t.links, l] }
}
// สิ่งที่ผู้เรียนต้องทำ: เป้าหมาย 1 ต่อคอม 1, 2 เข้า Switch เอ / เป้าหมาย 3 ต่อ Router (g0/1) เข้า Switch บี
const solved1 = cable(cable(lab.start, 'pc1', 'eth0', 'swA', 'p2'), 'pc2', 'eth0', 'swA', 'p3')
const solved3 = cable(solved1, 'router', 'g0/1', 'swB', 'p3')

describe('lesson p0-l2', () => {
  it('อยู่ใน course เป็นบทที่สอง และ validateCourse ผ่าน', () => {
    const l = course[0].lessons[1]
    expect(l).toBe(lesson)
    expect(l.status).toBe('ready')
    expect(l.ciscoModules).toEqual(['ITN 1', 'ITN 11'])
    expect(l.videos.map((v) => v.youtubeId)).toEqual(['WunDlV89wpQ', 'q0t7Wtux-VM'])
    expect(validateCourse(course, glossary)).toEqual([])
  })

  it('บทพูดทุกฉากไม่เกิน 180 ตัวอักษร ไม่มีตัวเลขหรือวงเล็บ และมี 6-14 ฉาก', () => {
    const scenes = lesson.scenes!.scenes
    expect(scenes.length).toBeGreaterThanOrEqual(6)
    expect(scenes.length).toBeLessThanOrEqual(14)
    for (const s of scenes) {
      expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(180)
      expect(s.narrationTh, s.id).not.toMatch(/[0-9()]/)
    }
  })

  it('เป็นฉากแบบ v2: เปิดด้วยปัญหา / ต่อเป็นทอดกับสายขาด และส่งในหมู่บ้านกับข้ามไม่ได้ แยกฉากกัน', () => {
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
    expect(set.scenes[0].narrationTh.startsWith('จะต่อคอมหลายเครื่อง')).toBe(true) // กฎ 4.4 เปิดด้วยปัญหา
    expect(ids.indexOf('s3b')).toBe(ids.indexOf('s3') + 1)
    // ขาดแค่สายกลาง คอม 3 กับคอม 4 ยังถึงกัน แต่ไปหาคอม 1 คอม 2 ไม่ได้
    expect(set.scenes.find((s) => s.id === 's3b')!.narrationTh).toContain('ส่งไปหาคอมหนึ่งกับคอมสองไม่ได้')
    expect(ids.indexOf('s6b')).toBe(ids.indexOf('s6') + 1)
    const s6 = set.scenes.find((s) => s.id === 's6')!
    expect(s6.actions.some((a) => a.type === 'say')).toBe(false) // ฉากส่งได้ ยังไม่บอกว่าข้ามไม่ได้
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
    }
  })

  describe('ห้องทดลองทำสำเร็จได้จริง', () => {
    const [g1, g2, g3] = lab.goals
    const sendFor = (t: Topology, g: typeof g1) => simulateSend(t, g.from, g.toIp)

    it('มี 3 เป้าหมาย: deliver, fail, deliver', () => {
      expect(lab.goals.map((g) => g.type)).toEqual(['deliver', 'fail', 'deliver'])
    })

    it('เป้าหมาย 1: ตอนเริ่มยังส่งไม่ถึง พอต่อคอมทั้งสองเข้า Switch ก็ส่งถึง', () => {
      const r0 = sendFor(lab.start, g1)
      expect(r0.ok).toBe(false)
      expect(checkGoal(g1, lab.start, r0, g1)).toBe(false)
      const r1 = sendFor(solved1, g1)
      expect(r1.ok).toBe(true)
      expect(r1.hops).toEqual(['pc1', 'swA', 'pc2'])
      expect(checkGoal(g1, solved1, r1, g1)).toBe(true)
    })

    it('เป้าหมาย 2: ส่งข้ามหมู่บ้านแล้วไม่ถึง เพราะ Router ยังไม่มีสายไปหมู่บ้านบี', () => {
      if (g2.type !== 'fail') throw new Error('goal 2 must be fail')
      const r = sendFor(solved1, g2)
      expect(r.ok).toBe(false)
      expect(r.reasonTh).toContain(g2.reasonIncludes)
      expect(checkGoal(g2, solved1, r, g2)).toBe(true)
      // ตอนเริ่ม (คอม 1 ยังไม่มีสาย) พังด้วยเหตุผลอื่น จึงยังไม่ผ่าน
      const r0 = sendFor(lab.start, g2)
      expect(r0.ok).toBe(false)
      expect(checkGoal(g2, lab.start, r0, g2)).toBe(false)
      // ต่อ Router เข้าหมู่บ้านบีแล้ว ส่งถึง จึงไม่ใช่เป้าหมาย fail
      expect(checkGoal(g2, solved3, sendFor(solved3, g2), g2)).toBe(false)
    })

    it('เป้าหมาย 3: ต่อ Router เข้า Switch บี แค่เส้นเดียว ก็ส่งข้ามหมู่บ้านถึง', () => {
      expect(checkGoal(g3, solved1, sendFor(solved1, g3), g3)).toBe(false)
      const r = sendFor(solved3, g3)
      expect(r.ok).toBe(true)
      expect(r.hops).toEqual(['pc1', 'swA', 'router', 'swB', 'pc3'])
      expect(checkGoal(g3, solved3, r, g3)).toBe(true)
    })

    it('กับดัก: ต่อคอม 1 ตรงไปคอม 2 ผ่านเป้าหมาย 1 ได้ แต่เป้าหมาย 2 ไม่ผ่าน (ตัวช่วยต้องเตือนเรื่องนี้)', () => {
      const direct = cable(lab.start, 'pc1', 'eth0', 'pc2', 'eth0')
      expect(checkGoal(g1, direct, sendFor(direct, g1), g1)).toBe(true)
      const r = sendFor(direct, g2)
      expect(r.ok).toBe(false)
      expect(checkGoal(g2, direct, r, g2)).toBe(false)
      expect(g1.hintTh).toContain('อย่าต่อคอม 1 ตรงไปคอม 2')
      expect(g2.hintTh).toContain('ไม่ใช่ต่อตรงกับคอม 2')
    })

    it('คำแนะนำห้องทดลอง แบ่งเป็น 3 บรรทัด (หมู่บ้าน / ที่ตั้งไว้ให้ / วิธีต่อสาย)', () => {
      const lines = lab.introTh.split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[0]).toContain('หมู่บ้านเอ')
      expect(lines[1]).toContain('คอมจด Gateway ไว้ให้ด้วย')
      expect(lines[2]).toContain('🔌 ต่อสาย')
      expect(lab.introTh).not.toContain('คอมยังจด')
    })

    it('งานของทุกเป้าหมาย โชว์ให้เห็นตลอด', () => {
      for (const g of lab.goals) expect(g.taskTh.trim()).not.toBe('')
    })

    it('ทำผ่านหน้าจอห้องทดลองได้ครบ 3 เป้าหมาย ด้วยการต่อสายอย่างเดียว', () => {
      vi.useFakeTimers()
      try {
        const onDone = vi.fn()
        render(<LabView lab={lab} termIds={lesson.terms} onDone={onDone} />)
        const flush = () => act(() => { vi.advanceTimersByTime(5000) })
        const link = (a: string, b: string) => {
          fireEvent.click(screen.getByTestId(`device-${a}`))
          fireEvent.click(screen.getByTestId(`device-${b}`))
        }
        fireEvent.click(screen.getByText('🔌 ต่อสาย'))
        link('pc1', 'swA')
        link('pc2', 'swA')
        fireEvent.click(screen.getByText('ส่งข้อมูล'))
        flush()
        expect(screen.getByText(/ผ่านเป้าหมายนี้แล้ว/)).toBeInTheDocument()
        fireEvent.click(screen.getByText('เป้าหมายต่อไป'))

        expect(screen.getByLabelText('ไป IP')).toHaveValue('192.168.2.10')
        fireEvent.click(screen.getByText('ส่งข้อมูล'))
        flush()
        expect(screen.getByText(/ผ่านเป้าหมายนี้แล้ว/)).toBeInTheDocument()
        fireEvent.click(screen.getByText('เป้าหมายต่อไป'))

        link('router', 'swB')
        fireEvent.click(screen.getByText('ส่งข้อมูล'))
        flush()
        expect(screen.getByText(/ผ่านเป้าหมายนี้แล้ว/)).toBeInTheDocument()
        expect(onDone).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('เล่นทั้งบท', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เล่นได้ครบ: คลิป → ภาพทบทวน → ห้องทดลอง → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['p0-l1'] }, storage) // บทที่ 1 ผ่านแล้ว บทนี้จึงเปิดได้
      const { container } = render(<LessonPage id="p0-l2" storage={storage} />)

      // 0. เช็กพื้นฐาน (ไม่บังคับตอบ) แล้วเริ่มเรียน
      expect(screen.getByRole('button', { name: /1. เช็กพื้นฐาน/ })).toHaveAttribute('aria-current', 'step')
      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))

      // 1. คลิป
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 2. ภาพทบทวน
      const scenes = lesson.scenes!.scenes
      expect(container.querySelector('.sp-caption')).toHaveTextContent(scenes[0].narrationTh) // ข้อความถูกห่อ Term จึงแยกเป็นหลายท่อน
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!container.querySelector('.sp-caption')!.textContent!.includes('ชื่อ Switch')) await u.click(nextScene)
      expect(container.querySelector('.sp-caption button')).toBeInTheDocument() // ศัพท์ในคำบรรยายกดได้
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!) // ฉากสุดท้ายเล่นจบ
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 3. ห้องทดลอง: เห็นคำแนะนำและเป้าหมายแรก แล้วทำให้ครบ 3 เป้าหมาย (ใช้เวลาจริง)
      expect(container.querySelector('.lab-intro')).toHaveTextContent(/หมู่บ้านเอ/)
      expect(screen.getByText(/เป้าหมายที่ 1 จาก 3/)).toBeInTheDocument()
      expect(container.querySelector('.lab-task')).toHaveTextContent(lab.goals[0].taskTh)
      expect(screen.getByTestId('lab-dest')).toHaveTextContent('(คอม 2)')
      const link = (a: string, b: string) => {
        fireEvent.click(screen.getByTestId(`device-${a}`))
        fireEvent.click(screen.getByTestId(`device-${b}`))
      }
      const sendAndPass = async () => {
        fireEvent.click(screen.getByText('ส่งข้อมูล'))
        expect(await screen.findByText(/ผ่านเป้าหมายนี้แล้ว/, undefined, { timeout: 4000 })).toBeInTheDocument()
      }
      fireEvent.click(screen.getByText('🔌 ต่อสาย'))
      link('pc1', 'swA')
      link('pc2', 'swA')
      await sendAndPass()
      fireEvent.click(screen.getByText('เป้าหมายต่อไป'))
      await sendAndPass()
      fireEvent.click(screen.getByText('เป้าหมายต่อไป'))
      link('router', 'swB')
      await sendAndPass()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 4. คำถาม: ข้อแรกเป็นชั้น th
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 20000)
  })
})

describe('lesson p0-l2 foundations', () => {
  it('มี requires และเช็กพื้นฐาน 2 ข้อชี้กลับบทใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(['p0-l1'])
    for (const r of lesson.requires!) expect(r.useTh.trim()).not.toBe('')
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(['p0-l1']).toContain(q.reviewLesson)
      expect(q.explainTh.trim()).not.toBe('')
    }
    expect(validateCourse(course, glossary)).toEqual([])
  })
})
