import { useState } from 'react'
import type { Part, PrecheckQuestion, Requirement } from '../content/types'
import { RichText } from '../glossary/RichText'
import { isCorrect } from '../quiz/grade'
import '../quiz/quiz.css'

interface Props {
  questions: PrecheckQuestion[]
  requires: Requirement[]
  parts: Part[]
  termIds: string[]
  onDone: () => void
}

function Item({ q, requires, parts, termIds }: { q: PrecheckQuestion } & Pick<Props, 'requires' | 'parts' | 'termIds'>) {
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const need = q.correct.length
  const ok = submitted && isCorrect(q, selected)
  const review = requires.some((r) => r.lesson === q.reviewLesson)
    ? parts.flatMap((p) => p.lessons).find((l) => l.id === q.reviewLesson)
    : undefined
  const toggle = (id: string) => {
    if (submitted) return
    if (need < 2) return setSelected([id])
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < need ? [...s, id] : s))
  }
  return (
    <section className="quiz">
      <h3 className="quiz-prompt"><RichText text={q.prompt} termIds={termIds} /></h3>
      {need >= 2 && <p className="quiz-hint">เลือก {need} ข้อ</p>}
      <div className="quiz-choices" role="group">
        {q.choices.map((c) => {
          const on = selected.includes(c.id)
          const state = submitted ? (q.correct.includes(c.id) ? 'right' : on ? 'wrong' : '') : ''
          return (
            <button key={c.id} type="button" className={`quiz-choice ${on ? 'on' : ''} ${state}`} aria-pressed={on} disabled={submitted} onClick={() => toggle(c.id)}>
              <span className="quiz-mark" aria-hidden="true">{need >= 2 ? (on ? '☑' : '☐') : on ? '◉' : '○'}</span>
              <span>{c.text}</span>
              {state && <span className="quiz-verdict">{state === 'right' ? '✓' : '✗'}</span>}
            </button>
          )
        })}
      </div>
      {!submitted ? (
        <button type="button" className="quiz-btn" disabled={selected.length !== need} onClick={() => setSubmitted(true)}>ส่งคำตอบ</button>
      ) : (
        <>
          <p className={ok ? 'quiz-ok' : 'quiz-bad'}>{ok ? 'ถูกแล้ว!' : 'ยังไม่ถูกนะ'}</p>
          <p className="quiz-explain"><RichText text={q.explainTh} termIds={termIds} /></p>
          {!ok && review && <p><a href={`#/lesson/${review.id}`}>ทบทวนบท "{review.titleTh}"</a></p>}
        </>
      )}
    </section>
  )
}

/** เช็กพื้นฐานก่อนเรียน: ไม่ให้คะแนน ไม่บังคับตอบถูก กดเริ่มเรียนได้ตลอด */
export function PrecheckStep({ questions, requires, parts, termIds, onDone }: Props) {
  return (
    <div className="precheck">
      <p>ลองเช็กพื้นฐานที่บทนี้ใช้ ตอบผิดไม่เป็นไร ไม่มีคะแนน</p>
      {questions.map((q) => <Item key={q.id} q={q} requires={requires} parts={parts} termIds={termIds} />)}
      <p className="step-nav"><button type="button" className="btn primary" onClick={onDone}>เริ่มเรียน</button></p>
    </div>
  )
}
