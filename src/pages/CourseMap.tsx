import { useState } from 'react'
import { course } from '../content'
import type { Lesson, Part } from '../content/types'
import { isUnlocked, loadProgress, percentComplete } from '../progress/progress'
import { navigate } from '../router'

interface Props {
  parts?: Part[]
  storage?: Storage
  notice?: string | null
  onDismissNotice?: () => void
}

type ChipState = 'done' | 'now' | 'lock' | 'building'

export function CourseMap({ parts = course, storage, notice, onDismissNotice }: Props) {
  const [progress] = useState(() => loadProgress(storage))
  const pct = percentComplete(parts, progress)
  const hasLast = !!progress.lastLesson && parts.some((p) => p.lessons.some((l) => l.id === progress.lastLesson))

  const stateOf = (l: Lesson): ChipState => {
    if (l.status !== 'ready') return 'building'
    if (progress.completed.includes(l.id)) return 'done'
    return isUnlocked(l.id, parts, progress) ? 'now' : 'lock'
  }

  const label = (l: Lesson) => (l.analogyTh ? `${l.titleTh} (${l.analogyTh})` : l.titleTh)

  return (
    <main className="map-page">
      {notice && (
        <p className="notice" role="status">
          {notice}{' '}
          <button type="button" className="btn small" onClick={onDismissNotice}>ปิด</button>
        </p>
      )}
      <header className="map-head">
        <h1>เรียน CCNA แบบเข้าใจจริง</h1>
        <p className="map-progress-text">เรียนไปแล้ว {pct}%</p>
        <div className="bar" role="progressbar" aria-label="ความคืบหน้า" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="map-actions">
          {hasLast && <a className="btn primary" href={`#/lesson/${progress.lastLesson}`}>เรียนต่อ</a>}
          <a className="btn" href="#/glossary">📖 คลังศัพท์</a>
        </p>
      </header>
      <div className="map">
        {parts.map((p) => (
          <section className="part" key={p.part}>
            <h3>ภาค {p.part} · {p.titleTh}</h3>
            <div className="why">{p.examDomain}</div>
            <div className="ls">
              {p.lessons.map((l) => {
                const s = stateOf(l)
                if (s === 'done') return <a key={l.id} className="l done" href={`#/lesson/${l.id}`}>✅ {label(l)}</a>
                if (s === 'now') return <a key={l.id} className="l now" href={`#/lesson/${l.id}`}>▶ {label(l)}</a>
                if (s === 'building') {
                  return <span key={l.id} className="l building">{label(l)} <small>กำลังทำ</small></span>
                }
                return (
                  <span key={l.id} className="l lock">
                    🔒 {label(l)}{' '}
                    <button type="button" className="btn small" onClick={() => navigate(`#/lesson/${l.id}/test-out`)}>
                      สอบข้ามบท
                    </button>
                  </span>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
