import { Fragment, useContext } from 'react'
import { GlossaryContext } from './context'
import type { GlossaryTerm } from '../content/types'
import { Term } from './Term'

interface Props { text: string; termIds: string[]; terms?: GlossaryTerm[] }

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** ห่อคำศัพท์ (ทั้งคำ ไม่สนตัวพิมพ์ คำยาวก่อน) ด้วย <Term> ให้กดดูความหมายได้ */
export function RichText({ text, termIds, terms: given }: Props) {
  const fromCtx = useContext(GlossaryContext)
  const terms = given ?? fromCtx
  const used = terms.filter((t) => termIds.includes(t.id)).sort((a, b) => b.en.length - a.en.length)
  if (used.length === 0) return <>{text}</>
  const alt = used.map((t) => escapeRe(t.en)).join('|')
  const re = new RegExp(`(?<![A-Za-z0-9])(${alt})(?![A-Za-z0-9])`, 'gi')
  const pieces = text.split(re) // ตำแหน่งคี่ = คำที่ตรง
  return (
    <>
      {pieces.map((p, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{p}</Fragment>
        const t = used.find((u) => u.en.toLowerCase() === p.toLowerCase())
        return t ? <Term key={i} id={t.id} terms={terms}>{p}</Term> : <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}
