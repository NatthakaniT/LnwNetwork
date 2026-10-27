import { KNOWN, tokenize } from './parse'
import type { Commit, GitCommand, Machine, Repo, RunResult, World } from './types'

export { tokenize }
type Files = Record<string, string>

// ---------- helpers ----------
const done = (world: World, output: string, explainTh: string, ok = true): RunResult => ({ world, output, explainTh, ok })
const fail = (world: World, output: string, explainTh: string) => done(world, output, explainTh, false)
// conflict: ไม่ส่ง = คงเดิม, ส่ง undefined = ล้าง
const setMe = (w: World, patch: Partial<Machine>, ...c: [World['conflict']] | []): World => {
  const { conflict: _drop, ...rest } = w
  const conflict = c.length ? c[0] : w.conflict
  return { ...rest, me: { ...w.me, ...patch }, ...(conflict ? { conflict } : {}) }
}
const withBranch = (r: Repo, name: string, id: string | null): Repo => ({ ...r, branches: { ...r.branches, [name]: id } })
const snap = (r: Repo, id: string | null): Files => (id ? r.commits[id].files : {})
const tipOf = (r: Repo) => r.branches[r.head] ?? null
const nl = (s: string) => (s.endsWith('\n') ? s : s + '\n')

function ancestors(r: Repo, id: string | null): Set<string> {
  const seen = new Set<string>()
  const stack = id ? [id] : []
  while (stack.length) {
    const c = r.commits[stack.pop()!]
    if (!c || seen.has(c.id)) continue
    seen.add(c.id)
    stack.push(...(c.parent ? [c.parent] : []), ...(c.parent2 ? [c.parent2] : []))
  }
  return seen
}

/** id ต้องไม่ซ้ำทั้งโลก: นับ commit ทุกที่ที่มีแล้วบวกหนึ่ง (กำหนดได้ ไม่สุ่ม) */
function nextId(w: World): string {
  const all = new Set<string>()
  for (const r of [w.me.repo, w.friend.repo, w.github]) if (r) Object.keys(r.commits).forEach(k => all.add(k))
  return 'c1a' + (all.size + 1).toString(16).padStart(4, '0')
}

/** ย้ายไฟล์ทำงานจากสภาพ from ไปสภาพ to; ไฟล์ untracked และไฟล์ที่แก้ค้างโดยไม่ชนกันจะติดไปด้วย */
function checkoutFiles(m: Machine, from: Files, to: Files): Files {
  const next = { ...to }
  for (const [f, c] of Object.entries(m.files)) {
    if (!(f in from)) next[f] ??= c
    else if (c !== from[f] && from[f] === to[f]) next[f] = c
  }
  return next
}
/** มีไฟล์ที่แก้ค้าง/stage ไว้ และการย้ายครั้งนี้จะทับมัน */
function blocked(m: Machine, from: Files, to: Files): boolean {
  const dirty = new Set([...Object.keys(m.staged ?? {}), ...Object.keys(m.files).filter(f => f in from && m.files[f] !== from[f])])
  return [...dirty].some(f => from[f] !== to[f])
}
const blockedMsg = (w: World) =>
  fail(w, 'error: Your local changes would be overwritten.\nPlease commit your changes or stash them before you continue.',
    'ในเครื่องมีไฟล์ที่แก้ไว้แต่ยังไม่ได้ commit และคำสั่งนี้จะเขียนทับมัน git เลยหยุดให้ก่อน ให้ git add แล้ว git commit งานที่ค้างอยู่ก่อน แล้วค่อยลองใหม่')

