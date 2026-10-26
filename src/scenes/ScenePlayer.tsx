import { useCallback, useEffect, useRef, useState } from 'react'
import type { Scene, SceneSet, Tone } from '../content/types'
import { RichText } from '../glossary/RichText'
import { ActorView, Bubble, Trail, type StageActor } from './actors'
import { HALF } from './layout'
import './ScenePlayer.css'
import { applyAction, applyScene, audioUrl, fallbackDurationMs, stateAfterScene, stateBeforeScene, type StageState } from './timeline'

interface Props { lessonId: string; set: SceneSet; onFinished: () => void; termIds?: string[] }

const SETTLE_MS = 30 // let the "before" state render so CSS transitions can run

const LEGEND: [Tone, string][] = [
  ['bcast', 'ถามทุกเครื่อง (broadcast)'],
  ['reply', 'ตอบกลับเครื่องเดียว (unicast)'],
  ['deliver', 'ส่งของจริง'],
]

const reducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Step { at: number; run: (s: StageState) => StageState; ms?: [string, number]; ripple?: { actor: string; tone: Tone } }

/** v2: move/moveAlong ที่อยู่ติดกันวิ่งพร้อมกัน ส่วน action อื่นรอให้ของที่วิ่งก่อนหน้าถึงก่อน */
function scheduleV2(sc: Scene): Step[] {
  const out: Step[] = []
  let t = 0, moveEnd = 0
  for (const act of sc.actions) {
    if (act.type === 'moveAlong') {
      const o = act.offset ?? { dx: 0, dy: 0 }
      act.path.slice(1).forEach((to, i) => out.push({
        at: t + i * act.msPerHop,
        ms: [act.actor, act.msPerHop],
        run: (s) => {
          const d = s.actors[to]
          return d ? { ...s, actors: { ...s.actors, [act.actor]: { ...s.actors[act.actor], x: d.x + o.dx, y: d.y + o.dy } } } : s
        },
      }))
      moveEnd = Math.max(moveEnd, t + (act.path.length - 1) * act.msPerHop)
    } else if (act.type === 'move') {
      out.push({ at: t, ms: [act.actor, act.ms], run: (s) => applyAction(s, act) })
      moveEnd = Math.max(moveEnd, t + act.ms)
    } else {
      t = Math.max(t, moveEnd)
      out.push(act.type === 'ripple' ? { at: t, run: (s) => s, ripple: act } : { at: t, run: (s) => applyAction(s, act) })
    }
  }
  return out
}

/** วงกระจายตอน broadcast (มีแค่ตอนเล่น) */
function Ripple({ actor, tone }: { actor: StageActor; tone: Tone }) {
  return (
    <g className={`sp-tone-${tone}`}>
      {[0, 350, 700].map((d) => (
        <circle key={d} className="sp-ripple" cx={actor.x} cy={actor.y} r={HALF[actor.kind][0] || 40} style={{ animationDelay: `${d}ms` }} />
      ))}
    </g>
  )
}

