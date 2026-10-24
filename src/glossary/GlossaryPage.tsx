import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { course, glossary } from '../content'
import type { GlossaryTerm } from '../content/types'
import { OSI_LAYERS, OSI_OTHER_IDS, OSI_SECTION_IDS, TCPIP_LAYERS } from '../content/osi'
import type { OsiLayer } from '../content/osi'
import { useReveal } from '../ui/reveal'
import './glossary.css'

const OTHER = 'ศัพท์อื่น ๆ'
const OSI_TITLE = 'OSI Model · 7 ชั้น'
const OSI_OTHER_TITLE = 'ศัพท์ OSI อื่น ๆ'
const EMPTY = 'ไม่เจอคำที่ค้นหา ลองพิมพ์คำอื่นดู'
const SECTION_IDS = new Set([...OSI_SECTION_IDS, ...OSI_OTHER_IDS])

function norm(q: string): string {
  return q.trim().toLowerCase()
}

function matches(t: GlossaryTerm, s: string, extra: string[] = []): boolean {
  if (!s) return true
  return [t.th, t.explainTh, t.en, ...extra].some((x) => x.toLowerCase().includes(s))
}

/** "Network layer" -> "Network" (ชื่อสั้นบนแถบ) */
function shortEn(en: string): string {
  return en.replace(/\s+layer$/i, '')
}

type CardVars = CSSProperties & { '--card-c'?: string }

function TermCard({ t, color, badge, level = 3 }: { t: GlossaryTerm; color: string; badge?: string; level?: 3 | 4 }) {
  const ref = useReveal<HTMLElement>()
  const H = level === 4 ? 'h4' : 'h3'
  const style: CardVars = { '--card-c': color }
  return (
    <article ref={ref} className="g-card reveal" data-term={t.id} style={style}>
      {badge && <span className="g-badge">{badge}</span>}
      <H className="g-en">{t.en}</H>
      <p className="g-th">{t.th}</p>
      <p className="g-explain">{t.explainTh}</p>
    </article>
  )
}

type Pick = { termId: string; from: 'osi' | 'tcp' }

