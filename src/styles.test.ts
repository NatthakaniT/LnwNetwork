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
  const flat = () => css.replace(/\/\*[\s\S]*?\*\//g, '')
  it('ฐานปุ่ม/ช่องเลือก/ช่องพิมพ์ใช้ :where() (ความจำเพาะศูนย์ ไม่ทับคลาสอื่น)', () => {
    const c = flat()
    expect(c).toContain(':where(button, select) {')
    expect(c).toContain(":where(input[type='text'], input:not([type])) {")
    expect(c).toContain(':where(button:hover:not(:disabled), select:hover:not(:disabled))')
    expect(c).toContain(':where(button:disabled, select:disabled)')
    // pseudo-class ต้องอยู่ในวงเล็บ :where() ไม่ใช่ต่อท้าย (ไม่งั้นความจำเพาะไม่เป็นศูนย์)
    expect(c).not.toMatch(/:where[(][^)]*[)][ ]*:[a-z]/)
    // ต้องไม่มี selector ฐานเปล่า ๆ (button:disabled ฯลฯ) ที่ทับ .quiz-choice ได้
    expect(c).not.toMatch(/(^|\n)\s*(button|select)(:[a-z:()]+)?\s*[,{]/)
  })
  it('ฐานมีตัวอักษร 1rem และปุ่มที่ล็อกยังดูเทาจาง', () => {
    expect(flat()).toMatch(/:where\(button, select\) \{[^}]*font-size:\s*1rem/)
    expect(flat()).toMatch(/:where\(input\[type='text'\], input:not\(\[type\]\)\) \{[^}]*font-size:\s*1rem/)
    for (const sel of ['.btn.primary:disabled', '.step:disabled']) {
      expect(rule(sel)).toMatch(/background:\s*#232b36/)
      expect(rule(sel)).toMatch(/cursor:\s*not-allowed/)
    }
  })
  it('ตัวเลือกคำถามที่ตอบแล้ว (.quiz-choice:disabled) ไม่จางและเคอร์เซอร์ปกติ', async () => {
    const fsModule = 'node:fs'
    const urlModule = 'node:url'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
    const quiz = readFileSync(new NodeURL('./quiz/quiz.css', import.meta.url), 'utf-8')
    const m = quiz.match(/\.quiz-choice:disabled\s*\{([^}]*)\}/)
    expect(m).not.toBeNull()
    expect(m![1]).toMatch(/opacity:\s*1/)
    expect(m![1]).toMatch(/cursor:\s*default/)
  })
})
