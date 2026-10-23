import { useCallback, useEffect, useRef, useState } from 'react'
import { course } from '../content'
import type { Lesson, Part } from '../content/types'
import { QuizView } from '../quiz/QuizView'
import { ScenePlayer } from '../scenes/ScenePlayer'
import { LabView } from '../lab/LabView'
import { ActivityView } from '../lab/ActivityView'
import { isUnlocked, loadProgress, markCompleted, saveProgress } from '../progress/progress'
import type { Progress, StepKey } from '../progress/progress'
import { navigate } from '../router'
import { VideoStep } from './VideoStep'
import { RichText } from '../glossary/RichText'

export const MSG_LOCKED = 'ต้องเรียนบทก่อนหน้าก่อนนะ'
export const MSG_BUILDING = 'บทนี้กำลังทำอยู่ เร็ว ๆ นี้'

const NO_TERMS: string[] = []

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'video', label: 'ดูคลิป' },
  { key: 'scenes', label: 'ดูภาพทบทวน' },
  { key: 'lab', label: 'ลองเล่น' },
  { key: 'quiz', label: 'ตอบคำถาม' },
]

interface Props {
  id: string
  testOut?: boolean
  parts?: Part[]
  storage?: Storage
  onBlocked?: (message: string) => void
}

function findLesson(parts: Part[], id: string): Lesson | undefined {
  return parts.flatMap((p) => p.lessons).find((l) => l.id === id)
}

function nextReadyLesson(parts: Part[], id: string): Lesson | undefined {
  const ready = parts
    .flatMap((p) => p.lessons)
    .filter((l) => l.status === 'ready')
    .sort((a, b) => a.part - b.part || a.order - b.order)
  return ready[ready.findIndex((l) => l.id === id) + 1]
}

/** เช็กสิทธิ์เข้าบทก่อน แล้วค่อยแสดงหน้า (แยกกันเพื่อให้ hook เรียงเท่าเดิมเสมอ) */
export function LessonPage({ id, testOut = false, parts = course, storage, onBlocked }: Props) {
  const lesson = findLesson(parts, id)
  const [progress0] = useState(() => loadProgress(storage))

  let blocked: string | null = null
  if (!lesson) blocked = MSG_LOCKED
  else if (lesson.status !== 'ready' || !lesson.quiz || lesson.quiz.length === 0) blocked = MSG_BUILDING
  else if (!testOut && !isUnlocked(id, parts, progress0)) blocked = MSG_LOCKED

  useEffect(() => {
    if (!blocked) return
    onBlocked?.(blocked)
    navigate('#/')
  }, [blocked, onBlocked])

  if (blocked || !lesson) return null
  return testOut
    ? <TestOut lesson={lesson} storage={storage} />
    : <LessonBody lesson={lesson} parts={parts} storage={storage} initial={progress0} />
}

function TestOut({ lesson, storage }: { lesson: Lesson; storage?: Storage }) {
  const onPass = useCallback(() => {
    saveProgress(markCompleted(lesson.id, loadProgress(storage)), storage)
    navigate('#/')
  }, [lesson.id, storage])
  return (
    <main className="lesson-page">
      <p><a href="#/">← กลับแผนที่</a></p>
      <h1>สอบข้ามบท: {lesson.titleTh}</h1>
      <QuizView key={lesson.id} questions={lesson.quiz!} mode="testOut" termIds={lesson.terms ?? NO_TERMS} onPass={onPass} />
    </main>
  )
}

