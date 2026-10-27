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
import { lesson } from './g2-l1'

const git = courseById('git')!
const lab = lesson.lab as ActivityLab
const narration = () => lesson.scenes!.scenes.map((s) => s.narrationTh).join('\n')

describe('lesson g2-l1', () => {
  it('เป็นบทที่ 1 ของภาค 2 พร้อมใช้ และ validateCourse ของวิชา git ผ่าน', () => {
    const l = gitParts[2].lessons[0]
    expect(l).toEqual(lesson)
    expect(l.id).toBe('g2-l1')
    expect(l.status).toBe('ready')
    expect(l.titleTh).toBe('push งานจริงครั้งแรก')
    expect(validateCourse(git.parts, git.glossary, { requireEnglishQuiz: false })).toEqual([])
  })

  it('ต่อจากบทก่อน มีเช็กพื้นฐาน 2 ข้อชี้กลับบทที่อยู่ใน requires', () => {
    expect(lesson.requires!.map((r) => r.lesson)).toEqual(['g0-l5', 'g0-l3', 'g1-l4'])
    expect(lesson.precheck).toHaveLength(2)
    for (const q of lesson.precheck!) {
      expect(q.layer).toBe('th')
      expect(lesson.requires!.some((r) => r.lesson === q.reviewLesson)).toBe(true)
    }
  })

  it('คลิปหลักคือ MilerDev และ noteTh บอกตรง ๆ ว่าตรงบางส่วน ไม่มีคลิปไทยเรื่องล็อกอินกับ collaborator มีคลิปเสริมอีกสาม', () => {
    expect(lesson.videos[0].youtubeId).toBe('4Z8fGcx5N2A')
    expect(lesson.videos[0].channel).toBe('MilerDev')
    expect(lesson.videos[0].noteTh).toContain('บางส่วน')
    expect(lesson.videos[0].noteTh).toContain('collaborator')
    expect(lesson.videos.slice(1).map((v) => v.youtubeId)).toEqual(['BDoNSr3rMf4', 'DV-JWKq-1BI', 'bZhtmmZinWo'])
    for (const v of lesson.videos) expect(v.noteTh?.trim()).toBeTruthy()
  })

  it('ศัพท์ใหม่ collaborator กับ GCM อยู่ในคลังศัพท์ ครั้งเดียว', () => {
    expect(lesson.terms).toEqual(['collaborator', 'gcm'])
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

  it('สอนครบ: repo เปล่า, remote add, main, push -u, หน้าต่างล็อกอินไม่พิมพ์รหัส, collaborator, clone และทุกคำสั่งบอกว่าถ้าไม่พิมพ์เป็นยังไง', () => {
    const all = narration()
    for (const s of ['repository เปล่า', 'git remote add origin', 'ชื่อสายเป็น main', 'git push ขีดยู origin main', 'Git Credential Manager', 'ห้ามพิมพ์รหัสผ่านลงในคำสั่ง', 'collaborator', 'git clone']) expect(all).toContain(s)
    for (const s of ['ถ้าไม่ผูก', 'ถ้าไม่ตั้ง', 'ถ้าไม่ push', 'ถ้าไม่ clone']) expect(all).toContain(s)
  })

  it('อยากรู้ลึก: SSH อยู่ที่นี่ ไม่อยู่ในฉาก/ลองของจริง, token ห้ามใส่ในคำสั่ง, และทุกข้อบอกว่าไม่ต้องรู้ก็เรียนต่อได้', () => {
    const deep = lesson.deepDives!.map((d) => d.titleTh + ' ' + d.bodyTh).join('\n')
    for (const n of ['SSH', 'token', 'Public', 'Private']) expect(deep).toContain(n)
    for (const d of lesson.deepDives!) expect(d.bodyTh).toContain('ไม่ต้องรู้')
    expect(narration()).not.toContain('SSH')
    expect(JSON.stringify(lesson.realTry)).not.toContain('SSH')
    expect(JSON.stringify(lesson.realTry)).not.toContain('git@')
  })

  it('ลองของจริง: remote add, branch -M main, push -u origin main, clone ไม่มีรหัสผ่านหรือ token ในคำสั่ง และเรียงถูก', () => {
    const cmds = lesson.realTry!.steps.map((s) => s.cmd)
    const at = (c: string) => cmds.indexOf(c)
    expect(new Set(cmds).size).toBe(cmds.length)
    expect(cmds.some((c) => c.startsWith('git remote add origin https://github.com/'))).toBe(true)
    expect(at('git branch -M main')).toBeGreaterThan(-1)
    expect(at('git push -u origin main')).toBeGreaterThan(at('git branch -M main'))
    expect(cmds.findIndex((c) => c.startsWith('git clone '))).toBeGreaterThan(at('git push -u origin main'))
    expect(lesson.realTry!.introTh).toContain('README')
    expect(lesson.realTry!.introTh).toContain('ห้ามพิมพ์รหัสผ่านหรือ token')
    expect(lesson.realTry!.steps.find((s) => s.cmd === 'git branch -M main')!.expectTh).toContain('master')
    expect(lesson.realTry!.steps.find((s) => s.cmd === 'git push -u origin main')!.expectTh).toContain('Git Credential Manager')
    // ลิงก์ในคำสั่งต้องไม่ฝังชื่อผู้ใช้:รหัส หรือ token
    expect(cmds.join('\n')).not.toMatch(/password|ghp_|github_pat_|https:\/\/[^/\s]*@|@gmail|@hotmail/i)
  })

  it('ห้องทดลองจับคู่: คำสั่งแต่ละตัวมีความหมายของตัวเองหนึ่งอัน และคำอธิบายไม่ไล่คำตอบ', () => {
    expect(lab.kind).toBe('match')
    const ans = lab.answer as Record<string, string>
    expect(Object.keys(ans).length).toBeGreaterThanOrEqual(5)
    expect(new Set(Object.values(ans)).size).toBe(Object.keys(ans).length)
    for (const [l, r] of Object.entries(ans)) {
      expect(lab.items.some((i) => i.id === l)).toBe(true)
      expect(lab.items.some((i) => i.id === r)).toBe(true)
    }
    for (const c of ['git remote add origin', 'git branch -M main', 'git push -u origin main', 'git clone']) {
      expect(lab.items.some((i) => i.textTh.startsWith(c))).toBe(true)
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
      saveProgress({ version: 1, completed: ['g0-l5', 'g0-l3', 'g1-l4'] }, storage, git.storageKey)
      const { container } = render(<LessonPage id="g2-l1" course={git} storage={storage} />)

      await u.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
      expect(container.querySelector('.video-note')).toHaveTextContent(lesson.videos[0].noteTh!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))
      const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
      while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
      fireEvent.ended(container.querySelector('audio')!)
      await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

      expect(container.querySelector('.real-try')).toHaveTextContent('git push -u origin main')
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