/** ส่ง commit ของ src ขึ้น dst (เฉพาะ branch ปัจจุบัน) */
function pushRepo(src: Repo, dst: Repo | null): { status: 'ok' | 'uptodate' | 'rejected' | 'empty'; dst: Repo } {
  const target = dst ?? { commits: {}, branches: { [src.head]: null }, head: src.head }
  const mine = tipOf(src)
  const theirs = target.branches[src.head] ?? null
  if (!mine) return { status: 'empty', dst: target }
  if (mine === theirs) return { status: 'uptodate', dst: target }
  const mineAnc = ancestors(src, mine)
  if (theirs && !mineAnc.has(theirs)) return { status: 'rejected', dst: target }
  const commits = { ...target.commits }
  for (const id of mineAnc) commits[id] = src.commits[id]
  return { status: 'ok', dst: withBranch({ ...target, commits }, src.head, mine) }
}

// ---------- merge (ใช้ทั้ง merge และ pull) ----------
function integrate(w: World, theirs: string, label: string, message: string): RunResult {
  const me = w.me
  const repo = me.repo!
  const ours = tipOf(repo)
  const oSnap = snap(repo, ours)
  if (ancestors(repo, ours).has(theirs)) return done(w, 'Already up to date.', 'ฝั่งนี้มีทุกอย่างของอีกฝั่งอยู่แล้ว เลยไม่มีอะไรต้องรวมเพิ่ม')
  const tSnap = snap(repo, theirs)

  if (!ours || ancestors(repo, theirs).has(ours)) {
    if (blocked(me, oSnap, tSnap)) return blockedMsg(w)
    const files = checkoutFiles(me, oSnap, tSnap)
    return done(setMe(w, { files, repo: withBranch(repo, repo.head, theirs) }),
      `Updating ${ours?.slice(0, 7) ?? '0000000'}..${theirs.slice(0, 7)}\nFast-forward`,
      'ฝั่งเราไม่มีอะไรใหม่เลย git เลยแค่เลื่อน branch ตามไปให้ทัน เรียกว่า fast-forward ไม่ต้องสร้าง commit รวมเพิ่ม')
  }

  const ancO = ancestors(repo, ours)
  const common = [...ancestors(repo, theirs)].filter(id => ancO.has(id)).sort().pop() ?? null
  const bSnap = snap(repo, common)
  const merged: Files = {}
  const conflicts: string[] = []
  for (const f of new Set([...Object.keys(oSnap), ...Object.keys(tSnap), ...Object.keys(bSnap)])) {
    const o = oSnap[f], t = tSnap[f], b = bSnap[f]
    let r: string | undefined
    if (o === t) r = o
    else if (o === b) r = t
    else if (t === b) r = o
    else { conflicts.push(f); r = `<<<<<<< HEAD\n${nl(o ?? '')}=======\n${nl(t ?? '')}>>>>>>> ${label}\n` }
    if (r !== undefined) merged[f] = r
  }
  if (blocked(me, oSnap, merged)) return blockedMsg(w)
  const files = checkoutFiles(me, oSnap, merged)

  if (conflicts.length) {
    const clean = Object.fromEntries(Object.entries(merged).filter(([f, c]) => !conflicts.includes(f) && c !== oSnap[f]))
    const world = setMe(w, { files, staged: Object.keys(clean).length ? clean : null }, { file: conflicts[0], mergeHead: theirs, mergeMessage: message })
    return fail(world,
      conflicts.map(f => `Auto-merging ${f}\nCONFLICT (content): Merge conflict in ${f}`).join('\n') + '\nAutomatic merge failed; fix conflicts and then commit the result.',
      `สองฝั่งแก้ไฟล์ ${conflicts.join(', ')} ในที่เดียวกันคนละแบบ git เลือกเองไม่ได้เลยใส่เครื่องหมาย <<<<<<< ======= >>>>>>> ไว้ในไฟล์ ให้เปิดไฟล์แก้เองให้เหลือแบบที่ต้องการ ลบเครื่องหมายออก แล้ว git add กับ git commit`)
  }
  const id = nextId(w)
  const commit: Commit = { id, message, parent: ours, parent2: theirs, files: merged }
  const next = withBranch({ ...repo, commits: { ...repo.commits, [id]: commit } }, repo.head, id)
  return done(setMe(w, { files, repo: next }), `Merge made by the 'ort' strategy.\n[${repo.head} ${id}] ${message}`,
    'สองฝั่งต่างมีงานใหม่ที่ไม่ชนกัน git เลยรวมให้เองและสร้าง merge commit ที่มีพ่อแม่สองคน ไม่ต้องแก้อะไรเพิ่ม')
}

