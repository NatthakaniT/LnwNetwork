# แอปเรียน CCNA รอบแรก (ตัวแอป + ภาค 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้าง web app เรียน CCNA ภาษาไทยที่เปิดใน Chrome บนเครื่องผู้ใช้ พร้อมบทเรียนภาค 0 ครบ 5 บท (คลิป → ภาพเคลื่อนไหว → ห้องทดลอง → คำถาม) ให้ผู้ใช้เริ่มเรียนได้ทันที

**Architecture:** แอปหน้าเดียว (SPA) ด้วย Vite + React + TypeScript เนื้อหาบทเรียนเป็นไฟล์ข้อมูล TypeScript แยกจากโค้ด (`src/content/`) ส่วนตรรกะที่ทดสอบได้ (ปลดล็อค, ให้คะแนน, จำลองเครือข่าย, timeline ภาพเคลื่อนไหว) เป็นฟังก์ชันบริสุทธิ์แยกจาก UI เสียงพากย์สร้างล่วงหน้าด้วย F5-TTS-THAI ในเครื่อง แล้วเก็บเป็นไฟล์ mp3 ใน `public/audio/`

**Tech Stack:** Node 22, Vite 5, React 18, TypeScript 5, Vitest + @testing-library/react + jsdom, @fontsource/noto-sans-thai, SVG ล้วนสำหรับภาพเคลื่อนไหว (ไม่ใช้ไลบรารี animation), Python 3.10 + f5-tts-th + torch 2.3.0+cu118 (เฉพาะเครื่องมือสร้างเสียง), FFmpeg

**Spec:** `docs/superpowers/specs/2026-10-24-ccna-learning-app-design.md`

## Global Constraints

- ข้อความที่ผู้ใช้เห็นทั้งหมดเป็นภาษาไทยภาษาพูด ประโยคสั้น ห้ามภาษาทางการ ห้ามแปลตรงตัว (spec ข้อ 7)
- ศัพท์อังกฤษในเนื้อหาต้องห่อด้วย `<Term id>` ที่มีคำอธิบายไทย และอธิบายครั้งแรกที่เจอ (spec ข้อ 7.3)
- ทุกคำอธิบายเริ่มจากตัวอย่างชีวิตจริงก่อนศัพท์เทคนิค และบอก "ทำไม" เสมอ (spec ข้อ 7.1, 7.4)
- ห้ามใช้ความรู้ที่ยังไม่ได้สอนในบทก่อนหน้า (spec ข้อ 7.5)
- ห้ามคัดลอกสไลด์ Cisco / เนื้อหาลิขสิทธิ์ — เขียนใหม่ทั้งหมด; คลิป YouTube ใช้ embed เท่านั้น
- ฟรีทั้งหมด ห้ามเรียก API ภายนอกที่เสียเงิน; แอปไม่ต้องใช้เน็ตยกเว้นคลิป YouTube
- คำถามผ่านที่ 80% ทำซ้ำได้ไม่จำกัด; บทที่ `status: 'building'` ไม่ขวางการปลดล็อค
- คำถามท้ายบทมี 2 ชั้น: `th` (วัดความเข้าใจ) และ `en` (แบบข้อสอบจริง + ตัวช่วยแปล/ไฮไลต์คำสำคัญ)
- ไฟล์ใน `tools/tts/models/` ห้ามเข้า git
- เปิดใช้งานได้ด้วยการดับเบิลคลิก `start.bat` (ผู้ใช้ไม่เขียนโค้ด)
- รองรับจอคอมกว้าง ≥ 1280px เป็นหลัก (ไม่ต้องรองรับมือถือ)

## Review Focus

1. **localStorage ใช้ไม่ได้หรือข้อมูลเสีย** (เช่น JSON พัง) → แอปยังเปิดได้ เริ่มความคืบหน้าใหม่ ไม่จอขาว — test ใน Task 3
2. **คลิป YouTube โหลดไม่ได้** (ไม่มีเน็ต หรือเจ้าของปิด embed) → แสดงปุ่ม "เปิดใน YouTube" และยังกดไปขั้นถัดไปได้ — test ใน Task 9
3. **ยังไม่ได้สร้างไฟล์เสียงของฉากนั้น** → ฉากยังเล่นได้ ใช้เวลาตามความยาวข้อความ และแสดงคำบรรยาย — test ใน Task 6
4. **พิมพ์ IP ผิดรูปในห้องทดลอง** (`192.168.1`, `300.1.1.1`, `abc`, ช่องว่าง, เลขไทย `๑๙๒.๑๖๘.๑.๑`) → ข้อความเตือนภาษาไทยที่บอกว่าผิดตรงไหน ไม่พัง — test ใน Task 7
5. **คำถามแบบเลือกหลายข้อ ("Choose two")** → ต้องเลือกครบจำนวนจึงส่งได้ และถูกเมื่อตรงทุกตัวเท่านั้น — test ใน Task 4

---

## โครงสร้างไฟล์

