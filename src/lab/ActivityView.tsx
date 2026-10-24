import { useRef, useState } from 'react'
import type { ActivityLab } from '../content/types'
import { RichText } from '../glossary/RichText'

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
            <li key={id}>
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
      <button type="button" onClick={check}>ตรวจคำตอบ</button>
      {result === 'right' && <p className="lab-result ok" role="status">ถูกต้อง! 🎉 <RichText text={lab.rightTh ?? lab.explainTh} termIds={termIds} /></p>}
      {result === 'wrong' && <p className="lab-result warn" role="status">ยังไม่ถูก ลองใหม่อีกที — <RichText text={lab.explainTh} termIds={termIds} /></p>}
    </section>
  )
}
