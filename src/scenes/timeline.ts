import type { Actor, Scene, SceneAction, SceneSet, Tone } from '../content/types'

export type StageActor = Actor & { highlighted?: boolean; dimmed?: boolean; glow?: boolean }
export interface StageState {
  actors: Record<string, StageActor>
  trails: { path: string[]; tone: Tone }[]
  bubbles: { actor: string; text: string; mood: 'yes' | 'no' }[]
}

export function initialState(set: SceneSet): StageState {
  const actors: StageState['actors'] = {}
  for (const a of set.actors) actors[a.id] = { ...a }
  return { actors, trails: [], bubbles: [] }
}

export function applyAction(state: StageState, action: SceneAction): StageState {
  switch (action.type) {
    case 'trail': return { ...state, trails: [...state.trails, { path: action.path, tone: action.tone }] }
    case 'say': {
      const { actor, text, mood } = action
      return { ...state, bubbles: [...state.bubbles.filter((b) => b.actor !== actor), { actor, text, mood }] }
    }
    case 'ripple': return state // ไม่มีผลกับสภาพตอนจบ
  }
  const cur = state.actors[action.actor]
  if (!cur) return state
  let next: StageActor = cur
  switch (action.type) {
    case 'show': next = { ...cur, hidden: false }; break
    case 'hide': next = { ...cur, hidden: true }; break
    case 'highlight': next = { ...cur, highlighted: true }; break
    case 'unhighlight': next = { ...cur, highlighted: false }; break
    case 'dim': next = { ...cur, dimmed: true }; break
    case 'glow': next = { ...cur, glow: true }; break
    case 'move': next = { ...cur, x: action.x, y: action.y }; break
    case 'setLabel': next = { ...cur, label: action.label }; break
    case 'setRows': next = { ...cur, rows: action.rows }; break
    case 'moveAlong': {
      const last = state.actors[action.path[action.path.length - 1]]
      const o = action.offset ?? { dx: 0, dy: 0 }
      if (last) next = { ...cur, x: last.x + o.dx, y: last.y + o.dy }
      break
    }
  }
  return { ...state, actors: { ...state.actors, [action.actor]: next } }
}

export function applyScene(state: StageState, scene: Scene): StageState {
  return scene.actions.reduce(applyAction, state)
}

/** v2: เวทีเริ่มใหม่ทุกฉาก (initialState + setup ของฉากนั้น) / แบบเดิม: สะสมจากฉากก่อน ๆ */
export function stateBeforeScene(set: SceneSet, index: number): StageState {
  if (set.style === 'v2') return (set.scenes[index]?.setup ?? []).reduce(applyAction, initialState(set))
  return set.scenes.slice(0, index).reduce(applyScene, initialState(set))
}

export function stateAfterScene(set: SceneSet, index: number): StageState {
  return applyScene(stateBeforeScene(set, index), set.scenes[index])
}

export function fallbackDurationMs(narrationTh: string, rate: number): number {
  return (narrationTh.length * 90 + 1500) / rate
}

// base มาจาก vite (เครื่องตัวเอง = '/', GitHub Pages = '/LnwNetwork/')
export function audioUrl(lessonId: string, sceneId: string, base: string = import.meta.env.BASE_URL): string {
  return `${base}audio/${lessonId}/${sceneId}.mp3`
}
