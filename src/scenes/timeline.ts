import type { Actor, Scene, SceneAction, SceneSet } from '../content/types'

export interface StageState { actors: Record<string, Actor & { highlighted?: boolean }> }

export function initialState(set: SceneSet): StageState {
  const actors: StageState['actors'] = {}
  for (const a of set.actors) actors[a.id] = { ...a }
  return { actors }
}

export function applyAction(state: StageState, action: SceneAction): StageState {
  const cur = state.actors[action.actor]
  if (!cur) return state
  let next: Actor & { highlighted?: boolean } = cur
  switch (action.type) {
    case 'show': next = { ...cur, hidden: false }; break
    case 'hide': next = { ...cur, hidden: true }; break
    case 'highlight': next = { ...cur, highlighted: true }; break
    case 'unhighlight': next = { ...cur, highlighted: false }; break
    case 'move': next = { ...cur, x: action.x, y: action.y }; break
    case 'setLabel': next = { ...cur, label: action.label }; break
    case 'moveAlong': {
      const last = state.actors[action.path[action.path.length - 1]]
      if (last) next = { ...cur, x: last.x, y: last.y }
      break
    }
  }
  return { actors: { ...state.actors, [action.actor]: next } }
}

export function applyScene(state: StageState, scene: Scene): StageState {
  return scene.actions.reduce(applyAction, state)
}

export function stateBeforeScene(set: SceneSet, index: number): StageState {
  return set.scenes.slice(0, index).reduce(applyScene, initialState(set))
}

export function fallbackDurationMs(narrationTh: string, rate: number): number {
  return (narrationTh.length * 90 + 1500) / rate
}

// base มาจาก vite (เครื่องตัวเอง = '/', GitHub Pages = '/LnwNetwork/')
export function audioUrl(lessonId: string, sceneId: string, base: string = import.meta.env.BASE_URL): string {
  return `${base}audio/${lessonId}/${sceneId}.mp3`
}
