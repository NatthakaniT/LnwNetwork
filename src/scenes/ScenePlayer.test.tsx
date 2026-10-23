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
