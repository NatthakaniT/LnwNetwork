import { useMemo, useState } from 'react'
import { course, glossary } from '../content'
import type { GlossaryTerm } from '../content/types'
import './glossary.css'

const OTHER = 'ศัพท์อื่น ๆ'

function matches(t: GlossaryTerm, q: string): boolean {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return [t.th, t.explainTh, t.en].some((x) => x.toLowerCase().includes(s))
}

export function GlossaryPage({ terms = glossary }: { terms?: GlossaryTerm[] }) {
  const [q, setQ] = useState('')

  const groups = useMemo(() => {
    // ภาคแรกที่มีบทอ้างศัพท์นี้ (เรียงตามภาค แล้วตามลำดับบท)
    const firstPart = new Map<string, number>()
    for (const p of [...course].sort((a, b) => a.part - b.part)) {
      for (const l of [...p.lessons].sort((a, b) => a.order - b.order)) {
        for (const id of l.terms ?? []) if (!firstPart.has(id)) firstPart.set(id, p.part)
      }
    }
    const found = terms.filter((t) => matches(t, q))
    const out: { key: string; title: string; items: GlossaryTerm[] }[] = []
    for (const p of [...course].sort((a, b) => a.part - b.part)) {
      const items = found.filter((t) => firstPart.get(t.id) === p.part)
      if (items.length) out.push({ key: `p${p.part}`, title: p.titleTh, items })
    }
    const rest = found.filter((t) => !firstPart.has(t.id))
    if (rest.length) out.push({ key: 'other', title: OTHER, items: rest })
    return out
  }, [terms, q])

  return (
    <main className="glossary">
      <h1>คลังศัพท์</h1>
      <input type="search" className="glossary-search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นคำไทยหรืออังกฤษ" aria-label="ค้นหาศัพท์" />
      {groups.length === 0 && <p className="glossary-empty">ไม่เจอคำที่ค้นหา ลองพิมพ์คำอื่นดู</p>}
      {groups.map((g) => (
        <section key={g.key}>
          <h2>{g.title}</h2>
          <dl>
            {g.items.map((t) => (
              <div key={t.id} className="glossary-item">
                <dt>{t.en}</dt>
                <dd><strong>{t.th}</strong><br />{t.explainTh}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </main>
  )
}
