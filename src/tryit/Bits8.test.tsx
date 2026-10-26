import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Bits8 } from './Bits8'

afterEach(() => vi.useRealTimers())
const sw = (v: number) => screen.getByRole('button', { name: `สวิตช์ค่า ${v}` })

describe('Bits8', () => {
  it('shows sum, working, goal; advances after 1400ms; onDone once', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<Bits8 tryIt={{ kind: 'bits8', introTh: 'ลองดู', goals: [192, 10] }} onDone={onDone} />)
    expect(screen.getByText('ลองดู')).toBeInTheDocument()
    expect(screen.getByText(/โจทย์ 1\/2: เปิดสวิตช์ให้รวมกันได้ 192/)).toBeInTheDocument()
    fireEvent.click(sw(128))
    expect(sw(128)).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(sw(64))
    expect(screen.getByText('128 + 64 = 192 → 11000000')).toBeInTheDocument()
    expect(screen.getByText(/ถูกต้อง 192 = 128 \+ 64/)).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1400) })
    expect(screen.getByText(/โจทย์ 2\/2: เปิดสวิตช์ให้รวมกันได้ 10/)).toBeInTheDocument()
    expect(sw(128)).toHaveAttribute('aria-pressed', 'false')
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(sw(8)); fireEvent.click(sw(2))
    act(() => { vi.advanceTimersByTime(1400) })
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