```
C:\LnwNetwork\
  start.bat                      ← ดับเบิลคลิกเพื่อเปิดแอป
  package.json, vite.config.ts, tsconfig.json, index.html
  src/
    main.tsx, App.tsx, router.ts, styles.css
    content/
      types.ts                   ← ชนิดข้อมูลบทเรียนทั้งหมด (แหล่งความจริงเดียว)
      glossary.ts                ← คลังศัพท์
      parts.ts                   ← รายชื่อภาค 0-6 และบททั้งหมด 45 บท (บทที่ยังไม่ทำ = building)
      lessons/p0-l1.ts … p0-l5.ts← เนื้อหาบทภาค 0
      index.ts                   ← รวมบท + validateCourse()
    progress/progress.ts         ← เก็บ/โหลดความคืบหน้า + ตรรกะปลดล็อค
    quiz/grade.ts, quiz/QuizView.tsx
    glossary/Term.tsx, glossary/GlossaryPage.tsx
    scenes/timeline.ts, scenes/ScenePlayer.tsx, scenes/actors.tsx
    lab/ip.ts, lab/sim.ts, lab/goals.ts, lab/LabView.tsx, lab/ActivityLab.tsx
    pages/CourseMap.tsx, pages/LessonPage.tsx, pages/VideoStep.tsx
  scripts/export-narration.ts    ← ดึงบทพูดทุกฉากเป็น JSON
  tools/tts/
    README.md                    ← วิธีติดตั้งและสร้างเสียง (ภาษาไทย)
    gen_lessons.py               ← สร้าง public/audio/<lessonId>/<sceneId>.mp3
    gen_local.py, models/, ref/ref_gen_4.wav   ← มีอยู่แล้ว
  public/audio/                  ← ไฟล์เสียงที่สร้างแล้ว
  tests/ (วางไฟล์ test คู่กับโค้ดเป็น *.test.ts(x) แทนได้)
```

---

### Task 1: ตั้งโปรเจกต์และหน้าว่างที่เปิดได้

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.gitignore`, `start.bat`, `src/App.test.tsx`

**Interfaces:**
- Produces: `npm test` (vitest run), `npm run dev`, `npm run build`, `npm run preview`; `<App />` default export

- [ ] **Step 1:** `git init` ใน `C:\LnwNetwork` (ยังไม่เป็น git repo) และสร้าง `.gitignore` ที่มี `node_modules/`, `dist/`, `tools/tts/models/`, `tools/tts/.venv/`, `.superpowers/`
- [ ] **Step 2:** สร้างโปรเจกต์ Vite React TS ในโฟลเดอร์ปัจจุบัน ติดตั้ง `vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @fontsource/noto-sans-thai` ตั้ง vitest `environment: 'jsdom'`
- [ ] **Step 3: Write the failing test** `src/App.test.tsx`

```tsx
test('แสดงชื่อแอป', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('เรียน CCNA แบบเข้าใจจริง')
})
```

- [ ] **Step 4:** Run `npm test` → Expected: FAIL
- [ ] **Step 5:** ทำ `App.tsx` ให้มี `<h1>เรียน CCNA แบบเข้าใจจริง</h1>`; `styles.css` ใช้ฟอนต์ Noto Sans Thai, ขนาดตัวอักษรพื้นฐาน 18px, `line-height: 1.7`, สีเป็นตัวแปร CSS บน `:root` (โหมดมืดเป็นค่าเริ่มต้น เพราะผู้ใช้เห็น mockup มืดแล้ว)
- [ ] **Step 6:** `start.bat`:

```bat
@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run build
start "" http://localhost:4173
call npm run preview
```

- [ ] **Step 7:** Run `npm test` → PASS; run `npm run build` → สำเร็จไม่มี error
- [ ] **Step 8: Commit** `git add -A && git commit -m "chore: scaffold CCNA learning web app"`

---

### Task 2: ชนิดข้อมูลบทเรียน + รายชื่อบท + ตัวตรวจเนื้อหา

**Files:**
- Create: `src/content/types.ts`, `src/content/glossary.ts`, `src/content/parts.ts`, `src/content/index.ts`, `src/content/index.test.ts`

**Interfaces:**
- Produces (ชนิดข้อมูลทั้งหมด — ห้ามเปลี่ยนชื่อในงานถัดไป):

```ts
export type LessonId = string            // 'p0-l1' … 'p6-l4'
export type LessonStatus = 'ready' | 'building'

export interface VideoRef { youtubeId: string; titleTh: string; channel: string; startSec?: number }

export type ActorKind = 'house' | 'pc' | 'laptop' | 'switch' | 'router' | 'server' | 'cloud'
  | 'envelope' | 'box' | 'truck' | 'person' | 'label' | 'cable'
export interface Actor { id: string; kind: ActorKind; x: number; y: number; label?: string; hidden?: boolean; to?: string /* cable: target actor id */ }
export type SceneAction =
  | { type: 'show' | 'hide' | 'highlight' | 'unhighlight'; actor: string }
  | { type: 'move'; actor: string; x: number; y: number; ms: number }
  | { type: 'moveAlong'; actor: string; path: string[]; msPerHop: number }   // path = actor ids
  | { type: 'setLabel'; actor: string; label: string }
export interface Scene { id: string; narrationTh: string; actions: SceneAction[] }
export interface SceneSet { stage: { width: number; height: number }; actors: Actor[]; scenes: Scene[] }

export interface QuizChoice { id: string; text: string; textTh?: string }
export interface QuizQuestion {
  id: string
  layer: 'th' | 'en'
  prompt: string            // th: ภาษาไทย / en: ภาษาอังกฤษแบบข้อสอบ
  promptTh?: string         // en เท่านั้น: คำแปลไทย
  keywords?: string[]       // en เท่านั้น: คำที่ต้องไฮไลต์ เช่น 'NOT', 'two'
  choices: QuizChoice[]
  correct: string[]         // ≥2 ตัว = เลือกหลายข้อ
  explainTh: string         // อธิบายว่าทำไมคำตอบนี้ถูก (ภาษาง่าย)
}

