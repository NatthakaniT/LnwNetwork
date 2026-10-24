import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { course, glossary, validateCourse } from '../index'
import type { NetworkLab, Topology } from '../types'
import { LessonPage } from '../../pages/LessonPage'
import { memoryStorage } from '../../pages/fixture'
import { saveProgress } from '../../progress/progress'
import { LabView } from '../../lab/LabView'
import { simulateSend } from '../../lab/sim'
import { checkGoal } from '../../lab/goals'
import { initialState, applyScene } from '../../scenes/timeline'
import { lesson } from './p0-l4'

const lab = lesson.lab as NetworkLab
/** ตั้ง IP ให้ eth0 ของเครื่อง เหมือนที่ผู้เรียนพิมพ์ในช่อง IP แล้วกด บันทึก */
const setIp = (t: Topology, dev: string, ip: string): Topology => ({
  ...t,
  devices: t.devices.map((d) => (d.id === dev ? { ...d, ifaces: d.ifaces.map((i) => ({ ...i, ip })) } : d)),
})
const dupTopo = setIp(lab.start, 'pc2', '192.168.1.10')
const fixedTopo = setIp(dupTopo, 'pc2', '192.168.1.20')

describe('lesson p0-l4', () => {
  it('อยู่ใน course เป็นบทที่สี่ และ validateCourse ผ่าน', () => {
    const l = course[0].lessons[3]
    expect(l).toBe(lesson)
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('ที่อยู่ 2 แบบ: MAC กับ IP')
    expect(l.ciscoModules).toEqual(['ITN 7', 'ITN 9', 'ITN 11'])
    expect(l.videos.map((v) => v.youtubeId)).toEqual(['u6W4u0R5P0w', 'iAecBW8rflc'])
    for (const v of l.videos) expect(v.channel).toBe('9hua Training')
    expect(l.videos[0].noteTh).toContain('ภาค 1')
    expect(l.videos[0].noteTh).not.toContain('ถ้าคลิป') // บอกชัด ไม่ใช่ถ้า
    expect(l.videos[1].noteTh).toContain('ARP = ตะโกนถามหา MAC ในหมู่บ้าน')
    expect(validateCourse(course, glossary)).toEqual([])
  })

  it('ศัพท์ใหม่ MAC address, IPv4, ARP, NIC อยู่ในคลังศัพท์ (ไม่ซ้ำ) และอยู่ใน terms ของบท', () => {
    for (const id of ['mac-address', 'ipv4', 'arp', 'nic', 'ip-address', 'gateway', 'switch', 'router']) {
      expect(glossary.filter((g) => g.id === id)).toHaveLength(1)
      expect(lesson.terms).toContain(id)
    }
    expect(new Set(glossary.map((g) => g.en.toLowerCase())).size).toBe(glossary.length)
    expect(glossary.find((g) => g.id === 'mac-address')!.explainTh).toContain('เลขบัตรประชาชน')
    expect(glossary.find((g) => g.id === 'ip-address')!.explainTh).toContain('บ้านเลขที่')
    expect(glossary.find((g) => g.id === 'arp')!.explainTh).toContain('Gateway')
  })

  it('บทพูด: 6-10 ฉาก ไม่เกิน 170 ตัวอักษร ไม่มีวงเล็บ (TTS อ่านวงเล็บตรง ๆ) ไม่มีตัวเลขให้ TTS อ่านเพี้ยน', () => {
    const scenes = lesson.scenes!.scenes
    expect(scenes.length).toBeGreaterThanOrEqual(6)
    expect(scenes.length).toBeLessThanOrEqual(10)
    for (const s of scenes) {
      expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(170)
      expect(s.narrationTh, s.id).not.toMatch(/[()]/)
      expect(s.narrationTh.replace(/IPv4/g, ''), s.id).not.toMatch(/\d/) // IPv4 อ่านด้วยตาราง PRONOUNCE
    }
  })

  it('ยังไม่ใช้เรื่องที่สอนบทหลัง (OSI, port, TCP, layer) และไม่สอน Subnet ลึก', () => {
    const texts: string[] = []
    const walk = (v: unknown) => {
      if (typeof v === 'string') texts.push(v)
      else if (v && typeof v === 'object') Object.values(v).forEach(walk)
    }
    walk({ ...lesson, videos: [] })
    const later = [/\bOSI\b/, /\bTCP\b/, /\bports?\b/i, /พอร์ต/, /\blayers?\b/i, /เลเยอร์/, /\/24/, /255\.255\./]
    const all = texts.join('\n')
    for (const w of later) expect(all).not.toMatch(w)
    // โน้ตคลิปก็ตรวจด้วย ยกเว้นคำว่า Layer คำเดียว (โน้ตเตือนให้ข้ามช่วง Layer ได้)
    const videoAll = lesson.videos.map((v) => `${v.titleTh}\n${v.noteTh ?? ''}`).join('\n').replace(/\bLayer\b/g, '')
    for (const w of later) expect(videoAll, String(w)).not.toMatch(w)
    // พูดถึงเลขสามชุดแรก ได้ก็ต่อเมื่อบอกว่ากฎจริงอยู่ภาค 1
    for (const t of texts.filter((x) => x.includes('สามชุดแรก'))) expect(t).toContain('ภาค 1')
  })

  it('ทุกฉาก: ไอคอนที่โชว์อยู่ห่างกัน ≥ 120 และป้ายข้อความไม่ทับกัน', () => {
    const set = lesson.scenes!
    let st = initialState(set)
    for (const sc of set.scenes) {
      st = applyScene(st, sc)
      const vis = Object.values(st.actors).filter((a) => !a.hidden && a.kind !== 'cable')
      const icons = vis.filter((a) => a.kind !== 'label' && a.kind !== 'box' && a.kind !== 'envelope')
      const labels = vis.filter((a) => a.kind === 'label')
      for (let i = 0; i < icons.length; i++) {
        for (let j = i + 1; j < icons.length; j++) {
          const d = Math.hypot(icons[i].x - icons[j].x, icons[i].y - icons[j].y)
          expect(d, `${sc.id}: ${icons[i].id} กับ ${icons[j].id}`).toBeGreaterThanOrEqual(120)
        }
      }
      for (const a of vis) {
        expect(a.x, `${sc.id}: ${a.id}`).toBeGreaterThanOrEqual(60)
        expect(a.x, `${sc.id}: ${a.id}`).toBeLessThanOrEqual(900)
        expect(a.y, `${sc.id}: ${a.id}`).toBeLessThanOrEqual(510)
      }
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const apart = Math.abs(labels[i].y - labels[j].y) >= 50 || Math.abs(labels[i].x - labels[j].x) >= 400
          expect(apart, `${sc.id}: ${labels[i].id} กับ ${labels[j].id}`).toBe(true)
        }
        for (const ic of icons) {
          const clash = Math.abs(labels[i].x - ic.x) < 300 && labels[i].y > ic.y - 75 && labels[i].y < ic.y + 110
          expect(clash, `${sc.id}: ป้าย ${labels[i].id} ทับ ${ic.id}`).toBe(false)
        }
      }
    }
  })

  it('ฉากย้ายบ้าน: โน้ตบุ๊กย้ายหมู่บ้าน IP เปลี่ยน MAC เดิม / ฉาก ARP ถาม Gateway เมื่อปลายทางอยู่นอกหมู่บ้าน', () => {
    const all = lesson.scenes!.scenes.map((s) => s.narrationTh)
    expect(all.some((n) => n.includes('ได้ IP ใหม่') && n.includes('MAC') && n.includes('เลขเดิม'))).toBe(true)
    expect(all.some((n) => n.includes('ARP'))).toBe(true)
    expect(all.some((n) => n.includes('MAC ของ Gateway'))).toBe(true)
  })

  it('คำถาม: th 3-4 ข้อ, en 2-3 ข้อ มีคำแปลและ keywords ครบ และคำอธิบายไม่ไล่ข้อความตัวเลือก', () => {
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
    for (const q of lesson.quiz!) {
      for (const c of q.choices) expect(q.explainTh, `${q.id}/${c.id}`).not.toContain(c.textTh ?? c.text)
    }
  })

  it('IP ซ้ำ: อธิบายด้วย ARP ได้คำตอบสองเครื่อง ไม่ใช่ไปรษณีย์ (Switch) งง', () => {
    const scenes = lesson.scenes!.scenes
    const s9 = scenes.find((s) => s.id === 's9')!
    expect(s9.narrationTh).not.toContain('ไปรษณีย์')
    expect(s9.narrationTh).toContain('สองเครื่องตอบ')
    expect((lesson.lab as NetworkLab).goals[0].hintTh).not.toContain('ไปรษณีย์')
    expect((lesson.lab as NetworkLab).goals[0].hintTh).toContain('พอถามหา MAC ก็ตอบมาสองเครื่อง')
    // คำตอบสองซองวิ่งจากคอม 1 และคอม 2 กลับไปที่คนส่ง และเครื่องหมายคำถามอยู่ที่คนส่ง
    const along = s9.actions.filter((a) => a.type === 'moveAlong') as { actor: string; path: string[] }[]
    for (const from of ['d1', 'd2']) expect(along.some((a) => a.path[0] === from && a.path[a.path.length - 1] === 'dSend')).toBe(true)
    expect(s9.actions).toContainEqual({ type: 'setLabel', actor: 'dSend', label: 'คอม 3: MAC ไหนดี?' })
    expect(lesson.scenes!.actors.find((a) => a.id === 'dLbl1')!.label).toBe('❓ IP ซ้ำ: สองเครื่องตอบ ARP · คอมไม่รู้จะส่งให้ใคร')
  })

  it('ฉาก 6 บอกว่าทำไมต้องรู้ MAC / ฉาก 7 เริ่มจากคนส่งต้องเขียน MAC ผู้รับ / ไม่มีศัพท์อังกฤษสองคำติดกัน', () => {
    const [s3, s5, s6, s7] = ['s3', 's5', 's6', 's7'].map((id) => lesson.scenes!.scenes.find((s) => s.id === id)!.narrationTh)
    expect(s6).toContain('Switch จะดู MAC ผู้รับบนกล่อง')
    expect(s6).not.toContain('MAC Switch')
    expect(s7.startsWith('คนส่งต้องเขียน MAC ผู้รับบนกล่องด้วย')).toBe(true)
    expect(s3).toContain('เลขนี้ห้ามซ้ำกันนะ')
    expect(s5).toContain('Router หรือไปรษณีย์กลาง')
    expect(glossary.find((g) => g.id === 'mac-address')!.explainTh).toContain('ตามปกติ')
  })

  describe('ห้องทดลองทำสำเร็จได้จริง', () => {
    const [g1, g2] = lab.goals

    it('มี 2 เป้าหมาย: fail แล้ว fix และทุกเป้าหมายมี taskTh', () => {
      expect(lab.goals.map((g) => g.type)).toEqual(['fail', 'fix'])
      for (const g of lab.goals) expect(g.taskTh.trim()).not.toBe('')
    })

    it('คำแนะนำสอนวิธีพิมพ์ IP: กดที่เครื่อง → พิมพ์ IP → บันทึก (แบ่งบรรทัด)', () => {
      const lines = lab.introTh.split('\n')
      expect(lines.length).toBeGreaterThanOrEqual(3)
      expect(lab.introTh).toMatch(/กดที่รูปคอม[\s\S]*ช่อง IP[\s\S]*บันทึก/)
      expect(lab.introTh).toContain('วง')
    })

    it('reasonIncludes ของเป้าหมาย 1 เป็นส่วนหนึ่งของข้อความจริงจาก sim.ts', () => {
      if (g1.type !== 'fail') throw new Error('goal 1 must be fail')
      const r = simulateSend(dupTopo, g1.from, g1.toIp)
      expect(r.ok).toBe(false)
      expect(r.reasonTh.startsWith('IP ซ้ำ!')).toBe(true)
      expect(r.reasonTh).toContain(g1.reasonIncludes)
      expect(g1.reasonIncludes).toContain('IP ซ้ำ')
    })

    it('เป้าหมาย 1: ตอนเริ่มส่งถึง (ยังไม่ผ่าน) พอตั้ง IP คอม 2 ซ้ำคอม 1 ก็พังเพราะ IP ซ้ำ (ผ่าน)', () => {
      const r0 = simulateSend(lab.start, g1.from, g1.toIp)
      expect(r0.ok).toBe(true)
      expect(checkGoal(g1, lab.start, r0, g1)).toBe(false)
      const r1 = simulateSend(dupTopo, g1.from, g1.toIp)
      expect(checkGoal(g1, dupTopo, r1, g1)).toBe(true)
    })

    it('เป้าหมาย 2: ตอนยัง IP ซ้ำ ส่งไม่ถึง / แก้เป็น 192.168.1.20 ส่งถึง / แก้ไปเลขหมู่บ้านอื่น ไม่ผ่าน', () => {
      const bad = simulateSend(dupTopo, g2.from, g2.toIp)
      expect(bad.ok).toBe(false)
      expect(checkGoal(g2, dupTopo, bad, g2)).toBe(false)
      const r = simulateSend(fixedTopo, g2.from, g2.toIp)
      expect(r.ok).toBe(true)
      expect(r.hops).toEqual(['pc2', 'sw', 'pc1'])
      expect(checkGoal(g2, fixedTopo, r, g2)).toBe(true)
      // ซ้ำกับคอม 3 ก็ยังไม่ผ่าน
      const dup3 = setIp(dupTopo, 'pc2', '192.168.1.12')
      expect(checkGoal(g2, dup3, simulateSend(dup3, g2.from, g2.toIp), g2)).toBe(false)
      // ย้ายไปหมู่บ้านอื่น ส่งหาคอม 1 ไม่ถึง
      const away = setIp(dupTopo, 'pc2', '10.0.0.5')
      expect(checkGoal(g2, away, simulateSend(away, g2.from, g2.toIp), g2)).toBe(false)
      expect(g2.hintTh).toContain('ภาค 1')
    })

    it('เป้าหมาย 2: แก้คอม 1 แทนคอม 2 ไม่ผ่าน (ส่งหา IP ของตัวเองไม่ได้ / ต้องเป็นคู่เดิม)', () => {
      const moved = setIp(dupTopo, 'pc1', '192.168.1.30')
      const r = simulateSend(moved, g2.from, g2.toIp)
      expect(r.ok).toBe(false)
      expect(r.reasonTh).toContain('IP นี้เป็นของเครื่องที่ส่งเอง')
      expect(checkGoal(g2, moved, r, g2)).toBe(false)
      // ส่งจากคอม 1 ไปคอม 2 แทน ก็ไม่ใช่คู่ที่เป้าหมายขอ
      const other = simulateSend(moved, 'pc1', '192.168.1.10')
      expect(checkGoal(g2, moved, other, { from: 'pc1', toIp: '192.168.1.10' })).toBe(false)
    })

    it('ทางตัน: ถ้าเป้าหมาย 1 ผ่านด้วยการตั้งคอม 3 เป็น .10 เป้าหมาย 2 ทำไม่ได้ ตัวช่วยต้องบอกให้กด เริ่มใหม่', () => {
      const via3 = setIp(lab.start, 'pc3', '192.168.1.10')
      expect(checkGoal(g1, via3, simulateSend(via3, g1.from, g1.toIp), g1)).toBe(true)
      const still = setIp(via3, 'pc2', '192.168.1.20')
      expect(checkGoal(g2, still, simulateSend(still, g2.from, g2.toIp), g2)).toBe(false)
      expect(g2.hintTh).toContain('ถ้าคอม 3 ก็ใช้ .10 อยู่ด้วย ให้กด เริ่มใหม่ ก่อน เพราะ .10 ยังซ้ำอยู่ที่คอม 3')
      // กด เริ่มใหม่ = กลับไป lab.start แล้วแก้คอม 2 ก็ผ่าน
      const again = setIp(lab.start, 'pc2', '192.168.1.20')
      expect(checkGoal(g2, again, simulateSend(again, g2.from, g2.toIp), g2)).toBe(true)
    })

    it('ทำผ่านหน้าจอห้องทดลองได้ครบ: กดคอม 2 → พิมพ์ IP → บันทึก → ส่ง', () => {
      vi.useFakeTimers()
      try {
        const onDone = vi.fn()
        render(<LabView lab={lab} termIds={lesson.terms} onDone={onDone} />)
        const flush = () => act(() => { vi.advanceTimersByTime(5000) })
        const typeIp = (ip: string) => {
          fireEvent.click(screen.getByTestId('device-pc2'))
          fireEvent.change(screen.getByLabelText('IP ของ eth0'), { target: { value: ip } })
          fireEvent.click(screen.getByText('บันทึก'))
        }
        expect(screen.getByLabelText('ส่งจาก')).toHaveValue('pc3')
        expect(screen.getByTestId('lab-dest')).toHaveTextContent('(คอม 1)')
        typeIp('192.168.1.10')
        fireEvent.click(screen.getByText('ส่งข้อมูล'))
        flush()
        expect(screen.getByRole('status')).toHaveTextContent('IP ซ้ำ')
        expect(screen.getByText(/ผ่านเป้าหมายนี้แล้ว/)).toBeInTheDocument()
        fireEvent.click(screen.getByText('เป้าหมายต่อไป'))

        expect(screen.getByLabelText('ส่งจาก')).toHaveValue('pc2')
        expect(screen.getByTestId('lab-dest')).toHaveTextContent('(คอม 1)')
        typeIp('192.168.1.20')
        fireEvent.click(screen.getByText('ส่งข้อมูล'))
        flush()
        expect(screen.getByText(/ผ่านเป้าหมายนี้แล้ว/)).toBeInTheDocument()
        expect(onDone).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เล่นได้ครบ: คลิป → ภาพทบทวน → ห้องทดลอง → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['p0-l1', 'p0-l2', 'p0-l3'] }, storage)
      const { container } = render(<LessonPage id="p0-l4" storage={storage} />)

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

      // 3. ห้องทดลอง: ยังไม่ทำเป้าหมาย ไปขั้นต่อไปไม่ได้
      expect(container.querySelector('.lab-intro')).toHaveTextContent(/บันทึก/)
      expect(screen.getByText(/เป้าหมายที่ 1 จาก 2/)).toBeInTheDocument()
      expect(container.querySelector('.lab-task')).toHaveTextContent(lab.goals[0].taskTh)
      expect(screen.getByRole('button', { name: 'ไปขั้นต่อไป' })).toBeDisabled()
      const typeIp = async (ip: string) => {
        fireEvent.click(screen.getByTestId('device-pc2'))
        const box = screen.getByLabelText('IP ของ eth0')
        await u.clear(box)
        await u.type(box, ip)
        await u.click(screen.getByText('บันทึก'))
      }
      const sendAndPass = async () => {
        fireEvent.click(screen.getByText('ส่งข้อมูล'))
        expect(await screen.findByText(/ผ่านเป้าหมายนี้แล้ว/, undefined, { timeout: 4000 })).toBeInTheDocument()
      }
      await typeIp('192.168.1.10')
      await sendAndPass()
      fireEvent.click(screen.getByText('เป้าหมายต่อไป'))
      expect(screen.getByRole('button', { name: 'ไปขั้นต่อไป' })).toBeDisabled()
      await typeIp('192.168.1.20')
      await sendAndPass()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      // 4. คำถาม: ข้อแรกเป็นชั้น th
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(validateCourse(course, glossary)).toEqual([])
      expect(errSpy).not.toHaveBeenCalled()
    }, 30000)
  })
})
