import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const sceneProps: { set?: unknown }[] = []
vi.mock('../scenes/ScenePlayer', () => ({
  ScenePlayer: (p: { set: unknown; onFinished: () => void }) => { sceneProps.push(p); return <button onClick={p.onFinished}>จบฉาก</button> },
}))
vi.mock('../lab/LabView', () => ({ LabView: (p: { onDone: () => void }) => <button onClick={p.onDone}>จบแล็บเครือข่าย</button> }))
vi.mock('../lab/ActivityView', () => ({ ActivityView: (p: { onDone: () => void }) => <button onClick={p.onDone}>จบกิจกรรม</button> }))
vi.mock('../quiz/QuizView', () => ({
  QuizView: (p: { mode?: string; onPass: () => void }) => <button onClick={p.onPass}>ผ่านคำถาม-{p.mode ?? 'lesson'}</button>,
}))

import { LessonPage, MSG_LOCKED, MSG_BUILDING } from './LessonPage'
import { fixture, mk, memoryStorage } from './fixture'
import { loadProgress, saveProgress } from '../progress/progress'
import type { NetworkLab, Part } from '../content/types'

let storage: Storage
beforeEach(() => { storage = memoryStorage(); window.location.hash = ''; sceneProps.length = 0 })

const nextBtn = () => screen.getByRole('button', { name: 'ไปขั้นต่อไป' })
const tab = (n: string) => screen.getByRole('button', { name: new RegExp(n) })

