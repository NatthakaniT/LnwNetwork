import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RealTry } from './RealTry'

const realTry = {
  introTh: 'เปิด Git Bash แล้วลองตามนี้',
  steps: [
    { cmd: 'git init', expectTh: 'เห็นข้อความ Initialized' },
    { cmd: 'git status', expectTh: 'เห็น On branch main' },
  ],
}
afterEach(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }))

describe('RealTry', () => {
  it('แสดงหัวข้อ intro ทุกคำสั่งและผลที่ควรเห็น', () => {
    render(<RealTry realTry={realTry} />)
    expect(screen.getByRole('heading', { name: 'ลองของจริงใน Git Bash' })).toBeInTheDocument()
    expect(screen.getByText('เปิด Git Bash แล้วลองตามนี้')).toBeInTheDocument()
    for (const s of realTry.steps) {
      expect(screen.getByText(s.cmd).tagName).toBe('CODE')
      expect(screen.getByText(s.expectTh)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: `คัดลอกคำสั่ง ${s.cmd}` })).toBeInTheDocument()
    }
  })

  it('กดคัดลอกส่งคำสั่งนั้นไปที่ clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<RealTry realTry={realTry} />)
    await userEvent.click(screen.getByRole('button', { name: 'คัดลอกคำสั่ง git status' }))
    expect(writeText).toHaveBeenCalledWith('git status')
  })
})
