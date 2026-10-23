import { beforeAll, describe, expect, it } from 'vitest'

// ข้อความในห้องทดลองและกิจกรรม ขึ้นบรรทัดใหม่ตาม \n ได้
// (vitest ตั้ง css: false จึงอ่านไฟล์ css ตรง ๆ จากดิสก์)
describe('styles: ข้อความหลายบรรทัด', () => {
  let css = ''
  beforeAll(async () => {
    // ใช้ URL ของ node (URL ของ jsdom ต่อ path แบบ http) จึงไม่ขึ้นกับโฟลเดอร์ที่รันเทสต์
    const fsModule = 'node:fs'
    const urlModule = 'node:url'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
    css = readFileSync(new NodeURL('./styles.css', import.meta.url), 'utf-8')
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
