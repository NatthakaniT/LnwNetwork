import { describe, expect, it } from 'vitest'
import { editFile, friendDoes, run } from './run'
import type { GitCommand, Machine, Repo, World } from './types'

const ALL: GitCommand[] = ['init', 'status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge', 'clone', 'push', 'pull']
const mk = (name: string): Machine => ({ name, files: {}, staged: null, repo: null })
const emptyRepo = (): Repo => ({ commits: {}, branches: { main: null }, head: 'main' })
const W0: World = { me: mk('me'), friend: mk('friend'), github: null }

/** รันหลายบรรทัดต่อกัน คืน world สุดท้ายกับผลบรรทัดสุดท้าย */
function seq(w: World, ...lines: string[]) {
  let r = { world: w, output: '', explainTh: '', ok: true }
  for (const l of lines) r = run(r.world, l, ALL)
  return r
}
/** GitHub มี commit แรกจากเพื่อน แล้วเรา clone มา */
function cloned() {
  let w: World = { ...W0, friend: { ...W0.friend, repo: emptyRepo(), remote: 'origin' } }
  w = friendDoes(w, { type: 'commit', file: 'index.html', content: 'v1', message: 'first' })
  w = friendDoes(w, { type: 'push' })
  return seq(w, 'git clone https://github.com/x/y.git').world
}
const tip = (r: Repo) => r.commits[r.branches[r.head]!]

describe('ข้อกำหนด Review Focus 3-5', () => {
  it('คำสั่งที่ไม่ใช่ git / พิมพ์ผิด / ยังไม่ได้สอน ไม่ throw และมีคำอธิบายไทย', () => {
    for (const [line, allowed] of [['ls', ALL], ['git rebase main', ALL], ['git', ALL], ['', ALL], ['git push', ['init'] as GitCommand[]]] as const) {
      const r = run(W0, line, [...allowed])
      expect(r.ok).toBe(false)
      expect(r.explainTh).toMatch(/[ก-๙]/)
    }
    expect(run(W0, 'git push', ['init']).explainTh).toContain('ยังไม่ได้เรียน')
  })
  it('git commit ไม่มี -m บอกว่าขาดข้อความ', () => {
    const w = seq(W0, 'git init').world
    const r = run(editFile(w, 'a.txt', 'x'), 'git commit', ALL)
    expect(r.ok).toBe(false)
    expect(r.explainTh).toContain('-m')
  })
  it('commit ข้อความไทยมีช่องว่างเก็บเป็นข้อความเดียว', () => {
    const r = seq(editFile(seq(W0, 'git init').world, 'a.txt', 'x'), 'git add a.txt', 'git commit -m "แก้หน้าแรก ใหม่"')
    expect(r.ok).toBe(true)
    expect(tip(r.world.me.repo!).message).toBe('แก้หน้าแรก ใหม่')
  })
  it('เพื่อน push ไปก่อน → push ถูกปฏิเสธ บอกให้ pull; pull แล้ว push ผ่าน มี commit ทั้งสองคน', () => {
    let w = cloned()
    w = friendDoes(w, { type: 'commit', file: 'friend.txt', content: 'f', message: 'friend work' })
    w = friendDoes(w, { type: 'push' })
    w = editFile(w, 'me.txt', 'm')
    w = seq(w, 'git add .', 'git commit -m "my work"').world
    const rejected = run(w, 'git push', ALL)
    expect(rejected.ok).toBe(false)
    expect(rejected.explainTh).toContain('git pull')
    expect(rejected.world.github).toEqual(w.github)
    const pulled = run(w, 'git pull', ALL)
    expect(pulled.ok).toBe(true)
    const pushed = run(pulled.world, 'git push', ALL)
    expect(pushed.ok).toBe(true)
    const msgs = Object.values(pushed.world.github!.commits).map(c => c.message)
    expect(msgs).toEqual(expect.arrayContaining(['first', 'friend work', 'my work']))
    expect(pushed.world.me.files['friend.txt']).toBe('f')
  })
  it('conflict แล้วแก้ไฟล์ + add + commit → conflict หาย', () => {
    let w = cloned()
    w = friendDoes(w, { type: 'commit', file: 'index.html', content: 'friend', message: 'friend edit' })
    w = friendDoes(w, { type: 'push' })
    w = editFile(w, 'index.html', 'mine')
    w = seq(w, 'git add .', 'git commit -m "my edit"').world
    const p = run(w, 'git pull', ALL)
    expect(p.world.conflict?.file).toBe('index.html')
    expect(p.world.me.files['index.html']).toMatch(/<<<<<<< HEAD\nmine\n=======\nfriend\n>>>>>>> /)
    const blocked = run(p.world, 'git commit -m "x"', ALL)
    expect(blocked.ok).toBe(false)
    const fixed = seq(editFile(p.world, 'index.html', 'mine+friend'), 'git add index.html', 'git commit -m "resolve"')
    expect(fixed.ok).toBe(true)
    expect(fixed.world.conflict).toBeUndefined()
    const t = tip(fixed.world.me.repo!)
    expect(t.parent2).toBeDefined()
    expect(run(fixed.world, 'git push', ALL).ok).toBe(true)
  })
})

