import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { course, glossary, validateCourse } from '../index'
import type { ActivityLab } from '../types'
import { LessonPage } from '../../pages/LessonPage'
import { memoryStorage } from '../../pages/fixture'
import { saveProgress } from '../../progress/progress'
import { valueOf } from '../../tryit/bits'
import { lesson } from './p0-bits'

const narration = (id: string) => lesson.scenes!.scenes.find((s) => s.id === id)!.narrationTh

describe('lesson p0-bits', () => {
  it('อยู่ในภาค 0 ระหว่าง p0-l3 กับ p0-l4 และ validateCourse ผ่าน', () => {
    const ids = course[0].lessons.map((l) => l.id)
    expect(ids.indexOf('p0-bits')).toBe(ids.indexOf('p0-l3') + 1)
    expect(ids.indexOf('p0-l4')).toBe(ids.indexOf('p0-bits') + 1)
    const l = course[0].lessons[3]
    expect(l).toEqual({ ...lesson, videos: [...lesson.videos, ...l.videos.slice(lesson.videos.length)] })
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('คอมพูดภาษา 0 กับ 1')
    expect(l.analogyTh).toBe('สวิตช์ไฟกับทอนเงินด้วยแบงก์')
    expect(l.ciscoModules).toEqual(['ITN 5'])
    expect(validateCourse(course, glossary)).toEqual([])
  })

  it('ต่อจาก p0-l3 มีเช็กพื้นฐาน 2 ข้อชี้กลับ p0-l3', () => {
    expect(lesson.requires).toEqual([{ lesson: 'p0-l3', useTh: 'ข้อมูลที่วิ่งในสายคือสิ่งที่เราจะดูว่าคอมเก็บยังไง' }])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(q.reviewLesson).toBe('p0-l3')
    }
  })

  it('ลองกดเอง: แผงสวิตช์ 8 ตัว ทำ 192 168 10 1 / อยากรู้ลึก 2 กล่อง (transistor, ASCII)', () => {
    expect(lesson.tryIt).toMatchObject({ kind: 'bits8', goals: [192, 168, 10, 1] })
    expect(lesson.tryIt!.introTh.trim()).not.toBe('')
    expect(lesson.deepDives).toHaveLength(2)
    expect(lesson.deepDives![0].titleTh).toContain('transistor')
    expect(lesson.deepDives![1].titleTh).toContain('ASCII')
    expect(lesson.deepDives![1].bodyTh).toContain('65')
    for (const d of lesson.deepDives!) expect(d.bodyTh).toContain('ไม่ต้องรู้')
  })

  it('คลิปภาษาไทยเปิดในหน้าได้ มีโน้ต', () => {
    expect(lesson.videos.length).toBeGreaterThanOrEqual(1)
    for (const v of lesson.videos) {
      expect(v.youtubeId).toMatch(/^[\w-]{11}$/)
      expect(v.noteTh?.trim()).toBeTruthy()
    }
  })

  it('ศัพท์ใหม่ bit byte binary อยู่ในคลังศัพท์และ terms', () => {
    for (const id of ['bit', 'byte', 'binary']) {
      expect(glossary.filter((g) => g.id === id)).toHaveLength(1)
      expect(lesson.terms).toContain(id)
    }
    expect(new Set(glossary.map((g) => g.en.toLowerCase())).size).toBe(glossary.length)
    expect(glossary.find((g) => g.id === 'bit')!.explainTh).toContain('สวิตช์')
    expect(glossary.find((g) => g.id === 'byte')!.explainTh).toMatch(/8[\s\S]*0 ถึง 255/)
    expect(glossary.find((g) => g.id === 'binary')!.explainTh).toContain('ทอนเงิน')
  })

  it('บทพูด: ไม่เกิน 170 ตัวอักษร ไม่มีตัวเลขและวงเล็บ', () => {
    const scenes = lesson.scenes!.scenes
    expect(scenes.length).toBeGreaterThanOrEqual(6)
    expect(scenes.length).toBeLessThanOrEqual(10)
    for (const s of scenes) {
      expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(170)
      expect(s.narrationTh.replace(/IPv4/g, ''), s.id).not.toMatch(/[0-9()]/)
    }
  })

  it('ฉากแบบ v2 ครบ และเล่าเรื่องตามลำดับ: ปัญหา → bit → สองเท่า → ป้ายค่า → ทอนเงิน → 192 → byte → ทำไม 8 → IP 32 bit', () => {
    const set = lesson.scenes!
    expect(set.style).toBe('v2')
    for (const s of set.scenes) {
      expect(s.chipTh, s.id).toBeTruthy()
      expect(s.lifeTh, s.id).toBeTruthy()
      expect(s.lifeIcon, s.id).toBeTruthy()
    }
    expect(narration('s1').startsWith('คอมรู้จักแค่ไฟเปิดกับไฟปิด แล้วมันจำเลขหนึ่งร้อยเก้าสิบสอง ได้ยังไง')).toBe(true) // กฎ 4.4
    expect(narration('s2')).toContain('bit')
    expect(narration('s2')).toContain('Switch') // บอกว่าสวิตช์ไฟไม่ใช่ Switch ไปรษณีย์
    expect(narration('s3')).toContain('สองเท่า')
    expect(narration('s5')).toContain('ทอนเงิน')
    expect(narration('s6')).toContain('binary')
    expect(narration('s7')).toMatch(/ศูนย์ถึงสองร้อยห้าสิบห้า[\s\S]*byte/)
    expect(narration('s8')).toContain('ข้อตกลง')
    expect(narration('s9')).toMatch(/สามสิบสอง[\s\S]*สี่ก้อน/)
  })

  it('ฉาก 192 เปิดสวิตช์ 128 กับ 64 / ฉาก A เปิด 64 กับ 1 / ฉาก byte เปิดครบ 8 ตัว', () => {
    const set = lesson.scenes!
    const onAfter = (id: string) => {
      const sc = set.scenes.find((s) => s.id === id)!
      const lit = new Set<string>()
      for (const a of [...(sc.setup ?? []), ...sc.actions]) if (a.type === 'setLabel' && a.label.startsWith('💡')) lit.add(a.actor)
      return ['sw0', 'sw1', 'sw2', 'sw3', 'sw4', 'sw5', 'sw6', 'sw7'].map((sw) => (lit.has(sw) ? 1 : 0)) as (0 | 1)[]
    }
    expect(valueOf(onAfter('s6'))).toBe(192)
    expect(valueOf(onAfter('s7'))).toBe(255)
    expect(valueOf(onAfter('s8'))).toBe(65)
  })

  it('ฉาก A = 65: ป้ายผลลัพธ์โผล่หลังเปิดสวิตช์ ไม่ใช่ก่อน (กฎ 3.1 ข้อ 2) / transistor สลับตามไฟที่สั่ง', () => {
    const s8 = lesson.scenes!.scenes.find((s) => s.id === 's8')!
    expect(s8.setup).not.toContainEqual({ type: 'show', actor: 'aLbl0' })
    const at = s8.actions.findIndex((a) => a.type === 'show' && a.actor === 'aLbl0')
    const lastFlip = s8.actions.map((a) => a.type === 'setLabel').lastIndexOf(true)
    expect(at).toBeGreaterThan(lastFlip)
    expect(lesson.deepDives![0].bodyTh).not.toContain('สลับเปิดปิดเอง')
    expect(lesson.deepDives![0].bodyTh).toContain('ตามไฟที่สั่ง')
  })

  it('ห้องทดลองจับคู่เลขกับแถวสวิตช์ 8 หลักที่ถูกต้อง', () => {
    const lab = lesson.lab as ActivityLab
    expect(lab.kind).toBe('match')
    const text = (id: string) => lab.items.find((i) => i.id === id)!.textTh
    const pairs = Object.entries(lab.answer as Record<string, string>)
    expect(pairs.length).toBeGreaterThanOrEqual(4)
    for (const [l, r] of pairs) {
      const n = Number(text(l))
      const bits = text(r).match(/[01]{8}/)![0]
      expect(parseInt(bits, 2), `${l} → ${r}`).toBe(n)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(255)
    }
  })

  it('คำถาม: th 3-4 ข้อ en 2-3 ข้อ มีคำแปล keywords ครบ', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    const en = lesson.quiz!.filter((q) => q.layer === 'en')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(en.length).toBeGreaterThanOrEqual(2)
    expect(en.length).toBeLessThanOrEqual(3)
    for (const q of en) {
      expect(q.promptTh).toBeTruthy()
      for (const c of q.choices) expect(c.textTh).toBeTruthy()
      for (const k of q.keywords!) expect(q.prompt).toContain(k)
    }
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน + ลองกดเอง → จับคู่ → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['p0-l1', 'p0-l2', 'p0-l3'] }, storage)
      const { container } = render(<LessonPage id="p0-bits" storage={storage} />)

      expect(container.querySelector('.requires-box')).toHaveTextContent('ข้อมูลเดินทางยังไง')
      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))

      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      // ยังไม่ได้ลองกดเอง ไปต่อไม่ได้
      expect(screen.getByRole('button', { name: 'ไปขั้นต่อไป' })).toBeDisabled()
      const goals = lesson.tryIt!.goals
      for (const [i, g] of goals.entries()) {
        for (const v of [128, 64, 32, 16, 8, 4, 2, 1]) if (g & v) await u.click(screen.getByRole('button', { name: `สวิตช์ค่า ${v}` }))
        // รอแผงรีเซ็ตแล้วขึ้นโจทย์ถัดไป
        await screen.findByText(i + 1 < goals.length ? new RegExp(`โจทย์ ${i + 2}/`) : 'ทำครบทุกโจทย์แล้ว', undefined, { timeout: 3000 })
      }
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      const lab = lesson.lab as ActivityLab
      for (const [l, r] of Object.entries(lab.answer as Record<string, string>)) {
        const left = lab.items.find((i) => i.id === l)!.textTh
        await u.selectOptions(screen.getByLabelText(`จับคู่ ${left}`), r)
      }
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(container.querySelector('.lab-result.ok')).toHaveTextContent('ถูกต้อง')
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 30000)
  })
})
