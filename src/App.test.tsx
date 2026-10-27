import { render, screen, act } from '@testing-library/react'
import App from './App'

test('หน้าแรกเป็นหน้าเลือกวิชา', () => {
  window.location.hash = ''
  render(<App />)
  expect(screen.getByRole('link', { name: /CCNA/ })).toHaveAttribute('href', '#/c/ccna')
  expect(screen.getByRole('link', { name: /Git & GitHub/ })).toHaveAttribute('href', '#/c/git')
})

test('แผนที่ของวิชา CCNA และวิชา Git', async () => {
  window.location.hash = '#/c/ccna'
  const { unmount } = render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('เรียน CCNA แบบเข้าใจจริง')
  unmount()
  window.location.hash = '#/c/git'
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('เรียน Git & GitHub ทำงานเป็นทีมกับเพื่อน')
  expect(screen.getByRole('link', { name: /คลังศัพท์/ })).toHaveAttribute('href', '#/c/git/glossary')
})

test('เข้าบทที่ไม่มีจริง แล้วกลับหน้าเลือกวิชาพร้อมข้อความ', async () => {
  window.location.hash = '#/lesson/no-such-lesson'
  render(<App />)
  await act(async () => {})
  expect(screen.getByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeInTheDocument()
  expect(window.location.hash).toBe('#/')
})

test('บท CCNA ที่ยังล็อกอยู่ กลับแผนที่ CCNA พร้อมข้อความ', async () => {
  localStorage.clear()
  window.location.hash = '#/lesson/p0-l2'
  render(<App />)
  await act(async () => {})
  expect(window.location.hash).toBe('#/c/ccna')
  expect(screen.getByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeInTheDocument()
})

test('hash เสียรูปแบบ ไม่ทำให้แอปพัง แสดงหน้าเลือกวิชา', async () => {
  window.location.hash = '#/lesson/%E0%A4%A'
  render(<App />)
  await act(async () => {})
  expect(screen.getByRole('link', { name: /CCNA/ })).toHaveAttribute('href', '#/c/ccna')
})

test('ลิงก์คลังศัพท์เดิมพาไปคลังศัพท์ CCNA', async () => {
  window.location.hash = '#/glossary'
  render(<App />)
  await act(async () => {})
  expect(screen.getByRole('link', { name: /กลับแผนที่/ })).toHaveAttribute('href', '#/c/ccna')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('คลังศัพท์')
})
