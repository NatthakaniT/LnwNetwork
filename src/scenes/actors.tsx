import type { ActorKind } from '../content/types'
import { BUBBLE, CARD, HALF, ICON_SCALE, LABEL_BELOW_Y, TABLE, bubbleBox, cardSize, tableSize } from './layout'
import type { StageActor, StageState } from './timeline'

export type { StageActor }

const STROKE = '#0b1220'

function Icon({ kind }: { kind: ActorKind }) {
  switch (kind) {
    case 'house':
      return (
        <g>
          <polygon points="-34,-4 0,-34 34,-4" fill="#e5624d" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <rect x="-26" y="-4" width="52" height="38" fill="#f6e3b4" stroke={STROKE} strokeWidth="3" />
          <rect x="-7" y="12" width="14" height="22" fill="#8a5a2b" stroke={STROKE} strokeWidth="2" />
        </g>
      )
    case 'pc':
      return (
        <g>
          <rect x="-30" y="-30" width="60" height="42" rx="5" fill="#cfe8ff" stroke={STROKE} strokeWidth="3" />
          <rect x="-24" y="-24" width="48" height="30" rx="2" fill="#3b82c4" />
          <rect x="-5" y="12" width="10" height="9" fill="#9aa7b4" stroke={STROKE} strokeWidth="2" />
          <rect x="-18" y="21" width="36" height="7" rx="3" fill="#9aa7b4" stroke={STROKE} strokeWidth="2" />
        </g>
      )
    case 'laptop':
      return (
        <g>
          <rect x="-24" y="-28" width="48" height="33" rx="4" fill="#cfe8ff" stroke={STROKE} strokeWidth="3" />
          <rect x="-19" y="-23" width="38" height="23" fill="#3b82c4" />
          <polygon points="-34,10 34,10 28,22 -28,22" fill="#9aa7b4" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
        </g>
      )
    case 'switch':
      return (
        <g>
          <rect x="-38" y="-14" width="76" height="30" rx="6" fill="#4ca56b" stroke={STROKE} strokeWidth="3" />
          {[-26, -13, 0, 13, 26].map(px => (
            <rect key={px} x={px - 4} y={-4} width="8" height="10" fill="#0b1220" />
          ))}
          <circle cx="-30" cy="-8" r="2" fill="#fff" />
        </g>
      )
    case 'router':
      return (
        <g>
          <rect x="-36" y="-6" width="72" height="26" rx="8" fill="#e7a23a" stroke={STROKE} strokeWidth="3" />
          <line x1="-22" y1="-6" x2="-28" y2="-32" stroke={STROKE} strokeWidth="4" strokeLinecap="round" />
          <line x1="22" y1="-6" x2="28" y2="-32" stroke={STROKE} strokeWidth="4" strokeLinecap="round" />
          <circle cx="-16" cy="7" r="3" fill="#fff" />
          <circle cx="-4" cy="7" r="3" fill="#fff" />
        </g>
      )
    case 'server':
      return (
        <g>
          {[-30, -10, 10].map(py => (
            <g key={py}>
              <rect x="-28" y={py} width="56" height="18" rx="4" fill="#8f7ae0" stroke={STROKE} strokeWidth="3" />
              <circle cx="-18" cy={py + 9} r="3" fill="#7CFC9A" />
              <line x1="-8" y1={py + 9} x2="18" y2={py + 9} stroke={STROKE} strokeWidth="2" />
            </g>
          ))}
        </g>
      )
    case 'cloud':
      return (
        <path
          d="M-24,16 a14,14 0 0 1 -2,-28 a20,20 0 0 1 38,-6 a16,16 0 0 1 14,34 z"
          fill="#e8f1fb"
          stroke={STROKE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )
    case 'envelope':
      return (
        <g>
          <rect x="-24" y="-16" width="48" height="32" rx="3" fill="#fff6d6" stroke={STROKE} strokeWidth="3" />
          <polyline points="-24,-16 0,4 24,-16" fill="none" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
        </g>
      )
    case 'box':
      return (
        <g>
          <rect x="-24" y="-22" width="48" height="44" fill="#c98f52" stroke={STROKE} strokeWidth="3" />
          <rect x="-24" y="-22" width="48" height="12" fill="#dba96f" stroke={STROKE} strokeWidth="3" />
          <line x1="0" y1="-22" x2="0" y2="-10" stroke={STROKE} strokeWidth="3" />
        </g>
      )
    case 'truck':
      return (
        <g>
          <rect x="-38" y="-22" width="44" height="34" fill="#f2f2f2" stroke={STROKE} strokeWidth="3" />
          <polygon points="6,-12 24,-12 36,0 36,12 6,12" fill="#e5624d" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="-22" cy="16" r="8" fill="#333" stroke={STROKE} strokeWidth="2" />
          <circle cx="22" cy="16" r="8" fill="#333" stroke={STROKE} strokeWidth="2" />
        </g>
      )
    case 'person':
      return (
        <g>
          <circle cx="0" cy="-22" r="12" fill="#f4c9a0" stroke={STROKE} strokeWidth="3" />
          <path d="M-20,28 a20,22 0 0 1 40,0 z" fill="#4aa8ff" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="-4" cy="-24" r="1.5" fill={STROKE} />
          <circle cx="4" cy="-24" r="1.5" fill={STROKE} />
          <path d="M-5,-17 q5,4 10,0" fill="none" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'label':
    case 'cable':
    case 'card':
    case 'table':
      return null
  }
}

const ICON_HALF_HEIGHT = 36 * ICON_SCALE

/** ซองที่มีป้ายหน้าซอง ขอบเป็นสีชนิดการส่ง */
function Card({ actor }: { actor: StageActor }) {
  const lines = actor.lines ?? []
  const { w, h } = cardSize(lines)
  return (
    <g className={`sp-card sp-tone-${actor.tone ?? 'deliver'}`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="8" />
      {lines.map((l, i) => (
        <text key={i} x={-w / 2 + CARD.pad} y={-h / 2 + 28 + i * CARD.line} fontSize={CARD.font} fontWeight={i === 0 ? 700 : 400}>{l}</text>
      ))}
    </g>
  )
}

/** สิ่งที่อุปกรณ์รู้ เช่น สมุดจด IP → MAC */
function Table({ actor }: { actor: StageActor }) {
  const rows = actor.rows ?? []
  const { w, h } = tableSize(rows.length)
  const L = -w / 2, T = -h / 2
  const [c1, c2] = actor.columns ?? ['', '']
  return (
    <g className="sp-table">
      <rect className="sp-paper" x={L} y={T} width={w} height={h} rx="12" />
      <text x={L + 16} y={T + 32} fontSize="20" fontWeight={700}>{actor.titleTh}</text>
      <text className="sp-muted" x={L + 16} y={T + 66} fontSize="16" fontWeight={600}>{c1}</text>
      <text className="sp-muted" x={L + TABLE.col2} y={T + 66} fontSize="16" fontWeight={600}>{c2}</text>
      <line className="sp-rule" x1={L + 12} y1={T + 76} x2={L + w - 12} y2={T + 76} />
      {rows.length === 0
        ? <text className="sp-muted" x={L + 16} y={T + 108} fontSize="17">ยังว่างอยู่</text>
        : rows.map(([a, b], i) => (
          <g key={i}>
            <text x={L + 16} y={T + 108 + i * TABLE.row} fontSize="18">{a}</text>
            <text x={L + TABLE.col2} y={T + 108 + i * TABLE.row} fontSize="18" fontWeight={700}>{b}</text>
          </g>
        ))}
    </g>
  )
}

/** ป้ายพูดเหนือเครื่อง: yes = เครื่องที่ใช่ (ฟ้า) / no = ไม่ใช่ (เทา) */
export function Bubble({ actor, text, mood }: { actor: StageActor; text: string; mood: 'yes' | 'no' }) {
  const b = bubbleBox(actor, text)
  return (
    <g data-bubble={actor.id} className={`sp-bubble sp-bubble-${mood}`} transform={`translate(${b.x + b.w / 2} ${b.y + b.h / 2})`}>
      <rect x={-b.w / 2} y={-b.h / 2} width={b.w} height={b.h} rx={b.h / 2} />
      <text y="7" textAnchor="middle" fontSize={BUBBLE.font} fontWeight={700}>{text}</text>
    </g>
  )
}

/** เส้นทางที่ของวิ่งผ่าน ค้างไว้บนสาย */
export function Trail({ trail, actors }: { trail: StageState['trails'][number]; actors: StageState['actors'] }) {
  return (
    <g data-trail={trail.tone} className={`sp-trail sp-tone-${trail.tone}`}>
      {trail.path.slice(1).map((to, i) => {
        const a = actors[trail.path[i]], b = actors[to]
        return a && b ? <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> : null
      })}
    </g>
  )
}

export function ActorView({
  actor,
  target,
  moveMs,
}: {
  actor: StageActor
  target?: StageActor
  moveMs: number
}) {
  const hidden = !!actor.hidden

  if (actor.kind === 'cable') {
    if (!target) return null
    return (
      <line
        data-actor={actor.id}
        x1={actor.x}
        y1={actor.y}
        x2={target.x}
        y2={target.y}
        stroke={actor.highlighted ? '#ffd84a' : '#9aa7b4'}
        strokeWidth={actor.highlighted ? 7 : 5}
        strokeLinecap="round"
        style={{ opacity: hidden ? 0 : 1, transition: 'opacity 300ms' }}
      />
    )
  }

  return (
    <g
      data-actor={actor.id}
      data-kind={actor.kind}
      data-highlighted={actor.highlighted ? 'true' : undefined}
      style={{
        transform: `translate(${actor.x}px, ${actor.y}px)`,
        transition: `transform ${moveMs}ms ease-in-out, opacity 300ms`,
        opacity: hidden ? 0 : actor.dimmed ? 0.35 : 1,
        pointerEvents: 'none',
      }}
      className={actor.glow ? 'sp-glow' : undefined}
    >
      {actor.kind === 'card' && <Card actor={actor} />}
      {actor.kind === 'table' && <Table actor={actor} />}
      {actor.highlighted && (
        <rect
          x={-50 * ICON_SCALE}
          y={-ICON_HALF_HEIGHT - 12 * ICON_SCALE}
          width={100 * ICON_SCALE}
          height={ICON_HALF_HEIGHT * 2 + 24 * ICON_SCALE}
          rx="14"
          fill="rgba(255, 216, 74, 0.15)"
          stroke="#ffd84a"
          strokeWidth="4"
          style={{ filter: 'drop-shadow(0 0 8px #ffd84a)' }}
        />
      )}
      <g data-icon-scale={ICON_SCALE} transform={`scale(${ICON_SCALE})`}>
        <Icon kind={actor.kind} />
      </g>
      {actor.label && actor.label.split('\n').map((line, i) => {
        const side = actor.labelSide === 'right'
        const y0 = actor.kind === 'label' ? 0 : side ? -4 : LABEL_BELOW_Y
        return (
          <text
            key={i}
            className={i > 0 ? 'sp-label-sub' : undefined}
            x={side ? HALF[actor.kind][0] + 12 : 0}
            y={y0 + i * 28}
            textAnchor={side ? 'start' : 'middle'}
            fontSize={actor.kind === 'label' ? 26 : i > 0 ? 20 : 24}
            fontWeight={i > 0 ? 400 : 600}
            fill="#e6edf3"
            stroke="#0f1419"
            strokeWidth="4"
            paintOrder="stroke"
          >
            {line}
          </text>
        )
      })}
    </g>
  )
}
