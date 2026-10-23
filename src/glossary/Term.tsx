import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { glossary } from '../content/glossary'
import type { GlossaryTerm } from '../content/types'
import './glossary.css'

interface Props { id: string; children?: ReactNode; terms?: GlossaryTerm[] }

export function Term({ id, children, terms = glossary }: Props) {
  const term = terms.find((t) => t.id === id)
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  const popId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])

  if (!term) return <>{children}</>

  return (
    <span className="term" ref={wrap}>
      <button type="button" className="term-btn" aria-expanded={open} aria-controls={open ? popId : undefined}
        onClick={() => setOpen((o) => !o)}>
        {children ?? term.en}
      </button>
      {open && (
        <span id={popId} role="dialog" aria-label={`ความหมายของ ${term.en}`} className="term-pop">
          <strong className="term-en">{term.en}</strong>
          <span className="term-th">{term.th}</span>
          <span className="term-explain">{term.explainTh}</span>
        </span>
      )}
    </span>
  )
}
