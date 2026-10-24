import { test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never { throw new Error('boom') }

test('แสดงข้อความภาษาไทยเมื่อมีอะไรพัง และมีปุ่มกลับแผนที่', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  window.location.hash = '#/lesson/p0-l1'
  render(<ErrorBoundary><Boom /></ErrorBoundary>)
  expect(screen.getByRole('alert')).toHaveTextContent('มีอะไรผิดพลาด ลองกดรีเฟรชนะ')
  expect(screen.getByRole('alert').closest('.error-card')).not.toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'กลับไปแผนที่' }))
  expect(window.location.hash).toBe('#/')
  spy.mockRestore()
})

test('ไม่พังก็แสดงเนื้อหาปกติ', () => {
  render(<ErrorBoundary><p>ปกติ</p></ErrorBoundary>)
  expect(screen.getByText('ปกติ')).toBeInTheDocument()
})
