import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CoursePicker } from './CoursePicker'
import { memoryStorage } from './fixture'
import { saveProgress } from '../progress/progress'

describe('CoursePicker', () => {
  it('มีการ์ดวิชาละใบ ลิงก์ไปแผนที่ของวิชา และบอกว่าเรียนไปกี่บท', () => {
    const storage = memoryStorage()
    saveProgress({ version: 1, completed: ['p0-l1'] }, storage, 'lnw-ccna-progress-v1')
    render(<CoursePicker storage={storage} />)
    const cards = document.querySelectorAll('.course-card')
    expect(cards).toHaveLength(2)
    expect(screen.getByRole('link', { name: /CCNA/ })).toHaveAttribute('href', '#/c/ccna')
    expect(screen.getByRole('link', { name: /Git & GitHub/ })).toHaveAttribute('href', '#/c/git')
    expect(screen.getByText('เรียนแล้ว 1 จาก 6 บท · อีก 40 บทกำลังทำ')).toBeInTheDocument()
    expect(screen.getByText('เรียนแล้ว 0 จาก 10 บท')).toBeInTheDocument()
    expect(screen.getByText('⏱ ประมาณ 5 ชั่วโมงครึ่ง')).toBeInTheDocument()
    expect(screen.getByText('⏱ ประมาณ 3 ชั่วโมงครึ่ง')).toBeInTheDocument()
  })
  it('แสดงข้อความแจ้งเตือนได้', () => {
    render(<CoursePicker storage={memoryStorage()} notice="ต้องเรียนบทก่อนหน้าก่อนนะ" />)
    expect(screen.getByRole('status')).toHaveTextContent('ต้องเรียนบทก่อนหน้าก่อนนะ')
  })
  it('HUD ผู้เล่น: XP เลเวล streak และเหรียญ คิดจากความคืบหน้าที่เก็บไว้', () => {
    const storage = memoryStorage()
    saveProgress({ version: 1, completed: ['p0-l1'], scores: { 'p0-l1': 100 }, days: ['2026-11-05', '2026-11-06'] }, storage, 'lnw-ccna-progress-v1')
    render(<CoursePicker storage={storage} today="2026-11-06" />)
    const hud = screen.getByRole('region', { name: 'สถานะผู้เล่น' })
    expect(hud).toHaveTextContent('LV 1')
    expect(hud).toHaveTextContent('150 / 500 XP') // ผ่าน 100 + 3 ดาว 50
    expect(hud).toHaveTextContent('🔥 2')
    expect(hud).toHaveTextContent('2/8') // ด่านแรก + ไร้ที่ติ
    const unlocked = [...document.querySelectorAll('.badge-item.on')].map((b) => b.querySelector('.badge-title')?.textContent)
    expect(unlocked).toEqual(['ด่านแรก', 'ไร้ที่ติ'])
    // ตารางวันเรียน: 5 สัปดาห์ วันที่เรียนถูกระบาย และบอกวันนี้
    const log = screen.getByRole('region', { name: 'วันที่เข้ามาเรียน' })
    expect(log.querySelectorAll('td')).toHaveLength(35)
    expect([...log.querySelectorAll('td.on')].map((c) => c.textContent)).toEqual(['5', '6'])
    expect(screen.getByLabelText('2026-11-01 ไม่ได้เรียน')).toHaveTextContent('1 พ.ย.') // วันที่ 1 บอกเดือน
    expect(log.querySelector('td.today')).toHaveAttribute('aria-label', '2026-11-06 วันนี้ เรียนแล้ว')
    expect(log).toHaveTextContent('เรียนติดกัน 2 วัน · 2 วันใน 5 สัปดาห์ล่าสุด')
  })
})
