import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GitLabView } from './GitLabView'
import { friendDoes } from '../gitsim/run'
import type { GitLab } from '../gitsim/goals'
import type { Machine, World } from '../gitsim/types'

const mk = (name: string): Machine => ({ name, files: {}, staged: null, repo: null })
const start: World = { me: mk('me'), friend: { ...mk('friend'), repo: { commits: {}, branches: { main: null }, head: 'main' }, remote: 'origin' }, github: null }
const lab: GitLab = {
  kind: 'git', introTh: 'เริ่มเลย', start, allowed: ['init', 'status'],
  goals: [
    { type: 'state', taskTh: 'สร้าง repo', hintTh: 'พิมพ์ git init', check: 'onBranch', arg: 'main' },
    { type: 'state', taskTh: 'ดูสถานะ', hintTh: 'พิมพ์ git status', check: 'onBranch', arg: 'main' },
  ],
  friendScript: [{ afterGoal: 0, action: { type: 'push' } }],
}
const type = async (u: ReturnType<typeof userEvent.setup>, line: string) => {
  await u.type(screen.getByLabelText('พิมพ์คำสั่ง git'), line + '{Enter}')
}

describe('GitLabView', () => {
  it('git init แสดง output และประวัติว่าง', async () => {
    const u = userEvent.setup()
    render(<GitLabView lab={lab} onDone={() => {}} />)
    await type(u, 'git init')
    expect(screen.getByText(/Initialized empty Git repository/)).toBeInTheDocument()
    expect(screen.getAllByText('ยังไม่มี commit').length).toBeGreaterThan(0)
  })
  it('คำสั่งที่ยังไม่อนุญาต เห็นคำอธิบายไทย', async () => {
    const u = userEvent.setup()
    render(<GitLabView lab={lab} onDone={() => {}} />)
    await type(u, 'git push')
    expect(screen.getByText(/ยังไม่ได้เรียน/)).toBeInTheDocument()
  })
  it('ทำเป้าหมายครบ onDone ครั้งเดียว และ friendScript ทำงาน', async () => {
    const onDone = vi.fn()
    const u = userEvent.setup()
    const l2: GitLab = { ...lab, start: friendDoes(start, { type: 'commit', file: 'f.txt', content: '1', message: 'fm' }), goals: [lab.goals[0], { type: 'state', taskTh: 'ดูสถานะ', hintTh: 'h', check: 'committed' }], allowed: ['init', 'status', 'add', 'commit'] }
    l2.start.me.files = { 'a.txt': 'x' }
    render(<GitLabView lab={l2} onDone={onDone} />)
    expect(screen.getByText('สร้าง repo')).toBeInTheDocument()
    await type(u, 'git init')
    expect(screen.getByText('ดูสถานะ')).toBeInTheDocument()
    expect(screen.getByText(/เพื่อนเพิ่ง push งานขึ้น GitHub/)).toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
    await type(u, 'git add a.txt')
    await type(u, 'git commit -m "x"')
    expect(onDone).toHaveBeenCalledTimes(1)
    await type(u, 'git status')
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('ขอตัวช่วยและแก้ไฟล์ในโฟลเดอร์งานได้', async () => {
    const u = userEvent.setup()
    render(<GitLabView lab={{ ...lab, start: { ...start, me: { ...start.me, files: { 'a.txt': 'hi' } } } }} onDone={() => {}} />)
    await u.click(screen.getByText('ขอตัวช่วย'))
    expect(screen.getByText('พิมพ์ git init')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'a.txt' }))
    const box = screen.getByLabelText('แก้ไฟล์ a.txt')
    await u.clear(box)
    await u.type(box, 'new')
    await u.click(screen.getByText('บันทึกไฟล์'))
    await u.click(screen.getByRole('button', { name: 'a.txt' }))
    expect(screen.getByLabelText('แก้ไฟล์ a.txt')).toHaveValue('new')
  })
})

const ALL = ['init', 'status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge', 'clone', 'push', 'pull'] as GitLab['allowed']
const st = (files: Record<string, string>): World => ({ ...start, me: { ...start.me, files } })
const none = { type: 'state' as const, taskTh: 't', hintTh: 'h', check: 'cloned' as const }
const run = async (u: ReturnType<typeof userEvent.setup>, ...ls: string[]) => { for (const l of ls) await type(u, l) }

describe('GitLabView fix round 1', () => {
  it('feature row shows only own commit and fork point; merge commit marked', async () => {
    const u = userEvent.setup()
    render(<GitLabView lab={{ ...lab, allowed: ALL, goals: [none], friendScript: [], start: st({ 'a.txt': 'a', 'b.txt': 'b', 'c.txt': 'c' }) }} onDone={() => {}} />)
    await run(u, 'git init', 'git add a.txt', 'git commit -m "first"', 'git switch -c feature', 'git add b.txt', 'git commit -m "second"')
    const mine = screen.getByLabelText('ประวัติ เครื่องเรา')
    const fork = mine.querySelector('.gl-fork')!
    expect(fork.querySelectorAll('.gl-msg')).toHaveLength(1)
    expect(fork).toHaveTextContent('second')
    expect(fork).toHaveTextContent('แยกจาก first')
    await run(u, 'git switch main', 'git add c.txt', 'git commit -m "third"', 'git merge feature')
    expect(within(mine).getByText(/รวมจาก feature/)).toBeInTheDocument()
  })
  it('HEAD marker only on เครื่องเรา', async () => {
    const u = userEvent.setup()
    const fw = friendDoes({ ...start, friend: { ...start.friend } }, { type: 'commit', file: 'f.txt', content: '1', message: 'fm' })
    render(<GitLabView lab={{ ...lab, start: fw, goals: [none], friendScript: [] }} onDone={() => {}} />)
    await type(u, 'git init')
    expect(within(screen.getByLabelText('ประวัติ เครื่องเพื่อน')).queryByText(/ตรงนี้/)).toBeNull()
  })
  it('one command satisfying last two goals fires onDone', async () => {
    const onDone = vi.fn()
    const u = userEvent.setup()
    render(<GitLabView lab={{ ...lab, friendScript: [] }} onDone={onDone} />)
    await type(u, 'git init')
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('friend note only when friend action changed something', async () => {
    const u = userEvent.setup()
    const { unmount } = render(<GitLabView lab={lab} onDone={() => {}} />)
    await type(u, 'git init')
    expect(screen.queryByText(/เพื่อนเพิ่ง push/)).toBeNull() // friend has no commits
    unmount()
    const fw = friendDoes(start, { type: 'commit', file: 'f.txt', content: '1', message: 'fm' })
    render(<GitLabView lab={{ ...lab, start: fw }} onDone={() => {}} />)
    await type(u, 'git init')
    expect(screen.getByText(/เพื่อนเพิ่ง push/)).toBeInTheDocument()
  })
})