// ห้องทดลอง — ประกาศที่นี่ทั้งหมด Task 7-8 import ไปใช้
export type DeviceKind = 'pc' | 'laptop' | 'switch' | 'router' | 'server'
export interface Iface { name: string; ip?: string; prefix?: number; mac: string }
export interface Device { id: string; kind: DeviceKind; label: string; ifaces: Iface[]; gateway?: string; x: number; y: number }
export interface Link { a: { device: string; iface: string }; b: { device: string; iface: string } }
export interface Topology { devices: Device[]; links: Link[] }
export type LabGoal =
  | { type: 'deliver'; from: string; toIp: string; hintTh: string }
  | { type: 'fail'; from: string; toIp: string; reasonIncludes: string; hintTh: string } // ทำให้พังแล้วดูว่าพังเพราะอะไร
  | { type: 'fix'; from: string; toIp: string; hintTh: string }                          // เริ่มพัง ต้องซ่อม
export interface NetworkLab { kind: 'network'; introTh: string; start: Topology; palette: DeviceKind[]; goals: LabGoal[] }
export interface ActivityLab { kind: 'order' | 'match'; introTh: string; items: { id: string; textTh: string }[]; answer: string[] | Record<string, string>; explainTh: string }
export type Lab = NetworkLab | ActivityLab

