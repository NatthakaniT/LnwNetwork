import { useCallback, useEffect, useRef, useState } from 'react'
import type { SceneSet } from '../content/types'
import { RichText } from '../glossary/RichText'
import { ActorView } from './actors'
import './ScenePlayer.css'
import { applyAction, applyScene, audioUrl, fallbackDurationMs, stateBeforeScene, type StageState } from './timeline'

interface Props { lessonId: string; set: SceneSet; onFinished: () => void; termIds?: string[] }

const SETTLE_MS = 30 // let the "before" state render so CSS transitions can run

export function ScenePlayer({ lessonId, set, onFinished, termIds = [] }: Props) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [slow, setSlow] = useState(false)
  const [runId, setRunId] = useState(0)
  const [stage, setStage] = useState<StageState>(() => stateBeforeScene(set, 0))
  const [moveMs, setMoveMs] = useState<Record<string, number>>({})

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
    finishedCalled.current = false

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
            return dest ? { actors: { ...s.actors, [h.actor]: { ...s.actors[h.actor], x: dest.x, y: dest.y } } } : s
          })
        }, h.at))
      }
    }, SETTLE_MS))

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
  }, [playing, index, runId, set, clearTimers, startFallback])

  const jump = (to: number) => {
    clearTimers()
    setIndex(to)
    const before = stateBeforeScene(set, to)
    // paused: show where the scene ends so the visuals match the caption
    setStage(playing ? before : applyScene(before, set.scenes[to]))
    setMoveMs({})
    setRunId(r => r + 1)
  }

  const togglePlay = () => {
    if (playing) { setPlaying(false); return }
    setPlaying(true)
    setRunId(r => r + 1)
  }

  return (
    <section aria-label="ภาพเคลื่อนไหวสรุปบทเรียน" className="sp">
      <svg
        viewBox={`0 0 ${set.stage.width} ${set.stage.height}`}
        className="sp-stage"
        style={{ aspectRatio: `${set.stage.width} / ${set.stage.height}` }}
        role="img"
        aria-label="เวทีภาพเคลื่อนไหว"
      >
        {Object.values(stage.actors)
          .sort((a, b) => Number(b.kind === 'cable') - Number(a.kind === 'cable'))
          .map(actor => (
            <ActorView
              key={actor.id}
              actor={actor}
              target={actor.to ? stage.actors[actor.to] : undefined}
              moveMs={moveMs[actor.id] ?? 0}
            />
          ))}
      </svg>

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
