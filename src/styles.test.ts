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

  it('อ่านไฟล์ css ได้จริง', () => { expect(css).toContain(':root') })
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

// Task 5: คำถาม ห้องทดลอง กิจกรรม เวที ป๊อปอัปศัพท์
describe('quiz / lab / scene css (token เท่านั้น + motion)', () => {
  const files: Record<string, string> = {}
  let base = ''
  let actors = ''
  beforeAll(async () => {
    const fsModule = 'node:fs'
    const urlModule = 'node:url'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
    const read = (p: string) => readFileSync(new NodeURL(p, import.meta.url), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const f of ['quiz/quiz.css', 'lab/lab.css', 'scenes/ScenePlayer.css', 'glossary/glossary.css']) files[f] = read('./' + f)
    base = read('./styles.css')
    actors = readFileSync(new NodeURL('./scenes/actors.tsx', import.meta.url), 'utf-8')
  })
  const rule = (css: string, sel: string) =>
    (css.match(/[^{}]*\{[^}]*\}/g) ?? [])
      .filter((r) => r.split('{')[0].split(',').map((s) => s.trim()).includes(sel))
      .join(' ')
  const root = () => base.match(/:root\s*\{([^}]*)\}/)![1]
  const token = (name: string) => root().match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))![1]

  it.each(['quiz/quiz.css', 'lab/lab.css', 'scenes/ScenePlayer.css', 'glossary/glossary.css'])('%s ไม่มี hex/rgba และไม่มี animation วน', (f) => {
    expect(files[f]).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(files[f]).not.toMatch(/rgba?\(/)
    expect(files[f]).not.toMatch(/infinite/)
  })
  it.each(['quiz/quiz.css', 'lab/lab.css', 'scenes/ScenePlayer.css'])('%s ปิดการขยับเมื่อ prefers-reduced-motion', (f) => {
    expect(files[f]).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
  })

  it('กฎห้องทดลอง/กิจกรรมย้ายจาก styles.css ไป lab/lab.css', () => {
    for (const k of ['.lab-toolbar', '.lab-result', '.lab-iface', '.activity-list', '.lab-intro']) expect(base, k).not.toContain(k)
    const lab = files['lab/lab.css']
    for (const sel of ['.lab-intro', '.lab-task', '.lab-hint', '.activity .lab-result']) {
      expect(rule(lab, sel), sel).toMatch(/white-space:\s*pre-line/)
    }
  })
  it('lab: ผลถูก/ผิดใช้ --ok/--bad, การ์ดเป้าหมายมีเส้นซ้ายสีภาค, รายการที่ขยับมี animation ~350ms, มี focus-visible', () => {
    const lab = files['lab/lab.css']
    expect(rule(lab, '.lab-result.ok')).toMatch(/var\(--ok\)/)
    expect(rule(lab, '.lab-result.bad')).toMatch(/var\(--bad\)/)
    expect(rule(lab, '.lab-goal')).toMatch(/border-left:\s*\d+px solid var\(--part/)
    expect(rule(lab, '.activity-list li.moved')).toMatch(/animation:[^;]*0?\.3\ds/)
    expect(lab).toMatch(/:focus-visible/)
  })
  it('quiz: การ์ดโค้ง 14px ชี้แล้วยก, shake .4s, celebrate เรืองเขียว .6s, ตอบแล้วไม่จาง, มี focus-visible', () => {
    const q = files['quiz/quiz.css']
    expect(rule(q, '.quiz-choice')).toMatch(/border-radius:\s*14px/)
    expect(q).toMatch(/\.quiz-choice:hover:not\(:disabled\)[^{]*\{[^}]*translateY\(-\d+px\)/)
    expect(rule(q, '.quiz-choice.shake')).toMatch(/animation:[^;]*\.4s/)
    const cel = rule(q, '.quiz-choice.celebrate')
    expect(cel).toMatch(/animation:\s*([a-z-]+)\s+\.6s/)
    const name = cel.match(/animation:\s*([a-z-]+)/)![1]
    expect(q).toMatch(new RegExp(`@keyframes ${name}[^@]*var\\(--ok\\)`))
    expect(rule(q, '.quiz-choice:disabled')).toMatch(/opacity:\s*1/)
    expect(q).toMatch(/\.quiz-choice:focus-visible/)
    expect(q).toMatch(/\.quiz-btn:focus-visible/)
  })
  it('เวที: พื้น --stage กรอบ --border มุม 16px; คำบรรยายพื้นดำตัวขาว ≥22px; ปุ่มมี focus-visible', () => {
    const sp = files['scenes/ScenePlayer.css']
    const st = rule(sp, '.sp-stage')
    expect(st).toMatch(/background:\s*var\(--stage\)/)
    expect(st).toMatch(/border:\s*1px solid var\(--border\)/)
    expect(st).toMatch(/border-radius:\s*16px/)
    const cap = rule(sp, '.sp-caption')
    expect(cap).toMatch(/background:\s*var\(--black\)/)
    expect(cap).toMatch(/color:\s*var\(--white\)/)
    const rem = Number(cap.match(/font-size:\s*([\d.]+)rem/)![1])
    expect(rem * 18).toBeGreaterThanOrEqual(22)
    expect(token('black')).toBe('#000000')
    expect(token('white').toLowerCase()).toBe('#ffffff')
    expect(sp).toMatch(/\.sp-btn:focus-visible/)
  })
  it('ป้ายใต้ไอคอนใน actors.tsx ยังอ่านชัดบนพื้นเวทีใหม่ (contrast ≥ 4.5) และพื้นเวทีอยู่ระหว่าง --bg กับ --surface', async () => {
    const { contrastRatio } = await import('./ui/contrast')
    const label = actors.match(/<text[\s\S]*?fill="(#[0-9a-fA-F]{6})"/)![1]
    const stage = token('stage')
    expect(contrastRatio(label, stage)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(stage, token('text'))).toBeGreaterThan(contrastRatio(token('surface'), token('text')))
    expect(contrastRatio(stage, token('text'))).toBeLessThan(contrastRatio(token('bg'), token('text')))
  })
  it('หัวตารางและคำว่า ยังว่างอยู่ ในสมุดบนเวที อ่านชัดบนกระดาษ (contrast ≥ 4.5)', async () => {
    const { contrastRatio } = await import('./ui/contrast')
    const sp = files['scenes/ScenePlayer.css']
    const tok = (sel: string, prop: string) => rule(sp, sel).match(new RegExp(`${prop}:\\s*var\\(--([a-z-]+)\\)`))![1]
    const paper = tok('.sp-table .sp-paper', 'fill')
    const muted = tok('.sp-table text.sp-muted', 'fill')
    expect(contrastRatio(token(muted), token(paper))).toBeGreaterThanOrEqual(4.5)
  })
  it('ป๊อปอัปศัพท์ มุม 14px มีเงา และปุ่มมี focus-visible', () => {
    const g = files['glossary/glossary.css']
    expect(rule(g, '.term-pop')).toMatch(/border-radius:\s*14px/)
    expect(rule(g, '.term-pop')).toMatch(/box-shadow:[^;]*var\(--shadow\)/)
    expect(g).toMatch(/\.term-btn:focus-visible/)
  })
  it('การ์ดข้อผิดพลาด (ErrorBoundary) ใช้มุม/สีเดียวกัน', () => {
    const r = rule(base, '.error-card')
    expect(r).toMatch(/border-radius:\s*14px/)
    expect(r).toMatch(/border-left:\s*6px solid var\(--bad\)/)
    expect(base).toMatch(/\.error-card \.btn:focus-visible/)
  })
})

describe('motion: ไม่ค้างเป็น stacking context', () => {
  it('.rise / .pop-in / .part-card.rise ไม่ใช้ fill-mode forwards หรือ both', async () => {
    const fsModule = 'node:fs'
    const urlModule = 'node:url'
    const { readFileSync } = await import(/* @vite-ignore */ fsModule)
    const { URL: NodeURL } = await import(/* @vite-ignore */ urlModule)
    const strip = (f: string) => readFileSync(new NodeURL(f, import.meta.url), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
    const pick = (css: string, sel: string) =>
      (css.match(/[^{}]*\{[^}]*\}/g) ?? []).filter((r) => r.split('{')[0].split(',').map((s) => s.trim()).includes(sel)).join(' ')
    const base = strip('./styles.css')
    const map = strip('./pages/map.css')
    for (const r of [pick(base, '.rise'), pick(base, '.pop-in'), pick(map, '.part-card.rise')]) {
      expect(r).toMatch(/animation:/)
      expect(r).not.toMatch(/\b(forwards|both)\b/)
    }
  })
})
