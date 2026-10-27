import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { course, glossary, validateCourse } from '../index'
import type { ActivityLab } from '../types'
import { LessonPage } from '../../pages/LessonPage'
import { memoryStorage } from '../../pages/fixture'
import { lesson } from './p0-l1'

// smoke test ไม่ mock component: ใช้ course จริง + LessonPage จริง
let errSpy: ReturnType<typeof vi.spyOn>
beforeEach(() => { window.location.hash = ''; errSpy = vi.spyOn(console, 'error') })
afterEach(() => { errSpy.mockRestore() })

describe('lesson p0-l1', () => {
  it('อยู่ใน course เป็นบทแรก และ validateCourse ผ่าน', () => {
    const l = course[0].lessons[0]
    expect(l).toBe(lesson)
    expect(l.status).toBe('ready')
    expect(l.ciscoModules).toEqual(['ITN 1'])
    expect(validateCourse(course, glossary)).toEqual([])
  })

  it('บทพูดทุกฉากไม่เกิน 180 ตัวอักษร ไม่มีตัวเลขหรือวงเล็บ และมี 6-10 ฉาก', () => {
    const scenes = lesson.scenes!.scenes
    expect(scenes.length).toBeGreaterThanOrEqual(6)
    expect(scenes.length).toBeLessThanOrEqual(10)
    for (const s of scenes) {
      expect([...s.narrationTh].length, s.id).toBeLessThanOrEqual(180)
      expect(s.narrationTh, s.id).not.toMatch(/[0-9()]/)
    }
  })

  it('เป็นฉากแบบ v2: ทุกฉากมีชื่อฉากและแถบชีวิตจริง ของที่วิ่งเป็นซองมีป้ายหน้าซอง', () => {
    const set = lesson.scenes!
    expect(set.style).toBe('v2')
    for (const s of set.scenes) {
      expect(s.chipTh, s.id).toBeTruthy()
      expect(s.lifeTh, s.id).toBeTruthy()
      expect(s.lifeIcon, s.id).toBeTruthy()
      for (const a of s.actions) {
        if (a.type === 'moveAlong') expect(set.actors.find((x) => x.id === a.actor)!.kind, `${s.id} ${a.actor}`).toBe('card')
      }
    }
    // บทนี้สอนคำว่า data ในความหมาย ข้อมูลที่ส่ง (บทห่อของใช้ต่อเป็นชั้นในสุด)
    expect(lesson.terms).toContain('data')
    expect(set.scenes.find((s) => s.id === 's3')!.narrationTh).toContain('เรียกว่า data')
    // ฉาก network มีคอมมากกว่าสองเครื่อง ตามที่บทพูดบอกว่า หลายเครื่อง
    const s4 = set.scenes.find((s) => s.id === 's4')!
    expect((s4.setup ?? []).filter((a) => a.type === 'show' && set.actors.find((x) => x.id === a.actor)!.kind === 'pc').length).toBeGreaterThan(2)
  })

  it('เล่นได้ครบ: คลิป → ภาพทบทวน → กิจกรรม → คำถาม', async () => {
    const u = userEvent.setup()
    const { container } = render(<LessonPage id="p0-l1" storage={memoryStorage()} />)

    // 1. คลิป
    expect(screen.getByTitle(lesson.videos[0].titleTh)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

    // 2. ภาพทบทวน
    const scenes = lesson.scenes!.scenes
    expect(screen.getByText(scenes[0].narrationTh)).toBeInTheDocument()
    const nextScene = screen.getByRole('button', { name: /ฉากต่อไป/ })
    for (let i = 0; i < 3; i++) await u.click(nextScene)
    expect(screen.getAllByRole('button', { name: 'network' }).length).toBeGreaterThan(0) // ศัพท์ในคำบรรยายกดได้
    while (!(nextScene as HTMLButtonElement).disabled) await u.click(nextScene)
    fireEvent.ended(container.querySelector('audio')!) // ฉากสุดท้ายเล่นจบ
    await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

    // 3. กิจกรรมจับคู่
    const lab = lesson.lab as ActivityLab
    for (const it of lab.items) expect(screen.getAllByText(it.textTh).length).toBeGreaterThan(0)
    for (const [left, right] of Object.entries(lab.answer as Record<string, string>)) {
      const l = lab.items.find((i) => i.id === left)!
      await u.selectOptions(screen.getByLabelText(`จับคู่ ${l.textTh}`), right)
    }
    await u.click(screen.getByRole('button', { name: 'ตรวจคำตอบ' }))
    expect(screen.getByText(/ถูกต้อง!/)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'ไปขั้นต่อไป' }))

    // 4. คำถาม: ข้อแรกเป็นชั้น th
    const firstTh = lesson.quiz!.find((q) => q.layer === 'th')!
    expect(screen.getByText(firstTh.prompt)).toBeInTheDocument()
    expect(errSpy).not.toHaveBeenCalled()
  })
})