// ---------- แต่ละคำสั่ง ----------
type Handler = (w: World, args: string[]) => RunResult
const midMerge = (w: World) =>
  fail(w, 'fatal: You have not concluded your merge (MERGE_HEAD exists).',
    'ตอนนี้ยังรวมงานค้างอยู่เพราะมี conflict ให้แก้ไฟล์ให้เสร็จ แล้ว git add กับ git commit ก่อน ค่อยทำคำสั่งนี้')

const handlers: Record<GitCommand, Handler> = {
  init(w) {
    if (w.me.repo) return done(w, 'Reinitialized existing Git repository', 'โฟลเดอร์นี้เป็น repo อยู่แล้ว git เลยไม่ต้องสร้างใหม่ ประวัติเดิมยังอยู่ครบ')
    const repo: Repo = { commits: {}, branches: { main: null }, head: 'main' }
    return done(setMe(w, { repo }), 'Initialized empty Git repository', 'สร้าง repo เปล่าในโฟลเดอร์นี้แล้ว จากนี้ git จะเริ่มจดประวัติงานให้ ถ้าไม่ init ก็ใช้คำสั่ง git อื่นไม่ได้')
  },

  status(w) {
    const { repo, files, staged } = w.me
    const head = snap(repo!, tipOf(repo!))
    const st = staged ?? {}
    const stagedL: string[] = [], unstagedL: string[] = [], untracked: string[] = [], unmerged: string[] = []
    for (const f of Object.keys({ ...st, ...files }).sort()) {
      if (w.conflict?.file === f && !(f in st)) { unmerged.push(`\tboth modified:   ${f}`); continue }
      if (f in st && st[f] !== head[f]) stagedL.push(`\t${f in head ? 'modified:  ' : 'new file:  '} ${f}`)
      if (!(f in files)) continue
      if (f in st) { if (files[f] !== st[f]) unstagedL.push(`\tmodified:   ${f}`) }
      else if (!(f in head)) untracked.push(`\t${f}`)
      else if (files[f] !== head[f]) unstagedL.push(`\tmodified:   ${f}`)
    }
    const out = [`On branch ${repo!.head}`]
    if (!tipOf(repo!)) out.push('\nNo commits yet')
    if (w.conflict) out.push('\nYou have unmerged paths.')
    if (unmerged.length) out.push('\nUnmerged paths:', ...unmerged)
    if (stagedL.length) out.push('\nChanges to be committed:', ...stagedL)
    if (unstagedL.length) out.push('\nChanges not staged for commit:', ...unstagedL)
    if (untracked.length) out.push('\nUntracked files:', ...untracked)
    const clean = !(stagedL.length || unstagedL.length || untracked.length || unmerged.length)
    if (clean) out.push(tipOf(repo!) ? '\nnothing to commit, working tree clean' : '\nnothing to commit (create/copy files and use "git add" to track)')
    return done(w, out.join('\n'), clean
      ? 'ตอนนี้ไฟล์ทุกไฟล์ตรงกับ commit ล่าสุด ไม่มีอะไรค้าง'
      : 'status บอกว่าไฟล์ไหนเพิ่งสร้าง แก้ไป หรือเตรียมไว้พร้อม commit แล้ว ดูก่อนทุกครั้งว่าจะ commit อะไร')
  },

  add(w, args) {
    if (!args.length) return done(w, 'Nothing specified, nothing added.', 'ต้องบอกว่าจะเก็บไฟล์ไหน เช่น git add ชื่อไฟล์ หรือ git add . เพื่อเก็บทุกไฟล์ที่เปลี่ยน')
    const { repo, files } = w.me
    const head = snap(repo!, tipOf(repo!))
    const staged = { ...(w.me.staged ?? {}) }
    const pick = args.includes('.') || args.includes('-A') ? Object.keys(files) : args
    const missing = pick.find(f => !(f in files))
    if (missing) return fail(w, `fatal: pathspec '${missing}' did not match any files`, `ไม่เจอไฟล์ชื่อ ${missing} ในโฟลเดอร์นี้ ลองเช็กชื่อไฟล์ว่าสะกดถูกไหม แล้วพิมพ์ใหม่`)
    for (const f of pick) if (files[f] !== head[f] || f in staged) staged[f] = files[f]
    return done(setMe(w, { staged: Object.keys(staged).length ? staged : null }), '',
      'เอาการเปลี่ยนแปลงไปวางในที่พักก่อน commit (staging) เหมือนหยิบของใส่ตะกร้า ถ้าไม่ add ไฟล์นั้นจะไม่ถูกเก็บลง commit')
  },

  commit(w, args) {
    const i = args.indexOf('-m')
    if (i < 0 || args[i + 1] === undefined || args[i + 1].trim() === '')
      return fail(w, 'error: switch `m\' requires a value', 'commit ต้องมีข้อความบอกว่าแก้อะไร ให้พิมพ์แบบ git commit -m "ข้อความ" นะ ในแอปนี้ไม่เปิดโปรแกรมแก้ข้อความให้')
    const message = args[i + 1]
    const { repo } = w.me
    const parent = tipOf(repo!)
    const head = snap(repo!, parent)
    const staged = w.me.staged ?? {}
    const changed = Object.keys(staged).filter(f => staged[f] !== head[f])
    const c = w.conflict
    if (c && !(c.file in staged))
      return fail(w, `error: Committing is not possible because you have unmerged files.\n\tboth modified:   ${c.file}`,
        `ไฟล์ ${c.file} ยัง conflict อยู่ ให้เปิดไฟล์แก้ให้เสร็จ แล้ว git add ${c.file} ก่อน ถึงจะ commit ได้`)
    if (!c && !changed.length)
      return fail(w, 'nothing to commit, working tree clean', 'ยังไม่มีอะไรอยู่ในที่พักให้ commit ให้แก้ไฟล์แล้ว git add ก่อน ถึงจะ commit ได้')
    const id = nextId(w)
    const commit: Commit = { id, message: c?.mergeMessage ?? message, parent, ...(c?.mergeHead ? { parent2: c.mergeHead } : {}), files: { ...head, ...staged } }
    const next = withBranch({ ...repo!, commits: { ...repo!.commits, [id]: commit } }, repo!.head, id)
    return done(setMe(w, { repo: next, staged: null }, undefined),
      `[${repo!.head}${parent ? '' : ' (root-commit)'} ${id}] ${commit.message}\n ${changed.length} file(s) changed`,
      c ? 'แก้ conflict เสร็จและบันทึกแล้ว git สร้าง merge commit ปิดงานรวมให้ conflict หายไปแล้ว'
        : 'บันทึกสภาพไฟล์ตอนนี้เป็น commit หนึ่งอัน เหมือนเซฟจุดย้อนกลับไว้ ถ้าไม่ commit งานที่ add ไว้จะยังไม่ถูกจดลงประวัติ')
  },

  log(w) {
    const repo = w.me.repo!
    const t = tipOf(repo)
    if (!t) return fail(w, `fatal: your current branch '${repo.head}' does not have any commits yet`, 'ยังไม่เคย commit เลย เลยไม่มีประวัติให้ดู ลอง git add แล้ว git commit ก่อน')
    const out = [...ancestors(repo, t)].sort().reverse().map(id => {
      const c = repo.commits[id]
      const refs = Object.keys(repo.branches).filter(b => repo.branches[b] === id).map(b => (b === repo.head ? `HEAD -> ${b}` : b))
      if (refs.includes(`HEAD -> ${repo.head}`)) refs.unshift(refs.splice(refs.indexOf(`HEAD -> ${repo.head}`), 1)[0])
      return `commit ${id}${refs.length ? ` (${refs.join(', ')})` : ''}${c.parent2 ? `\nMerge: ${c.parent!.slice(0, 7)} ${c.parent2.slice(0, 7)}` : ''}\n\n    ${c.message}\n`
    })
    return done(w, out.join('\n'), 'log แสดงประวัติ commit จากใหม่สุดไปเก่าสุด แต่ละอันมีรหัสและข้อความที่เราเขียนไว้')
  },

  branch(w, args) {
    const repo = w.me.repo!
    if (!args.length)
      return done(w, Object.keys(repo.branches).sort().map(b => `${b === repo.head ? '*' : ' '} ${b}`).join('\n'), 'รายการ branch ทั้งหมด ดาวคืออันที่เราอยู่ตอนนี้')
    const name = args[0]
    if (name in repo.branches) return fail(w, `fatal: a branch named '${name}' already exists`, `มี branch ชื่อ ${name} อยู่แล้ว ลองตั้งชื่อใหม่`)
    const t = tipOf(repo)
    if (!t) return fail(w, `fatal: not a valid object name: '${repo.head}'`, 'ยังไม่มี commit เลย สร้าง branch ไม่ได้ ให้ commit อย่างน้อยหนึ่งครั้งก่อน')
    return done(setMe(w, { repo: withBranch(repo, name, t) }), '', `สร้าง branch ชื่อ ${name} แยกออกมาจากจุดนี้ แต่ยังไม่ได้ย้ายไปอยู่ ต้อง git switch ${name} ถึงจะไปทำงานที่นั่น`)
  },

  switch(w, args) {
    const repo = w.me.repo!
    const create = args.includes('-c') || args.includes('-b')
    const name = args.find(a => !a.startsWith('-'))
    if (!name) return fail(w, 'fatal: missing branch name', 'ต้องบอกชื่อ branch ที่จะไป เช่น git switch main')
    if (w.conflict) return midMerge(w)
    if (create) {
      if (name in repo.branches) return fail(w, `fatal: a branch named '${name}' already exists`, `มี branch ชื่อ ${name} อยู่แล้ว ใช้ git switch ${name} เพื่อไปที่นั่น`)
      return done(setMe(w, { repo: { ...withBranch(repo, name, tipOf(repo)), head: name } }), `Switched to a new branch '${name}'`,
        `สร้าง branch ${name} แล้วย้ายไปอยู่ทันที งานที่ทำต่อจากนี้จะเก็บใน branch นี้ ไม่กระทบ ${repo.head}`)
    }
    if (!(name in repo.branches)) return fail(w, `fatal: invalid reference: ${name}`, `ไม่มี branch ชื่อ ${name} พิมพ์ git branch ดูรายชื่อ branch ที่มีได้`)
    if (name === repo.head) return done(w, `Already on '${name}'`, `อยู่ที่ branch ${name} อยู่แล้ว ไม่ต้องย้าย`)
    const from = snap(repo, tipOf(repo)), to = snap(repo, repo.branches[name])
    if (blocked(w.me, from, to)) return blockedMsg(w)
    return done(setMe(w, { repo: { ...repo, head: name }, files: checkoutFiles(w.me, from, to) }), `Switched to branch '${name}'`,
      `ย้ายมาที่ branch ${name} ไฟล์ในโฟลเดอร์เปลี่ยนไปตามงานของ branch นี้ งานของอีก branch ไม่หาย แค่ถูกเก็บไว้ที่นั่น`)
  },

  checkout(w, args) {
    const r = handlers.switch(w, args)
    return r.ok ? { ...r, explainTh: r.explainTh + ' (git checkout ทำหน้าที่นี้ได้เหมือน git switch)' } : r
  },

  merge(w, args) {
    const repo = w.me.repo!
    const name = args[0]
    if (!name) return fail(w, 'fatal: No commit specified and merge.defaultToUpstream not set.', 'ต้องบอกชื่อ branch ที่จะเอามารวม เช่น git merge feature')
    if (w.conflict) return midMerge(w)
    const t = repo.branches[name]
    if (!(name in repo.branches) || !t) return fail(w, `merge: ${name} - not something we can merge`, `ไม่มี branch ชื่อ ${name} (หรือยังไม่มี commit) ลอง git branch ดูรายชื่อก่อน`)
    return integrate(w, t, name, `Merge branch '${name}'`)
  },

  clone(w) {
    if (w.me.repo) return fail(w, 'fatal: destination path already exists and is not an empty directory.', 'ตรงนี้เป็น repo อยู่แล้ว ไม่ต้อง clone อีก')
    if (!w.github) return fail(w, 'fatal: repository not found', 'หา repo บน GitHub ไม่เจอ ลองเช็กลิงก์อีกที')
    const repo = structuredClone(w.github)
    const files = { ...snap(repo, tipOf(repo)) }
    return done(setMe(w, { repo, files, staged: null, remote: 'origin' }), "Cloning into 'project'...\ndone.",
      'ดึงสำเนา repo ทั้งก้อนจาก GitHub ลงเครื่อง พร้อมประวัติทั้งหมด และตั้งลิงก์ชื่อ origin ไว้ให้ push กับ pull ได้ ถ้าไม่ clone ก็ไม่มีไฟล์ของโปรเจกต์ในเครื่อง')
  },

  push(w) {
    const { repo } = w.me
    if (w.me.remote !== 'origin')
      return fail(w, 'fatal: No configured push destination.', 'เครื่องนี้ยังไม่ได้ผูกกับ GitHub เลย จึงไม่รู้ว่าจะส่งงานไปที่ไหน ให้ clone repo จาก GitHub มา ถึงจะ push ได้')
    const r = pushRepo(repo!, w.github)
    const b = repo!.head
    if (r.status === 'empty') return fail(w, `error: src refspec ${b} does not match any`, 'ยังไม่มี commit ให้ส่ง ให้ commit อย่างน้อยหนึ่งครั้งก่อน แล้วค่อย push')
    if (r.status === 'uptodate') return done(w, 'Everything up-to-date', 'GitHub มีงานเท่ากับเครื่องเราแล้ว ไม่มีอะไรต้องส่งเพิ่ม')
    if (r.status === 'rejected')
      return fail(w, ` ! [rejected]        ${b} -> ${b} (fetch first)\nerror: failed to push some refs to 'origin'`,
        'push ไม่ผ่านเพราะ GitHub มี commit ใหม่ที่เครื่องเรายังไม่มี เช่นเพื่อน push ไปก่อน git กันไม่ให้ทับงานเขา ให้พิมพ์ git pull เพื่อดึงมารวมก่อน แล้วค่อย git push อีกครั้ง')
    return done({ ...w, github: r.dst }, `To github.com/origin\n   ${tipOf(repo!)!.slice(0, 7)}  ${b} -> ${b}`, 'ส่ง commit ของเราขึ้น GitHub แล้ว เพื่อนจะเห็นงานนี้ ถ้าไม่ push งานก็อยู่แค่ในเครื่องเรา')
  },

  pull(w) {
    const repo = w.me.repo!
    if (w.me.remote !== 'origin' || !w.github)
      return fail(w, 'fatal: No remote repository specified.', 'เครื่องนี้ยังไม่ได้ผูกกับ GitHub จึงไม่มีที่ให้ดึงงานมา ให้ clone repo จาก GitHub มาก่อน')
    if (w.conflict) return midMerge(w)
    const theirs = w.github.branches[repo.head] ?? null
    if (!theirs) return done(w, 'Already up to date.', 'GitHub ยังไม่มีงานใน branch นี้ เลยไม่มีอะไรให้ดึงมา')
    const fetched = setMe(w, { repo: { ...repo, commits: { ...repo.commits, ...w.github.commits } } })
    const r = integrate(fetched, theirs, `origin/${repo.head}`, `Merge branch '${repo.head}' of origin`)
    return { ...r, explainTh: 'pull คือดึงงานใหม่จาก GitHub (fetch) แล้วรวมเข้ากับงานเรา (merge) ในคำสั่งเดียว: ' + r.explainTh }
  },
}

