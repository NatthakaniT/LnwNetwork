import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const sceneProps: { set?: unknown }[] = []
vi.mock('../scenes/ScenePlayer', () => ({
  ScenePlayer: (p: { set: unknown; onFinished: () => void }) => { sceneProps.push(p); return <button onClick={p.onFinished}>จบฉาก</button> },
}))
vi.mock('../lab/LabView', () => ({ LabView: (p: { onDone: () => void }) => <button onClick={p.onDone}>จบแล็บเครือข่าย</button> }))
vi.mock('../lab/ActivityView', () => ({ ActivityView: (p: { onDone: () => void }) => <button onClick={p.onDone}>จบกิจกรรม</button> }))
vi.mock('../quiz/QuizView', () => ({
  QuizView: (p: { onPass: () => void }) => <button onClick={p.onPass}>ผ่านคำถาม</button>,
}))

import { LessonPage, MSG_LOCKED, MSG_BUILDING } from './LessonPage'
import { fixture, mk, memoryStorage } from './fixture'
import { loadProgress, saveProgress } from '../progress/progress'
import type { NetworkLab, Part } from '../content/types'
import { PART_COLORS } from '../ui/contrast'

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
    fireEvent.click(screen.getByText('ผ่านคำถาม'))
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
    fireEvent.click(screen.getByText('ผ่านคำถาม'))
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

  it('a lesson already completed opens even if the previous one is not completed', () => {
    saveProgress({ version: 1, completed: ['f3'] }, storage)
    const onBlocked = vi.fn()
    render(<LessonPage id="f3" parts={fixture} storage={storage} onBlocked={onBlocked} />)
    expect(onBlocked).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('บท f3')
  })
})

describe('LessonPage terms', () => {
  it('คำศัพท์ใน analogy กดดูความหมายได้', () => {
    const parts: Part[] = [{ ...fixture[0], lessons: [mk('t1', 0, 1, { analogyTh: 'เหมือน IP address', terms: ['ip-address'] })] }]
    render(<LessonPage id="t1" parts={parts} storage={memoryStorage()} />)
    expect(screen.getByRole('button', { name: 'IP address' })).toBeInTheDocument()
  })
})

describe('LessonPage shell', () => {
  const p4: Part[] = [{ part: 4, titleTh: 'ภาค 4', examDomain: 'e', lessons: [mk('q1', 4, 1)] }]

  it('.lesson-page ใช้สีของภาค (--part / --part-fg)', () => {
    const { container } = render(<LessonPage id="q1" parts={p4} storage={storage} />)
    const page = container.querySelector('.lesson-page') as HTMLElement
    expect(page.style.getPropertyValue('--part')).toBe(PART_COLORS[4].bg)
    expect(page.style.getPropertyValue('--part-fg')).toBe(PART_COLORS[4].fg)
  })

  it('แถบบอกขั้นปัจจุบัน .steps-indicator เลื่อนตาม --i', () => {
    const { container } = render(<LessonPage id="f1" parts={fixture} storage={storage} />)
    const ind = () => container.querySelector('.steps-indicator') as HTMLElement
    expect(ind()).toHaveAttribute('aria-hidden', 'true')
    expect(ind().style.getPropertyValue('--i')).toBe('0')
    fireEvent.click(nextBtn())
    expect(ind().style.getPropertyValue('--i')).toBe('1')
    fireEvent.click(tab('1. ดูคลิป'))
    expect(ind().style.getPropertyValue('--i')).toBe('0')
  })

  it('เปลี่ยนขั้นแล้ว .step-body สร้างใหม่ (เล่น .rise อีกครั้ง)', () => {
    const { container } = render(<LessonPage id="f1" parts={fixture} storage={storage} />)
    const first = container.querySelector('.step-body')!
    expect(first).toHaveClass('rise')
    fireEvent.click(nextBtn())
    const second = container.querySelector('.step-body')!
    expect(second).not.toBe(first)
    expect(second).toHaveClass('rise')
  })
})

describe('LessonPage foundations', () => {
  const base = mk('r1', 0, 1)
  const withReq = (extra: object) => [{ ...fixture[0], lessons: [base, mk('t1', 0, 2, { requires: [{ lesson: 'r1', useTh: 'ใช้ตอนนับบิต' }], ...extra })] }]
  const done = () => saveProgress({ version: 1, completed: ['r1'] }, storage)
  const pre = { precheck: [{ id: 'c1', layer: 'th' as const, prompt: 'ถาม', reviewLesson: 'r1', choices: [{ id: 'a', text: 'ก' }, { id: 'b', text: 'ข' }], correct: ['a'], explainTh: 'เพราะ' }] }

  it('lesson with precheck opens at เช็กพื้นฐาน and shows the requires box', () => {
    done()
    render(<LessonPage id="t1" parts={withReq(pre)} storage={storage} />)
    expect(tab('1. เช็กพื้นฐาน')).toHaveAttribute('aria-current', 'step')
    expect(tab('2. ดูคลิป')).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
    expect(tab('2. ดูคลิป')).toHaveAttribute('aria-current', 'step')
    expect(loadProgress(storage).lastStep).toBe('video')
  })
  it('requires without precheck starts at the video and shows the box', () => {
    done()
    render(<LessonPage id="t1" parts={withReq({})} storage={storage} />)
    expect(tab('1. ดูคลิป')).toHaveAttribute('aria-current', 'step')
    expect(screen.queryByText(/เช็กพื้นฐาน/)).toBeNull()
    expect(screen.getByText(/เรื่องนี้ต่อจาก/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'บท r1' })).toHaveAttribute('href', '#/lesson/r1')
    expect(screen.getByText(/ใช้ตอนนับบิต/)).toBeInTheDocument()
  })
  it('plain lesson has neither', () => {
    render(<LessonPage id="f1" parts={fixture} storage={storage} />)
    expect(screen.queryByText(/เรื่องนี้ต่อจาก/)).toBeNull()
    expect(screen.queryByText(/เช็กพื้นฐาน/)).toBeNull()
  })
  it('resumes at check from saved progress', () => {
    saveProgress({ version: 1, completed: ['r1'], lastLesson: 't1', lastStep: 'check' }, storage)
    render(<LessonPage id="t1" parts={withReq(pre)} storage={storage} />)
    expect(tab('1. เช็กพื้นฐาน')).toHaveAttribute('aria-current', 'step')
  })
  it('deep dives are closed first and open on click', () => {
    render(<LessonPage id="f1" parts={[{ ...fixture[0], lessons: [mk('f1', 0, 1, { deepDives: [{ titleTh: 'ลึกมาก', bodyTh: 'เนื้อหาลึก' }] })] }]} storage={storage} />)
    const d = screen.getByText('อยากรู้ลึก: ลึกมาก').closest('details')!
    expect(d).not.toHaveAttribute('open')
    expect(screen.getByText('ไม่รู้เรื่องนี้ก็เรียนต่อได้')).toBeInTheDocument()
    fireEvent.click(screen.getByText('อยากรู้ลึก: ลึกมาก'))
    expect(d).toHaveAttribute('open')
  })
})
