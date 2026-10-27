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
import { lesson } from './g0-l5'

const git = courseById('git')!
const lab = lesson.lab as GitLab
const cmd = async (u: ReturnType<typeof userEvent.setup>, line: string) => { await u.type(screen.getByLabelText('พิมพ์คำสั่ง git'), line + '{Enter}') }
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

describe('lesson g0-l5', () => {
  it('เป็นบทที่ 5 ของภาค 0 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[0].lessons[4]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g0-l5')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('ในเครื่องกับบนเน็ต')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(["g0-l3","g0-l4"])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักมาจากไฟล์คลิป Task 5', () => {
    expect(lesson.videos).toHaveLength(1)
    expect(lesson.videos[0].youtubeId).toBe('K3LG7U9uu-U')
    expect(lesson.videos[0].channel).toBe('Panutat Tejasen')
    expect(lesson.videos[0].noteTh).toBeTruthy()
  })

  it('ศัพท์ใหม่ของบทนี้อยู่ในคลังศัพท์ git และ terms ครั้งเดียว', () => {
    expect(lesson.terms).toEqual(["remote","origin","clone","push","pull"])
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

  it('สอน clone, push, pull, remote, origin และบอกว่าถ้าไม่ทำจะเกิดอะไร', () => {
    const all = narration()
    for (const c of ['git clone', 'git push', 'git pull', 'remote', 'origin']) expect(all).toContain(c)
    expect(all).toContain('ถ้าไม่ clone')
    expect(all).toContain('ถ้าไม่ push')
    expect(all).toContain('ถ้าไม่พิมพ์ เครื่องเขาก็ยังเป็นของเก่า')
  })

  it('ภาพ "สิ่งที่แต่ละที่รู้": ก่อน pull เครื่องเพื่อนไม่มี commit ใหม่ และมีฉาก push ถูกปฏิเสธ', () => {
    const s6 = lesson.scenes!.scenes.find((s) => s.chipTh === 'เพื่อนยังไม่มี')!
    expect(s6.setup!.some((a) => a.type === 'show' && a.actor === 'h2')).toBe(true)
    expect(s6.setup!.some((a) => a.type === 'show' && a.actor === 'f2')).toBe(false)
    expect(lesson.scenes!.scenes.some((s) => s.chipTh === 'push ถูกปฏิเสธ')).toBe(true)
  })

  it('realTry ชุดแรกครบตามที่กำหนด ไม่มีรหัสผ่านหรือ token', () => {
    expect(lesson.realTry!.steps.map((s) => s.cmd)).toEqual([
      'git --version',
      'git config --global user.name "ชื่อคุณ"',
      'git config --global user.email "อีเมลของคุณ"',
      'git init',
      'git add hello.txt',
      'git commit -m "จุดเซฟแรกของฉัน"',
      'git log',
    ])
    expect(JSON.stringify(lesson.realTry)).not.toMatch(/password|ghp_|@gmail|@hotmail/i)
  })

  it('GitHub Desktop: ตารางปุ่มกับคำสั่งอยู่ในกล่องอยากรู้ลึกของบทนี้', () => {
    const d = lesson.deepDives!.find((x) => x.titleTh.includes('GitHub Desktop'))!
    for (const c of ['git commit', 'git push', 'git pull']) expect(d.bodyTh).toContain(c)
  })

  it('ห้องทดลอง: เพื่อน commit แล้ว push หลังเรา clone และไม่มีข้อไหนผ่านเองตั้งแต่เริ่ม', () => {
    expect(lab.allowed).toEqual(['status', 'add', 'commit', 'log', 'clone', 'push', 'pull'])
    expect(lab.goals.map((g) => g.check)).toEqual(['cloned', 'pulled', 'committed', 'pushed'])
    expect(lab.friendScript!.map((f) => [f.afterGoal, f.action.type])).toEqual([[0, 'commit'], [0, 'push']])
    for (const g of lab.goals) expect(checkGitGoal(lab.start, g)).toBe(false)
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → ห้องทดลอง → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ["g0-l3","g0-l4"] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g0-l5" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      expect(container.querySelector('.real-try')).toHaveTextContent('git --version')
      await cmd(u, 'git pull')
      expect(screen.getByText(/ข้อ 1 จาก 4/)).toBeInTheDocument()
      await cmd(u, 'git clone')
      expect(screen.getByText(/ข้อ 2 จาก 4/)).toBeInTheDocument() // clone แล้ว แต่ pulled ยังไม่ผ่านเพราะเพื่อน push ตามมา
      expect(screen.getByText(/เพื่อนเพิ่ง push งานขึ้น GitHub/)).toBeInTheDocument()
      await cmd(u, 'git push')
      expect(screen.getByText(/ข้อ 2 จาก 4/)).toBeInTheDocument()
      await cmd(u, 'git pull')
      expect(screen.getByText(/ข้อ 3 จาก 4/)).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'index.html' }))
      const box = screen.getByLabelText('แก้ไฟล์ index.html')
      await u.clear(box)
      await u.type(box, 'ใหม่')
      await u.click(screen.getByText('บันทึกไฟล์'))
      await cmd(u, 'git add index.html')
      await cmd(u, 'git commit -m "หน้าแรกของฉัน"')
      expect(screen.getByText(/ข้อ 4 จาก 4/)).toBeInTheDocument()
      await cmd(u, 'git push')
      expect(screen.getByText('ครบทุกข้อแล้ว 🎉')).toBeInTheDocument()
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
      expect(container.querySelector('.quiz-prompt')).toHaveTextContent(firstTh.prompt)
      expect(errSpy).not.toHaveBeenCalled()
    }, 40000)
  })
})
