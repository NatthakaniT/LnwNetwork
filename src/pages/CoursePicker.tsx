import type { CSSProperties } from 'react'
import { courses } from '../content/courses'
import { countCompleted, loadProgress, percentComplete, totalLessons } from '../progress/progress'
import { PART_COLORS } from '../ui/contrast'
import './map.css'

interface Props {
  storage?: Storage
  notice?: string | null
  onDismissNotice?: () => void
}

/** หน้าแรก: เลือกวิชา การ์ดละวิชา พร้อมความคืบหน้าของวิชานั้น */
export function CoursePicker({ storage, notice, onDismissNotice }: Props) {
  return (
    <main className="map-page map-page--home">
      {notice && (
        <p className="notice pop-in" role="status">
          <span>{notice}</span>
          <button type="button" className="btn small" onClick={onDismissNotice}>ปิด</button>
        </p>
      )}
      <header className="map-head">
        <h1 className="rise">อยากเรียนอะไรดี <span className="h1-line">เลือกวิชาได้เลย</span></h1>
      </header>
      <div className="map">
        {courses.map((c, i) => {
          const p = loadProgress(storage, c.storageKey)
          const color = PART_COLORS[(i * 3) % 7] // สีการ์ดยืมสีภาค ให้แต่ละวิชาสีไม่ชนกัน
          const style = { '--part': color.bg, '--part-fg': color.fg } as CSSProperties
          return (
            <a key={c.id} className="part-card course-card rise" href={`#/c/${c.id}`} style={style}>
              <h2>{c.titleTh}</h2>
              <div className="why">{c.taglineTh}</div>
              <p className="course-count">เรียนแล้ว {countCompleted(c.parts, p)} จาก {totalLessons(c.parts)} บท</p>
              <div className="bar" role="progressbar" aria-label={`ความคืบหน้า ${c.titleTh}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentComplete(c.parts, p)}>
                <div style={{ width: `${percentComplete(c.parts, p)}%` }} />
              </div>
            </a>
          )
        })}
      </div>
    </main>
  )
}
