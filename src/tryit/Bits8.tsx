import { useEffect, useState } from 'react'
import type { TryIt } from '../content/types'
import { BIT_VALUES, bitsOf, valueOf } from './bits'
import './tryit.css'

const GOAL_DELAY_MS = 1400

export function Bits8({ tryIt, onDone }: { tryIt: Extract<TryIt, { kind: 'bits8' }>; onDone: () => void }) {
  const { goals } = tryIt
  const [bits, setBits] = useState<(0 | 1)[]>(() => bitsOf(0))
  const [idx, setIdx] = useState(0)

  const n = valueOf(bits)
  const on = BIT_VALUES.filter((_, i) => bits[i])
  const target = goals[idx]
  const correct = target !== undefined && n === target

  useEffect(() => {
    if (!correct) return
    const t = setTimeout(() => {
      setBits(bitsOf(0))
      setIdx(idx + 1)
      if (idx + 1 >= goals.length) onDone()
    }, GOAL_DELAY_MS)
    return () => clearTimeout(t)
  }, [correct, idx, goals.length, onDone])

  return (
    <section className="tryit" aria-label="ลองกดเอง">
      <h2>ลองกดเอง</h2>
      <p>{tryIt.introTh}</p>
      <div className="tryit-plate">
        {BIT_VALUES.map((v, i) => (
          <button
            key={v}
            type="button"
            className="tryit-sw"
            aria-pressed={bits[i] === 1}
            aria-label={`สวิตช์ค่า ${v}`}
            onClick={() => setBits(bits.map((b, j) => (j === i ? (b ? 0 : 1) : b)) as (0 | 1)[])}
          >
            <span className="tryit-bulb" />
            <span className="tryit-val">{v}</span>
            <span className="tryit-bit">{bits[i]}</span>
          </button>
        ))}
      </div>
      <p className="tryit-sum" aria-live="polite">
        <span className="tryit-big">{n}</span>{' '}
        <span className="tryit-how">{on.length ? `${on.join(' + ')} = ${n} → ${bits.join('')}` : 'ยังไม่ได้เปิดสวิตช์ตัวไหน'}</span>
      </p>
      <p className={`tryit-goal${correct ? ' ok' : ''}`} aria-live="polite">
        {target === undefined
          ? 'ทำครบทุกโจทย์แล้ว'
          : correct
            ? `ถูกต้อง ${target} = ${on.join(' + ')}`
            : `โจทย์ ${idx + 1}/${goals.length}: เปิดสวิตช์ให้รวมกันได้ ${target}`}
      </p>
    </section>
  )
}
