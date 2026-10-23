import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { QuizQuestion } from '../content/types'
import { RichText } from '../glossary/RichText'
import { grade, isCorrect } from './grade'
import './quiz.css'

type Shuffle = <T>(xs: T[]) => T[]

function fisherYates<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function Highlighted({ text, keywords }: { text: string; keywords?: string[] }) {
  if (!keywords || keywords.length === 0) return <>{text}</>
  const alt = [...keywords].sort((a, b) => b.length - a.length).map(escapeRe).join('|')
  const re = new RegExp(`(?<![A-Za-z0-9_])(${alt})(?![A-Za-z0-9_])`, 'g')
  const parts = text.split(re) // ตำแหน่งคี่ = คำที่ตรง
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <mark key={i}>{p}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </>
  )
}

// th ก่อน en; ถ้าส่ง shuffle มา จะสลับลำดับตัวเลือกในแต่ละข้อ
function order(questions: QuizQuestion[], shuffle?: Shuffle): QuizQuestion[] {
  const th = questions.filter((q) => q.layer === 'th')
  const en = questions.filter((q) => q.layer === 'en')
  const withChoices = (q: QuizQuestion) => (shuffle ? { ...q, choices: shuffle(q.choices) } : q)
  return [...th, ...en].map(withChoices)
}

export interface QuizViewProps {
  questions: QuizQuestion[]
  onPass: () => void
  mode?: 'lesson' | 'testOut'
  shuffle?: Shuffle
  termIds?: string[]
}

export function QuizView({ questions, onPass, mode = 'lesson', shuffle = fisherYates, termIds = [] }: QuizViewProps) {
  const [list, setList] = useState(() => order(questions))
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [showTh, setShowTh] = useState(false)
  const [done, setDone] = useState(false)
  const passedRef = useRef(false)

  const result = useMemo(() => grade(list, answers), [list, answers])

  useEffect(() => {
    if (done && result.passed && !passedRef.current) {
      passedRef.current = true
      onPass()
    }
  }, [done, result.passed, onPass])

  if (list.length === 0) return null

  const resetQuestion = () => {
    setSelected([])
    setSubmitted(false)
    setShowTh(false)
  }

  if (done) {
    return (
      <section className="quiz">
        <h2 className="quiz-score">ได้ {result.correct} จาก {result.total} ข้อ</h2>
        {result.passed ? (
          <p>เก่งมาก ผ่านแล้ว!</p>
        ) : (
          <>
            <p>ยังไม่ผ่านนะ ต้องถูกอย่างน้อย 80% ลองอีกรอบได้เลย</p>
            <button
              type="button"
              className="quiz-btn"
              onClick={() => {
                setList(order(questions, shuffle))
                setAnswers({})
                setIndex(0)
                setDone(false)
                resetQuestion()
              }}
            >
              ลองใหม่
            </button>
          </>
        )}
      </section>
    )
  }

  const q = list[index]
  const need = q.correct.length
  const multi = need >= 2
  const ok = submitted && isCorrect(q, selected)
  const last = index === list.length - 1

  const toggle = (id: string) => {
    if (submitted) return
    if (!multi) return setSelected([id])
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < need ? [...s, id] : s))
  }

  return (
    <section className="quiz">
      {index === 0 && (
        <p className="quiz-intro">
          {mode === 'testOut' ? 'ถ้าตอบผ่าน จะข้ามบทนี้ได้เลย ต้องถูกอย่างน้อย 80%' : 'ตอบให้ถูกอย่างน้อย 80% ถึงจะผ่านบทนี้'}
        </p>
      )}
      <p className="quiz-count">ข้อ {index + 1} จาก {list.length}</p>
      <h3 className="quiz-prompt" lang={q.layer === 'en' ? 'en' : 'th'}>
        {q.layer === 'en'
          ? <Highlighted text={q.prompt} keywords={q.keywords} />
          : <RichText text={q.prompt} termIds={termIds} />}
      </h3>
      {q.layer === 'en' && q.promptTh && (
        <>
          <button type="button" className="quiz-link" onClick={() => setShowTh((v) => !v)}>
            {showTh ? 'ซ่อนคำแปลไทย' : 'ดูคำแปลไทย'}
          </button>
          {showTh && <p className="quiz-translation">{q.promptTh}</p>}
        </>
      )}
      {multi && <p className="quiz-hint">เลือก {need} ข้อ</p>}
      <div className="quiz-choices" role="group">
        {q.choices.map((c) => {
          const on = selected.includes(c.id)
          const state = submitted ? (q.correct.includes(c.id) ? 'right' : on ? 'wrong' : '') : ''
          return (
            <button
              key={c.id}
              type="button"
              className={`quiz-choice ${on ? 'on' : ''} ${state}`}
              aria-pressed={on}
              disabled={submitted}
              onClick={() => toggle(c.id)}
            >
              <span className="quiz-mark" aria-hidden="true">{multi ? (on ? '☑' : '☐') : on ? '◉' : '○'}</span>
              <span>
                <span lang={q.layer === 'en' ? 'en' : 'th'}>{c.text}</span>
                {showTh && c.textTh && <span className="quiz-choice-th">{c.textTh}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {!submitted ? (
        <button
          type="button"
          className="quiz-btn"
          disabled={selected.length !== need}
          onClick={() => {
            setSubmitted(true)
            setAnswers((a) => ({ ...a, [q.id]: selected }))
          }}
        >
          ส่งคำตอบ
        </button>
      ) : (
        <>
          <p className={ok ? 'quiz-ok' : 'quiz-bad'}>{ok ? 'ถูกแล้ว!' : 'ยังไม่ถูกนะ'}</p>
          {!ok && <p className="quiz-explain"><RichText text={q.explainTh} termIds={termIds} /></p>}
          <button
            type="button"
            className="quiz-btn"
            onClick={() => {
              if (last) setDone(true)
              else setIndex(index + 1)
              resetQuestion()
            }}
          >
            {last ? 'ดูคะแนน' : 'ข้อต่อไป'}
          </button>
        </>
      )}
    </section>
  )
}