describe('LessonPage', () => {
  it('header shows title, analogy and Cisco badge', () => {
    render(<LessonPage id="f1" parts={fixture} storage={storage} />)
    expect(screen.getByRole('heading', { level: 1, name: 'บท f1' })).toBeInTheDocument()
    expect(screen.getByText('เหมือน f1')).toBeInTheDocument()
    expect(screen.getByText('ตรงกับ Cisco: ITN 1, ITN 3')).toBeInTheDocument()
  })

  it('no badge when no cisco modules', () => {
    saveProgress({ version: 1, completed: ['f1'] }, storage)
    render(<LessonPage id="f2" parts={fixture} storage={storage} />)
    expect(screen.queryByText(/ตรงกับ Cisco/)).toBeNull()
  })

  it('steps go forward one at a time, back always allowed, then pass shows next lesson', () => {
    render(<LessonPage id="f1" parts={fixture} storage={storage} />)
    expect(tab('2. ดูภาพทบทวน')).toBeEnabled() // video step is always done
    expect(tab('3. ลองเล่น')).toBeDisabled()
    expect(tab('4. ตอบคำถาม')).toBeDisabled()
    fireEvent.click(nextBtn())
    expect(sceneProps[0].set).toBe(fixture[0].lessons[0].scenes) // stable object from content
    expect(nextBtn()).toBeDisabled()
    fireEvent.click(screen.getByText('จบฉาก'))
    expect(nextBtn()).toBeEnabled()
    expect(tab('3. ลองเล่น')).toBeEnabled()
    expect(tab('4. ตอบคำถาม')).toBeDisabled()
    fireEvent.click(nextBtn())
    expect(nextBtn()).toBeDisabled()
    fireEvent.click(screen.getByText('จบกิจกรรม'))
    fireEvent.click(nextBtn())
    expect(screen.queryByText(/ไปบทถัดไป/)).toBeNull()
    fireEvent.click(screen.getByText('ผ่านคำถาม-lesson'))
    expect(loadProgress(storage).completed).toEqual(['f1'])
    expect(screen.getByRole('link', { name: 'ไปบทถัดไป' })).toHaveAttribute('href', '#/lesson/f2')
    fireEvent.click(tab('1. ดูคลิป'))
    expect(screen.getByTitle('คลิป f1')).toBeInTheDocument()
  })

  it('last lesson: after pass offers link back to map', () => {
    saveProgress({ version: 1, completed: ['f1', 'f2'] }, storage)
    render(<LessonPage id="f3" parts={fixture} storage={storage} />)
    fireEvent.click(nextBtn()); fireEvent.click(screen.getByText('จบฉาก')); fireEvent.click(nextBtn())
    fireEvent.click(screen.getByText('จบกิจกรรม')); fireEvent.click(nextBtn())
    fireEvent.click(screen.getByText('ผ่านคำถาม-lesson'))
    expect(screen.queryByRole('link', { name: 'ไปบทถัดไป' })).toBeNull()
    expect(screen.getByRole('link', { name: 'กลับไปแผนที่' })).toHaveAttribute('href', '#/')
  })

  it('network lab uses LabView', () => {
    const net: NetworkLab = { kind: 'network', introTh: 'x', start: { devices: [], links: [] }, palette: [], goals: [] }
    const parts: Part[] = [{ part: 0, titleTh: 't', examDomain: 'e', lessons: [mk('n1', 0, 1, { lab: net })] }]
    render(<LessonPage id="n1" parts={parts} storage={storage} />)
    fireEvent.click(nextBtn()); fireEvent.click(screen.getByText('จบฉาก')); fireEvent.click(nextBtn())
    expect(screen.getByText('จบแล็บเครือข่าย')).toBeInTheDocument()
  })

  it('saves lastLesson/lastStep on step change and resumes there after refresh', () => {
    const { unmount } = render(<LessonPage id="f1" parts={fixture} storage={storage} />)
    expect(loadProgress(storage)).toMatchObject({ lastLesson: 'f1', lastStep: 'video' })
    fireEvent.click(nextBtn())
    expect(loadProgress(storage)).toMatchObject({ lastLesson: 'f1', lastStep: 'scenes' })
    fireEvent.click(screen.getByText('จบฉาก')); fireEvent.click(nextBtn())
    expect(loadProgress(storage).lastStep).toBe('lab')
    unmount()
    render(<LessonPage id="f1" parts={fixture} storage={storage} />)
    expect(tab('3. ลองเล่น')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('จบกิจกรรม')).toBeInTheDocument()
    expect(tab('2. ดูภาพทบทวน')).toBeEnabled()
  })

  it('locked lesson redirects to map with notice', () => {
    const onBlocked = vi.fn()
    window.location.hash = '#/lesson/f3'
    const { container } = render(<LessonPage id="f3" parts={fixture} storage={storage} onBlocked={onBlocked} />)
    expect(onBlocked).toHaveBeenCalledWith(MSG_LOCKED)
    expect(MSG_LOCKED).toBe('ต้องเรียนบทก่อนหน้าก่อนนะ')
    expect(window.location.hash).toBe('#/')
    expect(container).toBeEmptyDOMElement()
  })

  it('building / unknown lessons redirect too', () => {
    const onBlocked = vi.fn()
    render(<LessonPage id="b1" parts={fixture} storage={storage} onBlocked={onBlocked} />)
    expect(onBlocked).toHaveBeenCalledWith(MSG_BUILDING)
    expect(MSG_BUILDING).toBe('บทนี้กำลังทำอยู่ เร็ว ๆ นี้')
    const on2 = vi.fn()
    render(<LessonPage id="nope" parts={fixture} storage={storage} onBlocked={on2} />)
    expect(on2).toHaveBeenCalledWith(MSG_LOCKED)
  })

  it('test-out: allowed while locked, only the quiz, pass completes and goes to map', () => {
    window.location.hash = '#/lesson/f3/test-out'
    render(<LessonPage id="f3" testOut parts={fixture} storage={storage} />)
    expect(screen.queryByRole('navigation')).toBeNull()
    fireEvent.click(screen.getByText('ผ่านคำถาม-testOut'))
    expect(loadProgress(storage).completed).toEqual(['f3'])
    expect(window.location.hash).toBe('#/')
  })
})

describe('LessonPage terms', () => {
  it('คำศัพท์ใน analogy กดดูความหมายได้', () => {
    const parts: Part[] = [{ ...fixture[0], lessons: [mk('t1', 0, 1, { analogyTh: 'เหมือน IP address', terms: ['ip-address'] })] }]
    render(<LessonPage id="t1" parts={parts} storage={memoryStorage()} />)
    expect(screen.getByRole('button', { name: 'IP address' })).toBeInTheDocument()
  })
})
