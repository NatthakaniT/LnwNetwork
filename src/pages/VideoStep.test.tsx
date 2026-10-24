import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { VideoStep } from './VideoStep'

const vids = [
  { youtubeId: 'main1', titleTh: 'คลิปหลัก', channel: 'ก', startSec: 30 },
  { youtubeId: 'extra1', titleTh: 'คลิปเสริมหนึ่ง', channel: 'ข' },
]
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('VideoStep', () => {
  it('embeds main clip with nocookie + start and lists extras', () => {
    render(<VideoStep videos={vids} onNext={() => {}} />)
    const f = screen.getByTitle('คลิปหลัก') as HTMLIFrameElement
    expect(f.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/main1?start=30')
    expect(screen.getByText(/คลิปเสริมหนึ่ง/)).toBeInTheDocument()
    expect(screen.queryByText('เปิดใน YouTube')).toBeNull()
  })

  it('clicking an extra swaps the main player', () => {
    render(<VideoStep videos={vids} onNext={() => {}} />)
    fireEvent.click(screen.getByText(/คลิปเสริมหนึ่ง/))
    expect(screen.getByTitle('คลิปเสริมหนึ่ง').getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/extra1')
  })

  it('shows YouTube fallback after 15s without load, next stays enabled', () => {
    vi.useFakeTimers()
    const onNext = vi.fn()
    render(<VideoStep videos={vids} onNext={onNext} />)
    act(() => { vi.advanceTimersByTime(14999) })
    expect(screen.queryByText('เปิดใน YouTube')).toBeNull()
    act(() => { vi.advanceTimersByTime(1) })
    const a = screen.getByText('เปิดใน YouTube') as HTMLAnchorElement
    expect(a.href).toBe('https://www.youtube.com/watch?v=main1')
    expect(a.target).toBe('_blank')
    const next = screen.getByRole('button', { name: 'ไปขั้นต่อไป' })
    expect(next).toBeEnabled()
    fireEvent.click(next)
    expect(onNext).toHaveBeenCalled()
  })

  it('no fallback when iframe loads in time', () => {
    vi.useFakeTimers()
    render(<VideoStep videos={vids} onNext={() => {}} />)
    fireEvent.load(screen.getByTitle('คลิปหลัก'))
    act(() => { vi.advanceTimersByTime(20000) })
    expect(screen.queryByText('เปิดใน YouTube')).toBeNull()
  })

  it('shows fallback immediately when offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    render(<VideoStep videos={vids} onNext={() => {}} />)
    expect(screen.getByText('เปิดใน YouTube')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ไปขั้นต่อไป' })).toBeEnabled()
  })
})

describe('VideoStep note', () => {
  it('shows noteTh above the player, with glossary terms clickable', () => {
    const v = [{ youtubeId: 'n1', titleTh: 'คลิปมีโน้ต', channel: 'ก', noteTh: 'ช่วง Subnet mask ดูผ่าน ๆ ได้ IP address ไว้บทหน้า' }]
    const { container } = render(<VideoStep videos={v} termIds={['ip-address']} onNext={() => {}} />)
    const note = container.querySelector('.video-note')!
    expect(note).toHaveTextContent('ช่วง Subnet mask ดูผ่าน ๆ ได้')
    expect(note.compareDocumentPosition(container.querySelector('.video-frame')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('button', { name: 'IP address' })).toBeInTheDocument()
  })

  it('noteTh เป็นการ์ดสติกเกอร์ (class sticker-note)', () => {
    const v = [{ youtubeId: 'n1', titleTh: 'คลิปมีโน้ต', channel: 'ก', noteTh: 'ดูช่วงแรกพอ' }]
    const { container } = render(<VideoStep videos={v} onNext={() => {}} />)
    expect(container.querySelector('.video-note')).toHaveClass('sticker-note')
  })

  it('no note element when noteTh is missing', () => {
    const { container } = render(<VideoStep videos={vids} onNext={() => {}} />)
    expect(container.querySelector('.video-note')).toBeNull()
  })
})
