import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { checkGitGoal } from '../gitsim/goals'
import type { GitLab } from '../gitsim/goals'
import { editFile, friendDoes, run } from '../gitsim/run'
import type { Repo, World } from '../gitsim/types'
import './lab.css'
import './gitlab.css'

interface Entry { line?: string; output?: string; explainTh?: string; ok?: boolean; note?: string }

/** commit ใน branch นี้ เรียงจากเก่าไปใหม่ (ตาม parent แรก) */
function chain(repo: Repo, branch: string): string[] {
  const out: string[] = []
  for (let id = repo.branches[branch]; id; id = repo.commits[id]?.parent ?? null) out.unshift(id)
  return out
}

/** เส้นหลักคือ main (ถ้าไม่มีใช้ branch แรกที่มี commit); branch อื่นมีเฉพาะ commit ของตัวเอง + จุดที่แยกออกมา */
function layout(repo: Repo, branches: string[]) {
  const trunk = branches.includes('main') ? 'main' : branches[0]
  const trunkIds = chain(repo, trunk)
  const onTrunk = new Set(trunkIds)
  const rows = branches.filter(b => b !== trunk).map(b => {
    const all = chain(repo, b)
    let i = all.length
    while (i > 0 && !onTrunk.has(all[i - 1])) i--
    return { name: b, own: all.slice(i), fork: i > 0 ? all[i - 1] : null }
  })
  return { trunk, trunkIds, rows }
}

type Who = 'me' | 'friend' | 'github'

function Timeline({ title, repo, who }: { title: string; repo: Repo | null; who: Who }) {
  const branches = repo ? Object.keys(repo.branches).filter(b => repo.branches[b]) : []
  const tagOf = (b: string) => b + (who === 'me' && repo!.head === b ? ' ← ตรงนี้' : '')
  const joinName = (id: string) => Object.keys(repo!.branches).find(b => repo!.branches[b] === id) ?? id.slice(0, 7)
  const commit = (id: string, i: number, last: string | null) => {
    const c = repo!.commits[id]
    return (
      <span key={id} className="gl-commit" title={c.message}>
        {i > 0 && <span className="gl-link" aria-hidden="true" />}
        <span className={`gl-dot${c.parent2 ? ' join' : ''}`} aria-hidden="true" />
        <span className="gl-msg">{c.message}</span>
        {c.parent2 && <span className="gl-join">รวมจาก {joinName(c.parent2)}</span>}
        {last && <span className="gl-tag">{last}</span>}
      </span>
    )
  }
  const L = repo && branches.length ? layout(repo, branches) : null
  return (
    <section className="gl-line" aria-label={`ประวัติ ${title}`}>
      <h3>{title}</h3>
      {!L ? <p className="gl-empty">ยังไม่มี commit</p> : (
        <>
          <div className="gl-branch gl-trunk">{L.trunkIds.map((id, i, a) => commit(id, i, i === a.length - 1 ? tagOf(L.trunk) : null))}</div>
          {L.rows.map(r => (
            <div key={r.name} className="gl-branch gl-fork">
              {r.fork && <span className="gl-from">แยกจาก {repo!.commits[r.fork].message} →</span>}
              {r.own.map((id, i, a) => commit(id, i, i === a.length - 1 ? tagOf(r.name) : null))}
              {!r.own.length && <span className="gl-tag">{tagOf(r.name)}</span>}
            </div>
          ))}
        </>
      )}
    </section>
  )
}

export interface GitLabViewProps { lab: GitLab; onDone: () => void }