export interface Lesson {
  id: LessonId; part: number; order: number; status: LessonStatus
  titleTh: string; analogyTh: string; ciscoModules: string[]
  videos: VideoRef[]                // ตัวแรก = คลิปหลัก
  scenes?: SceneSet; lab?: Lab; quiz?: QuizQuestion[]; terms?: string[]
}
export interface Part { part: number; titleTh: string; examDomain: string; lessons: Lesson[] }
export interface GlossaryTerm { id: string; en: string; th: string; explainTh: string }
```

- Produces: `export const course: Part[]` และ `export function validateCourse(parts: Part[], glossary: GlossaryTerm[]): string[]` (คืนรายการปัญหาเป็นภาษาไทย; ว่าง = ผ่าน) ใน `src/content/index.ts`; `export const glossary: GlossaryTerm[]` ใน `glossary.ts`

- [ ] **Step 1: Write the failing test** `src/content/index.test.ts`:
  - `course` มี 7 ภาค (0-6) และรวม 45 บท ชื่อบทตรงกับ spec ข้อ 6.3
  - `validateCourse(course, glossary)` คืน `[]`
  - `validateCourse` คืนข้อความปัญหาเมื่อ: id บทซ้ำ; บท `ready` ไม่มี video / scenes / lab / quiz; quiz ของบท `ready` ไม่มีทั้งชั้น `th` และ `en`; คำถาม `en` ไม่มี `promptTh`; `correct` อ้าง choice id ที่ไม่มี; `terms` อ้างศัพท์ที่ไม่มีใน glossary; actor ใน action ไม่มีอยู่จริง
- [ ] **Step 2:** Run `npx vitest run src/content` → FAIL
- [ ] **Step 3:** เขียน `types.ts`, `parts.ts` (45 บท ทุกบท `status: 'building'` ยกเว้นภาค 0 ที่จะเปลี่ยนเป็น `ready` ใน Task 11-15 — ตอนนี้ภาค 0 ก็ `building` ก่อน), `glossary.ts` (เริ่มว่างหรือมีศัพท์ภาค 0), `validateCourse`
  - `ciscoModules` ภาค 0: p0-l1 `ITN 1`, p0-l2 `ITN 1, ITN 11`, p0-l3 `ITN 3`, p0-l4 `ITN 7, ITN 9`, p0-l5 `ITN 3`
  - ชื่อภาคและ examDomain: 0 "เริ่มจากศูนย์"/"Pre-CCNA", 1 "พื้นฐาน Network"/"Network Fundamentals 20%", 2 "Switch และ VLAN"/"Network Access 20%", 3 "Router และการหาเส้นทาง"/"IP Connectivity 25%", 4 "บริการในเครือข่าย"/"IP Services 10%", 5 "ความปลอดภัย"/"Security Fundamentals 15%", 6 "ระบบอัตโนมัติ"/"Automation and Programmability 10%"
- [ ] **Step 4:** Run → PASS
- [ ] **Step 5: Commit** `feat: lesson data model, course outline and validator`

---

### Task 3: ความคืบหน้าและการปลดล็อค

**Files:**
- Create: `src/progress/progress.ts`, `src/progress/progress.test.ts`

**Interfaces:**
- Consumes: `Part`, `Lesson`, `LessonId` จาก Task 2
- Produces:

```ts
export interface Progress { version: 1; completed: LessonId[]; lastLesson?: LessonId; lastStep?: StepKey }
export type StepKey = 'video' | 'scenes' | 'lab' | 'quiz'
export const STORAGE_KEY = 'lnw-ccna-progress-v1'
export function loadProgress(storage?: Storage): Progress
export function saveProgress(p: Progress, storage?: Storage): void
export function isUnlocked(id: LessonId, parts: Part[], p: Progress): boolean
export function markCompleted(id: LessonId, p: Progress): Progress   // ใช้ทั้งเรียนจบปกติและสอบข้ามบท
export function percentComplete(parts: Part[], p: Progress): number  // 0-100 นับเฉพาะบท ready
```

- [ ] **Step 1: Write the failing test** ครอบคลุม:
  - บท ready แรกสุด (p0-l1) ปลดล็อคเสมอ; p0-l2 ล็อคจนกว่า p0-l1 อยู่ใน `completed`
  - บท `building` ถูกข้าม: ถ้าลำดับคือ ready A → building B → ready C แล้ว A จบ → C ปลดล็อค
  - `markCompleted` ไม่เพิ่มซ้ำ และคืนออบเจกต์ใหม่ (ไม่แก้ของเดิม)
  - **Review Focus 1:** `loadProgress` คืน progress ว่างเมื่อ storage มี `'{oops'`, เมื่อ `version` ไม่ใช่ 1, และเมื่อ `storage.getItem` throw; `saveProgress` ไม่ throw เมื่อ `setItem` throw
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** Implement (ลำดับบทเรียงตาม `part` แล้ว `order`; ครอบทุกการอ่าน/เขียน storage ด้วย try/catch)
- [ ] **Step 4:** Run → PASS
- [ ] **Step 5: Commit** `feat: progress storage and unlock rules`

---

### Task 4: ให้คะแนนคำถามและหน้าคำถาม 2 ชั้น

**Files:**
- Create: `src/quiz/grade.ts`, `src/quiz/grade.test.ts`, `src/quiz/QuizView.tsx`, `src/quiz/QuizView.test.tsx`

**Interfaces:**
- Consumes: `QuizQuestion`
- Produces:

```ts
export const PASS_RATIO = 0.8
export function isCorrect(q: QuizQuestion, selected: string[]): boolean
export function grade(qs: QuizQuestion[], answers: Record<string, string[]>): { correct: number; total: number; passed: boolean }
// <QuizView questions={QuizQuestion[]} onPass={() => void} mode?: 'lesson' | 'testOut' />
```

- [ ] **Step 1: Write the failing tests**
  - `isCorrect` ถูกเมื่อชุดคำตอบตรงกันทุกตัวไม่สนลำดับ; **Review Focus 5:** คำถาม `correct: ['a','c']` → `['a']` ผิด, `['a','b','c']` ผิด, `['c','a']` ถูก
  - `grade` 4/5 → `passed: true`; 3/5 → `false`
  - `QuizView`: แสดงคำถามชั้น `th` ก่อน แล้วค่อย `en`; คำถามเลือกหลายข้อแสดงข้อความ "เลือก 2 ข้อ" และปุ่มส่งกดไม่ได้จนเลือกครบ 2; ตอบผิดแสดง `explainTh`; คำถาม `en` มีปุ่ม "ดูคำแปลไทย" ที่แสดง `promptTh` และคำใน `keywords` ถูกห่อด้วย `<mark>`; ผ่าน ≥80% เรียก `onPass` หนึ่งครั้ง; ไม่ผ่านแสดงปุ่ม "ลองใหม่" ที่สลับลำดับตัวเลือก
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** Implement — ตัวเลือกภาษาอังกฤษแสดง `textTh` ใต้ข้อความเมื่อเปิดคำแปล
- [ ] **Step 4:** Run → PASS
- [ ] **Step 5: Commit** `feat: two-layer quiz with Thai help`

---

### Task 5: คลังศัพท์และป้ายศัพท์

**Files:**
- Create: `src/glossary/Term.tsx`, `src/glossary/Term.test.tsx`, `src/glossary/GlossaryPage.tsx`

**Interfaces:**
- Consumes: `glossary`, `GlossaryTerm`
- Produces: `<Term id="ip-address">IP address</Term>` (children ไม่ใส่ก็ได้ ใช้ `en` แทน); `<GlossaryPage />` แสดงศัพท์ทั้งหมดเรียงตามภาค ค้นหาได้ทั้งไทยและอังกฤษ

- [ ] **Step 1: Write the failing test:** คลิก `<Term id="ip-address">` แล้วเห็น `th` และ `explainTh`; กด Esc หรือคลิกข้างนอกแล้วปิด; id ที่ไม่มีใน glossary แสดงข้อความเดิมเฉย ๆ ไม่พัง; ค้นคำว่า "บ้านเลขที่" ในหน้าคลังศัพท์แล้วเจอ IP address
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** Implement (popover แสดงใกล้คำ ใช้ปุ่มที่เข้าถึงได้ด้วยคีย์บอร์ด)
- [ ] **Step 4:** Run → PASS
- [ ] **Step 5: Commit** `feat: glossary terms with Thai explanations`

---

### Task 6: เครื่องเล่นภาพเคลื่อนไหว (แบบ A)

**Files:**
- Create: `src/scenes/timeline.ts`, `src/scenes/timeline.test.ts`, `src/scenes/actors.tsx`, `src/scenes/ScenePlayer.tsx`, `src/scenes/ScenePlayer.test.tsx`

**Interfaces:**
- Consumes: `SceneSet`, `Scene`, `SceneAction`, `Actor`
- Produces:

```ts
export interface StageState { actors: Record<string, Actor & { highlighted?: boolean }> }
export function initialState(set: SceneSet): StageState
export function applyScene(state: StageState, scene: Scene): StageState   // สถานะสุดท้ายหลังฉากจบ
export function stateBeforeScene(set: SceneSet, index: number): StageState // ใช้ตอนกดย้อน
export function fallbackDurationMs(narrationTh: string, rate: number): number
export function audioUrl(lessonId: string, sceneId: string): string        // `/audio/${lessonId}/${sceneId}.mp3`
// <ScenePlayer lessonId={string} set={SceneSet} onFinished={() => void} />
```

- [ ] **Step 1: Write the failing tests**
  - `applyScene` กับ `move` เปลี่ยน x,y; `hide` ตั้ง hidden; `moveAlong` จบที่ตำแหน่งของ actor ตัวสุดท้ายใน path
  - `stateBeforeScene(set, 2)` = ผลของฉาก 0 และ 1 ต่อกัน
  - `fallbackDurationMs('ก'.repeat(100), 1)` = 100 × 90 ms + 1500 ms = 10500; rate 0.75 ยาวขึ้นตามสัดส่วน (`/ rate`)
  - **Review Focus 3:** `ScenePlayer` เมื่อไฟล์เสียงโหลดไม่ได้ (เหตุการณ์ `error` ของ `<audio>`) ยังแสดงคำบรรยายและเลื่อนไปฉากถัดไปหลัง `fallbackDurationMs` (ใช้ fake timers)
  - ปุ่ม: เล่น/หยุด, ย้อน, ฉากต่อไป, "ช้าลง" (สลับ rate 1 ↔ 0.75 ทั้ง `audio.playbackRate` และ fallback), ฉากสุดท้ายจบแล้วเรียก `onFinished`
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** Implement — วาด actor แต่ละชนิดเป็น SVG ง่าย ๆ ใน `actors.tsx` (ไอคอนวาดเอง ไม่ใช้ภาพที่มีลิขสิทธิ์) แต่ละตัวมีป้ายชื่อใต้ภาพ; การเคลื่อนที่ใช้ CSS transition บน `transform`; คำบรรยายแสดงใต้เวที ตัวใหญ่ อ่านง่าย
- [ ] **Step 4:** Run → PASS
- [ ] **Step 5: Commit** `feat: narrated scene player with fallback timing`

---

### Task 7: ตัวจำลองเครือข่าย (ตรรกะล้วน)

**Files:**
- Create: `src/lab/ip.ts`, `src/lab/ip.test.ts`, `src/lab/sim.ts`, `src/lab/sim.test.ts`

**Interfaces:**
- Produces:

```ts
// ip.ts
export function parseIPv4(input: string): { ok: true; value: string } | { ok: false; reasonTh: string }
export function parsePrefix(input: string): { ok: true; value: number } | { ok: false; reasonTh: string } // รับ '24' หรือ '255.255.255.0'
export function sameSubnet(a: string, b: string, prefix: number): boolean

