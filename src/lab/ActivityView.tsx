import { useEffect, useRef, useState } from 'react'
import type { ActivityLab } from '../content/types'
import { RichText } from '../glossary/RichText'
import './lab.css'

const MOVED_MS = 350

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

export interface ActivityViewProps {
  lab: ActivityLab
  onDone: () => void
  shuffle?: <T>(items: T[]) => T[]
  termIds?: string[]
}

export function ActivityView({ lab, onDone, shuffle = fisherYates, termIds = [] }: ActivityViewProps) {
  const [items] = useState(() => shuffle(lab.items))
  const [order, setOrder] = useState<string[]>(() => items.map(i => i.id))
  const [choice, setChoice] = useState<Record<string, string>>({})
  const [result, setResult] = useState<'idle' | 'wrong' | 'right'>('idle')
  const doneRef = useRef(false)
  // รายการที่เพิ่งขยับ ได้ class moved สั้น ๆ (เลื่อน + กะพริบ) แล้วหายไปเอง
  const [moved, setMoved] = useState<{ id: string; dir: 'up' | 'down' } | null>(null)
  const movedTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(movedTimer.current), [])
  // ลำดับการตรวจ ใช้เป็น key ให้การ์ดผลสร้างใหม่ (.pop-in เล่นซ้ำ) ทุกครั้งที่ตรวจ
  const [checkNo, setCheckNo] = useState(0)
  const text = (id: string) => lab.items.find(i => i.id === id)?.textTh ?? id

  const move = (idx: number, d: number) => {
    const j = idx + d
    if (j < 0 || j >= order.length) return
    const next = [...order]
    const tmp = next[idx]
    next[idx] = next[j]
    next[j] = tmp
    setOrder(next)
    setResult('idle')
    clearTimeout(movedTimer.current)
    setMoved({ id: order[idx], dir: d < 0 ? 'up' : 'down' })
    movedTimer.current = setTimeout(() => setMoved(null), MOVED_MS)
  }

  const check = () => {
    let ok: boolean
    if (lab.kind === 'order') {
      const ans = lab.answer as string[]
      ok = ans.length === order.length && ans.every((id, i) => order[i] === id)
    } else {
      const ans = lab.answer as Record<string, string>
      ok = Object.entries(ans).every(([l, r]) => choice[l] === r)
    }
    setResult(ok ? 'right' : 'wrong')
    setCheckNo(n => n + 1)
    if (ok && !doneRef.current) {
      doneRef.current = true
      onDone()
    }
  }

  const matchLeft = lab.kind === 'match' ? Object.keys(lab.answer as Record<string, string>) : []
  const matchRight = lab.kind === 'match' ? Object.values(lab.answer as Record<string, string>) : []
  const rightOptions = items.filter(i => matchRight.includes(i.id))
  const leftItems = items.filter(i => matchLeft.includes(i.id))

  return (
    <section className="activity">
      <p className="lab-intro"><RichText text={lab.introTh} termIds={termIds} /></p>
      {lab.kind === 'order' ? (
        <ol className="activity-list">
          {order.map((id, idx) => (
            <li key={id} className={moved?.id === id ? `moved ${moved.dir}` : undefined}>
              <span><RichText text={text(id)} termIds={termIds} /></span>
              <button type="button" aria-label={`เลื่อนขึ้น ${text(id)}`} disabled={idx === 0} onClick={() => move(idx, -1)}>⬆</button>
              <button type="button" aria-label={`เลื่อนลง ${text(id)}`} disabled={idx === order.length - 1} onClick={() => move(idx, 1)}>⬇</button>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="activity-list">
          {leftItems.map(l => (
            <li key={l.id}>
              <span><RichText text={l.textTh} termIds={termIds} /></span>
              <select
                aria-label={`จับคู่ ${l.textTh}`}
                value={choice[l.id] ?? ''}
                onChange={e => { setChoice({ ...choice, [l.id]: e.target.value }); setResult('idle') }}
              >
                <option value="">เลือกคู่...</option>
                {rightOptions.map(r => <option key={r.id} value={r.id}>{r.textTh}</option>)}
              </select>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="activity-check" onClick={check}>ตรวจคำตอบ</button>
      {result === 'right' && <p key={checkNo} className="lab-result ok pop-in" role="status">ถูกต้อง! 🎉 <RichText text={lab.rightTh ?? lab.explainTh} termIds={termIds} /></p>}
      {result === 'wrong' && <p key={checkNo} className="lab-result bad pop-in" role="status">ยังไม่ถูก ลองใหม่อีกที — <RichText text={lab.explainTh} termIds={termIds} /></p>}
    </section>
  )
}
