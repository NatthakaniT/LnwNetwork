import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Term } from './Term'
import { GlossaryPage } from './GlossaryPage'
import { glossary } from '../content/glossary'

describe('Term', () => {
  it('คลิกแล้วเห็นคำไทยกับคำอธิบาย', async () => {
    const u = userEvent.setup()
    render(<Term id="ip-address">IP address</Term>)
    expect(screen.queryByText(/บ้านเลขที่ของคอมพิวเตอร์/)).toBeNull()
    await u.click(screen.getByRole('button', { name: 'IP address' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/ไอพีแอดเดรส/)).toBeInTheDocument()
    expect(screen.getByText(/บ้านเลขที่ของคอมพิวเตอร์/)).toBeInTheDocument()
  })

  it('ไม่ใส่ children ใช้คำอังกฤษแทน', () => {
    render(<Term id="ip-address" />)
    expect(screen.getByRole('button', { name: 'IP address' })).toBeInTheDocument()
  })

  it('กด Esc แล้วปิด', async () => {
    const u = userEvent.setup()
    render(<Term id="ip-address">IP address</Term>)
    await u.click(screen.getByRole('button', { name: 'IP address' }))
    await u.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('คลิกข้างนอกแล้วปิด', async () => {
    const u = userEvent.setup()
    render(<div><p>ข้างนอก</p><Term id="ip-address">IP address</Term></div>)
    await u.click(screen.getByRole('button', { name: 'IP address' }))
    await u.click(screen.getByText('ข้างนอก'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('id ที่ไม่มี แสดงข้อความเฉย ๆ ไม่มีปุ่ม', () => {
    render(<Term id="nope">คำนี้</Term>)
    expect(screen.getByText('คำนี้')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('GlossaryPage', () => {
  it('ค้นคำว่า "บ้านเลขที่" แล้วเจอ IP address', async () => {
    const u = userEvent.setup()
    render(<GlossaryPage />)
    await u.type(screen.getByRole('searchbox'), 'บ้านเลขที่')
    expect(screen.getByText('IP address')).toBeInTheDocument()
  })

  it('ค้นภาษาอังกฤษไม่สนตัวพิมพ์ และไม่เจอก็บอก', async () => {
    const u = userEvent.setup()
    render(<GlossaryPage />)
    const box = screen.getByRole('searchbox')
    await u.type(box, 'ip ADDR')
    expect(screen.getByText('IP address')).toBeInTheDocument()
    await u.clear(box)
    await u.type(box, 'zzzz')
    expect(screen.queryByText('IP address')).toBeNull()
    expect(screen.getByText(/ไม่เจอ/)).toBeInTheDocument()
  })

  it('จัดกลุ่มตามภาค และศัพท์ที่ไม่มีบทไหนใช้ไปอยู่ "ศัพท์อื่น ๆ"', () => {
    const terms = [
      { id: 'a', en: 'Alpha', th: 'เอ', explainTh: 'อธิบายเอ' },
      { id: 'zz-orphan', en: 'Orphan', th: 'กำพร้า', explainTh: 'ไม่มีบทไหนใช้' },
    ]
    render(<GlossaryPage terms={terms} />)
    expect(screen.getByRole('heading', { name: 'ศัพท์อื่น ๆ' })).toBeInTheDocument()
    expect(screen.getByText('Orphan')).toBeInTheDocument()
  })

  it('glossary จริงมี ip-address', () => {
    expect(glossary.some((g) => g.id === 'ip-address')).toBe(true)
  })
})