// sim.ts (Topology, Device, Link, Iface มาจาก src/content/types.ts)
export interface SendResult { ok: boolean; hops: string[]; reasonTh: string }  // hops = device ids ตามลำดับที่ข้อมูลผ่าน
export function simulateSend(t: Topology, fromId: string, toIp: string): SendResult
```

- [ ] **Step 1: Write the failing tests** (`ip.test.ts`) — **Review Focus 4:**
  - `parseIPv4('192.168.1.10')` ok; `'192.168.1'` → reasonTh มีคำว่า "ต้องมี 4 ชุด"; `'300.1.1.1'` → "เลขแต่ละชุดต้องอยู่ระหว่าง 0 ถึง 255"; `'abc'` และ `''` → ไม่ ok; `' 10.0.0.1 '` ตัดช่องว่างแล้ว ok; `'๑๙๒.๑๖๘.๑.๑'` แปลงเลขไทยเป็น `192.168.1.1` ok
  - `parsePrefix('255.255.255.0')` = 24; `'33'` ไม่ ok
- [ ] **Step 2: Write the failing tests** (`sim.test.ts`):
  - PC1 — Switch — PC2 ใน 192.168.1.0/24 → ok, hops `['pc1','sw1','pc2']`
  - ไม่มีสายต่อ PC2 → ไม่ ok, reasonTh มี "ไม่มีสาย"
  - IP ซ้ำ 2 เครื่อง → ไม่ ok, reasonTh มี "IP ซ้ำ"
  - ปลายทางคนละวง ไม่มี gateway → ไม่ ok, reasonTh มี "Gateway"
  - คนละวง ผ่าน Router ที่ต่อทั้งสองวง และ PC ตั้ง gateway ถูก → ok, hops `['pc1','sw1','r1','sw2','pc3']`
  - IP ปลายทางไม่มีอยู่ → ไม่ ok, reasonTh มี "ไม่มีเครื่องไหนใช้ IP นี้"
- [ ] **Step 3:** Run → FAIL
- [ ] **Step 4:** Implement — Switch ส่งต่อภายในกลุ่มที่ต่อถึงกันโดยไม่มี Router คั่น; Router ส่งข้ามระหว่างวงที่ต่ออยู่โดยตรงเท่านั้น (route หลายทอดค่อยเพิ่มในรอบหลัง); ข้อความ `reasonTh` ภาษาพูด บอกทั้ง "เกิดอะไร" และ "ทำไม"
- [ ] **Step 5:** Run → PASS
- [ ] **Step 6: Commit** `feat: simple network simulator with Thai reasons`

---

### Task 8: หน้าห้องทดลอง (แบบ C)

**Files:**
- Create: `src/lab/goals.ts`, `src/lab/goals.test.ts`, `src/lab/LabView.tsx`, `src/lab/LabView.test.tsx`, `src/lab/ActivityView.tsx`, `src/lab/ActivityView.test.tsx`

**Interfaces:**
- Consumes: `LabGoal`, `NetworkLab`, `ActivityLab`, `Topology` จาก Task 2; `simulateSend`, `SendResult`, `parseIPv4` จาก Task 7
- Produces:

```ts
export function checkGoal(goal: LabGoal, t: Topology, lastSend?: SendResult): boolean
// <LabView lab={NetworkLab} onDone={() => void} />  <ActivityView lab={ActivityLab} onDone={() => void} />
```

- [ ] **Step 1: Write the failing tests:** `checkGoal` ทั้ง 3 ชนิด; `LabView` แสดง `introTh` และเป้าหมายทีละข้อพร้อมปุ่ม "ขอตัวช่วย" ที่แสดง `hintTh`; กด "ส่งข้อมูล" แล้วแสดง `reasonTh`; แก้ IP เป็น `300.1.1.1` แล้วเห็นข้อความเตือนจาก `parseIPv4` และ topology ไม่เปลี่ยน; ครบทุกเป้าหมายเรียก `onDone`; `ActivityView` แบบ `order` ลากเรียงแล้วกดตรวจ ถูกเรียก `onDone` ผิดแสดง `explainTh`
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** Implement — เวที SVG: ลากอุปกรณ์จากแถบด้านข้าง, คลิกอุปกรณ์ 2 ตัวเพื่อต่อสาย, คลิกอุปกรณ์เพื่อแก้ IP/gateway ในแผงด้านข้าง, ปุ่มส่งข้อมูลแล้วซองจดหมายวิ่งตาม `hops` ด้วยภาพเคลื่อนไหว (ใช้ actor จาก Task 6)
- [ ] **Step 4:** Run → PASS
- [ ] **Step 5: Commit** `feat: interactive lab and activity lab`

---

### Task 9: แผนที่บทเรียนและหน้าบทเรียน 4 ขั้น

**Files:**
- Create: `src/router.ts`, `src/pages/CourseMap.tsx`, `src/pages/LessonPage.tsx`, `src/pages/VideoStep.tsx`, `src/pages/*.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: ทุกอย่างจาก Task 2-8
- Produces: hash routes `#/` (แผนที่), `#/lesson/<id>` (บทเรียน), `#/lesson/<id>/test-out` (สอบข้ามบท), `#/glossary`; `useRoute(): { name: 'map' } | { name: 'lesson'; id: string; testOut: boolean } | { name: 'glossary' }`

- [ ] **Step 1: Write the failing tests:**
  - แผนที่: แสดง 7 ภาคตามภาพตัวอย่างที่ผู้ใช้อนุมัติ (`.superpowers/brainstorm/1149-1792777763/content/course-map.html`) — บทจบแล้ว ✅, บทปัจจุบัน ▶ เด่น, บทล็อค 🔒, บท building แสดง "กำลังทำ"; แถบความคืบหน้าใช้ `percentComplete`; บทล็อคที่ ready มีปุ่ม "สอบข้ามบท"
  - หัวหน้าบทเรียนแสดง `titleTh` และป้าย "ตรงกับ Cisco: ITN 1" จาก `ciscoModules`
  - หน้าบทเรียน: แท็บขั้น 1-4 (ดูคลิป, ดูภาพทบทวน, ลองเล่น, ตอบคำถาม) เดินหน้าได้ทีละขั้น ย้อนได้เสมอ; ผ่านคำถามแล้ว `markCompleted` + `saveProgress` แล้วแสดงปุ่ม "ไปบทถัดไป"; รีเฟรชแล้วกลับมาที่ `lastLesson`/`lastStep`
  - เข้า `#/lesson/<id>` ของบทที่ล็อค → พากลับแผนที่พร้อมข้อความ "ต้องเรียนบทก่อนหน้าก่อนนะ"
  - **Review Focus 2:** `VideoStep` แสดง iframe `https://www.youtube-nocookie.com/embed/<id>`; ถ้า iframe ไม่โหลดภายใน 15 วินาที หรือ `navigator.onLine === false` แสดงลิงก์ "เปิดใน YouTube" และปุ่ม "ไปขั้นต่อไป" กดได้เสมอ ไม่บังคับดูจบ; ถ้ามีหลายคลิปแสดงคลิปเสริมเป็นรายการใต้คลิปหลัก
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** Implement
- [ ] **Step 4:** Run → PASS; `npm run build` สำเร็จ
- [ ] **Step 5: Commit** `feat: course map and 4-step lesson page`

---

### Task 10: เครื่องมือสร้างเสียงพากย์

**Files:**
- Create: `scripts/export-narration.ts`, `scripts/export-narration.test.ts`, `tools/tts/gen_lessons.py`, `tools/tts/README.md`
- Modify: `package.json` (สคริปต์ `narration:export`), `.gitignore`

**Interfaces:**
- Consumes: `course` และ `audioUrl` (Task 6)
- Produces: `npm run narration:export` → `tools/tts/narration.json` รูปแบบ `[{ "lessonId": "p0-l1", "sceneId": "s1", "text": "..." }]` (เฉพาะบท ready); `tools/tts/gen_lessons.py <narration.json> <public/audio>` สร้าง `public/audio/<lessonId>/<sceneId>.mp3` ข้ามไฟล์ที่มีอยู่แล้ว เว้นแต่ใส่ `--force`

- [ ] **Step 1: Write the failing test:** export คืนเฉพาะฉากของบท ready, ไม่มีฉากซ้ำ, ข้อความไม่ว่าง
- [ ] **Step 2:** Run → FAIL → Implement → PASS
- [ ] **Step 3:** เขียน `gen_lessons.py` โดยต่อยอดจาก `tools/tts/gen_local.py` (ค่าที่ใช้แล้วได้ผล: model v1 config เดิม, `ref/ref_gen_4.wav`, ref_text `"เราอยากจะตื่นขึ้นมามั้ยคะ."`, `nfe_step=32`, `speed=0.9`, `cfg_strength=2.0`, `set_max_chars=100`) แปลงศัพท์อังกฤษในบทพูดเป็นคำอ่านไทยก่อนส่งเข้าโมเดลด้วยตาราง `PRONOUNCE = {"IP address": "ไอพีแอดเดรส", "network": "เน็ตเวิร์ค", "Switch": "สวิตช์", "Router": "เราเตอร์", "MAC address": "แม็คแอดเดรส", ...}` แล้ว `ffmpeg -b:a 96k` เป็น mp3
- [ ] **Step 4:** สร้าง Python env ในโปรเจกต์: `uv venv --python <path ของ cpython-3.10.22 ใน %APPDATA%\uv\python> tools/tts/.venv` แล้ว `uv pip install torch==2.3.0+cu118 torchaudio==2.3.0+cu118 f5-tts-th --extra-index-url https://download.pytorch.org/whl/cu118 --index-strategy unsafe-best-match` (หมายเหตุ: `uv venv --python 3.10` เฉย ๆ พังบนเครื่องนี้ ต้องชี้ path python.exe ตรง ๆ)
- [ ] **Step 5:** `README.md` ภาษาไทยทีละขั้น: ติดตั้ง, `npm run narration:export`, รัน `gen_lessons.py`, ถ้าไฟล์โมเดลหายให้โหลด 4 ไฟล์ผ่าน Chrome (huggingface.co ถูกบล็อก DNS) พร้อมลิงก์และ SHA-256 (`model_1000000.pt` = `304db1ac0ff1d0a92f3cc14951ee053e52e25ae13abfdb5dc339cdb9b3bebc62`, `pytorch_model.bin` = `97ec976ad1fd67a33ab2682d29c0ac7df85234fae875aefcc5fb215681a91b2a`)
- [ ] **Step 6:** ทดสอบจริง: สร้างเสียงจาก narration ตัวอย่าง 1 ฉาก → Expected: ได้ไฟล์ mp3 ใน `public/audio/` เล่นได้
- [ ] **Step 7: Commit** `feat: offline Thai narration pipeline` (ไม่ commit `models/`, `.venv/`)

---

### Tasks 11-15: เนื้อหาบทภาค 0 (หนึ่ง Task ต่อหนึ่งบท)

แต่ละบทเป็นไฟล์ `src/content/lessons/p0-lN.ts` export `lesson: Lesson` แล้วต่อเข้า `parts.ts` และเปลี่ยน `status` เป็น `'ready'`

**ขั้นตอนเหมือนกันทุกบท:**
- [ ] **Step 1:** เขียนเนื้อหาตามโครงด้านล่าง: ฉาก 6-10 ฉาก (บทพูดต่อฉาก 1-3 ประโยคภาษาพูด เว้นวรรคตามจังหวะพูด), ห้องทดลองหรือกิจกรรม, คำถามชั้น `th` 3-4 ข้อ (ถาม "ทำไม" / "จะเกิดอะไรถ้า") และชั้น `en` 2-3 ข้อแบบข้อสอบ CCNA (มี `promptTh`, `keywords`, `textTh` ทุกตัวเลือก), ศัพท์ใหม่เพิ่มใน `glossary.ts`
- [ ] **Step 2:** ตรวจกับเช็คลิสต์ spec ข้อ 7 ทีละข้อ แล้วจดผลไว้ในข้อความ commit
- [ ] **Step 3:** Run `npm test` → `validateCourse` ผ่าน
- [ ] **Step 4:** `npm run narration:export` แล้วสร้างเสียงของบทนี้ด้วย `gen_lessons.py`
- [ ] **Step 5:** เปิดแอปเล่นบทนี้ครบ 4 ขั้นด้วยตัวเอง (ผ่าน `npm run dev`) ไม่มี error ใน console
- [ ] **Step 6: Commit** `content: lesson p0-lN`

**Task 11 — p0-l1 "Network คืออะไร (ถนนกับรถส่งของ)"**
- คลิป: `-0zk67Z__18` (9hua: Basic Network ตอนที่ 1 ทำความรู้จักกับ Network)
- แนวเรื่อง: บ้านหลายหลังอยากส่งของถึงกัน → ต้องมีถนน = สาย/สัญญาณ, ของ = ข้อมูล; network เล็ก (บ้าน) / กลาง (ออฟฟิศ) / ใหญ่ (อินเทอร์เน็ต = ถนนทั้งประเทศ); ทำไมต้องมี network (แชร์ไฟล์ ปริ้นเตอร์ อินเทอร์เน็ต)
- กิจกรรม: `match` จับคู่ของในชีวิตจริงกับของใน network (ถนน↔สาย, พัสดุ↔ข้อมูล, บ้าน↔คอม)
- ศัพท์: network, LAN, WAN, Internet

**Task 12 — p0-l2 "อุปกรณ์มีอะไรบ้าง (คอม สาย Switch Router)"**
- คลิป: `WunDlV89wpQ` (ตอนที่ 3 Router), เสริม `q0t7Wtux-VM` (ตอนที่ 5 Switch)
- แนวเรื่อง: Switch = ไปรษณีย์ในหมู่บ้าน ส่งของในหมู่บ้านเดียวกัน; Router = ไปรษณีย์กลางที่ส่งข้ามหมู่บ้าน/ข้ามจังหวัด; สาย = ถนน; ทำไมหมู่บ้านเดียวไม่ต้องใช้ Router
- ห้องทดลอง `network`: เป้าหมาย 1 ต่อ PC 2 เครื่องผ่าน Switch แล้วส่งถึง (`deliver`); เป้าหมาย 2 ส่งไปเครื่องอีกหมู่บ้านแล้วไม่ถึงเพราะไม่มี Router (`fail`, reasonIncludes "Gateway" — ใช้คำอธิบาย "ประตูออกหมู่บ้าน" ใน hint); เป้าหมาย 3 วาง Router ต่อสองหมู่บ้านแล้วส่งถึง (`deliver`, start topology ตั้ง IP และ gateway ไว้ให้แล้ว)
- ศัพท์: switch, router, cable, end device

**Task 13 — p0-l3 "ข้อมูลเดินทางยังไง (กล่องพัสดุ)"**
- คลิป: `jjs02wLiXmQ` (IPv4, Subnet mask, Gateway, DNS คืออะไร ทำงานอย่างไร)
- แนวเรื่อง: ไฟล์ใหญ่ถูกแบ่งเป็นกล่องเล็ก ๆ (packet) ทำไมต้องแบ่ง (สายว่างให้คนอื่นใช้ด้วย, กล่องหายส่งใหม่แค่กล่องเดียว); บนกล่องมีที่อยู่ผู้ส่งและผู้รับ; Gateway = ประตูออกหมู่บ้าน; DNS = สมุดโทรศัพท์ (เชื่อมกับเรื่องที่ผู้ใช้เจอจริงตอนโหลดไฟล์เสียงไม่ได้)
- กิจกรรม: `order` เรียงขั้นตอนตั้งแต่พิมพ์ชื่อเว็บจนเว็บขึ้น
- ศัพท์: packet, source, destination, default gateway, DNS

**Task 14 — p0-l4 "ที่อยู่ 2 แบบ: MAC กับ IP"**
- คลิป: `u6W4u0R5P0w` (ตอนที่ 2 IPv4), เสริม `iAecBW8rflc` (ARP)
- แนวเรื่อง: MAC = เลขบัตรประชาชน ติดตัวตลอดชีวิต, IP = บ้านเลขที่ ย้ายบ้านแล้วเปลี่ยน; ทำไมต้องมี 2 แบบ (ส่งของข้ามจังหวัดต้องใช้บ้านเลขที่ แต่ตอนยื่นของในหมู่บ้านต้องรู้ตัวคน); ARP = ตะโกนถามในหมู่บ้านว่า "ใครอยู่บ้านเลขที่นี้"
- ห้องทดลอง `network`: เป้าหมาย `fail` ตั้ง IP ซ้ำแล้วดูว่าพัง (reasonIncludes "IP ซ้ำ"); เป้าหมาย `fix` แก้ IP ให้ไม่ซ้ำแล้วส่งถึง
- ศัพท์: MAC address, IP address, IPv4, ARP

**Task 15 — p0-l5 "การห่อของเป็นชั้น ๆ (OSI / TCP-IP)"**
- คลิป: `4DkRRKjFCsk` (OSI 7 Layers ฉบับสั้นมีภาพกราฟิก), เสริม `e7s_D4YZznA` (TCP/IP & OSI ฉบับคนทำงานจริง EP.1)
- แนวเรื่อง: ส่งของต้องห่อหลายชั้น — ของ → กล่อง (ระบุผู้รับในตึก/โปรแกรม = port) → ใบปะหน้าบ้านเลขที่ (IP) → ใส่รถคันที่วิ่งในหมู่บ้าน (MAC) → ถนน (สาย); ปลายทางแกะย้อนกลับ; ทำไมแยกเป็นชั้น (แต่ละคนรู้แค่งานตัวเอง เปลี่ยนถนนไม่ต้องเปลี่ยนกล่อง); เทียบ OSI 7 ชั้นกับ TCP/IP 4 ชั้น
- กิจกรรม: `order` เรียงการห่อของจากในสุดถึงนอกสุด
- ศัพท์: OSI model, TCP/IP model, encapsulation, layer, port

---

### Task 16: ตรวจรอบสุดท้ายและส่งให้ผู้ใช้ลอง

**Files:** ไม่มีไฟล์ใหม่ (แก้เฉพาะที่พบปัญหา)

- [ ] **Step 1:** `npm test` → ผ่านทั้งหมด; `npm run build` → สำเร็จ
- [ ] **Step 2:** ดับเบิลคลิก `start.bat` → Chrome เปิด `http://localhost:4173` เห็นแผนที่บทเรียน บท p0-l1 เปิดได้ บทอื่นล็อค
- [ ] **Step 3:** เล่นบท p0-l1 ครบ 4 ขั้นจนบท p0-l2 ปลดล็อค; ปิดแอปแล้วเปิดใหม่ ความคืบหน้ายังอยู่
- [ ] **Step 4:** ทดสอบ Review Focus 2 ด้วยการปิดเน็ตแล้วเปิดบท → เห็นปุ่ม "เปิดใน YouTube" และไปขั้นต่อได้
- [ ] **Step 5:** ส่งให้ผู้ใช้ลองเรียน p0-l1 แล้วถามว่าเข้าใจไหม ภาษาตรงไหนยาก เสียงเป็นยังไง — เก็บคำตอบไว้ก่อนเริ่มแผนรอบถัดไป
- [ ] **Step 6: Commit** `chore: round 1 verified`
