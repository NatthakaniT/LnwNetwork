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
import { lesson } from './g0-l1'

const git = courseById('git')!
const lab = lesson.lab as ActivityLab
const textOf = (id: string) => lab.items.find((i) => i.id === id)!.textTh
const narration = (id: string) => lesson.scenes!.scenes.find((s) => s.id === id)!.narrationTh

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

describe('lesson g0-l1', () => {
  it('เป็นบทแรกของวิชา git พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[0].lessons[0]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g0-l1')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('ทำไมต้องมี Git')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('เป็นบทแรกของวิชา: ไม่มี requires และไม่มี precheck', () => {
    expect(lesson.requires).toBeUndefined()
    expect(lesson.precheck).toBeUndefined()
  })

  it('คลิปหลักมาจากไฟล์คลิป Task 5 (Panutat Tejasen บทที่ 1) และมีโน้ตบอกว่าให้ดูอะไร', () => {
    expect(lesson.videos).toHaveLength(1)
    expect(lesson.videos[0].youtubeId).toBe('pe9GU7yNYiE')
    expect(lesson.videos[0].channel).toBe('Panutat Tejasen')
    expect(lesson.videos[0].noteTh?.trim()).toBeTruthy()
  })

  it('ศัพท์ที่บทนี้สอน (git, version control) อยู่ในคลังศัพท์ของวิชา git และ terms', () => {
    for (const id of ['git', 'version-control']) {
      expect(gitGlossary.filter((g) => g.id === id)).toHaveLength(1)
      expect(lesson.terms).toContain(id)
    }
    expect(new Set(gitGlossary.map((g) => g.en.toLowerCase())).size).toBe(gitGlossary.length)
    expect(gitGlossary.find((g) => g.id === 'git')!.explainTh).toContain('เซฟ')
  })

  it('บทพูด: 6-10 ฉาก ไม่เกิน 170 ตัวอักษร ไม่มีตัวเลขและวงเล็บ', () => {
    const scenes = lesson.scenes!.scenes
    expect(scenes.length).toBeGreaterThanOrEqual(6)
    expect(scenes.length).toBeLessThanOrEqual(10)
    for (const s of scenes) {
      expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(170)
      expect(s.narrationTh, s.id).not.toMatch(/[0-9()]/)
    }
  })

  it('ฉากแบบ v2 ทุกฉากมีชื่อฉาก ไอคอน และแถบชีวิตจริง', () => {
    expect(lesson.scenes!.style).toBe('v2')
    for (const s of lesson.scenes!.scenes) {
      expect(s.chipTh, s.id).toBeTruthy()
      expect(s.lifeTh, s.id).toBeTruthy()
      expect(s.lifeIcon, s.id).toBeTruthy()
    }
  })

  it('เล่าตามลำดับ: ปัญหา 4 ข้อ ก่อนบอกว่า Git คืออะไร และไม่พูดถึงตัวอื่นในตระกูล Git ก่อนบทหน้า', () => {
    const ids = lesson.scenes!.scenes.map((s) => s.id)
    const at = (needle: string) => ids.findIndex((id) => narration(id).includes(needle))
    expect(narration('s1')).toContain('ไฟล์')
    expect(narration('s2')).toContain('ไลน์')
    expect(at('Git')).toBeGreaterThan(3) // ปัญหา 4 ฉากแรก แล้วค่อยเฉลย
    expect(narration('s5')).toContain('เซฟ')
    expect(narration('s7')).toContain('version control')
    const all = lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')
    for (const later of ['GitHub', 'Git Bash', 'GitLab']) expect(all).not.toContain(later)
  })

  it('ห้องทดลองเรียงลำดับ: 5-7 ข้อ คำตอบใช้ครบทุกข้อ ไม่ซ้ำ และคำอธิบายไม่ไล่คำตอบ', () => {
    expect(lab.kind).toBe('order')
    expect(lab.items.length).toBeGreaterThanOrEqual(5)
    expect(lab.items.length).toBeLessThanOrEqual(7)
    expect([...(lab.answer as string[])].sort()).toEqual(lab.items.map((i) => i.id).sort())
    expect(new Set(lab.items.map((i) => i.textTh)).size).toBe(lab.items.length)
    expect(lab.items.filter((i) => lab.explainTh.includes(i.textTh))).toHaveLength(0)
  })

  it('คำถามชั้นไทย 3-4 ข้อ (วิชา git ไม่บังคับชั้นอังกฤษ) / อยากรู้ลึกบอกว่าไม่ต้องรู้ก็เรียนต่อได้', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(lesson.deepDives!.length).toBeGreaterThanOrEqual(1)
    for (const d of lesson.deepDives!) expect(d.bodyTh).toContain('ไม่ต้องรู้')
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('คลิป → ภาพทบทวน → เรียงลำดับ → คำถาม', async () => {
      const u = userEvent.setup()
      const { container } = render(<LessonPage id="g0-l1" course={git} storage={memoryStorage()} />)

      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      expect(container.querySelector('.video-note')).toHaveTextContent(lesson.videos[0].noteTh!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      expect(container.querySelector('.sp-caption')).toHaveTextContent(lesson.scenes!.scenes[0].narrationTh)
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      expect(screen.getAllByRole('button', { name: 'Git' }).length).toBeGreaterThan(0) // ศัพท์ในคำบรรยายกดได้
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
