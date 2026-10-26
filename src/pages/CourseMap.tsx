import { useState } from 'react'
import type { CSSProperties } from 'react'
import { course } from '../content'
import type { Lesson, Part } from '../content/types'
import { countCompleted, firstOpenLesson, isUnlocked, loadProgress, percentComplete, totalLessons } from '../progress/progress'
import { navigate } from '../router'
import { PART_COLORS } from '../ui/contrast'
import { stickerText } from '../ui/sticker'
import './map.css'

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
  const total = totalLessons(parts)
  const doneCount = countCompleted(parts, progress)
  const started = !!progress.lastLesson || progress.completed.length > 0
  const continueId = started ? firstOpenLesson(parts, progress) : undefined

  const stateOf = (l: Lesson): ChipState => {
    if (l.status !== 'ready') return 'building'
    if (progress.completed.includes(l.id)) return 'done'
    return isUnlocked(l.id, parts, progress) ? 'now' : 'lock'
  }

  const label = (l: Lesson) => (l.analogyTh ? `${l.titleTh} (${l.analogyTh})` : l.titleTh)

  const partStyle = (n: number) => {
    const c = PART_COLORS[n] ?? PART_COLORS[((n % 7) + 7) % 7]
    return { '--part': c.bg, '--part-fg': c.fg } as CSSProperties
  }

  return (
    <main className="map-page map-page--home">
      {notice && (
        <p className="notice pop-in" role="status">
          <span>{notice}</span>
          <button type="button" className="btn small" onClick={onDismissNotice}>ปิด</button>
        </p>
      )}
      <header className="map-head">
        <span className="sticker">{stickerText(parts, progress)}</span>
        <h1 className="rise">เรียน CCNA <span className="h1-line">แบบเข้าใจจริง</span></h1>
        <p className="map-progress-text rise d1">เรียนแล้ว {doneCount} จาก {total} บท</p>
        <div className="bar rise d1" role="progressbar" aria-label="ความคืบหน้า" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="map-actions rise d2">
          {continueId && <a className="btn primary" href={`#/lesson/${continueId}`}>เรียนต่อ</a>}
          <a className="btn" href="#/glossary">📖 คลังศัพท์</a>
        </p>
      </header>
      <div className="map">
        {parts.map((p) => {
          const states = p.lessons.map(stateOf)
          const locked = !states.some((s) => s === 'done' || s === 'now')
          return (
            <section className={`part part-card rise${locked ? ' locked' : ''}`} key={p.part} style={partStyle(p.part)}>
              <div className="part-top">
                <small className="part-no">ภาค {p.part}</small>
                {locked && <span className="lock-pill">🔒 ยังไม่ถึง</span>}
              </div>
              <h2>{p.titleTh}</h2>
              <div className="why">{p.examDomain}</div>
              <div className="ls">
                {p.lessons.map((l, i) => {
                  const s = states[i]
                  if (s === 'done') return <a key={l.id} className="l done" href={`#/lesson/${l.id}`}>✅ {label(l)}</a>
                  if (s === 'now') return <a key={l.id} className="l now" href={`#/lesson/${l.id}`}>▶ {label(l)}</a>
                  if (s === 'building') {
                    return <span key={l.id} className="l building">{label(l)} <small>กำลังทำ</small></span>
                  }
                  return <span key={l.id} className="l lock">🔒 {label(l)}</span>
                })}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
