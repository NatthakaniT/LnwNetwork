import { vi, test, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

vi.mock('./quiz/QuizView', () => ({
  QuizView: (p: { onPass: () => void }) => <button onClick={p.onPass}>ผ่านคำถาม</button>,
}))

import App from './App'

beforeEach(() => { localStorage.clear() })

test('บทที่ผ่านแล้ว เปิดได้จากแผนที่ แม้บทก่อนหน้ายังไม่ได้เรียน', async () => {
  localStorage.setItem('lnw-ccna-progress-v1', JSON.stringify({ version: 1, completed: ['p0-l3'] }))
  window.location.hash = '#/lesson/p0-l3'
  render(<App />)
  await act(async () => {})
  expect(window.location.hash).toBe('#/lesson/p0-l3')
  expect(screen.queryByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeNull()
})
