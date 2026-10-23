import { render, screen, act } from '@testing-library/react'
import App from './App'

test('แสดงแผนที่บทเรียนเป็นหน้าแรก', () => {
  window.location.hash = ''
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('เรียน CCNA แบบเข้าใจจริง')
})

test('เข้าบทที่ยังไม่พร้อม แล้วกลับแผนที่พร้อมข้อความ', async () => {
  window.location.hash = '#/lesson/p0-l1'
  render(<App />)
  await act(async () => {})
  expect(screen.getByText(/บทนี้กำลังทำอยู่ เร็ว ๆ นี้/)).toBeInTheDocument()
  expect(window.location.hash).toBe('#/')
})

test('ไปหน้าคลังศัพท์ได้', async () => {
  window.location.hash = '#/glossary'
  render(<App />)
  await act(async () => {})
  expect(screen.getByRole('link', { name: /กลับแผนที่/ })).toBeInTheDocument()
})
