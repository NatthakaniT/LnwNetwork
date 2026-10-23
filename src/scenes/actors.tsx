import type { Actor, ActorKind } from '../content/types'

export type StageActor = Actor & { highlighted?: boolean }

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
      return null
  }
}

const ICON_HALF_HEIGHT = 36

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
        opacity: hidden ? 0 : 1,
        pointerEvents: 'none',
      }}
    >
      {actor.highlighted && (
        <rect
          x="-50"
          y={-ICON_HALF_HEIGHT - 12}
          width="100"
          height={ICON_HALF_HEIGHT * 2 + 24}
          rx="14"
          fill="rgba(255, 216, 74, 0.15)"
          stroke="#ffd84a"
          strokeWidth="4"
          style={{ filter: 'drop-shadow(0 0 8px #ffd84a)' }}
        />
      )}
      <Icon kind={actor.kind} />
      {actor.label && (
        <text
          y={actor.kind === 'label' ? 0 : ICON_HALF_HEIGHT + 18}
          textAnchor="middle"
          fontSize={actor.kind === 'label' ? 22 : 18}
          fontWeight={600}
          fill="#e6edf3"
          stroke="#0f1419"
          strokeWidth="4"
          paintOrder="stroke"
        >
          {actor.label}
        </text>
      )}
    </g>
  )
}
