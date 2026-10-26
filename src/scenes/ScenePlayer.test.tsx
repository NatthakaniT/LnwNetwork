import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SceneSet } from '../content/types'
import { ScenePlayer } from './ScenePlayer'
import { fallbackDurationMs } from './timeline'

const set: SceneSet = {
  stage: { width: 800, height: 400 },
  actors: [
    { id: 'a', kind: 'pc', x: 10, y: 20, label: 'เครื่องเอ' },
    { id: 'b', kind: 'pc', x: 200, y: 20, label: 'เครื่องบี' },
    { id: 'cab', kind: 'cable', x: 10, y: 20, to: 'b' },
  ],
  scenes: [
    { id: 's0', narrationTh: 'ฉากแรกนะ', actions: [{ type: 'move', actor: 'a', x: 50, y: 70, ms: 500 }] },
    { id: 's1', narrationTh: 'ฉากสอง', actions: [{ type: 'highlight', actor: 'b' }] },
    { id: 's2', narrationTh: 'ฉากสุดท้าย', actions: [] },
  ],
}

const audio = (c: HTMLElement) => c.querySelector('audio') as HTMLAudioElement
const group = (c: HTMLElement, id: string) => c.querySelector(`[data-actor="${id}"]`) as SVGGElement

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ScenePlayer', () => {
  it('starts paused on scene 1 with caption and counter', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    expect(screen.getByText('ฉากที่ 1 จาก 3')).toBeInTheDocument()
    expect(screen.getByText('ฉากแรกนะ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /เล่น/ })).toBeInTheDocument()
    expect(audio(container).getAttribute('src')).toBe('/audio/l1/s0.mp3')
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })

  it('play starts audio, toggles to หยุด, and pausing pauses audio', () => {
    render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /หยุด/ }))
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /เล่น/ })).toBeInTheDocument()
  })

  it('applies scene actions after play (actor moves)', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    expect(group(container, 'a').style.transform).toContain('translate(10px, 20px)')
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    act(() => { vi.advanceTimersByTime(100) })
    expect(group(container, 'a').style.transform).toContain('translate(50px, 70px)')
    expect(group(container, 'a').style.transition).toContain('500ms')
  })

  it('audio ended advances to next scene and keeps playing; last scene calls onFinished once', () => {
    const onFinished = vi.fn()
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={onFinished} />)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    fireEvent.ended(audio(container))
    expect(screen.getByText('ฉากที่ 2 จาก 3')).toBeInTheDocument()
    expect(audio(container).getAttribute('src')).toBe('/audio/l1/s1.mp3')
    fireEvent.ended(audio(container))
    expect(screen.getByText('ฉากที่ 3 จาก 3')).toBeInTheDocument()
    expect(onFinished).not.toHaveBeenCalled()
    fireEvent.ended(audio(container))
    expect(onFinished).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /เล่น/ })).toBeInTheDocument()
  })

  it('audio error: caption stays and scene advances after fallbackDurationMs', () => {
    const onFinished = vi.fn()
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={onFinished} />)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    fireEvent.error(audio(container))
    expect(screen.getByText('ฉากแรกนะ')).toBeInTheDocument()
    const d = fallbackDurationMs('ฉากแรกนะ', 1)
    act(() => { vi.advanceTimersByTime(d - 10) })
    expect(screen.getByText('ฉากที่ 1 จาก 3')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(20) })
    expect(screen.getByText('ฉากที่ 2 จาก 3')).toBeInTheDocument()
    expect(screen.getByText('ฉากสอง')).toBeInTheDocument()
  })

  it('audio error then finishing all scenes via timers calls onFinished', () => {
    const onFinished = vi.fn()
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={onFinished} />)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    for (let i = 0; i < 3; i++) {
      fireEvent.error(audio(container))
      act(() => { vi.advanceTimersByTime(20000) })
    }
    expect(onFinished).toHaveBeenCalledTimes(1)
  })

  it('slow toggle sets playbackRate 0.75 and lengthens the fallback', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /ช้าลง/ }))
    expect(screen.getByRole('button', { name: /ช้าลงอยู่/ })).toBeInTheDocument()
    expect(audio(container).playbackRate).toBe(0.75)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    fireEvent.error(audio(container))
    const slow = fallbackDurationMs('ฉากแรกนะ', 0.75)
    act(() => { vi.advanceTimersByTime(slow - 10) })
    expect(screen.getByText('ฉากที่ 1 จาก 3')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(20) })
    expect(screen.getByText('ฉากที่ 2 จาก 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /ช้าลงอยู่/ }))
    expect(audio(container).playbackRate).toBe(1)
  })

  it('AbortError from a play() interrupted by pause does not advance or finish', async () => {
    const onFinished = vi.fn()
    let rejectPlay: (e: unknown) => void = () => {}
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(
      () => new Promise<void>((_, rej) => { rejectPlay = rej }),
    )
    render(<ScenePlayer lessonId="l1" set={set} onFinished={onFinished} />)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    fireEvent.click(screen.getByRole('button', { name: /หยุด/ }))
    await act(async () => { rejectPlay(Object.assign(new Error('aborted'), { name: 'AbortError' })) })
    act(() => { vi.advanceTimersByTime(60000) })
    expect(screen.getByText('ฉากที่ 1 จาก 3')).toBeInTheDocument()
    expect(onFinished).not.toHaveBeenCalled()
  })

  it('resume after pause restarts audio from 0 on the same scene', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    audio(container).currentTime = 5
    fireEvent.click(screen.getByRole('button', { name: /หยุด/ }))
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    expect(audio(container).currentTime).toBe(0)
    expect(screen.getByText('ฉากที่ 1 จาก 3')).toBeInTheDocument()
    expect(screen.getByText('ฉากแรกนะ')).toBeInTheDocument()
  })

  it('next and prev jump between scenes, preserving paused state', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /ฉากต่อไป/ }))
    expect(screen.getByText('ฉากที่ 2 จาก 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /เล่น/ })).toBeInTheDocument()
    expect(group(container, 'a').style.transform).toContain('translate(50px, 70px)')
    fireEvent.click(screen.getByRole('button', { name: /ย้อน/ }))
    expect(screen.getByText('ฉากที่ 1 จาก 3')).toBeInTheDocument()
    // paused: prev shows the END state of scene 1 so it matches the caption
    expect(group(container, 'a').style.transform).toContain('translate(50px, 70px)')
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })

  it('paused: next shows the end state of the new scene; play then replays from its start', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    expect(group(container, 'b').getAttribute('data-highlighted')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /ฉากต่อไป/ }))
    expect(group(container, 'b').getAttribute('data-highlighted')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /ฉากต่อไป/ }))
    expect(screen.getByText('ฉากที่ 3 จาก 3')).toBeInTheDocument()
    expect(group(container, 'a').style.transform).toContain('translate(50px, 70px)')
    expect(group(container, 'b').getAttribute('data-highlighted')).toBe('true')
    // replay scene 2 (index 1) from its start state
    fireEvent.click(screen.getByRole('button', { name: /ย้อน/ }))
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    expect(group(container, 'b').getAttribute('data-highlighted')).toBeNull()
    act(() => { vi.advanceTimersByTime(100) })
    expect(group(container, 'b').getAttribute('data-highlighted')).toBe('true')
  })

  it('icons are scaled 1.6x around their anchor with labels >= 20 units', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    const icon = group(container, 'a').querySelector('[data-icon-scale]') as SVGGElement
    expect(icon.getAttribute('transform')).toBe('scale(1.6)')
    expect(group(container, 'a').style.transform).toContain('translate(10px, 20px)')
    const label = group(container, 'a').querySelector('text') as SVGTextElement
    expect(Number(label.getAttribute('font-size'))).toBeGreaterThanOrEqual(20)
  })

  it('control buttons use the styled classes; play is primary', () => {
    render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    expect(screen.getByRole('button', { name: /เล่น/ })).toHaveClass('sp-btn', 'sp-btn-primary')
    expect(screen.getByRole('button', { name: /ย้อน/ })).toHaveClass('sp-btn')
  })
})

