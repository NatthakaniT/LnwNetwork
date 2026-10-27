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
import { lesson } from './g0-l3'

const git = courseById('git')!
const lab = lesson.lab as GitLab
const cmd = async (u: ReturnType<typeof userEvent.setup>, line: string) => { await u.type(screen.getByLabelText('พิมพ์คำสั่ง git'), line + '{Enter}') }
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

describe('lesson g0-l3', () => {
  it('เป็นบทที่ 3 ของภาค 0 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[0].lessons[2]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g0-l3')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('repository กับ commit')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(["g0-l1","g0-l2"])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักมาจากไฟล์คลิป Task 5', () => {
    expect(lesson.videos).toHaveLength(1)
    expect(lesson.videos[0].youtubeId).toBe('MX9OUXV45B0')
    expect(lesson.videos[0].channel).toBe('CMDev')
    expect(lesson.videos[0].noteTh).toBeTruthy()
  })

  it('ศัพท์ใหม่ของบทนี้อยู่ในคลังศัพท์ git และ terms ครั้งเดียว', () => {
    expect(lesson.terms).toEqual(["repository","commit"])
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

  it('สอน init, add, commit, log และบอกว่าถ้าไม่ทำจะเกิดอะไร', () => {
    const all = narration()
    for (const c of ['git init', 'git commit', 'git log', 'git add']) expect(all).toContain(c)
    expect(all).toContain('ถ้าไม่พิมพ์ Git จะไม่จดอะไรเลย')
    expect(all).toContain('ถ้าไม่ commit ก็ไม่มีจุดเซฟ')
    expect(all).toContain('ถ้าไม่พิมพ์ก็แค่ไม่เห็นรายการ')
    expect(all).toContain('ถ้าข้าม git add จะ commit ไม่ผ่าน')
  })

  it('ไม่พูดถึงของที่ยังไม่ได้สอน (push, pull, clone, staging, remote, origin)', () => {
    expect(narration()).not.toMatch(/push|pull|clone|staging|remote|origin/i)
  })

  it('ห้องทดลอง: allowed ตรงกับที่สอน เป้าหมายเรียง init แล้ว committed', () => {
    expect(lab.allowed).toEqual(['init', 'status', 'add', 'commit', 'log'])
    expect(lab.goals.map((g) => g.check)).toEqual(['onBranch', 'committed'])
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → ห้องทดลอง → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ["g0-l1","g0-l2"] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g0-l3" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      await cmd(u, 'git commit -m "x"')
      expect(screen.getByText(/ข้อ 1 จาก 2/)).toBeInTheDocument()
      await cmd(u, 'git init')
      expect(screen.getByText(/ข้อ 2 จาก 2/)).toBeInTheDocument()
      await cmd(u, 'git commit -m "หน้าแรก"')
      expect(screen.getByText(/ข้อ 2 จาก 2/)).toBeInTheDocument() // ยังไม่ add ต้องไม่ผ่าน
      await cmd(u, 'git add index.html')
      await cmd(u, 'git commit -m "หน้าแรก"')
      expect(screen.getByText('ครบทุกข้อแล้ว 🎉')).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 40000)
  })
})
