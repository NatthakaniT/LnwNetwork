import type { GitCommand } from './types'

export const KNOWN: GitCommand[] = ['init', 'status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge', 'clone', 'push', 'pull']

/** แยกคำเหมือน shell: ช่องว่างคั่นคำ, "..." และ '...' รวมช่องว่าง/ภาษาไทยเป็นคำเดียว (shortcut: ไม่รองรับ backslash escape) */
export function tokenize(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quote = ''
  let has = false
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = ''
      else cur += ch
    } else if (ch === '"' || ch === "'") {
      quote = ch
      has = true
    } else if (/\s/.test(ch)) {
      if (has) { out.push(cur); cur = ''; has = false }
    } else {
      cur += ch
      has = true
    }
  }
  if (has) out.push(cur)
  return out
}
