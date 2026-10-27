import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { course } from '../content'
import type { Lesson, Part, QuizQuestion } from '../content/types'
import { QuizView } from '../quiz/QuizView'
import { ScenePlayer } from '../scenes/ScenePlayer'
import { Bits8 } from '../tryit/Bits8'
import { LabView } from '../lab/LabView'
import { ActivityView } from '../lab/ActivityView'
import { isUnlocked, loadProgress, markCompleted, saveProgress } from '../progress/progress'
import type { Progress, StepKey } from '../progress/progress'
import { navigate } from '../router'
import { VideoStep } from './VideoStep'
import { PrecheckStep } from './PrecheckStep'
import { RichText } from '../glossary/RichText'
import { AskTutor } from '../tutor/AskTutor'
import { tutorPrompt } from '../tutor/tutorPrompt'
import { PART_COLORS } from '../ui/contrast'
import './lesson.css'

export const MSG_LOCKED = 'ต้องเรียนบทก่อนหน้าก่อนนะ'
export const MSG_BUILDING = 'บทนี้กำลังทำอยู่ เร็ว ๆ นี้'

const NO_TERMS: string[] = []

/** สีของภาคบนหน้าบทเรียน: ปุ่มหลักและแท็บขั้นปัจจุบันใช้ --part (ตัวหนังสือ --part-fg) */
function partVars(n: number): CSSProperties {
  const c = PART_COLORS[n] ?? PART_COLORS[((n % 7) + 7) % 7]
  return { '--part': c.bg, '--part-fg': c.fg } as CSSProperties
}

const BASE_STEPS: { key: StepKey; label: string }[] = [
  { key: 'video', label: 'ดูคลิป' },
  { key: 'scenes', label: 'ดูภาพทบทวน' },
  { key: 'lab', label: 'ลองเล่น' },
  { key: 'quiz', label: 'ตอบคำถาม' },
]
const CHECK_STEP = { key: 'check' as StepKey, label: 'เช็กพื้นฐาน' }

