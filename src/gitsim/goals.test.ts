import { describe, expect, it } from 'vitest'
import { checkGitGoal, type GitGoal } from './goals'
import { editFile, friendDoes, run } from './run'
import type { GitCommand, Machine, World } from './types'

const ALL: GitCommand[] = ['init', 'status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge', 'clone', 'push', 'pull']
const mk = (name: string): Machine => ({ name, files: {}, staged: null, repo: null })
const W0: World = { me: mk('me'), friend: mk('friend'), github: null }
const go = (w: World, ...ls: string[]) => ls.reduce((x, l) => run(x, l, ALL).world, w)
const g = (check: Extract<GitGoal, { type: 'state' }>['check'], arg?: string): GitGoal => ({ type: 'state', taskTh: 't', hintTh: 'h', check, arg })

describe('checkGitGoal', () => {
  it('committed / staged', () => {
    let w = go(W0, 'git init')
    expect(checkGitGoal(w, g('committed'))).toBe(false)
    w = go(editFile(w, 'a.txt', 'x'), 'git add a.txt')
    expect(checkGitGoal(w, g('staged'))).toBe(true)
    expect(checkGitGoal(w, g('staged', 'b.txt'))).toBe(false)
    w = go(w, 'git commit -m "แรก"')
    expect(checkGitGoal(w, g('staged'))).toBe(false)
    expect(checkGitGoal(w, g('committed'))).toBe(true)
    expect(checkGitGoal(w, g('committed', 'แรก'))).toBe(true)
    expect(checkGitGoal(w, g('committed', 'อื่น'))).toBe(false)
  })
  it('cloned / pulled / pushed / onBranch / merged', () => {
    let f: World = { ...W0, friend: { ...W0.friend, repo: { commits: {}, branches: { main: null }, head: 'main' }, remote: 'origin' as const } }
    f = friendDoes(f, { type: 'commit', file: 'a.txt', content: '1', message: 'm1' })
    f = friendDoes(f, { type: 'push' })
    let w = go(f, 'git clone https://github.com/x/y.git')
    expect(checkGitGoal(w, g('cloned'))).toBe(true)
    expect(checkGitGoal(w, g('pulled'))).toBe(true)
    w = friendDoes(friendDoes(w, { type: 'commit', file: 'a.txt', content: '2', message: 'm2' }), { type: 'push' })
    expect(checkGitGoal(w, g('pulled'))).toBe(false)
    w = go(w, 'git pull')
    expect(checkGitGoal(w, g('pulled'))).toBe(true)
    w = go(editFile(w, 'b.txt', 'b'), 'git switch -c feat')
    expect(checkGitGoal(w, g('onBranch', 'feat'))).toBe(true)
    w = go(w, 'git add b.txt', 'git commit -m "b"', 'git switch main')
    expect(checkGitGoal(w, g('merged', 'feat'))).toBe(false)
    w = go(w, 'git merge feat')
    expect(checkGitGoal(w, g('merged', 'feat'))).toBe(true)
    expect(checkGitGoal(w, g('pushed'))).toBe(false)
    w = go(w, 'git push')
    expect(checkGitGoal(w, g('pushed'))).toBe(true)
  })
  it('conflictFixed', () => {
    let f: World = { ...W0, friend: { ...W0.friend, repo: { commits: {}, branches: { main: null }, head: 'main' }, remote: 'origin' as const } }
    f = friendDoes(friendDoes(f, { type: 'commit', file: 'a.txt', content: '1', message: 'm1' }), { type: 'push' })
    let w = go(f, 'git clone https://github.com/x/y.git')
    w = friendDoes(friendDoes(w, { type: 'commit', file: 'a.txt', content: 'F', message: 'f' }), { type: 'push' })
    w = go(editFile(w, 'a.txt', 'M'), 'git add a.txt', 'git commit -m "m"', 'git pull')
    expect(w.conflict).toBeTruthy()
    expect(checkGitGoal(w, g('conflictFixed'))).toBe(false)
    w = go(editFile(w, 'a.txt', 'ok'), 'git add a.txt', 'git commit -m "รวม"')
    expect(checkGitGoal(w, g('conflictFixed'))).toBe(true)
  })
})
