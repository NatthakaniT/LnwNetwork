import type { GitCommand, Repo, World } from './types'
import type { friendDoes } from './run'

export type GitGoal =
  | { type: 'state'; taskTh: string; hintTh: string; check: 'committed' | 'staged' | 'pushed' | 'pulled' | 'onBranch' | 'merged' | 'conflictFixed' | 'cloned'; arg?: string }
export interface GitLab {
  kind: 'git'; introTh: string; start: World; allowed: GitCommand[]; goals: GitGoal[]
  friendScript?: { afterGoal: number; action: Parameters<typeof friendDoes>[1] }[] // afterGoal นับจาก 0
}

const tip = (r: Repo | null, b = r?.head ?? '') => (r && r.branches[b]) || null
function ancestors(r: Repo, id: string | null): Set<string> {
  const seen = new Set<string>()
  const todo = id ? [id] : []
  while (todo.length) {
    const c = r.commits[todo.pop()!]
    if (!c || seen.has(c.id)) continue
    seen.add(c.id)
    todo.push(...(c.parent ? [c.parent] : []), ...(c.parent2 ? [c.parent2] : []))
  }
  return seen
}

export function checkGitGoal(world: World, g: GitGoal): boolean {
  const repo = world.me.repo
  if (!repo) return false
  const mine = tip(repo)
  switch (g.check) {
    case 'committed': return g.arg ? Object.values(repo.commits).some(c => c.message.includes(g.arg!)) : Object.keys(repo.commits).length > 0
    case 'staged': return !!world.me.staged && (!g.arg || g.arg in world.me.staged)
    case 'pushed': return !!mine && world.github?.branches[repo.head] === mine
    case 'pulled': return !!world.github && world.me.remote === 'origin' && !world.conflict && !!tip(world.github) && tip(world.github)! in repo.commits && ancestors(repo, mine).has(tip(world.github)!)
    case 'onBranch': return repo.head === g.arg
    case 'merged': { const o = g.arg ? tip(repo, g.arg) : null; return !!o && !world.conflict && ancestors(repo, mine).has(o) }
    case 'conflictFixed': return !world.conflict && !!mine && !!repo.commits[mine].parent2
    case 'cloned': return world.me.remote === 'origin'
  }
}
