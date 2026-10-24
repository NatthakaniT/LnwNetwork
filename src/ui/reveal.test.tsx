import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { useReveal } from './reveal'

function Box({ cls = 'reveal' }: { cls?: string }) {
  const ref = useReveal<HTMLDivElement>()
  return <div ref={ref} className={cls} data-testid="box">x</div>
}

type Entry = { isIntersecting: boolean; boundingClientRect?: { bottom: number } }
function stubIO() {
  const h: { cb: (e: Entry[]) => void; disconnect: ReturnType<typeof vi.fn> } = { cb: () => {}, disconnect: vi.fn() }
  class IO {
    constructor(c: typeof h.cb) { h.cb = c }
    observe() {}
    unobserve() {}
    disconnect = h.disconnect
  }
  vi.stubGlobal('IntersectionObserver', IO)
  return h
}

afterEach(() => { vi.unstubAllGlobals() })

describe('useReveal', () => {
  it('ไม่มี IntersectionObserver -> ตั้ง data-revealed ทันที', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    delete (window as unknown as Record<string, unknown>).IntersectionObserver
    render(<Box />)
    expect(screen.getByTestId('box')).toHaveAttribute('data-revealed', 'true')
  })
  it('observer แจ้งว่าเห็น -> ตั้ง data-revealed', () => {
    const h = stubIO()
    render(<Box />)
    expect(screen.getByTestId('box')).not.toHaveAttribute('data-revealed')
    act(() => h.cb([{ isIntersecting: false, boundingClientRect: { bottom: 500 } }]))
    expect(screen.getByTestId('box')).not.toHaveAttribute('data-revealed')
    act(() => h.cb([{ isIntersecting: true }]))
    expect(screen.getByTestId('box')).toHaveAttribute('data-revealed', 'true')
    expect(h.disconnect).toHaveBeenCalled()
  })
  it('อยู่เหนือจอไปแล้ว (bottom < 0) -> ถือว่าเห็นแล้ว', () => {
    const h = stubIO()
    render(<Box />)
    act(() => h.cb([{ isIntersecting: false, boundingClientRect: { bottom: -20 } }]))
    expect(screen.getByTestId('box')).toHaveAttribute('data-revealed', 'true')
  })
  it('React เปลี่ยน className ทีหลัง ก็ไม่ทำให้หาย', () => {
    const h = stubIO()
    function Wrap() {
      const [c, setC] = useState('reveal')
      return <><button onClick={() => setC('reveal other')}>go</button><Box cls={c} /></>
    }
    render(<Wrap />)
    act(() => h.cb([{ isIntersecting: true }]))
    act(() => screen.getByText('go').click())
    expect(screen.getByTestId('box')).toHaveClass('other')
    expect(screen.getByTestId('box')).toHaveAttribute('data-revealed', 'true')
  })
})
