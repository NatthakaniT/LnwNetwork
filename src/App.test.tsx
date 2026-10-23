import { render, screen, act } from '@testing-library/react'
import App from './App'

test('แสดงแผนที่บทเรียนเป็นหน้าแรก', () => {
  window.location.hash = ''
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('เรียน CCNA แบบเข้าใจจริง')
})

test('เข้าบทที่ไม่มีจริง แล้วกลับแผนที่พร้อมข้อความ', async () => {
  window.location.hash = '#/lesson/no-such-lesson'
  render(<App />)
  await act(async () => {})
  expect(screen.getByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeInTheDocument()
  expect(window.location.hash).toBe('#/')
})

test('hash เสียรูปแบบ ไม่ทำให้แอปพัง แสดงแผนที่', async () => {
  window.location.hash = '#/lesson/%E0%A4%A'
  render(<App />)
  await act(async () => {})
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('เรียน CCNA แบบเข้าใจจริง')
})

test('ไปหน้าคลังศัพท์ได้', async () => {
  window.location.hash = '#/glossary'
  render(<App />)
  await act(async () => {})
  expect(screen.getByRole('link', { name: /กลับแผนที่/ })).toBeInTheDocument()
})