export function GitLabView({ lab, onDone }: GitLabViewProps) {
  const [world, setWorld] = useState<World>(lab.start)
  const [log, setLog] = useState<Entry[]>([])
  const [text, setText] = useState('')
  const [goalIdx, setGoalIdx] = useState(0)
  const [hint, setHint] = useState(false)
  const [editing, setEditing] = useState<{ file: string; draft: string } | null>(null)
  const typed = useRef<string[]>([])
  const recall = useRef(0)
  const doneRef = useRef(false)

  const submit = () => {
    const line = text
    setText('')
    if (!line.trim()) return
    typed.current.push(line)
    recall.current = typed.current.length
    const r = run(world, line, lab.allowed)
    let w = r.world
    // งานชนกัน (conflict) เป็นสถานะปกติ ไม่ใช่ error
    const entries: Entry[] = [{ line, output: r.output, explainTh: r.explainTh, ok: r.ok || !!r.world.conflict }]
    let idx = goalIdx
    // ผ่านได้หลายข้อในคำสั่งเดียว ถ้าสภาพตอนนี้ตรงเป้าหมายถัดไปด้วย
    while (idx < lab.goals.length && checkGitGoal(w, lab.goals[idx])) {
      for (const f of lab.friendScript ?? []) {
        if (f.afterGoal !== idx) continue
        const next = friendDoes(w, f.action)
        if (next === w) continue // friendDoes คืน world เดิมเมื่อไม่มีอะไรเปลี่ยน
        w = next
        entries.push({ note: f.action.type === 'push' ? 'เพื่อนเพิ่ง push งานขึ้น GitHub' : 'เพื่อนเพิ่งแก้งานในเครื่องของเขา' })
      }
      idx++
      setHint(false)
    }
    if (idx >= lab.goals.length && !doneRef.current) { doneRef.current = true; onDone() }
    setEditing(null)
    setGoalIdx(idx)
    setWorld(w)
    setLog(l => [...l, ...entries])
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    else if (e.key === 'ArrowUp' && typed.current.length) {
      e.preventDefault()
      recall.current = Math.max(0, recall.current - 1)
      setText(typed.current[recall.current])
    }
  }

  const finished = goalIdx >= lab.goals.length
  const goal = lab.goals[Math.min(goalIdx, lab.goals.length - 1)]
  const repo = world.me.repo
  const staged = Object.keys(world.me.staged ?? {})
  const tip = repo && repo.branches[repo.head]
  const committed = tip ? Object.keys(repo.commits[tip].files) : []
  const files = Object.keys(world.me.files)

  return (
    <section className="gitlab">
      <p className="lab-intro">{lab.introTh}</p>
      <div className="lab-goal">
        <strong>{finished ? 'ครบทุกข้อแล้ว 🎉' : `ข้อ ${goalIdx + 1} จาก ${lab.goals.length}`}</strong>
        <p className="lab-task">{goal.taskTh}</p>
        {!finished && <button type="button" className="btn small" onClick={() => setHint(true)}>ขอตัวช่วย</button>}
        {hint && !finished && <p className="lab-hint">{goal.hintTh}</p>}
      </div>

      <div className="gl-grid">
        <div className="gl-term">
          <div className="gl-log" role="log" aria-live="polite" aria-label="ประวัติคำสั่ง" tabIndex={0}>
            {log.map((e, i) => e.note
              ? <p key={i} className="gl-note">{e.note}</p>
              : (
                <div key={i}>
                  <div className="gl-cmd"><span className="gl-prompt">$ </span>{e.line}</div>
                  {e.output && <pre className={`gl-out${e.ok ? '' : ' warn'}`}>{e.output}</pre>}
                  {e.explainTh && <p className="gl-explain">{e.explainTh}</p>}
                </div>
              ))}
          </div>
          <label className="gl-input">
            <span className="gl-prompt" aria-hidden="true">$ </span>
            <input
              aria-label="พิมพ์คำสั่ง git" value={text} spellCheck={false} autoComplete="off" autoCapitalize="off"
              placeholder="git ..." onChange={e => setText(e.target.value)} onKeyDown={onKey}
            />
          </label>
        </div>

        <div className="gl-side">
          <section className="gl-places" aria-label="สามที่ที่ไฟล์อยู่ในเครื่องเรา">
            <div className="gl-place">
              <h3>โฟลเดอร์งาน</h3>
              {files.length
                ? files.map(f => <button key={f} type="button" className="gl-file" onClick={() => setEditing({ file: f, draft: world.me.files[f] })}>{f}</button>)
                : <p className="gl-empty">ว่าง</p>}
            </div>
            <div className="gl-place">
              <h3>กล่องรอปิดผนึก</h3>
              {staged.length ? staged.map(f => <span key={f} className="gl-file">{f}</span>) : <p className="gl-empty">ว่าง</p>}
            </div>
            <div className="gl-place">
              <h3>ประวัติ</h3>
              {committed.length ? committed.map(f => <span key={f} className="gl-file">{f}</span>) : <p className="gl-empty">ยังไม่มี commit</p>}
            </div>
          </section>
          {editing && (
            <div className="gl-edit">
              <label>
                <span>แก้ไฟล์ {editing.file}</span>
                <textarea autoFocus aria-label={`แก้ไฟล์ ${editing.file}`} value={editing.draft} onChange={e => setEditing({ ...editing, draft: e.target.value })} />
              </label>
              <button type="button" className="btn small" onClick={() => { setWorld(editFile(world, editing.file, editing.draft)); setEditing(null) }}>บันทึกไฟล์</button>
              <button type="button" className="btn small" onClick={() => setEditing(null)}>ปิด</button>
            </div>
          )}
          <Timeline title="เครื่องเรา" repo={world.me.repo} who="me" />
          <Timeline title="GitHub" repo={world.github} who="github" />
          <Timeline title="เครื่องเพื่อน" repo={world.friend.repo} who="friend" />
        </div>
      </div>
    </section>
  )
}
