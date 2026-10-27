import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { validateCourse } from '../../index'
import type { GitLab } from '../../../gitsim/goals'
import { checkGitGoal } from '../../../gitsim/goals'
import { run } from '../../../gitsim/run'
import { courseById } from '../../courses'
import { gitParts } from '../parts'
import { gitGlossary } from '../glossary'
import { LessonPage } from '../../../pages/LessonPage'
import { memoryStorage } from '../../../pages/fixture'
import { saveProgress } from '../../../progress/progress'
import { lesson } from './g1-l3'

const git = courseById('git')!
const lab = lesson.lab as GitLab
const cmd = async (u: ReturnType<typeof userEvent.setup>, line: string) => { await u.type(screen.getByLabelText('พิมพ์คำสั่ง git'), line + '{Enter}') }
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

describe('lesson g1-l3', () => {
  it('เป็นบทที่ 3 ของภาค 1 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[1].lessons[2]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g1-l3')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('merge กับ conflict')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(['g1-l2', 'g0-l4'])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักคือ CMDev Merge Conflict และโน้ตบอกตรง ๆ ว่ายังไม่ได้ตรวจเนื้อหา', () => {
    expect(lesson.videos[0].youtubeId).toBe('u5TfPXI8AOo')
    expect(lesson.videos[0].channel).toBe('CMDev')
    expect(lesson.videos[0].noteTh).toContain('ยังไม่ได้ตรวจ')
  })

  it('ศัพท์ใหม่ conflict และ merge commit อยู่ในคลังศัพท์ ครั้งเดียว (merge สอนไปแล้วในบทก่อน)', () => {
    expect(lesson.terms).toEqual(['conflict', 'merge-commit'])
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

  it('สอน merge, conflict, add + commit, --abort และทุกคำสั่งบอกว่าถ้าไม่ทำจะเกิดอะไร', () => {
    const all = narration()
    for (const c of ['git merge login', 'git switch main', 'git add', 'git commit', 'git merge --abort', 'conflict', 'merge commit']) expect(all).toContain(c)
    expect(all).toContain('ถ้าไม่ merge')
    expect(all).toContain('ถ้าไม่ลบ')
    expect(all).toContain('ถ้าไม่ add')
    expect(all).toContain('ถ้าไม่ยกเลิก')
  })

  it('ภาพ: ฉากรวมไม่ชนมีจุดรวมที่มีสองสายมาบรรจบ ฉากชนกันยังไม่มีจุดรวม', () => {
    const find = (chip: string) => lesson.scenes!.scenes.find((x) => x.chipTh === chip)!
    const ok = find('ไม่ชนกัน')
    expect(ok.actions.some((a) => a.type === 'show' && a.actor === 'm4')).toBe(true)
    const clash = find('งานชนกัน')
    for (const a of [...(clash.setup ?? []), ...clash.actions]) expect(a.type === 'show' && a.actor === 'm4').toBe(false)
  })

  it('คำถามชั้นไทย 3-4 ข้อ / อยากรู้ลึกบอกว่าไม่ต้องรู้ก็เรียนต่อได้', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
    expect(lesson.deepDives!.length).toBeGreaterThanOrEqual(2)
    for (const d of lesson.deepDives!) expect(d.bodyTh).toContain('ไม่ต้องรู้')
  })

  it('ห้องทดลอง: เริ่มที่สาย login ไม่มีข้อไหนผ่านเอง และ merge เข้า main แล้วชนกันที่ index.html จริง', () => {
    expect(lab.allowed).toEqual(['status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge'])
    expect(lab.goals.map((g) => [g.check, g.arg])).toEqual([['onBranch', 'main'], ['conflictFixed', undefined]])
    for (const g of lab.goals) expect(checkGitGoal(lab.start, g)).toBe(false)
    const onMain = run(lab.start, 'git switch main', lab.allowed).world
    const r = run(onMain, 'git merge login', lab.allowed)
    expect(r.world.conflict?.files).toEqual(['index.html'])
    expect(r.world.me.files['index.html']).toContain('<<<<<<< HEAD')
    expect(r.world.me.files['login.html']).toBeTruthy() // ไฟล์ที่ไม่ชนรวมให้เอง
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → ห้องทดลอง (ชนแล้วแก้เอง) → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['g1-l2', 'g0-l4'] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g1-l3" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      await cmd(u, 'git merge login') // ยังอยู่สาย login: ต้องไม่ผ่านข้อและไม่ error
      expect(screen.getByText(/ข้อ 1 จาก 2/)).toBeInTheDocument()
      await cmd(u, 'git switch main')
      expect(screen.getByText(/ข้อ 2 จาก 2/)).toBeInTheDocument()
      await cmd(u, 'git merge login')
      expect(screen.getByText(/ข้อ 2 จาก 2/)).toBeInTheDocument() // ชน: ยังไม่ผ่าน
      await cmd(u, 'git commit -m "รวม"') // ยังมี conflict ค้าง ต้องไม่ผ่าน
      expect(screen.getByText(/ข้อ 2 จาก 2/)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'index.html' }))
      const box = screen.getByLabelText('แก้ไฟล์ index.html')
      expect((box as HTMLTextAreaElement).value).toContain('<<<<<<< HEAD')
      await u.clear(box)
      await u.type(box, 'ยินดีต้อนรับ เข้าสู่ระบบ')
      await u.click(screen.getByText('บันทึกไฟล์'))
      await cmd(u, 'git add index.html')
      await cmd(u, 'git commit -m "รวม login"')
      expect(screen.getByText('ครบทุกข้อแล้ว 🎉')).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 40000)
  })
})