export function GlossaryPage({ terms = glossary }: { terms?: GlossaryTerm[] }) {
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<Pick>({ termId: 'network-layer', from: 'osi' })
  const s = norm(q)

  const byId = useMemo(() => new Map(terms.map((t) => [t.id, t])), [terms])

  // ---------- ส่วน OSI: ชั้นไหนเห็น และกรอบ TCP/IP อยู่แถวไหน ----------
  const osi = useMemo(() => {
    const layers = OSI_LAYERS.filter((l) => byId.has(l.termId))
    const boxes = TCPIP_LAYERS.filter((b) => byId.has(b.termId))
    const layerHit = (l: OsiLayer) => matches(byId.get(l.termId)!, s, [l.shortTh])
    const boxHit = boxes.filter((b) => matches(byId.get(b.termId)!, s))
    // ชั้นที่ตรงคำค้น + ชั้นที่กรอบ TCP/IP ที่ตรงคำค้นครอบอยู่ (ให้กรอบมีแถววาง)
    const shown = layers.filter((l) => layerHit(l) || boxHit.some((b) => b.osi.includes(l.no)))
    const row = new Map<number, number>(shown.map((l, i) => [l.no, i + 2])) // แถว 1 = หัวคอลัมน์
    const shownBoxes = boxes
      .map((b) => ({ ...b, rows: b.osi.filter((n) => row.has(n)).map((n) => row.get(n)!) }))
      .filter((b) => b.rows.length > 0)
    const cards = OSI_SECTION_IDS.map((id) => byId.get(id))
      .filter((t): t is GlossaryTerm => !!t)
      .filter((t) => {
        const l = OSI_LAYERS.find((x) => x.termId === t.id)
        return matches(t, s, l ? [l.shortTh] : [])
      })
    return { shown, row, shownBoxes, cards }
  }, [byId, s])

  const otherCards = useMemo(
    () => OSI_OTHER_IDS.map((id) => byId.get(id)).filter((t): t is GlossaryTerm => !!t && matches(t, s)),
    [byId, s],
  )

  // ---------- ศัพท์อื่นจัดกลุ่มตามภาค ----------
  const groups = useMemo(() => {
    // ภาคแรกที่มีบทอ้างศัพท์นี้ (เรียงตามภาค แล้วตามลำดับบท)
    const firstPart = new Map<string, number>()
    for (const p of [...course].sort((a, b) => a.part - b.part)) {
      for (const l of [...p.lessons].sort((a, b) => a.order - b.order)) {
        for (const id of l.terms ?? []) if (!firstPart.has(id)) firstPart.set(id, p.part)
      }
    }
    const found = terms.filter((t) => !SECTION_IDS.has(t.id) && matches(t, s))
    const out: { key: string; title: string; color: string; items: GlossaryTerm[] }[] = []
    for (const p of [...course].sort((a, b) => a.part - b.part)) {
      const items = found.filter((t) => firstPart.get(t.id) === p.part)
      if (items.length) out.push({ key: `p${p.part}`, title: p.titleTh, color: `var(--p${p.part})`, items })
    }
    const rest = found.filter((t) => !firstPart.has(t.id))
    if (rest.length) out.push({ key: 'other', title: OTHER, color: 'var(--text-muted)', items: rest })
    return out
  }, [terms, s])

  const osiVisible = osi.shown.length > 0 || osi.cards.length > 0
  const nothing = !osiVisible && otherCards.length === 0 && groups.length === 0

  // ชั้นที่เลือกถูกซ่อนตอนค้นหา -> โชว์ชั้นแรกที่ยังเห็นแทน
  const pickVisible = picked.from === 'osi'
    ? osi.shown.some((l) => l.termId === picked.termId)
    : osi.shownBoxes.some((b) => b.termId === picked.termId)
  const current: Pick | null = pickVisible
    ? picked
    : osi.shown[0] ? { termId: osi.shown[0].termId, from: 'osi' }
    : osi.shownBoxes[0] ? { termId: osi.shownBoxes[0].termId, from: 'tcp' }
    : null
  const curTerm = current ? byId.get(current.termId) : undefined
  const curLayer = current?.from === 'osi' ? OSI_LAYERS.find((l) => l.termId === current.termId) : undefined
  const curBox = current?.from === 'tcp' ? TCPIP_LAYERS.find((b) => b.termId === current.termId) : undefined

  return (
    <div className="glossary">
      <h1 className="rise">คลังศัพท์</h1>
      <input type="search" className="glossary-search rise d1" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นคำไทยหรืออังกฤษ" aria-label="ค้นหาศัพท์" />
      {nothing && <p className="glossary-empty">{EMPTY}</p>}

      {osiVisible && (
        <section className="osi rise d2" aria-labelledby="g-osi">
          <h2 id="g-osi">{OSI_TITLE}</h2>
          {osi.shown.length > 0 && (
            <>
              <p className="osi-hint">กดที่ชั้น หรือกรอบ TCP/IP เพื่ออ่านคำอธิบาย</p>
              <div className="osi-grid" role="group" aria-label="OSI 7 ชั้น เทียบกับ TCP/IP 4 ชั้น">
                <span className="osi-col-head" style={{ gridRow: 1, gridColumn: 1 }}>OSI 7 ชั้น</span>
                <span className="osi-col-head" style={{ gridRow: 1, gridColumn: 2 }}>TCP/IP 4 ชั้น</span>
                {osi.shown.map((l) => {
                  const t = byId.get(l.termId)!
                  const on = current?.from === 'osi' && current.termId === l.termId
                  return (
                    <button key={l.no} type="button" className="osi-layer" data-layer={l.no} aria-pressed={on}
                      style={{ gridRow: osi.row.get(l.no), gridColumn: 1, background: l.color }}
                      onClick={() => setPicked({ termId: l.termId, from: 'osi' })}>
                      <span className="osi-no">{l.no}</span>
                      <span className="osi-en">{shortEn(t.en)}</span>
                      <span className="osi-short">{l.shortTh}</span>
                    </button>
                  )
                })}
                {osi.shownBoxes.map((b) => {
                  const t = byId.get(b.termId)!
                  const on = current?.from === 'tcp' && current.termId === b.termId
                  return (
                    <button key={b.termId} type="button" className="tcp-box" data-term={b.termId} aria-pressed={on}
                      style={{ gridRow: `${Math.min(...b.rows)} / span ${b.rows.length}`, gridColumn: 2 }}
                      onClick={() => setPicked({ termId: b.termId, from: 'tcp' })}>
                      {shortEn(t.en)}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {curTerm && (
            <div className="osi-detail" role="region" aria-label="คำอธิบายชั้นที่เลือก" aria-live="polite"
              style={{ '--card-c': curLayer?.color ?? 'var(--text-muted)' } as CardVars}>
              <p className="osi-detail-title">
                <strong>{curTerm.en}</strong>{' '}
                <span className="osi-detail-tag">
                  {curLayer ? `ชั้นที่ ${curLayer.no}` : curBox ? `TCP/IP · ตรงกับ OSI ชั้น ${curBox.osi.join(', ')}` : ''}
                </span>
              </p>
              <p className="osi-detail-th">{curTerm.th}</p>
              <p className="osi-detail-explain">{curTerm.explainTh}</p>
            </div>
          )}
          {osi.cards.length > 0 && (
            <>
              <h3 className="osi-sub">อ่านทุกชั้นแบบเต็ม</h3>
              <div className="g-cards">
                {osi.cards.map((t) => {
                  const l = OSI_LAYERS.find((x) => x.termId === t.id)
                  return (
                    <TermCard key={t.id} t={t} level={4} color={l?.color ?? 'var(--text-muted)'}
                      badge={l ? `OSI ชั้นที่ ${l.no}` : 'ชั้นของ TCP/IP'} />
                  )
                })}
              </div>
            </>
          )}
        </section>
      )}

      {otherCards.length > 0 && (
        <section className="g-section" aria-labelledby="g-osi-other">
          <h2 id="g-osi-other" className="g-head" style={{ '--card-c': 'var(--p1)' } as CardVars}>{OSI_OTHER_TITLE}</h2>
          <div className="g-cards">
            {otherCards.map((t) => <TermCard key={t.id} t={t} color="var(--p1)" />)}
          </div>
        </section>
      )}

      {groups.map((g) => (
        <section key={g.key} className="g-section g-group" aria-labelledby={`g-${g.key}`}>
          <h2 id={`g-${g.key}`} className="g-head" style={{ '--card-c': g.color } as CardVars}>{g.title}</h2>
          <div className="g-cards">
            {g.items.map((t) => <TermCard key={t.id} t={t} color={g.color} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
