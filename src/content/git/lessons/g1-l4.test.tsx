import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { validateCourse } from '../../index'
import type { ActivityLab } from '../../types'
import { courseById } from '../../courses'
import { gitParts } from '../parts'
import { gitGlossary } from '../glossary'
import { LessonPage } from '../../../pages/LessonPage'
import { memoryStorage } from '../../../pages/fixture'
import { saveProgress } from '../../../progress/progress'
import { lesson } from './g1-l4'

const git = courseById('git')!
const lab = lesson.lab as ActivityLab
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

describe('lesson g1-l4', () => {
  it('เป็นบทที่ 4 ของภาค 1 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[1].lessons[3]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g1-l4')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('วิธีที่คนนิยมใช้')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(['g1-l2', 'g1-l3', 'g0-l3'])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักคือ .gitignore ของ Panutat Tejasen และ noteTh บอกตรง ๆ ว่าครอบคลุมแค่ส่วนเดียว มีคลิปเสริมอีกสองตัว', () => {
    expect(lesson.videos[0].youtubeId).toBe('clYb3xng5Zw')
    expect(lesson.videos[0].channel).toBe('Panutat Tejasen')
    expect(lesson.videos[0].noteTh).toContain('เฉพาะ')
    expect(lesson.videos[0].noteTh).toContain('GitHub Flow')
    expect(lesson.videos.slice(1).map((v) => v.youtubeId)).toEqual(['gZEjfT2TsVM', 'P-J8c9LBzic'])
    for (const v of lesson.videos) expect(v.noteTh?.trim()).toBeTruthy()
  })

  it('ศัพท์ใหม่ GitHub Flow, .gitignore, commit message อยู่ในคลังศัพท์ ครั้งเดียว', () => {
    expect(lesson.terms).toEqual(['github-flow', 'gitignore', 'commit-message'])
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

  it('สอน main ใช้ได้เสมอ, ไฟล์ที่ไม่ควรเข้า Git เพราะอะไร, .gitignore ใส่ทีหลังไม่ช่วย, ข้อความ commit ที่ดี', () => {
    const all = narration()
    expect(all).toContain('GitHub Flow')
    expect(all).toContain('main ต้องใช้ได้เสมอ')
    expect(all).toContain('รหัสลับ')
    expect(all).toContain('.gitignore')
    expect(all).toContain('ถ้าไม่สร้าง')
    expect(all).toContain('ใส่ชื่อทีหลังก็ไม่ช่วย')
    expect(all).toContain('ข้อความ commit')
    expect(all).toContain('ย้อนทั้งก้อน')
  })

  it('อยากรู้ลึก: rebase, cherry-pick, GitHub Actions มีชื่อกับเหตุผลบรรทัดเดียว และบอกว่าไม่ต้องรู้ก็เรียนต่อได้', () => {
    const all = lesson.deepDives!.map((d) => d.titleTh + ' ' + d.bodyTh).join('\n')
    for (const n of ['rebase', 'cherry-pick', 'GitHub Actions']) expect(all).toContain(n)
    for (const d of lesson.deepDives!) expect(d.bodyTh).toContain('ไม่ต้องรู้')
  })

  it('ลองของจริง: switch -c, .gitignore, commit ข้อความดี, push -u origin พร้อมบอกว่า push จะ error ถ้ายังไม่มี GitHub', () => {
    const cmds = lesson.realTry!.steps.map((s) => s.cmd)
    expect(cmds).toContain('git switch -c login')
    expect(cmds).toContain('git push -u origin login')
    expect(cmds.indexOf('git push -u origin login')).toBe(cmds.length - 1)
    expect(cmds).toContain('git status')
    expect(new Set(cmds).size).toBe(cmds.length)
    const push = lesson.realTry!.steps.find((s) => s.cmd.startsWith('git push'))!
    expect(push.expectTh).toContain('origin')
    expect(push.expectTh).toContain('ภาค 2')
    expect(JSON.stringify(lesson.realTry)).not.toMatch(/password|ghp_|@gmail|@hotmail/i)
  })

  it('ห้องทดลองจับคู่: ข้อความ commit ทุกข้อมีคำตัดสิน ทั้งดี/ไม่ดีสองแบบ และคำอธิบายไม่ไล่คำตอบ', () => {
    expect(lab.kind).toBe('match')
    const ans = lab.answer as Record<string, string>
    expect(Object.keys(ans).length).toBeGreaterThanOrEqual(5)
    expect(new Set(Object.values(ans)).size).toBe(3)
    for (const [l, r] of Object.entries(ans)) {
      expect(lab.items.some((i) => i.id === l)).toBe(true)
      expect(lab.items.some((i) => i.id === r)).toBe(true)
    }
    expect(new Set(lab.items.map((i) => i.textTh)).size).toBe(lab.items.length)
    expect(lab.items.filter((i) => lab.explainTh.includes(i.textTh))).toHaveLength(0)
  })

  it('คำถามชั้นไทย 3-4 ข้อ', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → ลองของจริง → จับคู่ → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['g1-l2', 'g1-l3', 'g0-l3'] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g1-l4" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      expect(container.querySelector('.video-note')).toHaveTextContent(lesson.videos[0].noteTh!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      expect(container.querySelector('.real-try')).toHaveTextContent('git push -u origin login')
      for (const [l, r] of Object.entries(lab.answer as Record<string, string>)) {
        await u.selectOptions(screen.getByLabelText(`จับคู่ ${lab.items.find((i) => i.id === l)!.textTh}`), r)
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