export function ScenePlayer({ lessonId, set, onFinished, termIds = [] }: Props) {
  const v2 = set.style === 'v2'
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [slow, setSlow] = useState(false)
  const [runId, setRunId] = useState(0)
  // v2 หยุดอยู่ = เห็นสภาพตอนจบของฉาก
  const [stage, setStage] = useState<StageState>(() => (v2 ? stateAfterScene(set, 0) : stateBeforeScene(set, 0)))
  const [moveMs, setMoveMs] = useState<Record<string, number>>({})
  const [ripples, setRipples] = useState<{ key: number; actor: string; tone: Tone }[]>([])

  const audioRef = useRef<HTMLAudioElement>(null)
  const timers = useRef<number[]>([])
  const failed = useRef<Set<string>>(new Set())
  const fallbackStarted = useRef(false)
  const finishedCalled = useRef(false)
  const runToken = useRef(0)
  const rate = slow ? 0.75 : 1
  const rateRef = useRef(rate)
  rateRef.current = rate
  const indexRef = useRef(index)
  indexRef.current = index
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished

  const scene = set.scenes[index]
  const last = set.scenes.length - 1

  const clearTimers = useCallback(() => {
    timers.current.forEach(t => window.clearTimeout(t))
    timers.current = []
    fallbackStarted.current = false
  }, [])

  const sceneDone = useCallback(() => {
    clearTimers()
    if (indexRef.current < last) {
      setIndex(indexRef.current + 1)
    } else {
      setPlaying(false)
      if (!finishedCalled.current) {
        finishedCalled.current = true
        onFinishedRef.current()
      }
    }
  }, [clearTimers, last])

  const startFallback = useCallback(() => {
    if (fallbackStarted.current) return
    fallbackStarted.current = true
    const text = set.scenes[indexRef.current].narrationTh
    timers.current.push(window.setTimeout(sceneDone, fallbackDurationMs(text, rateRef.current)))
  }, [sceneDone, set.scenes])

  // keep playbackRate in sync
  useEffect(() => {
    const a = audioRef.current
    if (a) { a.defaultPlaybackRate = rate; a.playbackRate = rate }
  }, [rate, index])

  // run the current scene while playing
  useEffect(() => {
    if (!playing) return
    const token = ++runToken.current
    const sc = set.scenes[index]
    const before = stateBeforeScene(set, index)
    setStage(before)
    setMoveMs({})
    setRipples([])
    finishedCalled.current = false

    if (v2 && reducedMotion()) {
      setStage(stateAfterScene(set, index))
    } else if (v2) {
      scheduleV2(sc).forEach((step, k) => {
        timers.current.push(window.setTimeout(() => {
          if (step.ms) { const [id, ms] = step.ms; setMoveMs(m => ({ ...m, [id]: ms })) }
          if (step.ripple) { const r = step.ripple; setRipples(rs => [...rs, { key: k, ...r }]) }
          setStage(step.run)
        }, SETTLE_MS + step.at))
      })
    } else {
      timers.current.push(window.setTimeout(() => {
        const ms: Record<string, number> = {}
        let next = before
        const hops: { at: number; actor: string; to: string }[] = []
        for (const act of sc.actions) {
          if (act.type === 'move') ms[act.actor] = act.ms
          if (act.type === 'moveAlong') {
            ms[act.actor] = act.msPerHop
            act.path.slice(1).forEach((to, i) => hops.push({ at: i * act.msPerHop, actor: act.actor, to }))
          } else {
            next = applyAction(next, act)
          }
        }
        setMoveMs(ms)
        setStage(next)
        for (const h of hops) {
          timers.current.push(window.setTimeout(() => {
            setStage(s => {
              const dest = s.actors[h.to]
              return dest ? { ...s, actors: { ...s.actors, [h.actor]: { ...s.actors[h.actor], x: dest.x, y: dest.y } } } : s
            })
          }, h.at))
        }
      }, SETTLE_MS))
    }

    const a = audioRef.current
    if (failed.current.has(sc.id) || !a) {
      startFallback()
    } else {
      a.playbackRate = rateRef.current
      try { a.currentTime = 0 } catch { /* ignore */ }
      try {
        const p = a.play() as Promise<void> | undefined
        p?.catch?.((e: unknown) => {
          if ((e as { name?: string } | null)?.name === 'AbortError') return
          if (token !== runToken.current) return
          startFallback()
        })
      } catch {
        startFallback()
      }
    }

    return () => {
      runToken.current++
      clearTimers()
      audioRef.current?.pause()
    }
  }, [playing, index, runId, set, v2, clearTimers, startFallback])

  const jump = (to: number) => {
    clearTimers()
    setIndex(to)
    const before = stateBeforeScene(set, to)
    // paused: show where the scene ends so the visuals match the caption
    setStage(playing ? before : applyScene(before, set.scenes[to]))
    setMoveMs({})
    setRipples([])
    setRunId(r => r + 1)
  }

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      // v2: หยุดแล้วเห็นสภาพตอนจบของฉากครบ รวมเส้นทาง (กฎ 3.1 ข้อ 7)
      if (v2) { setMoveMs({}); setRipples([]); setStage(stateAfterScene(set, index)) }
      return
    }
    setPlaying(true)
    setRunId(r => r + 1)
  }

  const actors = Object.values(stage.actors)
  const layer = (a: StageActor) => (a.kind === 'cable' ? 0 : a.kind === 'card' ? 2 : 1)
  const view = (actor: StageActor) => (
    <ActorView
      key={actor.id}
      actor={actor}
      target={actor.to ? stage.actors[actor.to] : undefined}
      moveMs={moveMs[actor.id] ?? 0}
    />
  )
  const tones = new Set<Tone>()
  if (v2) {
    for (const a of set.actors) if (a.kind === 'card') tones.add(a.tone ?? 'deliver')
    for (const sc of set.scenes) {
      for (const act of [...(sc.setup ?? []), ...sc.actions]) if (act.type === 'trail' || act.type === 'ripple') tones.add(act.tone)
    }
  }

  return (
    <section aria-label="ภาพเคลื่อนไหวสรุปบทเรียน" className="sp">
      {v2 && (
        <ol className="sp-chips" aria-label="เลือกฉาก">
          {set.scenes.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={i === index ? 'on' : i < index ? 'done' : undefined}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => jump(i)}
              >
                {`${i + 1} · ${s.chipTh ?? ''}`}
              </button>
            </li>
          ))}
        </ol>
      )}
      {v2 && (
        <div className="sp-life">
          <span className="sp-life-icon" aria-hidden="true">{scene.lifeIcon ?? '🏘️'}</span>
          <div>
            <div className="sp-life-tag">ในชีวิตจริง</div>
            <p>{scene.lifeTh}</p>
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${set.stage.width} ${set.stage.height}`}
        className="sp-stage"
        style={{ aspectRatio: `${set.stage.width} / ${set.stage.height}` }}
        role="img"
        aria-label="เวทีภาพเคลื่อนไหว"
      >
        {actors.filter(a => layer(a) === 0).map(view)}
        {stage.trails.map((t, i) => <Trail key={i} trail={t} actors={stage.actors} />)}
        {ripples.map(r => stage.actors[r.actor] && <Ripple key={r.key} actor={stage.actors[r.actor]} tone={r.tone} />)}
        {actors.filter(a => layer(a) === 1).map(view)}
        {stage.bubbles.map(b => stage.actors[b.actor] && <Bubble key={b.actor} actor={stage.actors[b.actor]} text={b.text} mood={b.mood} />)}
        {actors.filter(a => layer(a) === 2).map(view)}
      </svg>

      {v2 && tones.size > 0 && (
        <div className="sp-legend">
          {LEGEND.filter(([t]) => tones.has(t)).map(([t, text]) => (
            <span key={t} className={`sp-tone-${t}`}><i aria-hidden="true" />{text}</span>
          ))}
        </div>
      )}

      <p
        aria-live="polite"
        className="sp-caption"
      >
        <RichText text={scene.narrationTh} termIds={termIds} />
      </p>

      <audio
        ref={audioRef}
        src={audioUrl(lessonId, scene.id)}
        preload="auto"
        onEnded={sceneDone}
        onError={() => {
          failed.current.add(scene.id)
          if (playing) startFallback()
        }}
      />

      <div className="sp-controls">
        <button type="button" className="sp-btn sp-btn-primary" onClick={togglePlay}>{playing ? '⏸ หยุด' : '▶ เล่น'}</button>
        <button type="button" className="sp-btn" onClick={() => jump(Math.max(0, index - 1))}>⏮ ย้อน</button>
        <button type="button" className="sp-btn" onClick={() => jump(index + 1)} disabled={index >= last}>⏭ ฉากต่อไป</button>
        <button type="button" className="sp-btn" aria-pressed={slow} onClick={() => setSlow(s => !s)}>
          {slow ? '🐢 ช้าลงอยู่' : '🐢 ช้าลง'}
        </button>
        <span>{`ฉากที่ ${index + 1} จาก ${set.scenes.length}`}</span>
      </div>
    </section>
  )
}
