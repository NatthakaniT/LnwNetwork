import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AskTutor } from './AskTutor'

const setClipboard = (v: unknown) => Object.defineProperty(navigator, 'clipboard', { value: v, configurable: true })
afterEach(() => setClipboard(undefined))

describe('AskTutor', () => {
  it('คัดลอกสำเร็จ แสดงคัดลอกแล้ว', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    render(<AskTutor text="สวัสดี" />)
    await userEvent.click(screen.getByRole('button', { name: '📋 คัดลอกไปถามครู' }))
    expect(writeText).toHaveBeenCalledWith('สวัสดี')
    expect(await screen.findByText('คัดลอกแล้ว ไปวางใน Claude.ai ได้เลย')).toBeInTheDocument()
  })

  it('clipboard reject แสดง textarea', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('no')) })
    render(<AskTutor text="สวัสดี" />)
    await userEvent.click(screen.getByRole('button', { name: /คัดลอกไปถามครู/ }))
    const ta = (await screen.findByLabelText('ข้อความสำหรับคัดลอก')) as HTMLTextAreaElement
    expect(ta.value).toBe('สวัสดี')
    expect(screen.getByText('คัดลอกอัตโนมัติไม่ได้ กด Ctrl+C เพื่อคัดลอก')).toBeInTheDocument()
    expect(document.activeElement).toBe(ta)
  })

  it('ไม่มี navigator.clipboard แสดง textarea', async () => {
    setClipboard(undefined)
    render(<AskTutor text="สวัสดี" />)
    await userEvent.click(screen.getByRole('button', { name: /คัดลอกไปถามครู/ }))
    expect(((await screen.findByLabelText('ข้อความสำหรับคัดลอก')) as HTMLTextAreaElement).value).toBe('สวัสดี')
  })
})
