import { beforeAll, describe, expect, it } from 'vitest'

// ข้อความในห้องทดลองและกิจกรรม ขึ้นบรรทัดใหม่ตาม \n ได้
// (vitest ตั้ง css: false จึงอ่านไฟล์ css ตรง ๆ จากดิสก์)
describe('styles: ข้อความหลายบรรทัด', () => {
  let css = ''
  beforeAll(async () => {
    const fsModule = 'node:fs'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const cwd = (globalThis as unknown as { process: { cwd(): string } }).process.cwd()
    css = readFileSync(`${cwd}/src/styles.css`, 'utf-8')
  })
  const rule = (sel: string) =>
    (css.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]*\{[^}]*\}/g) ?? [])
      .filter((r) => r.split('{')[0].split(',').map((s) => s.trim()).includes(sel))
      .join(' ')

  it('อ่านไฟล์ css ได้จริง', () => { expect(css).toContain('.lab-toolbar') })
  it.each(['.lab-intro', '.lab-task', '.lab-hint', '.activity .lab-result'])('%s ใช้ white-space: pre-line', (sel) => {
    expect(rule(sel)).toMatch(/white-space:\s*pre-line/)
  })
})