describe('ScenePlayer termIds', () => {
  it('คำศัพท์ในคำบรรยายกดดูความหมายได้', () => {
    const s: SceneSet = { ...set, scenes: [{ id: 's0', narrationTh: 'ทุกเครื่องมี IP address', actions: [] }] }
    render(<ScenePlayer lessonId="l1" set={s} termIds={['ip-address']} onFinished={() => {}} />)
    expect(screen.getByRole('button', { name: 'IP address' })).toBeInTheDocument()
  })
})

describe('ScenePlayer v2', () => {
  const base = [{ type: 'show' as const, actor: 'me' }, { type: 'show' as const, actor: 'you' }]
  const v2: SceneSet = {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors: [
      { id: 'me', kind: 'pc', x: 150, y: 250, label: 'คอมเรา', hidden: true },
      { id: 'you', kind: 'pc', x: 750, y: 250, label: 'คอม 3', labelSide: 'right', hidden: true },
      { id: 'q', kind: 'card', x: 150, y: 140, lines: ['ถึง: ทุกเครื่อง', 'ใครคือ .30 ?'], tone: 'bcast', hidden: true },
    ],
    scenes: [
      { id: 'v1', narrationTh: 'ปัญหา', chipTh: 'ปัญหา', lifeTh: 'ชีวิตหนึ่ง', lifeIcon: '📦', setup: base, actions: [] },
      { id: 'v2', narrationTh: 'ถาม', chipTh: 'ตะโกนถาม', lifeTh: 'ชีวิตสอง', setup: base, actions: [
        { type: 'ripple', actor: 'me', tone: 'bcast' },
        { type: 'trail', path: ['me', 'you'], tone: 'bcast' },
        { type: 'show', actor: 'q' },
        { type: 'moveAlong', actor: 'q', path: ['me', 'you'], msPerHop: 500, offset: { dx: -180, dy: 0 } },
        { type: 'say', actor: 'you', text: 'ได้ยินแล้ว', mood: 'yes' },
      ] },
      { id: 'v3', narrationTh: 'เงียบ', chipTh: 'เงียบ', lifeTh: 'ชีวิตสาม', setup: base, actions: [{ type: 'dim', actor: 'you' }] },
      { id: 'v4', narrationTh: 'ตอบ', chipTh: 'ตอบกลับ', lifeTh: 'ชีวิตสี่', setup: base, actions: [
        { type: 'trail', path: ['you', 'me'], tone: 'reply' },
        { type: 'say', actor: 'you', text: 'ฉันเอง!', mood: 'yes' },
      ] },
    ],
  }
  const chip = (name: string) => screen.getByRole('button', { name: new RegExp(name) })

  it('แสดงปุ่มฉากตามจำนวนฉาก แถบชีวิตจริง และคำอธิบายสีเฉพาะที่ใช้', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={v2} onFinished={() => {}} />)
    expect(container.querySelectorAll('.sp-chips button')).toHaveLength(4)
    expect(screen.getByText('ชีวิตหนึ่ง')).toBeInTheDocument()
    expect(screen.getByText('ในชีวิตจริง')).toBeInTheDocument()
    expect(chip('ปัญหา')).toHaveAttribute('aria-current', 'step')
    expect(container.querySelector('.sp-legend')).toHaveTextContent('broadcast')
    expect(container.querySelector('.sp-legend')).toHaveTextContent('unicast')
    expect(container.querySelector('.sp-legend')).not.toHaveTextContent('ส่งของจริง')
  })

  it('กดปุ่มฉากที่ 4 เห็น bubble และ trail ทันที กดย้อนไปฉาก 3 ไม่มีของฉาก 4 ค้าง', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={v2} onFinished={() => {}} />)
    fireEvent.click(chip('ตอบกลับ'))
    expect(screen.getByText('ฉากที่ 4 จาก 4')).toBeInTheDocument()
    expect(screen.getByText('ฉันเอง!')).toBeInTheDocument()
    expect(container.querySelector('[data-trail="reply"]')).not.toBeNull()
    expect(screen.getByText('ชีวิตสี่')).toBeInTheDocument()
    expect(chip('ปัญหา')).toHaveClass('done')
    fireEvent.click(screen.getByRole('button', { name: /ย้อน/ }))
    expect(screen.getByText('ฉากที่ 3 จาก 4')).toBeInTheDocument()
    expect(container.querySelector('[data-trail]')).toBeNull()
    expect(screen.queryByText('ฉันเอง!')).toBeNull()
    expect(group(container, 'you').style.opacity).toBe('0.35')
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })

  it('เล่นฉาก: ripple มีแค่ตอนเล่น ซองวิ่งไปจอดข้างเครื่อง แล้วค่อยพูดหลังซองถึง', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={v2} onFinished={() => {}} />)
    fireEvent.click(chip('ตะโกนถาม'))
    expect(container.querySelector('.sp-ripple')).toBeNull()
    expect(group(container, 'q').style.transform).toContain('translate(570px, 250px)')
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    expect(screen.queryByText('ได้ยินแล้ว')).toBeNull()
    act(() => { vi.advanceTimersByTime(100) })
    expect(container.querySelector('.sp-ripple')).not.toBeNull()
    expect(container.querySelector('[data-trail="bcast"]')).not.toBeNull()
    expect(group(container, 'q').style.transform).toContain('translate(570px, 250px)')
    expect(screen.queryByText('ได้ยินแล้ว')).toBeNull()
    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByText('ได้ยินแล้ว')).toBeInTheDocument()
  })

  it('prefers-reduced-motion: กดเล่นแล้วเห็นสภาพตอนจบทันที ไม่มี ripple', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
    try {
      const { container } = render(<ScenePlayer lessonId="l1" set={v2} onFinished={() => {}} />)
      fireEvent.click(chip('ตะโกนถาม'))
      fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
      expect(screen.getByText('ได้ยินแล้ว')).toBeInTheDocument()
      act(() => { vi.advanceTimersByTime(100) })
      expect(container.querySelector('.sp-ripple')).toBeNull()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('ฉากสุดท้ายจบแล้วเรียก onFinished ครั้งเดียว', () => {
    const onFinished = vi.fn()
    const { container } = render(<ScenePlayer lessonId="l1" set={v2} onFinished={onFinished} />)
    fireEvent.click(screen.getByRole('button', { name: /เล่น/ }))
    for (let i = 0; i < 4; i++) fireEvent.ended(audio(container))
    expect(onFinished).toHaveBeenCalledTimes(1)
  })

  it('SceneSet แบบเดิมไม่มีแถบชีวิตจริงและปุ่มฉาก', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    expect(container.querySelector('.sp-life')).toBeNull()
    expect(container.querySelector('.sp-chips')).toBeNull()
    expect(container.querySelector('.sp-legend')).toBeNull()
  })
})