function LessonBody({ lesson, parts, storage, initial }: { lesson: Lesson; parts: Part[]; storage?: Storage; initial: Progress }) {
  const progressRef = useRef(initial)
  const completedAtStart = initial.completed.includes(lesson.id)
  const startIdx =
    initial.lastLesson === lesson.id && initial.lastStep
      ? Math.max(0, STEPS.findIndex((s) => s.key === initial.lastStep))
      : 0

  const [stepIdx, setStepIdx] = useState(startIdx)
  // ขั้นที่ทำเสร็จแล้ว: คลิปถือว่าเสร็จเสมอ; กลับมาที่ขั้นไหน ขั้นก่อนหน้าถือว่าผ่านแล้ว
  const [done, setDone] = useState<Set<StepKey>>(() => {
    const s = new Set<StepKey>(['video'])
    STEPS.slice(0, startIdx).forEach((st) => s.add(st.key))
    if (completedAtStart) STEPS.forEach((st) => s.add(st.key))
    return s
  })
  const [passed, setPassed] = useState(completedAtStart)

  const termIds = lesson.terms ?? NO_TERMS
  const markDone = useCallback((k: StepKey) => setDone((d) => (d.has(k) ? d : new Set(d).add(k))), [])
  const step = STEPS[stepIdx].key

  useEffect(() => {
    const p = { ...progressRef.current, lastLesson: lesson.id, lastStep: step }
    progressRef.current = p
    saveProgress(p, storage)
  }, [lesson.id, step, storage])

  // ขั้นที่บทไม่มีเนื้อหา ถือว่าผ่านเอง
  const missing: Partial<Record<StepKey, boolean>> = { scenes: !lesson.scenes, lab: !lesson.lab }
  const isDone = (k: StepKey) => done.has(k) || !!missing[k]
  const canOpen = (i: number) => STEPS.slice(0, i).every((s) => isDone(s.key))

  const onScenesFinished = useCallback(() => markDone('scenes'), [markDone])
  const onLabDone = useCallback(() => markDone('lab'), [markDone])
  const onQuizPass = useCallback(() => {
    const p = markCompleted(lesson.id, progressRef.current)
    progressRef.current = p
    saveProgress(p, storage)
    markDone('quiz')
    setPassed(true)
  }, [lesson.id, storage, markDone])

  const next = passed ? nextReadyLesson(parts, lesson.id) : undefined
  const nextOpen = next && isUnlocked(next.id, parts, progressRef.current) ? next : undefined

  return (
    <main className="lesson-page">
      <p><a href="#/">← กลับแผนที่</a></p>
      <header className="lesson-head">
        <h1>{lesson.titleTh}</h1>
        {lesson.analogyTh && <p className="analogy"><RichText text={lesson.analogyTh} termIds={termIds} /></p>}
        {lesson.ciscoModules.length > 0 && (
          <span className="badge">ตรงกับ Cisco: {lesson.ciscoModules.join(', ')}</span>
        )}
      </header>

      <nav className="steps" aria-label="ขั้นของบทเรียน">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`step${i === stepIdx ? ' on' : ''}`}
            aria-current={i === stepIdx ? 'step' : undefined}
            disabled={!canOpen(i)}
            onClick={() => setStepIdx(i)}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </nav>

      <section className="step-body">
        {step === 'video' && <VideoStep videos={lesson.videos} termIds={termIds} onNext={() => setStepIdx(1)} />}
        {step === 'scenes' && (lesson.scenes
          ? <ScenePlayer lessonId={lesson.id} set={lesson.scenes} termIds={termIds} onFinished={onScenesFinished} />
          : <p>บทนี้ไม่มีภาพทบทวน ไปขั้นต่อไปได้เลย</p>)}
        {step === 'lab' && (lesson.lab
          ? (lesson.lab.kind === 'network'
            ? <LabView lab={lesson.lab} termIds={termIds} onDone={onLabDone} />
            : <ActivityView lab={lesson.lab} termIds={termIds} onDone={onLabDone} />)
          : <p>บทนี้ไม่มีให้ลองเล่น ไปขั้นต่อไปได้เลย</p>)}
        {step === 'quiz' && <QuizView key={lesson.id} questions={lesson.quiz!} termIds={termIds} onPass={onQuizPass} />}
      </section>

      {step !== 'video' && step !== 'quiz' && (
        <p>
          <button type="button" className="btn primary" disabled={!isDone(step)} onClick={() => setStepIdx(stepIdx + 1)}>
            ไปขั้นต่อไป
          </button>
        </p>
      )}
      {stepIdx > 0 && (
        <p><button type="button" className="btn" onClick={() => setStepIdx(stepIdx - 1)}>ย้อนกลับ</button></p>
      )}

      {passed && step === 'quiz' && (
        <p className="pass-box">
          เก่งมาก ผ่านบทนี้แล้ว{' '}
          {nextOpen
            ? <a className="btn primary" href={`#/lesson/${nextOpen.id}`}>ไปบทถัดไป</a>
            : <a className="btn primary" href="#/">กลับไปแผนที่</a>}
        </p>
      )}
    </main>
  )
}
