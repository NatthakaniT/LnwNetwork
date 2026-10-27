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
    expect(screen.getByText('เรียนแล้ว 1 จาก 46 บท')).toBeInTheDocument()
    expect(screen.getByText('เรียนแล้ว 0 จาก 10 บท')).toBeInTheDocument()
  })
  it('แสดงข้อความแจ้งเตือนได้', () => {
    render(<CoursePicker storage={memoryStorage()} notice="ต้องเรียนบทก่อนหน้าก่อนนะ" />)
    expect(screen.getByRole('status')).toHaveTextContent('ต้องเรียนบทก่อนหน้าก่อนนะ')
  })
})
