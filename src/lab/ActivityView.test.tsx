import { describe, it, expect, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityView } from './ActivityView'
import type { ActivityLab } from '../content/types'

const items = [
  { id: 'a', textTh: 'ข้อหนึ่ง' }, { id: 'b', textTh: 'ข้อสอง' }, { id: 'c', textTh: 'ข้อสาม' },
]
const order: ActivityLab = { kind: 'order', introTh: 'เรียงให้ถูก', items, answer: ['a', 'b', 'c'], explainTh: 'เพราะต้องไล่ตามลำดับ' }
const reverse = <T,>(a: T[]) => [...a].reverse()

describe('ActivityView order', () => {
  it('wrong then right', async () => {
    const onDone = vi.fn()
    render(<ActivityView lab={order} onDone={onDone} shuffle={reverse} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('ตรวจคำตอบ'))
    expect(screen.getByText(/เพราะต้องไล่ตามลำดับ/)).toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
    // c b a -> a b c
    await user.click(screen.getByLabelText('เลื่อนขึ้น ข้อหนึ่ง'))
    await user.click(screen.getByLabelText('เลื่อนขึ้น ข้อหนึ่ง'))
    await user.click(screen.getByLabelText('เลื่อนลง ข้อสาม'))
    await user.click(screen.getByText('ตรวจคำตอบ'))
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe('ActivityView feedback', () => {
  it('correct answer shows ถูกต้อง + rightTh, not the wrong-answer coaching', async () => {
    const lab: ActivityLab = { ...order, explainTh: 'ลองถามตัวเองทีละขั้นนะ', rightTh: 'ใช่เลย เรียงตามลำดับเวลา' }
    render(<ActivityView lab={lab} onDone={() => {}} shuffle={a => a} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('ตรวจคำตอบ'))
    expect(screen.getByText(/ถูกต้อง!/)).toBeInTheDocument()
    expect(screen.getByText(/ใช่เลย เรียงตามลำดับเวลา/)).toBeInTheDocument()
    expect(screen.queryByText(/ลองถามตัวเองทีละขั้นนะ/)).toBeNull()
    expect(screen.queryByText(/ยังไม่ถูก/)).toBeNull()
  })
  it('wrong answer keeps explainTh', async () => {
    const lab: ActivityLab = { ...order, explainTh: 'ลองถามตัวเองทีละขั้นนะ', rightTh: 'ใช่เลย' }
    render(<ActivityView lab={lab} onDone={() => {}} shuffle={reverse} />)
    await userEvent.setup().click(screen.getByText('ตรวจคำตอบ'))
    expect(screen.getByText(/ยังไม่ถูก/)).toBeInTheDocument()
    expect(screen.getByText(/ลองถามตัวเองทีละขั้นนะ/)).toBeInTheDocument()
  })
  it('falls back to explainTh when rightTh is missing', async () => {
    render(<ActivityView lab={order} onDone={() => {}} shuffle={a => a} />)
    await userEvent.setup().click(screen.getByText('ตรวจคำตอบ'))
    expect(screen.getByText(/เพราะต้องไล่ตามลำดับ/)).toBeInTheDocument()
  })
})

describe('ActivityView match', () => {
  const lab: ActivityLab = {
    kind: 'match', introTh: 'จับคู่', explainTh: 'จับคู่ตามหน้าที่',
    items: [{ id: 'l1', textTh: 'Switch' }, { id: 'l2', textTh: 'Router' }, { id: 'r1', textTh: 'ในวงเดียวกัน' }, { id: 'r2', textTh: 'ข้ามวง' }],
    answer: { l1: 'r1', l2: 'r2' },
  }
  it('wrong then right', async () => {
    const onDone = vi.fn()
    render(<ActivityView lab={lab} onDone={onDone} shuffle={a => a} />)
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('จับคู่ Switch'), 'r2')
    await user.selectOptions(screen.getByLabelText('จับคู่ Router'), 'r1')
    await user.click(screen.getByText('ตรวจคำตอบ'))
    expect(screen.getByText(/จับคู่ตามหน้าที่/)).toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
    await user.selectOptions(screen.getByLabelText('จับคู่ Switch'), 'r1')
    await user.selectOptions(screen.getByLabelText('จับคู่ Router'), 'r2')
    await user.click(screen.getByText('ตรวจคำตอบ'))
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe('ActivityView termIds', () => {
  it('คำศัพท์ใน intro, ข้อ และคำอธิบาย กดดูความหมายได้', async () => {
    const lab: ActivityLab = {
      kind: 'order', introTh: 'เรื่อง IP address',
      items: [{ id: 'a', textTh: 'ตั้ง IP address' }, { id: 'b', textTh: 'ข้อสอง' }],
      answer: ['a', 'b'], explainTh: 'เพราะ IP address สำคัญ',
    }
    render(<ActivityView lab={lab} onDone={() => {}} shuffle={(x) => x} termIds={['ip-address']} />)
    expect(screen.getAllByRole('button', { name: 'IP address' })).toHaveLength(2)
    await userEvent.setup().click(screen.getByText('ตรวจคำตอบ'))
    expect(screen.getAllByRole('button', { name: 'IP address' })).toHaveLength(3)
  })
})

describe('ActivityView motion', () => {
  it('กด ⬆/⬇ แล้วรายการที่ขยับได้ class moved ชั่วคราว', async () => {
    vi.useFakeTimers()
    try {
      render(<ActivityView lab={order} onDone={() => {}} shuffle={reverse} />)
      fireEvent.click(screen.getByLabelText('เลื่อนขึ้น ข้อหนึ่ง'))
      const li = screen.getByText('ข้อหนึ่ง').closest('li')!
      expect(li).toHaveClass('moved')
      expect(screen.getByText('ข้อสอง').closest('li')).not.toHaveClass('moved')
      act(() => { vi.advanceTimersByTime(400) })
      expect(li).not.toHaveClass('moved')
    } finally {
      vi.useRealTimers()
    }
  })

  it('ผลตรวจเป็นการ์ด .pop-in สีถูก/ผิด', async () => {
    render(<ActivityView lab={order} onDone={() => {}} shuffle={reverse} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('ตรวจคำตอบ'))
    expect(screen.getByRole('status')).toHaveClass('lab-result', 'bad', 'pop-in')
  })
})
