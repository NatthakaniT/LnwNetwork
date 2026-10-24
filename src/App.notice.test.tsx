import { vi, test, expect, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'

vi.mock('./quiz/QuizView', () => ({
  QuizView: (p: { mode?: string; onPass: () => void }) => <button onClick={p.onPass}>ผ่านคำถาม-{p.mode ?? 'lesson'}</button>,
}))

import App from './App'
import { course } from './content'

beforeEach(() => { localStorage.clear() })

test('สอบข้ามบทผ่าน: กลับแผนที่พร้อมข้อความ ข้ามบท ... แล้ว และปิดได้', async () => {
  const l3 = course.flatMap((p) => p.lessons).find((l) => l.id === 'p0-l3')!
  window.location.hash = '#/lesson/p0-l3/test-out'
  render(<App />)
  await act(async () => {})
  fireEvent.click(screen.getByText('ผ่านคำถาม-testOut'))
  await act(async () => {})
  expect(window.location.hash).toBe('#/')
  expect(screen.getByText(`ข้ามบท ${l3.titleTh} แล้ว 🎉`)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'ปิด' }))
  expect(screen.queryByText(/ข้ามบท .* แล้ว/)).toBeNull()
})

test('บทที่สอบข้ามมา เปิดได้จากแผนที่ แม้บทก่อนหน้ายังไม่ได้เรียน', async () => {
  localStorage.setItem('lnw-ccna-progress-v1', JSON.stringify({ version: 1, completed: ['p0-l3'] }))
  window.location.hash = '#/lesson/p0-l3'
  render(<App />)
  await act(async () => {})
  expect(window.location.hash).toBe('#/lesson/p0-l3')
  expect(screen.queryByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeNull()
})
