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
    for (const sel of ['.btn.primary:disabled']) {
      expect(rule(sel)).toMatch(/background:\s*var\(--disabled-bg\)/)
      expect(rule(sel)).toMatch(/opacity:\s*0?\.\d+/)
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
  it('มี token มืดและ easing', () => {
    const root = flat().match(/:root\s*\{([^}]*)\}/)![1]
    expect(root).toMatch(/--bg:\s*#0e0f13/)
    expect(root).toMatch(/--ease-out:\s*cubic-bezier\(\.2,\s*\.9,\s*\.2,\s*1\)/)
    expect(root).toMatch(/--ease-bounce:\s*cubic-bezier\(\.3,\s*1\.6,\s*\.5,\s*1\)/)
    for (let i = 0; i <= 6; i++) expect(root).toContain('--p' + i + ':')
  })
  it('ไม่มี hex นอกบล็อก :root ใน styles.css', () => {
    const outside = flat().replace(/:root\s*\{[^}]*\}/, '').replace(/#fff\b/g, '')
    expect(outside).not.toMatch(/#[0-9a-fA-F]{3,6}\b/)
  })
  it('ปุ่มหลักใช้สีภาค (--part) ถ้ามี ไม่งั้น --p2', () => {
    expect(rule('.btn.primary')).toMatch(/var\(--part,\s*var\(--p2\)\)/)
  })
  it('ปุ่มกดแล้วยุบ scale(.97)', () => {
    expect(flat()).toMatch(/:active[^{]*\{[^}]*scale\(\.97\)/)
  })
  it('motion classes มีครบ', () => {
    const c = flat()
    for (const k of ['.rise', '.d1', '.d4', '.reveal', '.reveal[data-revealed]', '.pop-in', '.shake', '.celebrate']) {
      expect(c).toContain(k)
    }
  })
  it('prefers-reduced-motion ปิด animation/transition และทำให้ .rise/.reveal มองเห็น', () => {
    const m = flat().match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?\})\s*\}/)
    expect(m).not.toBeNull()
    const body = m![1]
    expect(body).toMatch(/animation:\s*none/)
    expect(body).toMatch(/transition:\s*none/)
    const vis = body.match(/[^{}]*\.rise[^{}]*\{[^}]*\}/)
    expect(vis).not.toBeNull()
    expect(vis![0]).toContain('.reveal')
    expect(vis![0]).toMatch(/opacity:\s*1/)
    expect(vis![0]).toMatch(/transform:\s*none/)
  })
})

describe('pages/lesson.css', () => {
  let css = ''
  let base = ''
  beforeAll(async () => {
    const fsModule = 'node:fs'
    const urlModule = 'node:url'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
    css = readFileSync(new NodeURL('./pages/lesson.css', import.meta.url), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
    base = readFileSync(new NodeURL('./styles.css', import.meta.url), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
  })
  const rule = (sel: string) =>
    (css.match(/[^{}]*\{[^}]*\}/g) ?? [])
      .filter((r) => r.split('{')[0].split(',').map((s) => s.trim()).includes(sel))
      .join(' ')

  it('ไม่มี hex หรือ rgba (ใช้ token เท่านั้น)', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}\b/)
    expect(css).not.toMatch(/rgba?\(/)
  })
  it('กฎหน้าบทเรียนและคลิปย้ายออกจาก styles.css แล้ว', () => {
    for (const k of ['.lesson-head', '.steps', '.step.on', '.video-frame', '.video-note', '.video-notice', '.video-pick', '.pass-box', '.badge']) {
      expect(base, k).not.toContain(k)
    }
  })
  it('แท็บขั้นที่ยังกดไม่ได้ดูเทาจาง', () => {
    const r = rule('.lesson-page .step:disabled')
    expect(r).toMatch(/background:\s*var\(--disabled-bg\)/)
    expect(r).toMatch(/opacity:\s*0?\.\d+/)
    expect(r).toMatch(/cursor:\s*not-allowed/)
  })
  it('แถบบอกขั้นเลื่อนด้วย translateX(var(--i) * 100%) และ --ease-out', () => {
    const r = rule('.steps-indicator')
    expect(r).toMatch(/transform:\s*translateX\(calc\(var\(--i\)\s*\*\s*100%\)\)/)
    expect(r).toMatch(/transition:[^;]*var\(--ease-out\)/)
  })
  it('ปิดการเลื่อนแถบเมื่อ prefers-reduced-motion', () => {
    const m = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?\})\s*\}/)
    expect(m).not.toBeNull()
    expect(m![1]).toMatch(/\.steps-indicator[^{]*\{[^}]*transition:\s*none/)
  })
  it('กรอบคลิปโค้ง 16px มีเงาและขอบ', () => {
    const r = rule('.video-frame')
    expect(r).toMatch(/border-radius:\s*16px/)
    expect(r).toMatch(/box-shadow:/)
    expect(r).toMatch(/border:\s*\d+px solid var\(--border\)/)
  })
  it('มี :focus-visible บนแท็บและปุ่ม', () => {
    expect(css).toMatch(/\.step:focus-visible/)
    expect(css).toMatch(/\.btn:focus-visible/)
  })
  it('ไม่มี animation วนไม่หยุด', () => {
    expect(css).not.toMatch(/infinite/)
  })
})
