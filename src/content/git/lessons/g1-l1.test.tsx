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
import { lesson } from './g1-l1'

const git = courseById('git')!
const lab = lesson.lab as GitLab
const cmd = async (u: ReturnType<typeof userEvent.setup>, line: string) => { await u.type(screen.getByLabelText('พิมพ์คำสั่ง git'), line + '{Enter}') }
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

describe('lesson g1-l1', () => {
  it('เป็นบทที่ 1 ของภาค 1 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[1].lessons[0]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g1-l1')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('branch')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(['g0-l3', 'g0-l5'])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักคือ Panutat Tejasen บทที่ 5 Branch และมีโน้ต', () => {
    expect(lesson.videos[0].youtubeId).toBe('u7dDKe7cYgs')
    expect(lesson.videos[0].channel).toBe('Panutat Tejasen')
    expect(lesson.videos[0].noteTh?.trim()).toBeTruthy()
  })

  it('ศัพท์ใหม่ branch และ HEAD อยู่ในคลังศัพท์ ครั้งเดียว', () => {
    expect(lesson.terms).toEqual(['branch', 'head'])
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

  it('เปิดด้วยปัญหา แล้วสอนว่า branch คือป้ายชี้จุดเซฟ ไม่ใช่การก๊อปไฟล์ และทุกคำสั่งบอกว่าถ้าไม่พิมพ์จะเกิดอะไร', () => {
    const s = lesson.scenes!.scenes
    expect(s[0].narrationTh).toContain('ปนกับ')
    const all = narration()
    expect(all).toContain('ป้ายชื่อ')
    expect(all).toContain('ไม่มีไฟล์ถูกก๊อป')
    for (const c of ['git branch', 'git switch', 'git switch -c', 'git checkout']) expect(all).toContain(c)
    expect(all).toContain('ถ้าไม่พิมพ์คำสั่งนี้')
    expect(all).toContain('ถ้าไม่ switch')
    expect(all).toContain('ถ้าไม่ใส่ -c')
    // ไม่ใช้ศัพท์ที่ยังไม่สอน
    for (const later of ['merge', 'Pull Request', 'conflict']) expect(all).not.toContain(later)
  })

  it('ภาพ: ตอนสร้าง branch ยังไม่มีจุดเซฟใหม่, ตอน commit จึงโผล่จุดใหม่ในสาย login ส่วนป้าย main ยังอยู่', () => {
    const find = (chip: string) => lesson.scenes!.scenes.find((x) => x.chipTh === chip)!
    const made = find('git branch')
    expect(made.setup!.some((a) => a.type === 'show' && a.actor === 'b1')).toBe(false)
    const committed = find('commit บนสายใหม่')
    expect(committed.actions.some((a) => a.type === 'show' && a.actor === 'b1')).toBe(true)
    expect(committed.setup!.some((a) => a.type === 'show' && a.actor === 'tMain')).toBe(true)
  })

  it('คำถามชั้นไทย 3-4 ข้อ / อยากรู้ลึกบอกว่าไม่ต้องรู้ก็เรียนต่อได้', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(lesson.deepDives!.length).toBeGreaterThanOrEqual(2)
    for (const d of lesson.deepDives!) expect(d.bodyTh).toContain('ไม่ต้องรู้')
  })

  it('ห้องทดลอง: ไม่มีข้อไหนผ่านเองตั้งแต่เริ่ม และเรียงสลับไป main → สร้างสาย → commit → กลับ main', () => {
    expect(lab.allowed).toEqual(['status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout'])
    expect(lab.goals.map((g) => [g.check, g.arg])).toEqual([['onBranch', 'main'], ['onBranch', 'login'], ['committed', 'login'], ['onBranch', 'main']])
    for (const g of lab.goals) expect(checkGitGoal(lab.start, g)).toBe(false)
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → ห้องทดลอง → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['g0-l3', 'g0-l5'] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g1-l1" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      await cmd(u, 'git switch login') // ยังไม่มีสายนี้ ต้องไม่ error และไม่ผ่านข้อ
      expect(screen.getByText(/ข้อ 1 จาก 4/)).toBeInTheDocument()
      await cmd(u, 'git switch main')
      expect(screen.getByText(/ข้อ 2 จาก 4/)).toBeInTheDocument()
      await cmd(u, 'git switch -c login')
      expect(screen.getByText(/ข้อ 3 จาก 4/)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'index.html' }))
      const box = screen.getByLabelText('แก้ไฟล์ index.html')
      await u.clear(box)
      await u.type(box, 'ฟอร์มใหม่')
      await u.click(screen.getByText('บันทึกไฟล์'))
      await cmd(u, 'git add index.html')
      await cmd(u, 'git commit -m "ทำหน้า login"')
      expect(screen.getByText(/ข้อ 4 จาก 4/)).toBeInTheDocument()
      await cmd(u, 'git switch main')
      expect(screen.getByText('ครบทุกข้อแล้ว 🎉')).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 40000)
  })
})