describe('พื้นฐาน', () => {
  it('init / status / add / commit / log', () => {
    let w = W0
    expect(run(w, 'git status', ALL).ok).toBe(false) // ยังไม่ใช่ repo
    w = seq(w, 'git init').world
    expect(w.me.repo).not.toBeNull()
    w = editFile(w, 'a.txt', 'one')
    expect(run(w, 'git status', ALL).output).toContain('Untracked')
    w = run(w, 'git add a.txt', ALL).world
    expect(run(w, 'git status', ALL).output).toContain('Changes to be committed')
    const c = run(w, 'git commit -m "first"', ALL)
    expect(c.ok).toBe(true)
    expect(c.output).toContain('c1a0001')
    expect(run(c.world, 'git status', ALL).output).toContain('working tree clean')
    expect(run(editFile(c.world, 'a.txt', 'two'), 'git status', ALL).output).toContain('modified:   a.txt')
    expect(run(c.world, 'git add nope.txt', ALL).ok).toBe(false)
  })
  it('commit ตอนไม่มีอะไร staged → nothing to commit', () => {
    const r = run(seq(W0, 'git init').world, 'git commit -m "x"', ALL)
    expect(r.ok).toBe(false)
    expect(r.output).toContain('nothing to commit')
  })
  it('add . เก็บทุกไฟล์ที่เปลี่ยน', () => {
    let w = seq(W0, 'git init').world
    w = editFile(editFile(w, 'a', '1'), 'b', '2')
    expect(run(w, 'git add .', ALL).world.me.staged).toEqual({ a: '1', b: '2' })
  })
  it('log ใหม่สุดก่อน', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', '1'), 'git add .', 'git commit -m "one"').world
    w = seq(editFile(w, 'a', '2'), 'git add .', 'git commit -m "two"').world
    const out = run(w, 'git log', ALL).output
    expect(out.indexOf('two')).toBeLessThan(out.indexOf('one'))
    expect(out).toContain('HEAD -> main')
  })
  it('branch / switch -c / switch / checkout สลับไฟล์ตาม branch', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', 'main-version'), 'git add .', 'git commit -m "m"').world
    expect(run(w, 'git branch dev', ALL).world.me.repo!.branches.dev).toBe('c1a0001')
    w = seq(w, 'git switch -c feat').world
    expect(w.me.repo!.head).toBe('feat')
    w = seq(editFile(w, 'a', 'feat-version'), 'git add .', 'git commit -m "f"').world
    w = seq(w, 'git switch main').world
    expect(w.me.files.a).toBe('main-version')
    w = seq(w, 'git checkout feat').world
    expect(w.me.files.a).toBe('feat-version')
    expect(run(w, 'git switch nope', ALL).ok).toBe(false)
    expect(run(editFile(w, 'a', 'dirty'), 'git switch main', ALL).ok).toBe(false) // แก้ค้างจะโดนทับ
  })
  it('merge fast-forward', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', '1'), 'git add .', 'git commit -m "m"', 'git switch -c feat').world
    w = seq(editFile(w, 'b', '2'), 'git add .', 'git commit -m "f"', 'git switch main').world
    const r = run(w, 'git merge feat', ALL)
    expect(r.ok).toBe(true)
    expect(r.output).toContain('Fast-forward')
    expect(r.world.me.files.b).toBe('2')
    expect(tip(r.world.me.repo!).parent2).toBeUndefined()
  })
  it('merge commit สองพ่อแม่เมื่อไฟล์ไม่ชนกัน', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', '1'), 'git add .', 'git commit -m "m"', 'git switch -c feat').world
    w = seq(editFile(w, 'b', '2'), 'git add .', 'git commit -m "f"', 'git switch main').world
    w = seq(editFile(w, 'c', '3'), 'git add .', 'git commit -m "m2"').world
    const r = run(w, 'git merge feat', ALL)
    expect(r.ok).toBe(true)
    const t = tip(r.world.me.repo!)
    expect(t.parent && t.parent2).toBeTruthy()
    expect(r.world.me.files).toMatchObject({ a: '1', b: '2', c: '3' })
  })
  it('merge ชนกัน → conflict + เครื่องหมายในไฟล์', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', 'base'), 'git add .', 'git commit -m "m"', 'git switch -c feat').world
    w = seq(editFile(w, 'a', 'feat'), 'git add .', 'git commit -m "f"', 'git switch main').world
    w = seq(editFile(w, 'a', 'main'), 'git add .', 'git commit -m "m2"').world
    const r = run(w, 'git merge feat', ALL)
    expect(r.ok).toBe(false)
    expect(r.world.conflict?.file).toBe('a')
    expect(r.world.me.files.a).toBe('<<<<<<< HEAD\nmain\n=======\nfeat\n>>>>>>> feat\n')
    expect(run(r.world, 'git status', ALL).output).toContain('both modified')
  })
  it('clone ตั้ง remote origin; push โดยไม่มี remote ได้คำอธิบาย; push ไป GitHub ว่างได้', () => {
    const w = cloned()
    expect(w.me.remote).toBe('origin')
    expect(w.me.files['index.html']).toBe('v1')
    const noRemote = run(seq(W0, 'git init').world, 'git push', ALL)
    expect(noRemote.ok).toBe(false)
    expect(noRemote.explainTh).toContain('GitHub')
    const empty: World = { ...W0, github: emptyRepo() }
    let e = seq(empty, 'git clone u').world
    e = seq(editFile(e, 'a', '1'), 'git add .', 'git commit -m "x"').world
    const p = run(e, 'git push', ALL)
    expect(p.ok).toBe(true)
    expect(p.world.github!.branches.main).toBe('c1a0001')
    expect(run(p.world, 'git push', ALL).output).toContain('up-to-date')
  })
  it('ไม่แก้ world เดิม (immutable)', () => {
    const w = cloned()
    const before = JSON.stringify(w)
    seq(editFile(w, 'z', '1'), 'git add .', 'git commit -m "m"', 'git push', 'git switch -c q', 'git merge main')
    expect(JSON.stringify(w)).toBe(before)
  })
})

