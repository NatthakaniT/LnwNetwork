import type { CSSProperties } from 'react'
import { courses } from '../content/courses'
import { dayKey, loadProgress, percentComplete, progressText, totalLessons } from '../progress/progress'
import { badges, courseXp, levelOf, playerStats, studyCalendar } from '../game/game'
import { PART_COLORS } from '../ui/contrast'
import { studyTime } from '../ui/studyTime'
import './map.css'

interface Props {
  storage?: Storage
  notice?: string | null
  onDismissNotice?: () => void
  /** วันนี้ 'YYYY-MM-DD' (เทสส่งมาเองได้) */
  today?: string
}

// ชื่อเดือนย่อ ติดไว้ที่วันที่ 1 ในตารางวันเรียน ให้รู้ว่าข้ามเดือนตรงไหน
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

/** หน้าแรก:สถานะผู้เล่น (เลเวล XP streak เหรียญ) แล้วตามด้วยการ์ดเลือกวิชา */
export function CoursePicker({ storage, notice, onDismissNotice, today = dayKey() }: Props) {
  const list = courses.map((course) => ({ course, progress: loadProgress(storage, course.storageKey) }))
  const stats = playerStats(list, today)
  const calendar = studyCalendar(list.flatMap((x) => x.progress.days ?? []), today)
  const lv = levelOf(stats.xp)
  const allBadges = badges(stats)
  const got = allBadges.filter((b) => b.unlocked).length

  return (
    <main className="map-page map-page--home tech-bg">
      {notice && (
        <p className="notice pop-in" role="status">
          <span>{notice}</span>
          <button type="button" className="btn small" onClick={onDismissNotice}>ปิด</button>
        </p>
      )}
      <header className="map-head">
        <p className="hud-tag rise"><span className="dot" aria-hidden="true" />LnwNetwork // player online</p>
        <h1 className="rise">อยากเรียนอะไรดี <span className="h1-line">เลือกวิชาได้เลย</span></h1>
      </header>

      <section className="hud-stats rise d1" aria-label="สถานะผู้เล่น">
        <div className="stat stat-level">
          <span className="stat-label">Level</span>
          <strong className="stat-value">LV {lv.level}</strong>
          <div className="bar" role="progressbar" aria-label="XP ไปเลเวลถัดไป" aria-valuemin={0} aria-valuemax={lv.need} aria-valuenow={lv.into}>
            <div style={{ width: `${(lv.into / lv.need) * 100}%` }} />
          </div>
          <span className="stat-sub">{lv.into} / {lv.need} XP ไปเลเวลถัดไป</span>
        </div>
        <div className="stat">
          <span className="stat-label">Streak</span>
          <strong className="stat-value">🔥 {stats.streak}</strong>
          <span className="stat-sub">วันติดกัน · ดีที่สุด {stats.bestStreak}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total XP</span>
          <strong className="stat-value">{stats.xp.toLocaleString('th-TH')}</strong>
          <span className="stat-sub">ผ่านแล้ว {stats.completed} บท</span>
        </div>
        <div className="stat">
          <span className="stat-label">Badges</span>
          <strong className="stat-value">{got}/{allBadges.length}</strong>
          <span className="stat-sub">เหรียญที่ปลดล็อก</span>
        </div>
      </section>

      <h2 className="hud-section">Select course</h2>
      <div className="map course-grid">
        {list.map(({ course: c, progress: p }, i) => {
          const color = PART_COLORS[(i * 3) % 7] // สีการ์ดยืมสีภาค ให้แต่ละวิชาสีไม่ชนกัน
          const style = { '--part': color.bg, '--part-fg': color.fg } as CSSProperties
          const started = p.completed.length > 0 || !!p.lastLesson
          return (
            <a key={c.id} className="part-card course-card rise" href={`#/c/${c.id}`} style={style}>
              <div className="part-top">
                <small className="part-no">Course {String(i + 1).padStart(2, '0')}</small>
                <span className="course-lv">LV {levelOf(courseXp(c.parts, p)).level}</span>
              </div>
              <h2>{c.titleTh}</h2>
              <div className="why">{c.taglineTh}</div>
              <div className="course-meta">
                <p className="course-count">{progressText(c.parts, p)}</p>
                <p className="course-time">⏱ {studyTime(c.parts.flatMap((pt) => pt.lessons))}</p>
              </div>
              <div className="bar" role="progressbar" aria-label={`ความคืบหน้า ${c.titleTh}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentComplete(c.parts, p)}>
                <div style={{ width: `${percentComplete(c.parts, p)}%` }} />
              </div>
              <span className="course-go" aria-hidden="true">▶ {started ? 'เล่นต่อ' : 'เริ่มเล่น'}</span>
            </a>
          )
        })}
      </div>

      <h2 className="hud-section">Study log</h2>
      <section className="study-log rise" aria-label="วันที่เข้ามาเรียน">
        <table className="study-cal">
          <caption>
            🔥 เรียนติดกัน {stats.streak} วัน · {calendar.flat().filter((c) => c.studied).length} วันใน {calendar.length} สัปดาห์ล่าสุด
          </caption>
          <thead>
            <tr>{['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((d) => <th key={d} scope="col">{d}</th>)}</tr>
          </thead>
          <tbody>
            {calendar.map((week) => (
              <tr key={week[0].day}>
                {week.map((c) => (
                  <td
                    key={c.day}
                    className={`${c.studied ? 'on' : ''}${c.today ? ' today' : ''}${c.future ? ' future' : ''}`}
                    aria-label={`${c.day}${c.today ? ' วันนี้' : ''} ${c.studied ? 'เรียนแล้ว' : c.future ? 'ยังไม่ถึง' : 'ไม่ได้เรียน'}`}
                  >
                    {c.date}{c.date === 1 && <small> {MONTHS[Number(c.day.slice(5, 7)) - 1]}</small>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <h2 className="hud-section">Achievements</h2>
      <ul className="badges" aria-label="เหรียญรางวัล">
        {allBadges.map((b) => (
          <li key={b.id} className={`badge-item rise${b.unlocked ? ' on' : ''}`}>
            <span className="badge-icon" aria-hidden="true">{b.icon}</span>
            <span className="badge-code">{b.unlocked ? b.code : `🔒 ${b.code}`}</span>
            <span className="badge-title">{b.titleTh}{b.unlocked ? '' : ' (ยังไม่ได้)'}</span>
            <span className="badge-how">{b.howTh}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
