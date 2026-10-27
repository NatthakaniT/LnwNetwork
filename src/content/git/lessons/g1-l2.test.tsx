import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { validateCourse } from '../../index'
import type { ActivityLab } from '../../types'
import { courseById } from '../../courses'
import { gitParts } from '../parts'
import { gitGlossary } from '../glossary'
import { LessonPage } from '../../../pages/LessonPage'
import { memoryStorage } from '../../../pages/fixture'
import { saveProgress } from '../../../progress/progress'
import { lesson } from './g1-l2'

const git = courseById('git')!
const lab = lesson.lab as ActivityLab
const textOf = (id: string) => lab.items.find((i) => i.id === id)!.textTh
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

async function solveWithButtons(u: ReturnType<typeof userEvent.setup>, root: HTMLElement) {
  const answer = lab.answer as string[]
  for (let i = 0; i < answer.length; i++) {
    const want = textOf(answer[i])
    const rows = () => within(root.querySelector('.activity-list') as HTMLElement).getAllByRole('listitem')
    let pos = rows().findIndex((r) => r.textContent?.includes(want))
    expect(pos).toBeGreaterThanOrEqual(0)
    while (pos > i) { await u.click(screen.getByLabelText(`เลื่อนขึ้น ${want}`)); pos-- }
  }
}

describe('lesson g1-l2', () => {
  it('เป็นบทที่ 2 ของภาค 1 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[1].lessons[1]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g1-l2')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('Pull Request')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(['g1-l1', 'g0-l5'])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักเป็นคลิปที่ครอบคลุมบางส่วน และ noteTh บอกตรง ๆ ว่ายาว ต้องหาช่วงเอง', () => {
    expect(lesson.videos[0].youtubeId).toBe('gZEjfT2TsVM')
    expect(lesson.videos[0].channel).toBe('Superdev Academy')
    const note = lesson.videos[0].noteTh!
    expect(note).toContain('ยาว')
    expect(note).toContain('ไม่มีคลิปไทยสั้น')
  })

  it('ศัพท์ใหม่ Pull Request, review, merge อยู่ในคลังศัพท์ ครั้งเดียว', () => {
    expect(lesson.terms).toEqual(['pull-request', 'review', 'merge'])
    for (const t of lesson.terms!) expect(gitGlossary.filter((g) => g.id === t)).toHaveLength(1)
    expect(new Set(gitGlossary.map((g) => g.en.toLowerCase())).size).toBe(gitGlossary.length)
  })

  it('บทพูด: 6-10 ฉาก ไม่เกิน 170 ตัวอักษร ไม่มีตัวเลขและวงเล็บ / v2 ครบ', () => {
    const set = lesson.scenes!
    expect(set.style).toBe('v2')
    expect(set.scenes.length).toBeGreaterThanOrEqual(6)
    expect(set.scenes.length).toBeLessThanOrEqual(10)
    for (const s of set.scenes) {
      expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(170)
      expect(s.narrationTh, s.id).not.toMatch(/[0-9()]/)
      expect(s.chipTh, s.id).toBeTruthy()
      expect(s.lifeTh, s.id).toBeTruthy()
      expect(s.lifeIcon, s.id).toBeTruthy()
    }
  })

  it('สอนว่า Pull Request คือคำขอ ยังไม่ได้รวม / ต้อง push สายก่อน / review / Merge บนเว็บ / ต้อง pull กลับ', () => {
    const all = narration()
    expect(all).toContain('ยังไม่รวมอะไรเลย')
    expect(all).toContain('git push -u origin login')
    expect(all).toContain('ถ้าไม่ push')
    expect(all).toContain('review')
    expect(all).toContain('Merge pull request')
    expect(all).toContain('ถ้าไม่ pull')
    expect(all).toContain('ถ้าไม่มี review')
    expect(all).not.toContain('conflict') // ยังไม่สอน
  })

  it('บอกว่าเว็บ GitHub ไม่ได้จำลองในแอป และชื่อปุ่มอาจเปลี่ยน', () => {
    expect(lab.introTh).toContain('ไม่ได้จำลอง')
    const all = lesson.deepDives!.map((d) => d.bodyTh).join('\n')
    expect(all).toContain('ชื่อปุ่ม')
  })

  it('ห้องทดลองเรียงลำดับ: 6-7 ข้อ คำตอบใช้ครบทุกข้อ ไม่ซ้ำ และคำอธิบายไม่ไล่คำตอบ', () => {
    expect(lab.kind).toBe('order')
    expect(lab.items.length).toBeGreaterThanOrEqual(6)
    expect(lab.items.length).toBeLessThanOrEqual(7)
    expect([...(lab.answer as string[])].sort()).toEqual(lab.items.map((i) => i.id).sort())
    expect(new Set(lab.items.map((i) => i.textTh)).size).toBe(lab.items.length)
    expect(lab.items.filter((i) => lab.explainTh.includes(i.textTh))).toHaveLength(0)
  })

  it('คำถามชั้นไทย 3-4 ข้อ / อยากรู้ลึกบอกว่าไม่ต้องรู้ก็เรียนต่อได้', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(lesson.deepDives!.length).toBeGreaterThanOrEqual(2)
    for (const d of lesson.deepDives!) expect(d.bodyTh).toContain('ไม่ต้องรู้')
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → เรียงลำดับ → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['g1-l1', 'g0-l5'] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g1-l2" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      expect(container.querySelector('.video-note')).toHaveTextContent(lesson.videos[0].noteTh!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      await solveWithButtons(u, container)
      await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
      expect(screen.getByText(/ถูกต้อง!/)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 30000)
  })
})
