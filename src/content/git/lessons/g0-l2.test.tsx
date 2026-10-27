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
import { lesson } from './g0-l2'

const git = courseById('git')!
const lab = lesson.lab as ActivityLab

describe('lesson g0-l2', () => {
  it('เป็นบทที่สองของวิชา git พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[0].lessons[1]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g0-l2')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('ตระกูล Git ต่างกันยังไง')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจาก g0-l1 มีเช็กพื้นฐาน 2 ข้อชี้กลับ g0-l1', () => {
    expect(lesson.requires).toEqual([{ lesson: 'g0-l1', useTh: expect.any(String) }])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(q.reviewLesson).toBe('g0-l1')
    }
  })

  it('คลิปหลักมาจากไฟล์คลิป Task 5 (BorntoDev Git CLI vs GitHub Desktop) และโน้ตบอกว่าคลิปไม่พูดถึงส่วนไหน', () => {
    expect(lesson.videos).toHaveLength(1)
    expect(lesson.videos[0].youtubeId).toBe('oxoIr7TyGMs')
    expect(lesson.videos[0].channel).toBe('BorntoDev')
    expect(lesson.videos[0].noteTh).toContain('GitLab')
  })

  it('ศัพท์ใหม่ของบทนี้อยู่ในคลังศัพท์ git และ terms (ไม่ซ้ำกับที่สอนในบทแรก)', () => {
    const mine = ['command-line', 'git-bash', 'github-desktop', 'github', 'gitlab']
    for (const id of mine) {
      expect(gitGlossary.filter((g) => g.id === id)).toHaveLength(1)
      expect(lesson.terms).toContain(id)
    }
    expect(lesson.terms).not.toContain('git')
    expect(new Set(gitGlossary.map((g) => g.en.toLowerCase())).size).toBe(gitGlossary.length)
    expect(gitGlossary.find((g) => g.id === 'git-bash')!.explainTh).toContain('Windows')
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

  it('ตอบ "ทำไมต้องมีหลายตัว" (สามหน้าที่) และบอกว่ามี GitLab / GitHub Desktop ไม่ใช่เว็บ GitHub', () => {
    const all = lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')
    expect(all).toContain('GitLab')
    expect(all).toMatch(/จดประวัติ[\s\S]*สั่งงาน[\s\S]*ฝากงาน/)
    expect(all).toMatch(/Desktop[\s\S]*ไม่ใช่เว็บ/)
    expect(all).toContain('ไม่ต้องต่ออินเทอร์เน็ต')
    expect(lesson.scenes!.scenes[lesson.scenes!.scenes.length - 1].narrationTh).toContain('Git Bash เป็นหลัก')
  })

  it('GitHub Desktop: บอกว่าปุ่มตรงกับคำสั่งไหน อยู่ในกล่องอยากรู้ลึก ไม่ใช่ในบทพูด', () => {
    const d = lesson.deepDives!.find((x) => x.titleTh.includes('GitHub Desktop'))!
    expect(d.bodyTh).toContain('git commit')
    expect(d.bodyTh).toContain('git push')
    expect(d.bodyTh).toContain('ไม่ต้องรู้')
  })

  it('ห้องทดลองจับคู่: 4 ชื่อ จับกับหน้าที่ ครบและไม่ซ้ำ', () => {
    expect(lab.kind).toBe('match')
    const ans = lab.answer as Record<string, string>
    expect(Object.keys(ans)).toHaveLength(4)
    expect(new Set(Object.values(ans)).size).toBe(4)
    expect(new Set(lab.items.map((i) => i.textTh)).size).toBe(lab.items.length)
    for (const [l, r] of Object.entries(ans)) {
      expect(lab.items.some((i) => i.id === l)).toBe(true)
      expect(lab.items.some((i) => i.id === r)).toBe(true)
    }
  })

  it('คำถามชั้นไทย 3-4 ข้อ', () => {
    const th = lesson.quiz!.filter((q) => q.layer === 'th')
    expect(th.length).toBeGreaterThanOrEqual(3)
    expect(th.length).toBeLessThanOrEqual(4)
  })

  it('ยังเข้าบทนี้ไม่ได้ถ้ายังไม่ผ่าน g0-l1', () => {
    window.location.hash = ''
    const { container } = render(<LessonPage id="g0-l2" course={git} storage={memoryStorage()} />)
    expect(container.querySelector('h1')).toBeNull()
  })

  describe('เล่นทั้งบท (ไม่ mock อะไร)', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
    afterEach(() => { errSpy.mockRestore() })

    it('เช็กพื้นฐาน → คลิป → ภาพทบทวน → จับคู่ → คำถาม', async () => {
      const u = userEvent.setup()
      const storage = memoryStorage()
      saveProgress({ version: 1, completed: ['g0-l1'] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g0-l2" course={git} storage={storage} />)

      expect(container.querySelector('.requires-box')).toHaveTextContent('ทำไมต้องมี Git')
      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))

      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      expect(container.querySelector('.video-note')).toHaveTextContent(lesson.videos[0].noteTh!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

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
