import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RichText } from './RichText'
import type { GlossaryTerm } from '../content/types'

const terms: GlossaryTerm[] = [
  { id: 'ip', en: 'IP', th: 'ไอพี', explainTh: 'เลขที่อยู่' },
  { id: 'ip-address', en: 'IP address', th: 'ไอพีแอดเดรส', explainTh: 'บ้านเลขที่ของเครื่อง' },
  { id: 'lan', en: 'LAN', th: 'แลน', explainTh: 'วงเล็ก' },
]

describe('RichText', () => {
  it('ห่อคำศัพท์ด้วย Term ส่วนข้อความอื่นเหมือนเดิม', async () => {
    const u = userEvent.setup()
    const { container } = render(<RichText text="ในบ้านมีLANหนึ่งวง" termIds={['lan']} terms={terms} />)
    expect(container.textContent).toBe('ในบ้านมีLANหนึ่งวง')
    await u.click(screen.getByRole('button', { name: 'LAN' }))
    expect(screen.getByText('วงเล็ก')).toBeInTheDocument()
  })

  it('ไม่สนตัวพิมพ์เล็กใหญ่ และคงตัวพิมพ์เดิมไว้', () => {
    render(<RichText text="ต่อ lan กับ Lan" termIds={['lan']} terms={terms} />)
    expect(screen.getByRole('button', { name: 'lan' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lan' })).toBeInTheDocument()
  })

  it('จับเฉพาะทั้งคำ ไม่จับกลางคำอังกฤษ', () => {
    render(<RichText text="PLANT กับ LANs และ LAN" termIds={['lan']} terms={terms} />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'LAN' })).toBeInTheDocument()
  })

  it('คำยาวมาก่อนคำสั้น', () => {
    render(<RichText text="IP address คือ IP" termIds={['ip', 'ip-address']} terms={terms} />)
    const btns = screen.getAllByRole('button').map((b) => b.textContent)
    expect(btns).toEqual(['IP address', 'IP'])
  })

  it('ไม่มี termIds หรือ id ไม่รู้จัก = ข้อความธรรมดา', () => {
    const { rerender } = render(<RichText text="ต่อ LAN" termIds={[]} terms={terms} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('ต่อ LAN')).toBeInTheDocument()
    rerender(<RichText text="ต่อ LAN" termIds={['nope']} terms={terms} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('ใช้ glossary จริงเมื่อไม่ส่ง terms มา', () => {
    render(<RichText text="ดู IP address" termIds={['ip-address']} />)
    expect(screen.getByRole('button', { name: 'IP address' })).toBeInTheDocument()
  })
})