// ---------- API ----------
export function run(world: World, line: string, allowed: GitCommand[]): RunResult {
  const t = tokenize(line.trim())
  if (!t.length) return fail(world, '', 'ยังไม่ได้พิมพ์อะไรเลย ลองพิมพ์คำสั่งที่ขึ้นต้นด้วย git ดูนะ')
  if (t[0] !== 'git')
    return fail(world, `bash: ${t[0]}: command not found`, 'ช่องนี้จำลอง Git Bash ที่รับเฉพาะคำสั่งที่ขึ้นต้นด้วย git เท่านั้น ลองพิมพ์ git แล้วตามด้วยคำสั่งที่เรียนอยู่')
  const cmd = t[1]
  if (!cmd) return fail(world, 'usage: git <command> [<args>]', 'git ต้องตามด้วยคำสั่ง เช่น git status ลองพิมพ์ต่อท้ายดู')
  if (!(KNOWN as string[]).includes(cmd))
    return fail(world, `git: '${cmd}' is not a git command.`, `git ไม่รู้จักคำสั่ง ${cmd} อาจพิมพ์ผิด หรือเป็นคำสั่งที่บทนี้ยังไม่ได้สอน ลองเช็กตัวสะกดอีกที`)
  if (!allowed.includes(cmd as GitCommand)) return fail(world, `git ${cmd}: not available yet`, `คำสั่ง ${cmd} นี้ยังไม่ได้เรียน เก็บไว้ก่อน เดี๋ยวบทต่อ ๆ ไปจะสอน`)
  if (cmd !== 'init' && cmd !== 'clone' && !world.me.repo)
    return fail(world, 'fatal: not a git repository (or any of the parent directories): .git', 'โฟลเดอร์นี้ยังไม่ใช่ repo ให้พิมพ์ git init เพื่อเริ่ม หรือ git clone เพื่อดึงมาจาก GitHub')
  return handlers[cmd as GitCommand](world, t.slice(2))
}

/** ผู้เรียนแก้ไฟล์ในเครื่องตัวเอง (UI เรียกตอนผู้เรียนพิมพ์แก้ไฟล์ในแบบจำลอง) */
export function editFile(world: World, file: string, content: string): World {
  return setMe(world, { files: { ...world.me.files, [file]: content } })
}

export function friendDoes(world: World, action: { type: 'commit'; file: string; content: string; message: string } | { type: 'push' }): World {
  const f = world.friend
  if (!f.repo) return world
  if (action.type === 'push') {
    const r = pushRepo(f.repo, world.github)
    return r.status === 'ok' ? { ...world, github: r.dst } : world
  }
  const parent = tipOf(f.repo)
  const files = { ...snap(f.repo, parent), [action.file]: action.content }
  const id = nextId(world)
  const repo = withBranch({ ...f.repo, commits: { ...f.repo.commits, [id]: { id, message: action.message, parent, files } } }, f.repo.head, id)
  return { ...world, friend: { ...f, repo, files: { ...f.files, [action.file]: action.content } } }
}
