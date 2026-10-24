import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useReveal } from './reveal'

function Box() {
  const ref = useReveal<HTMLDivElement>()
  return <div ref={ref} className="reveal" data-testid="box">x</div>
}

afterEach(() => { vi.unstubAllGlobals() })

describe('useReveal', () => {
  it('ไม่มี IntersectionObserver -> ใส่ is-in ทันที', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    delete (window as unknown as Record<string, unknown>).IntersectionObserver
    render(<Box />)
    expect(screen.getByTestId('box')).toHaveClass('is-in')
  })
  it('observer แจ้งว่าเห็น -> ใส่ is-in', () => {
    let cb: (e: Array<{ isIntersecting: boolean }>) => void = () => {}
    const disconnect = vi.fn()
    class IO {
      constructor(c: typeof cb) { cb = c }
      observe() {}
      unobserve() {}
      disconnect = disconnect
    }
    vi.stubGlobal('IntersectionObserver', IO)
    render(<Box />)
    expect(screen.getByTestId('box')).not.toHaveClass('is-in')
    act(() => cb([{ isIntersecting: false }]))
    expect(screen.getByTestId('box')).not.toHaveClass('is-in')
    act(() => cb([{ isIntersecting: true }]))
    expect(screen.getByTestId('box')).toHaveClass('is-in')
    expect(disconnect).toHaveBeenCalled()
  })
})