interface Props {
  id: string
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
export function LessonPage({ id, parts = course, storage, onBlocked }: Props) {
  const lesson = findLesson(parts, id)
  const [progress0] = useState(() => loadProgress(storage))

  let blocked: string | null = null
  if (!lesson) blocked = MSG_LOCKED
  else if (lesson.status !== 'ready' || !lesson.quiz || lesson.quiz.length === 0) blocked = MSG_BUILDING
  else if (!isUnlocked(id, parts, progress0)) blocked = MSG_LOCKED

  useEffect(() => {
    if (!blocked) return
    onBlocked?.(blocked)
    navigate('#/')
  }, [blocked, onBlocked])

  if (blocked || !lesson) return null
  return <LessonBody lesson={lesson} parts={parts} storage={storage} initial={progress0} />
}

function LessonBody({ lesson, parts, storage, initial }: { lesson: Lesson; parts: Part[]; storage?: Storage; initial: Progress }) {
  const progressRef = useRef(initial)
  // ขั้นเช็กพื้นฐานมีเฉพาะบทที่มี precheck
  const steps = lesson.precheck && lesson.precheck.length > 0 ? [CHECK_STEP, ...BASE_STEPS] : BASE_STEPS
  const completedAtStart = initial.completed.includes(lesson.id)
  const startIdx =
    initial.lastLesson === lesson.id && initial.lastStep
      ? Math.max(0, steps.findIndex((s) => s.key === initial.lastStep))
      : 0

  const [stepIdx, setStepIdx] = useState(startIdx)
  // ขั้นที่ทำเสร็จแล้ว: คลิปถือว่าเสร็จเสมอ; กลับมาที่ขั้นไหน ขั้นก่อนหน้าถือว่าผ่านแล้ว
  const [done, setDone] = useState<Set<StepKey>>(() => {
    const s = new Set<StepKey>(['check', 'video'])
    steps.slice(0, startIdx).forEach((st) => s.add(st.key))
    if (completedAtStart) steps.forEach((st) => s.add(st.key))
    return s
  })
  // ขั้นภาพทบทวนเสร็จเมื่อดูฉากจบ และทำ tryIt ครบ (ถ้าบทมี)
  const [fin, setFin] = useState({ scenes: false, tryIt: !lesson.tryIt })
  const [passed, setPassed] = useState(completedAtStart)
  const [wrongPrompt, setWrongPrompt] = useState<string>()

  const termIds = lesson.terms ?? NO_TERMS
  const markDone = useCallback((k: StepKey) => setDone((d) => (d.has(k) ? d : new Set(d).add(k))), [])
  const step = steps[stepIdx].key

  useEffect(() => {
    const p = { ...progressRef.current, lastLesson: lesson.id, lastStep: step }
    progressRef.current = p
    saveProgress(p, storage)
  }, [lesson.id, step, storage])

  // ขั้นที่บทไม่มีเนื้อหา ถือว่าผ่านเอง
  const missing: Partial<Record<StepKey, boolean>> = { scenes: !lesson.scenes, lab: !lesson.lab }
  const isDone = (k: StepKey) => done.has(k) || !!missing[k]
  const canOpen = (i: number) => steps.slice(0, i).every((s) => isDone(s.key))

  useEffect(() => { if (fin.scenes && fin.tryIt) markDone('scenes') }, [fin, markDone])
  const onScenesFinished = useCallback(() => setFin((f) => ({ ...f, scenes: true })), [])
  const onTryItDone = useCallback(() => setFin((f) => ({ ...f, tryIt: true })), [])
  const onLabDone = useCallback(() => markDone('lab'), [markDone])
  const onQuizPass = useCallback(() => {
    const p = markCompleted(lesson.id, progressRef.current)
    progressRef.current = p
    saveProgress(p, storage)
    markDone('quiz')
    setPassed(true)
  }, [lesson.id, storage, markDone])

  // ข้อภาษาอังกฤษใช้โจทย์ไทยถ้ามี เพราะผู้เรียนคุยกับครูเป็นภาษาไทย
  const onQuizWrong = useCallback((q: QuizQuestion) => setWrongPrompt((q.layer === 'en' && q.promptTh) || q.prompt), [])

  const tutorText = tutorPrompt({ lessonTitle: lesson.titleTh, stepLabel: steps[stepIdx].label, wrongPrompt })
  const next = passed ? nextReadyLesson(parts, lesson.id) : undefined
  const nextOpen = next && isUnlocked(next.id, parts, progressRef.current) ? next : undefined

  return (
    <main className="lesson-page" style={partVars(lesson.part)}>
      <p className="lesson-back rise"><a href="#/">← กลับแผนที่</a></p>
      <header className="lesson-head rise d1">
        <h1>{lesson.titleTh}</h1>
        {lesson.analogyTh && <p className="analogy"><RichText text={lesson.analogyTh} termIds={termIds} /></p>}
        {lesson.requires && lesson.requires.length > 0 && (
          <div className="requires-box">
            <h2>เรื่องนี้ต่อจาก…</h2>
            <ul>
              {lesson.requires.map((r) => (
                <li key={r.lesson}>
                  <a href={`#/lesson/${r.lesson}`}>{findLesson(parts, r.lesson)?.titleTh ?? r.lesson}</a> · <RichText text={r.useTh} termIds={termIds} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {lesson.ciscoModules.length > 0 && (
          <span className="badge">ตรงกับ Cisco: {lesson.ciscoModules.join(', ')}</span>
        )}
      </header>

      <nav className="steps rise d2" aria-label="ขั้นของบทเรียน" style={{ '--n': steps.length } as CSSProperties}>
        <span className="steps-indicator" aria-hidden="true" style={{ '--i': stepIdx } as CSSProperties} />
        {steps.map((s, i) => (
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

      {/* key ตามขั้น: เปลี่ยนขั้นแล้วสร้างใหม่ จึงลอยขึ้น (.rise) ทุกครั้ง */}
      <section key={step} className="step-body rise">
        {step === 'check' && (
          <PrecheckStep questions={lesson.precheck!} requires={lesson.requires ?? []} parts={parts} termIds={termIds} onDone={() => setStepIdx(stepIdx + 1)} />
        )}
        {step === 'video' && <VideoStep videos={lesson.videos} termIds={termIds} onNext={() => setStepIdx(stepIdx + 1)} />}
        {step === 'scenes' && (lesson.scenes
          ? <ScenePlayer lessonId={lesson.id} set={lesson.scenes} termIds={termIds} onFinished={onScenesFinished} />
          : <p>บทนี้ไม่มีภาพทบทวน ไปขั้นต่อไปได้เลย</p>)}
        {step === 'scenes' && lesson.tryIt && <Bits8 tryIt={lesson.tryIt} onDone={onTryItDone} />}
        {step === 'lab' && (lesson.lab
          ? (lesson.lab.kind === 'network'
            ? <LabView lab={lesson.lab} termIds={termIds} onDone={onLabDone} />
            : <ActivityView lab={lesson.lab} termIds={termIds} onDone={onLabDone} />)
          : <p>บทนี้ไม่มีให้ลองเล่น ไปขั้นต่อไปได้เลย</p>)}
        {step === 'quiz' && <QuizView key={lesson.id} questions={lesson.quiz!} termIds={termIds} onPass={onQuizPass} onWrong={onQuizWrong} />}
      </section>

      {step !== 'check' && step !== 'video' && step !== 'quiz' && (
        <p className="step-nav">
          <button type="button" className="btn primary" disabled={!isDone(step)} onClick={() => setStepIdx(stepIdx + 1)}>
            ไปขั้นต่อไป
          </button>
        </p>
      )}
      {stepIdx > 0 && (
        <p className="step-nav"><button type="button" className="btn" onClick={() => setStepIdx(stepIdx - 1)}>ย้อนกลับ</button></p>
      )}

      {lesson.deepDives?.map((d) => (
        <details key={d.titleTh} className="deep-dive">
          <summary>อยากรู้ลึก: {d.titleTh}</summary>
          <p><RichText text={d.bodyTh} termIds={termIds} /></p>
          <p className="deep-skip">ไม่รู้เรื่องนี้ก็เรียนต่อได้</p>
        </details>
      ))}

      {passed && step === 'quiz' && (
        <p className="pass-box">
          เก่งมาก ผ่านบทนี้แล้ว{' '}
          {nextOpen
            ? <a className="btn primary" href={`#/lesson/${nextOpen.id}`}>ไปบทถัดไป</a>
            : <a className="btn primary" href="#/">กลับไปแผนที่</a>}
        </p>
      )}
      {/* key: ข้อความเปลี่ยน (เปลี่ยนขั้น/ตอบผิด) ป้าย "คัดลอกแล้ว" จึงเริ่มใหม่ */}
      <AskTutor key={tutorText} text={tutorText} />
    </main>
  )
}
