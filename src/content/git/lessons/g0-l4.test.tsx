import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { validateCourse } from '../../index'
import type { GitLab } from '../../../gitsim/goals'
import { checkGitGoal } from '../../../gitsim/goals'
import { courseById } from '../../courses'
import { gitParts } from '../parts'
import { gitGlossary } from '../glossary'
import { LessonPage } from '../../../pages/LessonPage'
import { memoryStorage } from '../../../pages/fixture'
import { saveProgress } from '../../../progress/progress'
import { lesson } from './g0-l4'

const git = courseById('git')!
const lab = lesson.lab as GitLab
const cmd = async (u: ReturnType<typeof userEvent.setup>, line: string) => { await u.type(screen.getByLabelText('พิมพ์คำสั่ง git'), line + '{Enter}') }
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

describe('lesson g0-l4', () => {
  it('เป็นบทที่ 4 ของภาค 0 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[0].lessons[3]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g0-l4')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('git add')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(["g0-l3"])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักมาจากไฟล์คลิป Task 5', () => {
    expect(lesson.videos).toHaveLength(1)
    expect(lesson.videos[0].youtubeId).toBe('eSzam5vabTQ')
    expect(lesson.videos[0].channel).toBe('Panutat Tejasen')
    expect(lesson.videos[0].noteTh).toBeTruthy()
  })

  it('ศัพท์ใหม่ของบทนี้อยู่ในคลังศัพท์ git และ terms ครั้งเดียว', () => {
    expect(lesson.terms).toEqual(["staging"])
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

  it('คำถามชั้นไทย 3-4 ข้อ ห้องทดลองเป็น git ที่เป้าหมายแรกยังไม่ผ่านตั้งแต่เริ่ม', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(lab.kind).toBe('git')
    expect(checkGitGoal(lab.start, lab.goals[0])).toBe(false)
  })

  it('สอนสามที่ของไฟล์ เห็นไฟล์ย้ายด้วย move และบอกว่าถ้าไม่พิมพ์จะเกิดอะไร', () => {
    const all = narration()
    expect(all).toContain('staging area')
    for (const c of ['git add', 'git commit', 'git status']) expect(all).toContain(c)
    expect(all).toContain('ถ้าไม่พิมพ์ git add')
    expect(all).toContain('ถ้าไม่พิมพ์ git commit')
    expect(all).toContain('ถ้าไม่พิมพ์ก็ไม่รู้')
    const moves = lesson.scenes!.scenes.flatMap((s) => [...(s.setup ?? []), ...s.actions]).filter((a) => a.type === 'move')
    expect(moves.length).toBeGreaterThanOrEqual(4)
  })

  it('ไม่พูดถึงของที่ยังไม่ได้สอน (push, pull, clone, remote, origin)', () => {
    expect(narration()).not.toMatch(/push|pull|clone|remote|origin/i)
  })

  it('ห้องทดลอง: staged มาก่อน committed แล้วมี staged ปิดท้ายอีกไฟล์', () => {
    expect(lab.goals.map((g) => g.check)).toEqual(['onBranch', 'staged', 'committed', 'staged'])
    expect(lab.goals[1].arg).toBe('index.html')
    expect(lab.goals[3].arg).toBe('notes.txt')
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → ห้องทดลอง → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ["g0-l3"] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g0-l4" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      await cmd(u, 'git init')
      await cmd(u, 'git commit -m "x"')
      expect(screen.getByText(/ข้อ 2 จาก 4/)).toBeInTheDocument() // ยังไม่ add ห้ามผ่าน
      await cmd(u, 'git add index.html')
      expect(screen.getByText(/ข้อ 3 จาก 4/)).toBeInTheDocument()
      await cmd(u, 'git status')
      expect(screen.getAllByText(/notes.txt/).length).toBeGreaterThan(0)
      await cmd(u, 'git commit -m "หน้าแรก"')
      expect(screen.getByText(/ข้อ 4 จาก 4/)).toBeInTheDocument() // notes.txt ยังไม่เข้ากล่อง
      await cmd(u, 'git add notes.txt')
      expect(screen.getByText('ครบทุกข้อแล้ว 🎉')).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 40000)
  })
})
