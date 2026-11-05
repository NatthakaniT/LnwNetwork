import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ccna } from '../content/courses'
import type { Course, Lesson, Part } from '../content/types'
import { countCompleted, firstOpenLesson, isUnlocked, loadProgress, percentComplete, totalLessons } from '../progress/progress'
import { PART_COLORS } from '../ui/contrast'
import { stickerText } from '../ui/sticker'
import { studyTime } from '../ui/studyTime'
import { clearedParts, courseXp, levelOf, stars } from '../game/game'

/** ★★☆ ของบทที่ผ่านแล้ว */
function Stars({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="stars" aria-label={`${n} ดาว`}>
      {'★'.repeat(n)}<span className="off" aria-hidden="true">{'★'.repeat(3 - n)}</span>
    </span>
  )
}
import './map.css'

interface Props {
  course?: Course
  parts?: Part[]
  storage?: Storage
  notice?: string | null
  onDismissNotice?: () => void
}

type ChipState = 'done' | 'now' | 'lock' | 'building'

export function CourseMap({ course = ccna, parts = course.parts, storage, notice, onDismissNotice }: Props) {
  const [progress] = useState(() => loadProgress(storage, course.storageKey))
  const pct = percentComplete(parts, progress)
  const total = totalLessons(parts)
  const doneCount = countCompleted(parts, progress)
  const started = !!progress.lastLesson || progress.completed.length > 0
  const continueId = started ? firstOpenLesson(parts, progress) : undefined
  const lv = levelOf(courseXp(parts, progress))
  const readyCount = parts.flatMap((p) => p.lessons).filter((l) => l.status === 'ready').length
  const starCount = progress.completed
    .filter((id) => parts.some((p) => p.lessons.some((l) => l.id === id)))
    .reduce((s, id) => s + stars(progress.scores?.[id]), 0)

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
    <main className="map-page map-page--home tech-bg">
      {notice && (
        <p className="notice pop-in" role="status">
          <span>{notice}</span>
          <button type="button" className="btn small" onClick={onDismissNotice}>ปิด</button>
        </p>
      )}
      <header className="map-head">
        <span className="sticker">{stickerText(parts, progress)}</span>
        <p className="hud-tag rise"><span className="dot" aria-hidden="true" />Stage select // {course.id}</p>
        <h1 className="rise">เรียน {course.titleTh} <span className="h1-line">{course.taglineTh}</span></h1>
        <p className="map-progress-text rise d1">เรียนแล้ว {doneCount} จาก {total} บท</p>
        <div className="bar rise d1" role="progressbar" aria-label="ความคืบหน้า" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="map-actions rise d2">
          {continueId && <a className="btn primary" href={`#/lesson/${continueId}`}>เรียนต่อ</a>}
          <a className="btn" href="#/">← เลือกวิชา</a>
          <a className="btn" href={`#/c/${course.id}/glossary`}>📖 คลังศัพท์</a>
        </p>
      </header>
      <section className="hud-stats rise d2" aria-label={`สถานะในวิชา ${course.titleTh}`}>
        <div className="stat stat-level">
          <span className="stat-label">Level</span>
          <strong className="stat-value">LV {lv.level}</strong>
          <span className="stat-sub">{lv.into} / {lv.need} XP ไปเลเวลถัดไป</span>
        </div>
        <div className="stat">
          <span className="stat-label">Stars</span>
          <strong className="stat-value">★ {starCount}/{readyCount * 3}</strong>
          <span className="stat-sub">เต็มได้ 3 ดาว · 90% ได้ 2 ดาว</span>
        </div>
        <div className="stat">
          <span className="stat-label">Stages cleared</span>
          <strong className="stat-value">{clearedParts(parts, progress)}/{parts.length}</strong>
          <span className="stat-sub">ภาคที่ผ่านครบทุกบทที่เปิดแล้ว</span>
        </div>
      </section>
      <div className="map">
        {parts.map((p) => {
          const states = p.lessons.map(stateOf)
          const locked = !states.some((s) => s === 'done' || s === 'now')
          const cleared = states.includes('done') && !states.some((s) => s === 'now' || s === 'lock')
          return (
            <section className={`part part-card rise${locked ? ' locked' : ''}`} key={p.part} style={partStyle(p.part)}>
              <div className="part-top">
                <small className="part-no">Stage {String(p.part).padStart(2, '0')} · ภาค {p.part}</small>
                {locked && <span className="lock-pill">🔒 ยังไม่ถึง</span>}
                {cleared && <span className="clear-pill">✓ Cleared</span>}
              </div>
              <h2>{p.titleTh}</h2>
              <div className="why">{p.examDomain}</div>
              <div className="part-time">⏱ {studyTime(p.lessons.length)}</div>
              <div className="ls">
                {p.lessons.map((l, i) => {
                  const s = states[i]
                  if (s === 'done') return <a key={l.id} className="l done" href={`#/lesson/${l.id}`}>✅ {label(l)} <Stars n={stars(progress.scores?.[l.id])} /></a>
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
