import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrecheckStep } from './PrecheckStep'
import { fixture, mk } from './fixture'
import type { PrecheckQuestion, Part } from '../content/types'

const parts: Part[] = [{ ...fixture[0], lessons: [mk('r1', 0, 1), mk('t1', 0, 2)] }]
const qs: PrecheckQuestion[] = [{
  id: 'c1', layer: 'th', prompt: 'ถามพื้นฐาน', reviewLesson: 'r1',
  choices: [{ id: 'a', text: 'ถูกนะ' }, { id: 'b', text: 'ผิดนะ' }], correct: ['a'], explainTh: 'เพราะว่าแบบนี้',
}]
const requires = [{ lesson: 'r1', useTh: 'ใช้ตรงนี้' }]
const setup = (onDone = vi.fn()) => {
  render(<PrecheckStep questions={qs} requires={requires} parts={parts} termIds={[]} onDone={onDone} />)
  return onDone
}
const answer = (name: string) => {
  fireEvent.click(screen.getByRole('button', { name }))
  fireEvent.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
}

describe('PrecheckStep', () => {
  it('wrong answer shows explanation and review link', () => {
    setup()
    answer('ผิดนะ')
    expect(screen.getByText('เพราะว่าแบบนี้')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ทบทวนบท "บท r1"' })).toHaveAttribute('href', '#/lesson/r1')
  })
  it('right answer shows explanation but no review link', () => {
    setup()
    answer('ถูกนะ')
    expect(screen.getByText('เพราะว่าแบบนี้')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })
  it('start button works without answering', () => {
    const onDone = setup()
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
