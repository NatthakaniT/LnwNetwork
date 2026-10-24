import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { CourseMap } from './CourseMap'
import { fixture, memoryStorage } from './fixture'
import { course } from '../content'
import { saveProgress } from '../progress/progress'

let storage: Storage
beforeEach(() => { storage = memoryStorage(); window.location.hash = '' })

describe('CourseMap', () => {
  it('real course renders 7 parts; building chips match non-ready lessons', () => {
    render(<CourseMap storage={storage} />)
    expect(document.querySelectorAll('.part')).toHaveLength(7)
    const notReady = course.flatMap((p) => p.lessons).filter((l) => l.status !== 'ready').length
    expect(screen.queryAllByText('กำลังทำ')).toHaveLength(notReady)
    expect(screen.getByText(`เรียนแล้ว 0 จาก ${course.flatMap((p) => p.lessons).length} บท`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /คลังศัพท์/ })).toHaveAttribute('href', '#/glossary')
    expect(screen.queryByRole('link', { name: 'เรียนต่อ' })).toBeNull()
  })

  it('shows done / current / locked / building states and progress', () => {
    saveProgress({ version: 1, completed: ['f1'] }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByText('เรียนแล้ว 1 จาก 4 บท')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25')
    const done = screen.getByRole('link', { name: /✅ บท f1/ })
    expect(done).toHaveClass('done')
    const now = screen.getByRole('link', { name: /▶ บท f2/ })
    expect(now).toHaveClass('now')
    expect(now).toHaveAttribute('href', '#/lesson/f2')
    const lock = screen.getByText(/🔒 บท f3/).closest('.l') as HTMLElement
    expect(lock.tagName).not.toBe('A')
    expect(within(lock).getByRole('button', { name: 'สอบข้ามบท' })).toBeInTheDocument()
    const building = screen.getByText(/บท b1/).closest('.l') as HTMLElement
    expect(building.tagName).not.toBe('A')
    expect(within(building).getByText('กำลังทำ')).toBeInTheDocument()
    expect(within(building).queryByRole('button')).toBeNull()
  })

  it('test-out button goes to test-out route', () => {
    render(<CourseMap parts={fixture} storage={storage} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'สอบข้ามบท' })[1]) // f3 (f2 is the first locked)
    expect(window.location.hash).toBe('#/lesson/f3/test-out')
  })

  it('continue button points at lastLesson', () => {
    saveProgress({ version: 1, completed: [], lastLesson: 'f1', lastStep: 'lab' }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '#/lesson/f1')
  })

  it('continue button goes to the first open lesson, not an already-finished lastLesson', () => {
    saveProgress({ version: 1, completed: ['f1'], lastLesson: 'f1', lastStep: 'quiz' }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '#/lesson/f2')
  })

  it('a lesson done by test-out (previous one not done) is openable on the map', () => {
    saveProgress({ version: 1, completed: ['f3'] }, storage)
    render(<CourseMap parts={fixture} storage={storage} />)
    expect(screen.getByRole('link', { name: /✅ บท f3/ })).toHaveAttribute('href', '#/lesson/f3')
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '#/lesson/f1')
  })

  it('notice is dismissible', () => {
    let n: string | null = 'ต้องเรียนบทก่อนหน้าก่อนนะ'
    const { rerender } = render(<CourseMap parts={fixture} storage={storage} notice={n} onDismissNotice={() => { n = null }} />)
    expect(screen.getByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ปิด' }))
    rerender(<CourseMap parts={fixture} storage={storage} notice={n} />)
    expect(screen.queryByText(/ต้องเรียนบทก่อนหน้าก่อนนะ/)).toBeNull()
  })
})