describe('fix round 1', () => {
  const twoFileConflict = () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(editFile(w, 'a', 'base'), 'b', 'base'), 'git add .', 'git commit -m "m"', 'git switch -c feat').world
    w = seq(editFile(editFile(w, 'a', 'fa'), 'b', 'fb'), 'git add .', 'git commit -m "f"', 'git switch main').world
    w = seq(editFile(editFile(w, 'a', 'ma'), 'b', 'mb'), 'git add .', 'git commit -m "m2"').world
    return run(w, 'git merge feat', ALL)
  }
  it('conflict หลายไฟล์: ต้อง stage ครบก่อน commit และ status แสดงครบ', () => {
    const r = twoFileConflict()
    expect(r.world.conflict?.files).toEqual(['a', 'b'])
    const st = run(r.world, 'git status', ALL).output
    expect(st).toContain('both modified:   a')
    expect(st).toContain('both modified:   b')
    let w = run(editFile(r.world, 'a', 'ok'), 'git add a', ALL).world
    const c = run(w, 'git commit -m "x"', ALL)
    expect(c.ok).toBe(false)
    expect(c.output).toContain('unmerged files')
    expect(c.explainTh).toContain('b')
    expect(run(w, 'git status', ALL).output).not.toContain('both modified:   a')
    w = seq(editFile(w, 'b', 'ok'), 'git add b', 'git commit -m "x"').world
    expect(w.conflict).toBeUndefined()
    expect(w.me.repo!.commits[w.me.repo!.branches.main!].files).toEqual({ a: 'ok', b: 'ok' })
  })
  it('ชื่อที่ตรงกับ property ของ Object ไม่ทำให้พัง', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', '1'), 'git add .', 'git commit -m "m"').world
    for (const n of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      for (const l of [`git switch ${n}`, `git merge ${n}`, `git add ${n}`, `git checkout ${n}`]) {
        const r = run(w, l, ALL)
        expect(r.ok, l).toBe(false)
        expect(r.explainTh).toMatch(/[ก-๙]/)
      }
    }
    const f = seq(editFile(w, 'constructor', 'x'), 'git add constructor', 'git commit -m "c"')
    expect(f.ok).toBe(true)
    expect(run(f.world, 'git status', ALL).output).toContain('working tree clean')
    expect(run(editFile(w, 'toString', 'x'), 'git status', ALL).output).toContain('Untracked')
  })
  it('git branch: -M เปลี่ยนชื่อ, flag อื่นไม่สร้าง branch', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', '1'), 'git add .', 'git commit -m "m"').world
    const m = run(w, 'git branch -M trunk', ALL)
    expect(m.ok).toBe(true)
    expect(m.world.me.repo!.head).toBe('trunk')
    expect(Object.keys(m.world.me.repo!.branches)).toEqual(['trunk'])
    const e = seq(W0, 'git init', 'git branch -M main')
    expect(e.ok).toBe(true)
    expect(e.world.me.repo!.head).toBe('main')
    for (const l of ['git branch -d x', 'git branch -D x', 'git branch -a']) {
      const r = run(w, l, ALL)
      expect(r.ok).toBe(false)
      expect(r.explainTh).toContain('ยังไม่ได้สอน')
      expect(Object.keys(r.world.me.repo!.branches).some(b => b.startsWith('-'))).toBe(false)
    }
  })
  it('commit -m ตอนไม่มีอะไร staged ให้ข้อความตรง git จริง', () => {
    let w = seq(W0, 'git init').world
    w = seq(editFile(w, 'a', '1'), 'git add .', 'git commit -m "m"').world
    const clean = run(w, 'git commit -m "x"', ALL)
    expect(clean.output).toContain('nothing to commit, working tree clean')
    const mod = run(editFile(w, 'a', '2'), 'git commit -m "x"', ALL)
    expect(mod.output).toContain('no changes added to commit')
    expect(mod.explainTh).toContain('git add')
    const unt = run(editFile(w, 'b', '2'), 'git commit -m "x"', ALL)
    expect(unt.output).toContain('nothing added to commit but untracked files present')
    expect(unt.explainTh).toContain('git add')
  })
  it('commit -am อธิบายว่ายังไม่ได้สอน', () => {
    const w = editFile(seq(W0, 'git init').world, 'a', '1')
    const r = run(w, 'git commit -am "x"', ALL)
    expect(r.ok).toBe(false)
    expect(r.explainTh).toContain('ยังไม่ได้สอน')
    expect(r.explainTh).toContain('git add')
  })
  it('คำสั่ง git จริงที่ยังไม่ได้สอน → ยังไม่ได้สอน; พิมพ์ผิด → ไม่รู้จัก', () => {
    for (const c of ['remote -v', 'config user.name x', 'fetch', 'stash', 'rebase main', 'reset --hard'])
      { const e = run(W0, `git ${c}`, ALL).explainTh; expect(e).toContain('ยังไม่ได้สอน'); expect(e).not.toContain('ไม่รู้จัก') }
    expect(run(W0, 'git comit', ALL).explainTh).toContain('ไม่รู้จัก')
  })
  it('push/pull ไม่มี remote บอกว่าได้ลิงก์จาก git clone', () => {
    const w = seq(W0, 'git init').world
    expect(run(w, 'git push', ALL).explainTh).toContain('git clone')
    expect(run(w, 'git pull', ALL).explainTh).toContain('git clone')
  })
  it('merge --abort คืนสภาพก่อน merge และล้าง conflict', () => {
    const before = twoFileConflict()
    expect(before.world.conflict).toBeDefined()
    const w0 = (() => {
      let w = seq(W0, 'git init').world
      w = seq(editFile(editFile(w, 'a', 'base'), 'b', 'base'), 'git add .', 'git commit -m "m"', 'git switch -c feat').world
      w = seq(editFile(editFile(w, 'a', 'fa'), 'b', 'fb'), 'git add .', 'git commit -m "f"', 'git switch main').world
      return seq(editFile(editFile(w, 'a', 'ma'), 'b', 'mb'), 'git add .', 'git commit -m "m2"').world
    })()
    const r = run(before.world, 'git merge --abort', ALL)
    expect(r.ok).toBe(true)
    expect(r.world.conflict).toBeUndefined()
    expect(r.world.me).toEqual(w0.me)
    expect(run(w0, 'git merge --abort', ALL).ok).toBe(false)
  })
})
