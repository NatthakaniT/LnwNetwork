import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizView } from './QuizView'
import type { QuizQuestion } from '../content/types'

const mk = (id: string, layer: 'th' | 'en', correct: string[], extra: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id, layer, prompt: `คำถาม ${id}`, explainTh: `อธิบาย ${id}`, correct,
  choices: ['a', 'b', 'c'].map((c) => ({ id: c, text: `ตัวเลือก ${c} ${id}` })),
  ...extra,
})

const pick = async (u: ReturnType<typeof userEvent.setup>, id: string, c: string) =>
  u.click(screen.getByRole('button', { name: new RegExp(`ตัวเลือก ${c} ${id}`) }))

describe('QuizView', () => {
  it('แสดงชั้น th ก่อน en', async () => {
    const u = userEvent.setup()
    // ใส่ en ไว้ก่อนในอาร์เรย์ แต่ต้องเห็น th ก่อน
    render(<QuizView questions={[mk('e1', 'en', ['a']), mk('t1', 'th', ['a'])]} onPass={() => {}} />)
    expect(screen.getByText('คำถาม t1')).toBeInTheDocument()
    await pick(u, 't1', 'a')
    await u.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    await u.click(screen.getByRole('button', { name: 'ข้อต่อไป' }))
    expect(screen.getByText('คำถาม e1')).toBeInTheDocument()
  })

  it('เลือกหลายข้อ: บอก "เลือก 2 ข้อ" และปุ่มส่งกดไม่ได้จนเลือกครบ', async () => {
    const u = userEvent.setup()
    render(<QuizView questions={[mk('m', 'th', ['a', 'c'])]} onPass={() => {}} />)
    expect(screen.getByText(/เลือก 2 ข้อ/)).toBeInTheDocument()
    const submit = screen.getByRole('button', { name: 'ส่งคำตอบ' })
    expect(submit).toBeDisabled()
    await pick(u, 'm', 'a')
    expect(submit).toBeDisabled()
    await pick(u, 'm', 'c')
    expect(submit).toBeEnabled()
  })

  it('ตอบผิดแสดง explainTh', async () => {
    const u = userEvent.setup()
    render(<QuizView questions={[mk('t1', 'th', ['a'])]} onPass={() => {}} />)
    await pick(u, 't1', 'b')
    await u.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    expect(screen.getByText('อธิบาย t1')).toBeInTheDocument()
  })

  it('en: ปุ่มดูคำแปลไทย แสดง promptTh + textTh และ keywords ถูกห่อ <mark>', async () => {
    const u = userEvent.setup()
    const en = mk('e1', 'en', ['a'], {
      prompt: 'Which is NOT a router function? NOTE two.',
      promptTh: 'ข้อไหนไม่ใช่หน้าที่ของเราเตอร์',
      keywords: ['NOT', 'two'],
      choices: [{ id: 'a', text: 'Forwarding', textTh: 'ส่งต่อ' }, { id: 'b', text: 'Cooking' }],
    })
    const { container } = render(<QuizView questions={[en]} onPass={() => {}} />)
    const marks = [...container.querySelectorAll('mark')].map((m) => m.textContent)
    expect(marks).toEqual(['NOT', 'two']) // NOTE ไม่ถูกห่อ
    expect(screen.queryByText('ข้อไหนไม่ใช่หน้าที่ของเราเตอร์')).not.toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'ดูคำแปลไทย' }))
    expect(screen.getByText('ข้อไหนไม่ใช่หน้าที่ของเราเตอร์')).toBeInTheDocument()
    expect(screen.getByText('ส่งต่อ')).toBeInTheDocument()
  })

  it('ผ่าน ≥80% เรียก onPass ครั้งเดียว', async () => {
    const u = userEvent.setup()
    const onPass = vi.fn()
    const qs = ['1', '2', '3', '4', '5'].map((i) => mk(i, 'th', ['a']))
    render(<QuizView questions={qs} onPass={onPass} />)
    for (const i of ['1', '2', '3', '4', '5']) {
      await pick(u, i, i === '5' ? 'b' : 'a')
      await u.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
      await u.click(screen.getByRole('button', { name: i === '5' ? 'ดูคะแนน' : 'ข้อต่อไป' }))
    }
    expect(screen.getByText('ได้ 4 จาก 5 ข้อ')).toBeInTheDocument()
    expect(onPass).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'ลองใหม่' })).not.toBeInTheDocument()
  })

  it('ไม่ผ่าน: ไม่เรียก onPass, มีปุ่มลองใหม่ ที่สลับตัวเลือก', async () => {
    const u = userEvent.setup()
    const onPass = vi.fn()
    const shuffle = vi.fn((xs: unknown[]) => [...xs].reverse()) as unknown as <T>(xs: T[]) => T[]
    render(<QuizView questions={[mk('1', 'th', ['a'])]} onPass={onPass} shuffle={shuffle} />)
    const order = () => screen.getAllByRole('button').filter((b) => /ตัวเลือก/.test(b.textContent ?? '')).map((b) => (b.textContent ?? '').replace(/^[○◉☐☑]/, ''))
    await pick(u, '1', 'b')
    await u.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    await u.click(screen.getByRole('button', { name: 'ดูคะแนน' }))
    expect(screen.getByText('ได้ 0 จาก 1 ข้อ')).toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
    await u.click(screen.getByRole('button', { name: 'ลองใหม่' }))
    expect(shuffle).toHaveBeenCalled()
    expect(screen.getByText('คำถาม 1')).toBeInTheDocument()
    expect(order()).toEqual(['ตัวเลือก c 1', 'ตัวเลือก b 1', 'ตัวเลือก a 1'])
  })

  it('สลับตัวเลือกตั้งแต่การแสดงครั้งแรก ไม่เรียงตามที่เขียนไว้', () => {
    const shuffle = vi.fn((xs: unknown[]) => [...xs].reverse()) as unknown as <T>(xs: T[]) => T[]
    render(<QuizView questions={[mk('1', 'th', ['a'])]} onPass={() => {}} shuffle={shuffle} />)
    const texts = screen.getAllByRole('button').filter((b) => /ตัวเลือก/.test(b.textContent ?? '')).map((b) => (b.textContent ?? '').replace(/^[○◉☐☑]/, ''))
    expect(shuffle).toHaveBeenCalled()
    expect(texts).toEqual(['ตัวเลือก c 1', 'ตัวเลือก b 1', 'ตัวเลือก a 1'])
  })

  it('testOut แสดงข้อความนำ', () => {
    render(<QuizView questions={[mk('1', 'th', ['a'])]} onPass={() => {}} mode="testOut" />)
    expect(screen.getByText(/ถ้าตอบผ่าน จะข้ามบทนี้ได้เลย/)).toBeInTheDocument()
  })
})

describe('QuizView termIds', () => {
  it('คำศัพท์ในคำถาม th และคำอธิบาย กดดูความหมายได้', async () => {
    const u = userEvent.setup()
    const q = mk('t1', 'th', ['a'], { prompt: 'ทำไมต้องมี IP address', explainTh: 'เพราะ IP address บอกที่อยู่' })
    render(<QuizView questions={[q]} onPass={() => {}} termIds={['ip-address']} />)
    expect(screen.getByRole('button', { name: 'IP address' })).toBeInTheDocument()
    await pick(u, 't1', 'b')
    await u.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    expect(screen.getAllByRole('button', { name: 'IP address' })).toHaveLength(2)
  })
})
