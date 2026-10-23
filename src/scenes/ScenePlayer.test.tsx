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

  it('next and prev jump between scenes, preserving paused state', () => {
    const { container } = render(<ScenePlayer lessonId="l1" set={set} onFinished={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /ฉากต่อไป/ }))
    expect(screen.getByText('ฉากที่ 2 จาก 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /เล่น/ })).toBeInTheDocument()
    expect(group(container, 'a').style.transform).toContain('translate(50px, 70px)')
    fireEvent.click(screen.getByRole('button', { name: /ย้อน/ }))
    expect(screen.getByText('ฉากที่ 1 จาก 3')).toBeInTheDocument()
    expect(group(container, 'a').style.transform).toContain('translate(10px, 20px)')
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })
})
