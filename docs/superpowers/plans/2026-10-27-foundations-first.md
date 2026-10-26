# พื้นฐานก่อนเสมอ (Foundations first) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ทุกบทเริ่มจากพื้นฐานจริงๆ โดยเพิ่มขั้นเช็กพื้นฐาน กล่อง "เรื่องนี้ต่อจาก…" "ลองกดเอง" "อยากรู้ลึก" ปุ่มคัดลอกไปถามครู เครื่องเล่นภาพเคลื่อนไหวแบบใหม่ (spec ข้อ 3.1) และบทใหม่ "คอมพูดภาษา 0 กับ 1" เอา "สอบข้ามบท" ออก และตรวจภาค 0 ย้อนหลัง

**Architecture:** เพิ่มฟิลด์เสริมใน `Lesson` (`requires`, `precheck`, `tryIt`, `deepDives`) ที่ `validateCourse` ตรวจได้ และเพิ่ม component เล็กๆ ที่ `LessonPage` เรียกใช้ ส่วนเนื้อหาบทยังเป็นไฟล์ข้อมูลใน `src/content/lessons/` เหมือนเดิม lesson id ต้องตรึงไว้ ไม่ให้ขึ้นกับลำดับในแผนที่ เพื่อให้แทรกบทได้โดยความคืบหน้าและไฟล์เสียงไม่พัง

**Tech Stack:** Vite 5 + React 18 + TypeScript 5, vitest + Testing Library เสียงพากย์ใช้ F5-TTS-THAI ที่มีอยู่แล้วใน `tools/tts/`

**Spec:** `docs/superpowers/specs/2026-10-27-foundations-first-design.md` (และ spec เดิม `2026-10-24-ccna-learning-app-design.md` ข้อ 7 กฎการเขียนเนื้อหา)

## Global Constraints

- ห้ามเพิ่ม dependency ใหม่ (ใช้ React, CSS, Web API ที่มีอยู่แล้ว) และห้ามใช้ API หรือบริการที่เสียเงิน
- ข้อความทุกคำที่ผู้เรียนเห็นเป็นภาษาไทยเป็นกันเอง ประโยคสั้น ศัพท์อังกฤษต้องแปลไทยตั้งแต่ครั้งแรกที่ใช้ (spec เดิมข้อ 7)
- บทพูด (`narrationTh`) ห้ามมีตัวเลขอารบิกและวงเล็บ ให้สะกดเป็นคำ เช่น "หนึ่งร้อยยี่สิบแปด" เพราะเครื่องสร้างเสียงอ่านตัวเลขผิด (handoff ข้อ 4)
- สีและขนาดใช้ token จาก `src/styles.css` ห้ามเขียน hex ใน component (ui-refresh spec ข้อ 3) และต้องเคารพ `prefers-reduced-motion`
- สีการส่งในภาพเคลื่อนไหวใช้ชุดเดียวทั้งคอร์ส: broadcast = `--tone-bcast` (#ffb547), unicast = `--tone-reply` (#59c7ff), ส่งข้อมูลจริง = `--part` (spec ข้อ 3.1.6)
- ห้ามสมมติว่าผู้เรียนรู้เรื่องใดมาก่อน ผู้ใช้ไม่เคยเรียน ITN/SRWE (spec ข้อ 2.6)
- ทุก task ต้องจบด้วย `npm test` และ `npm run build` ผ่าน
- ทำงานบน branch `feat/foundations-first` (repo อยู่บน `main`)

## Review Focus

1. ความคืบหน้าเก่าในเครื่องผู้ใช้ (`lnw-ccna-progress-v1`) ต้องโหลดได้หลังเพิ่มขั้น `check` และบท `p0-bits` และบทที่เคยผ่านแล้วต้องยังผ่านอยู่ → test ใน Task 1 และ Task 3
2. ลิงก์เก่า `#/lesson/p0-l4/test-out` (ที่ bookmark ไว้) ต้องพาไปหน้าแผนที่ ไม่ใช่จอว่างหรือ error → test ใน Task 1
3. คัดลอกไม่ได้ (เบราว์เซอร์ปฏิเสธ `navigator.clipboard`) ต้องแสดงข้อความให้เลือกคัดลอกเอง → test ใน Task 4
4. บทที่มี `requires` แต่ไม่มี `precheck` หรือไม่มีทั้งสองอย่าง ต้องไม่เห็นขั้นเช็กพื้นฐาน และต้องเริ่มที่ขั้นคลิปได้ → test ใน Task 3
5. คำถามเช็กพื้นฐานที่ชี้ไปบทที่ยัง `building` หรือไม่อยู่ใน `requires` ต้องถูก `validateCourse` จับ จะได้ไม่มีลิงก์ที่กดแล้วเด้งกลับ → test ใน Task 2

**ข้อที่ทำตาม spec ไม่ได้ ต้องแจ้งผู้ใช้:** spec ข้อ 9 บอกว่า "ความคืบหน้าเดิมที่บันทึกว่าข้ามบท ให้นับเป็นยังไม่ผ่าน" แต่โค้ดเดิม (`LessonPage.tsx` `TestOut` เรียก `markCompleted`) บันทึกการข้ามบทแบบเดียวกับการเรียนผ่าน จึงแยกไม่ออก plan นี้จึงไม่แตะความคืบหน้าเดิม ผู้ใช้ล้างความคืบหน้าเองได้ (ลบ key ใน localStorage) ถ้าเคยกดข้ามบทไว้

---

### Task 1: ตรึง lesson id และเอา "สอบข้ามบท" ออก

**Files:**
- Modify: `src/content/parts.ts` (Row ต้องมี id ตรึง)
- Modify: `src/router.ts`, `src/App.tsx`, `src/pages/LessonPage.tsx`, `src/pages/CourseMap.tsx`, `src/quiz/QuizView.tsx`, `src/progress/progress.ts:47` (ลบคอมเมนต์ "สอบข้าม")
- Test: `src/content/index.test.ts`, `src/router` test (สร้าง `src/router.test.ts` ถ้ายังไม่มี), `src/pages/CourseMap.test.tsx`, `src/pages/LessonPage.test.tsx`, `src/App.notice.test.tsx`, `src/quiz/QuizView.test.tsx`, `src/progress/progress.test.ts`

**Interfaces:**
- Produces: `type Row = [id: LessonId, title: string, analogy?: string, modules?: string[]]` ใน `parts.ts`, `order` ยังเป็นลำดับในภาค (index + 1); `Route` เหลือ `{ name: 'lesson'; id: string }` (ไม่มี `testOut`); `QuizViewProps` ไม่มี `mode`; `LessonPage` Props ไม่มี `testOut` / `onTestOutPassed`

- [ ] **Step 1: สร้าง branch** `git switch -c feat/foundations-first`
- [ ] **Step 2: เขียน test ที่ล้ม**
  - `index.test.ts` เพิ่ม `it('lesson ids do not depend on position')`: สร้าง Row สองชุดที่สลับลำดับ ผ่าน `build` (export `build` ออกมาเพื่อ test) แล้ว `expect(ids).toEqual(['p9-a', 'p9-b'])` ไม่ว่าลำดับจะเป็นแบบไหน และ id ของบทเดิมทั้ง 45 บทยังเหมือนเดิม (`p0-l1` … `p6-l4`)
  - `router.test.ts`: `parseHash('#/lesson/p0-l4/test-out')` → `{ name: 'map' }`; `parseHash('#/lesson/p0-l4')` → `{ name: 'lesson', id: 'p0-l4' }`
  - `CourseMap.test.tsx`: บทที่ล็อกอยู่ต้องไม่มีปุ่มชื่อ "สอบข้ามบท" (`queryByRole('button', { name: 'สอบข้ามบท' })` เป็น null)
  - `QuizView.test.tsx`: ข้อความ "ถ้าตอบผ่าน จะข้ามบทนี้ได้เลย" ต้องไม่มีอยู่
  - `progress.test.ts`: progress เดิม `{ version: 1, completed: ['p0-l1','p0-l2'] }` ยังโหลดได้และ `isUnlocked('p0-l3', …)` เป็น true
- [ ] **Step 3:** รัน `npm test` แล้วต้องเห็น test ใหม่ล้ม
- [ ] **Step 4: แก้โค้ด**
  - `parts.ts`: ทุก Row ใส่ id ตรงกับที่ใช้อยู่ตอนนี้ (`'p0-l1'` …) และ `build` ใช้ `row[0]` เป็น id
  - ลบ `TestOut` component, `testOut` route และ regex group, `onTestOutPassed` และ notice ใน `App.tsx`, ปุ่มใน `CourseMap.tsx` (บทล็อกแสดงแค่ `🔒 {label}`), `mode` ใน `QuizView`
  - ลบ test ที่ทดสอบ test-out ใน `App.notice.test.tsx`, `LessonPage.test.tsx`, `QuizView.test.tsx` (ส่วน test notice ของ `onBlocked` ยังต้องอยู่)
- [ ] **Step 5:** รัน `npm test` และ `npm run build` ต้องผ่าน และ `grep -rn "testOut\|test-out\|ข้ามบท" src` ต้องไม่เจออะไร
- [ ] **Step 6: Commit** `git commit -am "refactor: pin lesson ids and remove test-out"`

---

### Task 2: ข้อมูล "พื้นฐานก่อน" และตัวตรวจ

**Files:**
- Modify: `src/content/types.ts`, `src/content/index.ts`
- Test: `src/content/index.test.ts`

**Interfaces:**
- Produces (ใน `types.ts`):
  ```ts
  export interface Requirement { lesson: LessonId; useTh: string } // useTh = บทนี้ใช้อะไรจากบทนั้น
  export interface PrecheckQuestion extends QuizQuestion { layer: 'th'; reviewLesson: LessonId }
  export interface DeepDive { titleTh: string; bodyTh: string }
  export type TryIt = { kind: 'bits8'; introTh: string; goals: number[] } // goals = เลข 0–255 ที่ต้องทำให้ได้ตามลำดับ
  // เพิ่มใน Lesson: requires?: Requirement[]; precheck?: PrecheckQuestion[]; tryIt?: TryIt; deepDives?: DeepDive[]
  ```
- Produces (ใน `index.ts`): `firstTaughtIn(parts: Part[]): Map<string, LessonId>` คืนว่าศัพท์แต่ละคำ (glossary id) สอนครั้งแรกในบทไหน โดยดูจาก `terms` ของบท ready ตามลำดับ part/order และ `validateCourse` ตรวจเพิ่ม
- คำนิยาม: บทที่ "สอน" ศัพท์คำหนึ่ง คือบทแรกตามลำดับที่ใส่ศัพท์นั้นไว้ใน `terms` (ไม่ต้องมีฟิลด์ `introduces` แยก)

- [ ] **Step 1: เขียน test ที่ล้ม** ใน `describe('validateCourse')` (ใช้ helper `readyOk`, `parts`, `has` เดิม) แต่ละข้อคาดหวังข้อความ error ภาษาไทยที่มีคำต่อไปนี้:
  - `requires` ชี้ไปบทที่ไม่มีอยู่ → `has(errs, 'requires')` และ id นั้น
  - `requires` ชี้ไปบทที่อยู่หลังบทนี้ หรือตัวเอง → `'ต้องเป็นบทก่อนหน้า'`
  - `precheck` มีแต่ไม่มี `requires` หรือ `reviewLesson` ไม่อยู่ใน `requires` → `'reviewLesson'`
  - `reviewLesson` ชี้ไปบทที่ status `building` → `'ยังไม่พร้อม'`
  - `precheck` มีคำถาม `layer: 'en'` → `'precheck ต้องเป็นภาษาไทย'`
  - `tryIt.kind === 'bits8'` และ goal ไม่อยู่ในช่วง 0–255 หรือไม่ใช่จำนวนเต็ม → `'0 ถึง 255'`
  - บทพูดหรือ label หรือ prompt ของบท A มีคำ `en` ของศัพท์ที่สอนครั้งแรกในบท B ที่อยู่หลัง A → `'ใช้ศัพท์ "<en>" ก่อนบทที่สอน'` (จับทั้งคำ ไม่สนตัวพิมพ์ ใช้ regex แบบเดียวกับ `RichText`)
  - `firstTaughtIn` กับบท ready สองบทที่ `terms` เป็น `['mac']` และ `['mac','ip']` → `mac → บทแรก, ip → บทที่สอง`
- [ ] **Step 2:** รัน `npx vitest run src/content/index.test.ts` ต้องล้ม
- [ ] **Step 3: แก้โค้ด** เพิ่ม type และการตรวจใน `validateReady` / `validateCourse` (การตรวจศัพท์ต้องรู้ลำดับบท จึงทำใน `validateCourse` หลังวนครบทุกบท)
- [ ] **Step 4:** รัน `npm test` ข้อ `'passes validation'` ของคอร์สจริงอาจล้ม เพราะบทภาค 0 ใช้ศัพท์ก่อนสอน **ห้ามแก้เนื้อหาใน task นี้** ให้จดรายการ error ที่เจอลงใน `docs/superpowers/plans/2026-10-27-p0-audit.md` พร้อมผลการอ่านภาค 0 ทีละบทตามกฎ spec ข้อ 4.3 (ทุกตัวเลขหรือข้อจำกัดต้องมีคำอธิบายว่าทำไม) และ 4.4 (เปิดบทด้วยปัญหาที่สิ่งนี้แก้) ซึ่งเครื่องตรวจไม่ได้ เช่น p0-l4 ฉาก 3 "0 ถึง 255" แล้วเปลี่ยน test นั้นชั่วคราวเป็น `expect(errs.filter(e => !e.includes('ก่อนบทที่สอน'))).toEqual([])` พร้อมคอมเมนต์ `// shortcut: กรองข้อศัพท์ก่อนสอนไว้จนกว่า Task 7 จะแก้ภาค 0, ลบตัวกรองใน Task 7`
- [ ] **Step 5:** `npm test` และ `npm run build` ต้องผ่าน
- [ ] **Step 6: Commit** `feat: lesson requires/precheck/tryIt/deepDives with validation`

---

### Task 3: ขั้น "เช็กพื้นฐาน" + กล่อง "เรื่องนี้ต่อจาก…" + กล่อง "อยากรู้ลึก"

**Files:**
- Create: `src/pages/PrecheckStep.tsx`, `src/pages/PrecheckStep.test.tsx`
- Modify: `src/pages/LessonPage.tsx`, `src/progress/progress.ts`, `src/pages/lesson.css`
- Test: `src/pages/LessonPage.test.tsx`, `src/progress/progress.test.ts`

**Interfaces:**
- Consumes: `Requirement`, `PrecheckQuestion`, `DeepDive` จาก Task 2
- Produces: `StepKey = 'check' | 'video' | 'scenes' | 'lab' | 'quiz'`; `PrecheckStep({ questions, requires, parts, termIds, onDone }: { questions: PrecheckQuestion[]; requires: Requirement[]; parts: Part[]; termIds: string[]; onDone: () => void })`
- พฤติกรรม: ขั้น `check` มีเฉพาะบทที่มี `precheck` อย่างน้อย 1 ข้อ ป้ายแท็บคือ `เช็กพื้นฐาน` แท็บขั้นแสดงเลขตามลำดับที่มีจริง แต่ละข้อตอบแล้วเห็น `explainTh` ทันที ถ้าตอบผิดมีลิงก์ `ทบทวนบท "<titleTh>"` ไป `#/lesson/<reviewLesson>` ปุ่ม `เริ่มเรียน` กดได้ตลอด (ไม่บังคับให้ตอบถูก) และกดแล้วไปขั้นคลิป
- กล่อง "เรื่องนี้ต่อจาก…": อยู่ใน `lesson-head` ใต้ analogy แสดงเมื่อมี `requires` แต่ละแถวเป็น `<a href="#/lesson/<id>">titleTh</a> · useTh`
- กล่อง "อยากรู้ลึก": อยู่ท้ายหน้าบทเรียน เป็น `<details>` ต่อ 1 `DeepDive` มี `<summary>อยากรู้ลึก: {titleTh}</summary>` และในเนื้อหามีบรรทัด `ไม่รู้เรื่องนี้ก็เรียนต่อได้`

- [ ] **Step 1: เขียน test ที่ล้ม**
  - `progress.test.ts`: `lastStep: 'check'` บันทึกแล้วโหลดกลับมาได้
  - `PrecheckStep.test.tsx`: เลือกคำตอบผิด → เห็น `explainTh` และลิงก์ `ทบทวนบท "…"` ที่ href ถูกต้อง; เลือกคำตอบถูก → ไม่มีลิงก์ทบทวน; ปุ่ม `เริ่มเรียน` เรียก `onDone` แม้ยังไม่ได้ตอบสักข้อ
  - `LessonPage.test.tsx`: บทที่มี precheck เปิดครั้งแรกอยู่ที่แท็บ `1. เช็กพื้นฐาน`; บทที่มี `requires` แต่ไม่มี precheck เปิดที่ `1. ดูคลิป` และเห็นกล่อง "เรื่องนี้ต่อจาก" ที่มีชื่อบทและ useTh; บทที่ไม่มีทั้งสองอย่างหน้าตาเหมือนเดิม; `deepDives` ปิดอยู่ตอนแรกและเปิดได้
- [ ] **Step 2:** รัน test ต้องล้ม
- [ ] **Step 3: แก้โค้ด** `STEPS` ใน `LessonPage` คำนวณต่อบท (มี `check` เมื่อมี precheck) และ `STEPS` ใน `progress.ts` เพิ่ม `'check'` ให้ `canOpen` / `startIdx` ใช้ลิสต์ต่อบท
- [ ] **Step 4:** `npm test` และ `npm run build` ต้องผ่าน
- [ ] **Step 5: Commit** `feat: precheck step, requires box and deep dives`

---

### Task 4: ปุ่ม "คัดลอกไปถามครู"

**Files:**
- Create: `src/tutor/tutorPrompt.ts`, `src/tutor/tutorPrompt.test.ts`, `src/tutor/AskTutor.tsx`, `src/tutor/AskTutor.test.tsx`
- Modify: `src/pages/LessonPage.tsx`, `src/quiz/QuizView.tsx` (เพิ่ม `onWrong`)

**Interfaces:**
- Produces: `tutorPrompt(input: { lessonTitle: string; stepLabel: string; wrongPrompt?: string }): string`; `AskTutor({ text }: { text: string })`; `QuizViewProps.onWrong?: (q: QuizQuestion) => void` (เรียกทุกครั้งที่ตอบข้อนั้นผิด)
- ข้อความ (copy ตายตัว):
  - ไม่มีข้อผิด: `ผมเรียนถึงบท "<lessonTitle>" ขั้น "<stepLabel>" อยากถามว่า `
  - มีข้อผิด: `ผมเรียนถึงบท "<lessonTitle>" ขั้น "<stepLabel>" ตอบข้อ "<wrongPrompt>" ผิด อยากถามว่า `
- AskTutor: ปุ่ม `📋 คัดลอกไปถามครู` เรียก `navigator.clipboard.writeText(text)` ในตัวจัดการคลิก สำเร็จแล้วขึ้น `คัดลอกแล้ว ไปวางใน Claude.ai ได้เลย` ถ้าล้มเหลว (ไม่มี clipboard หรือ promise reject) ให้แสดง `<textarea readOnly>` ที่มีข้อความนั้นและเลือกข้อความไว้ พร้อมบรรทัด `คัดลอกอัตโนมัติไม่ได้ กด Ctrl+C เพื่อคัดลอก`
- ใน LessonPage: วางปุ่มไว้ท้ายหน้า ใช้ `wrongPrompt` = prompt ของข้อล่าสุดที่ตอบผิดในบทนี้ (ถ้ามี) และ `stepLabel` = ป้ายของขั้นปัจจุบัน

- [ ] **Step 1: เขียน test ที่ล้ม** `tutorPrompt` คืนข้อความตรงตาม copy ทั้งสองแบบ; AskTutor ที่ clipboard สำเร็จ → เห็น `คัดลอกแล้ว`; clipboard reject → เห็น textarea ที่ `value === text`; QuizView ตอบผิดแล้ว `onWrong` ถูกเรียกพร้อมคำถามนั้น
- [ ] **Step 2:** รัน test ต้องล้ม
- [ ] **Step 3:** เขียนโค้ดตาม Interfaces
- [ ] **Step 4:** `npm test` และ `npm run build` ต้องผ่าน
- [ ] **Step 5: Commit** `feat: copy lesson status to ask the tutor`

---

### Task 5: "ลองกดเอง" ชนิดแผงสวิตช์ 8 bit

**Files:**
- Create: `src/tryit/bits.ts`, `src/tryit/bits.test.ts`, `src/tryit/Bits8.tsx`, `src/tryit/Bits8.test.tsx`, `src/tryit/tryit.css`
- Modify: `src/pages/LessonPage.tsx` (ขั้น scenes)

**Interfaces:**
- Consumes: `TryIt` จาก Task 2
- Produces: `BIT_VALUES = [128, 64, 32, 16, 8, 4, 2, 1] as const`; `bitsOf(n: number): (0 | 1)[]` (ยาว 8); `valueOf(bits: (0 | 1)[]): number`; `Bits8({ tryIt, onDone }: { tryIt: Extract<TryIt, { kind: 'bits8' }>; onDone: () => void })`
- พฤติกรรม (จากต้นแบบ `C:\ProjectX\REA\spike\bits-switches.html` ขั้นที่ 1): สวิตช์ 8 ปุ่ม (`aria-pressed`, `aria-label="สวิตช์ค่า <v>"`) มีหลอดไฟ ค่า และ 0/1 ใต้แต่ละตัว แสดงผลรวม และบรรทัดวิธีคิด `<ค่าที่เปิด คั่นด้วย " + "> = <ผลรวม> → <8 หลัก>`; โจทย์ `โจทย์ <i>/<n>: เปิดสวิตช์ให้รวมกันได้ <goal>` ถูกแล้วขึ้น `ถูกต้อง <goal> = …` แล้วไปข้อถัดไปและปิดสวิตช์ทั้งหมด ครบทุกข้อเรียก `onDone` หนึ่งครั้ง
- ใน LessonPage: ถ้าบทมี `tryIt` ให้แสดง Bits8 ใต้ ScenePlayer ในขั้น `scenes` ขั้นนี้ถือว่าเสร็จเมื่อดูฉากจบ **และ** ทำ tryIt ครบ (บทที่ไม่มี tryIt ใช้แบบเดิม)

- [ ] **Step 1: เขียน test ที่ล้ม** `bitsOf(192)` = `[1,1,0,0,0,0,0,0]`, `bitsOf(0)` = ศูนย์ 8 ตัว, `bitsOf(255)` = หนึ่ง 8 ตัว, `valueOf(bitsOf(n)) === n` สำหรับทุก n 0–255; Bits8 กับ goals `[192, 10]`: กด 128 กับ 64 → เห็น `ถูกต้อง 192` แล้วข้อถัดไปเป็น `10`; ทำครบแล้ว `onDone` ถูกเรียก 1 ครั้ง; LessonPage บทที่มี tryIt ปุ่ม `ไปขั้นต่อไป` ใน scenes ยังกดไม่ได้หลังฉากจบ จนกว่าจะทำ tryIt ครบ
- [ ] **Step 2:** รัน test ต้องล้ม
- [ ] **Step 3:** เขียนโค้ดตาม Interfaces (การเปลี่ยนข้อหลังตอบถูกใช้ `setTimeout` 1400 ms ตามต้นแบบ ใน test ใช้ fake timers)
- [ ] **Step 4:** `npm test` และ `npm run build` ต้องผ่าน
- [ ] **Step 5: Commit** `feat: bits8 try-it panel`

---

### Task 6: เครื่องเล่นฉากแบบใหม่ (spec ข้อ 3.1) และฉาก ARP ของ p0-l4

**Files:**
- Modify: `src/content/types.ts`, `src/content/index.ts` (ตรวจฉากแบบใหม่), `src/scenes/timeline.ts`, `src/scenes/actors.tsx`, `src/scenes/ScenePlayer.tsx`, `src/scenes/ScenePlayer.css`, `src/styles.css` (token สีการส่ง), `src/content/lessons/p0-l4.ts`, `public/audio/p0-l4/*.mp3` (เฉพาะฉากใหม่หรือฉากที่แก้)
- Create: `src/scenes/layout.ts`, `src/scenes/layout.test.ts`
- Test: `src/scenes/timeline.test.ts`, `src/scenes/ScenePlayer.test.tsx`, `src/content/index.test.ts`, `src/content/lessons/p0-l4.test.tsx`
- Reference: ต้นแบบ `C:\ProjectX\REA\spike\arp-scene.html` (ภาพ, สี, ลำดับ 6 ขั้น, ตำแหน่งซองข้างอุปกรณ์, สมุดจด)

**Interfaces:**
- Produces (ใน `types.ts`), ของเดิมยังใช้ได้:
  ```ts
  export type Tone = 'bcast' | 'reply' | 'deliver' // ส้ม / ฟ้า / สีภาค
  // ActorKind เพิ่ม 'card' | 'table'
  // Actor เพิ่ม: lines?: string[] (card: ข้อความหน้าซอง บรรทัดแรกตัวหนา); tone?: Tone (card)
  //              titleTh?: string; columns?: [string, string]; rows?: [string, string][] (table)
  // SceneAction เพิ่ม:
  //   | { type: 'trail'; path: string[]; tone: Tone }            // เส้นทางค้างบนสาย
  //   | { type: 'ripple'; actor: string; tone: Tone }            // วงกระจายตอน broadcast (ไม่มีผลกับสภาพตอนจบ)
  //   | { type: 'say'; actor: string; text: string; mood: 'yes' | 'no' }
  //   | { type: 'dim' | 'glow'; actor: string }
  //   | { type: 'setRows'; actor: string; rows: [string, string][] }
  // moveAlong เพิ่ม offset?: { dx: number; dy: number } ใช้กับทุกจุดในเส้นทาง เพื่อให้ซองจอดข้างอุปกรณ์
  // Scene เพิ่ม: chipTh?: string; lifeTh?: string; lifeIcon?: string; setup?: SceneAction[]
  // SceneSet เพิ่ม: style?: 'v2'
  ```
- Produces (ใน `timeline.ts`): `StageState` เพิ่ม `trails: { path: string[]; tone: Tone }[]` และ `bubbles: { actor: string; text: string; mood: 'yes' | 'no' }[]` ส่วนแต่ละ actor เพิ่ม `dimmed?`, `glow?`; `stateBeforeScene(set, i)`: ถ้า `set.style === 'v2'` เริ่มจาก `initialState(set)` แล้วใส่ `scenes[i].setup` ทันที **ไม่**ใช้สภาพของฉากก่อนหน้า (กฎข้อ 3.1.3) ถ้าไม่ใช่ v2 ใช้แบบเดิม; `stateAfterScene(set, i)` = สภาพก่อนฉาก + `actions` ของฉากนั้น
- Produces (ใน `layout.ts`): `boxOf(a: StageActor): { x: number; y: number; w: number; h: number }` (กรอบของไอคอนรวมป้ายชื่อ; card คำนวณจากจำนวนบรรทัด; table จากจำนวนแถว) และ `overlaps(state: StageState): [string, string][]` คืนคู่ actor ที่มองเห็นแล้วกรอบทับกัน (ไม่นับ cable, label ที่ตั้งใจวางบนพื้นที่ว่าง ให้นับด้วย)
- ตัวตรวจใน `validateCourse` สำหรับ SceneSet ที่ `style === 'v2'`: ทุกฉากต้องมี `chipTh` และ `lifeTh`; สภาพตอนจบของทุกฉากต้อง `overlaps(...)` ว่าง ข้อความ error ใช้ `'ซ้อนกัน'`, `'chipTh'`, `'lifeTh'`
- ScenePlayer สำหรับ v2 (ตามต้นแบบ): แถบ "ในชีวิตจริง" เหนือเวที (`lifeIcon` + `lifeTh`), ปุ่มเลือกฉากจาก `chipTh` (ฉากปัจจุบันเป็นสีภาค ฉากที่ผ่านแล้วขอบชัดขึ้น), คำอธิบายสีใต้เวทีแสดงเฉพาะ tone ที่บทใช้; กดเลือกฉาก ย้อน หรือข้าม ต้องแสดง `stateAfterScene` ทันทีพร้อม trails และ bubbles; กดเล่นแล้วเล่น actions ของฉากนั้น ripple มีแค่ตอนเล่น; ปุ่มเดิม (เล่น/ย้อน/ฉากต่อไป/ช้าลง) และเสียงทำงานเหมือนเดิม; ถ้า `prefers-reduced-motion` ไม่มีการเคลื่อนไหว ให้แสดงสภาพตอนจบทันที
- token ใหม่ใน `styles.css`: `--tone-bcast: #ffb547`, `--tone-reply: #59c7ff`, ส่วน `deliver` ใช้ `--part`
- p0-l4: เปลี่ยนเป็น `style: 'v2'` ทั้งบท และแยกฉาก ARP เดิม (ฉาก 7) เป็น 6 ฉากตามต้นแบบ: ปัญหา → ตะโกนถาม → ใช่ฉันไหม → ตอบกลับ → จดลงสมุด → ส่งของจริง ใช้ table "สมุดจดของคอมเรา" ฉากอื่นในบทแปลงให้ผ่านกฎ 3.1 (ใส่ chipTh, lifeTh, setup, ไม่ทับกัน, แยกคำถามกับคำตอบ) บทพูดต้องไม่มีตัวเลขอารบิกและวงเล็บ

- [ ] **Step 1: เขียน test ที่ล้ม**
  - `timeline.test.ts`: SceneSet v2 สองฉาก ฉากแรก `show` actor A ฉากที่สองมี setup `show` B → `stateBeforeScene(set, 1)` เห็น B และ **ไม่เห็น** A; `trail` / `say` / `dim` ไปอยู่ใน `stateAfterScene`; SceneSet ที่ไม่ใช่ v2 ทำงานแบบเดิม (test เดิมต้องผ่าน)
  - `layout.test.ts`: pc สองเครื่องที่ห่างกัน 100 ในแนวตั้ง → `overlaps` เจอคู่นี้ ห่าง 260 → ไม่เจอ; card ที่จอดด้วย offset `{dx:-165,dy:0}` ข้าง pc ที่ x 760 → ไม่ทับ pc นั้น
  - `index.test.ts`: v2 ที่ฉากไม่มี chipTh → `'chipTh'`; ฉากที่จบแล้วของทับกัน → `'ซ้อนกัน'`
  - `ScenePlayer.test.tsx`: v2 แสดงปุ่มฉากตามจำนวนฉากและข้อความ `lifeTh`; กดปุ่มฉากที่ 4 แล้วเห็น bubble และ trail ของฉากที่ 4 ทันทีโดยไม่ต้องกดเล่น; กดย้อนจากฉาก 4 ไปฉาก 3 ไม่มี trail ของฉาก 4 ค้าง; SceneSet แบบเดิมไม่มีแถบชีวิตจริง
  - `p0-l4.test.tsx`: `scenes.style === 'v2'` และมีฉากที่ chipTh เป็น `ตะโกนถาม`, `ตอบกลับ`, `จดลงสมุด` เรียงตามลำดับนี้ และบทพูดทุกฉากไม่มี `[0-9()]`
- [ ] **Step 2:** รัน test ต้องล้ม
- [ ] **Step 3:** เขียน types, timeline, layout และตัวตรวจ
- [ ] **Step 4:** เขียนการแสดงผลใน actors/ScenePlayer ตามต้นแบบ (card, table, trail, bubble, ripple, dim/glow, แถบชีวิตจริง, ปุ่มเลือกฉาก, คำอธิบายสี)
- [ ] **Step 5:** แปลง p0-l4 เป็น v2 แล้วสร้างเสียงเฉพาะฉากที่บทพูดใหม่หรือเปลี่ยน (`npm run narration:export` แล้วตาม `tools/tts/README.md`) ลบไฟล์เสียงของฉากที่ไม่มีแล้ว
- [ ] **Step 6:** `npm test` และ `npm run build` ต้องผ่าน แล้วเปิด `npm run dev` ดูบท p0-l4 ทุกฉาก ทั้งตอนเล่นและตอนกดข้าม ต้องไม่มีของทับกันและอ่านตัวหนังสือบนเวทีได้
- [ ] **Step 7: Commit** `feat: scene player v2 and p0-l4 ARP scenes`

---

### Task 7: บทใหม่ "คอมพูดภาษา 0 กับ 1" และตรวจย้อนภาค 0

**Files:**
- Create: `src/content/lessons/p0-bits.ts`, `src/content/lessons/p0-bits.test.tsx`, `public/audio/p0-bits/*.mp3`
- Modify: `src/content/parts.ts` (แทรก Row `['p0-bits', 'คอมพูดภาษา 0 กับ 1', 'สวิตช์ไฟกับทอนเงินด้วยแบงก์', ['ITN 5']]` ระหว่าง p0-l3 กับ p0-l4 และเปลี่ยนชื่อบท `p1-l1` จาก `เลขฐานสอง` เป็น `ฝึกแปลงเลขฐานสอง` ตาม spec ข้อ 5), `src/content/glossary.ts`, `src/content/lessons/p0-l1.ts` … `p0-l5.ts` ตามรายการ audit, `src/content/index.test.ts` (ภาค 0 = 6 บท, รวม 46 บท, รายชื่อบทใหม่), ลบตัวกรอง shortcut ที่ใส่ไว้ใน Task 2
- Reference: `docs/superpowers/plans/2026-10-27-p0-audit.md` (จาก Task 2), ต้นแบบ `C:\ProjectX\REA\spike\bits-switches.html`

**Interfaces:**
- Consumes: ทุกฟิลด์จาก Task 2–6
- เนื้อหาบท p0-bits (ตาม spec ข้อ 5 และกฎข้อ 4):
  - เปิดด้วยปัญหา: "คอมรู้จักแค่ไฟเปิดกับปิด แล้วมันจำเลข 192 ได้ยังไง"
  - ต้องสอน: bit (สวิตช์ 1 ตัว), byte (8 bit), ทำไม 8 (ข้อตกลงที่ใช้กันทั่วโลก พอดีกับตัวอักษร), ทุกสวิตช์ที่เพิ่มทำให้จำนวนแบบเพิ่มเป็น 2 เท่า, ทำไม 1 byte เก็บได้ 0 ถึง 255, IPv4 คือแถว 32 bit ที่คนตัดเป็น 4 ก้อนให้อ่านง่าย
  - ตัวอย่างชีวิตจริง: สวิตช์ไฟในห้อง และทอนเงินด้วยแบงก์ 1000/500/100 (ตัวที่ใหญ่ที่สุดที่ไม่เกินก่อน)
  - `requires`: `[{ lesson: 'p0-l3', useTh: 'ข้อมูลที่วิ่งในสายคือสิ่งที่เราจะดูว่าคอมเก็บยังไง' }]` และ precheck 2 ข้อเกี่ยวกับ p0-l3
  - `tryIt`: `{ kind: 'bits8', introTh: …, goals: [192, 168, 10, 1] }`
  - `deepDives`: "สวิตช์ในคอมหน้าตาเป็นยังไง (transistor)" และ "ตัวอักษรกลายเป็นสวิตช์ได้ยังไง (ASCII: A = 65)"
  - `videos`: คลิปภาษาไทยเรื่อง bit/byte/เลขฐานสอง ใช้ของ 9hua ก่อน ถ้าไม่มีใช้ช่องอื่นตาม spec เดิมข้อ 6.2 ต้องเช็กว่า `playableInEmbed: true`
  - `scenes` แบบ `style: 'v2'` 6–10 ฉาก ตามกฎ spec ข้อ 3.1 ใช้ actor ที่มีอยู่แล้ว (`label`, `pc`, `card`, `table` ฯลฯ), `lab` แบบ `match` (จับคู่เลขกับแถวสวิตช์ 8 หลัก), `quiz` มีทั้งชั้น th และ en ตาม spec เดิมข้อ 10, `terms` ใส่ศัพท์ใหม่ `bit`, `byte`, `binary` (เพิ่มใน glossary ด้วย explainTh แบบเห็นภาพ)
- ตรวจย้อนภาค 0: แก้ทุกข้อในไฟล์ audit; แปลง p0-l1, p0-l2, p0-l3, p0-l5 เป็น `style: 'v2'` ให้ผ่านกฎ spec ข้อ 3.1 (ฉากที่บทพูดเปลี่ยนต้องสร้างเสียงใหม่) แล้วเพิ่มตัวตรวจ `'ต้องใช้ภาพเคลื่อนไหวแบบใหม่ (v2)'` ให้ทุกบท ready; p0-l4 เพิ่ม `requires` ไป `p0-bits` (useTh: เลข 0 ถึง 255 ของแต่ละก้อนมาจาก 1 byte); ข้อความ "48 บิต" ของ MAC ใส่ได้หลังจากมีศัพท์ `bit` แล้ว
- เสียง: ฉากที่เพิ่มหรือแก้บทพูด ต้องสร้างเสียงใหม่ด้วย `npm run narration:export` แล้วรันตามขั้นใน `tools/tts/README.md` (ใช้ GPU บนเครื่องผู้ใช้) เฉพาะฉากที่เปลี่ยน

- [ ] **Step 1: เขียน test ที่ล้ม** `p0-bits.test.tsx` ตามแบบ `p0-l4.test.tsx` (บท ready, มี precheck, tryIt goals `[192,168,10,1]`, deepDives 2 อัน, บทพูดไม่มีตัวเลข/วงเล็บ); `index.test.ts` อัปเดตจำนวน (ภาค 0 = 6, รวม 46) รายชื่อบทภาค 0 และ `course[1].lessons[0].titleTh` เป็น `ฝึกแปลงเลขฐานสอง`; `'passes validation'` กลับเป็น `toEqual([])` แบบไม่มีตัวกรอง
- [ ] **Step 2:** รัน test ต้องล้ม
- [ ] **Step 3:** เขียน p0-bits.ts และ glossary ใหม่
- [ ] **Step 4:** แก้ภาค 0 ตามไฟล์ audit จน `validateCourse(course, glossary)` คืน `[]`
- [ ] **Step 5:** สร้างไฟล์เสียงของฉากใหม่และฉากที่แก้ แล้วเช็กว่าทุกฉากใน p0-bits มีไฟล์ใน `public/audio/p0-bits/`
- [ ] **Step 6:** `npm test` และ `npm run build` ต้องผ่าน แล้วเปิด `npm run dev` ไล่ดูบท p0-bits ครบทุกขั้นในเบราว์เซอร์
- [ ] **Step 7: Commit** `feat(content): lesson p0-bits and part 0 foundations audit`

---

### Task 8: ไฟล์ครูสำหรับ Claude.ai Project

**Files:**
- Create: `scripts/export-roadmap.ts`, `scripts/export-roadmap.test.ts`, `docs/tutor/instructions.md`, `docs/tutor/README.md`, `docs/tutor/roadmap.md` (ไฟล์ที่สร้างจากสคริปต์)
- Modify: `package.json` (เพิ่ม script `"roadmap:export": "vite-node scripts/export-roadmap.ts"`)

**Interfaces:**
- Produces: `renderRoadmap(parts: Part[]): string` (Markdown): หัวข้อต่อภาค `## ภาค <n> · <titleTh>` แล้วบรรทัดละบท `- <titleTh> (<analogyTh>) — <สถานะ: พร้อมเรียน | กำลังทำ>` และถ้ามี `requires` ต่อด้วยบรรทัดย่อย `  - ต่อจาก: <ชื่อบท> · <useTh>`; โครงสร้างการรันแบบเดียวกับ `export-narration.ts` (เช็ก `process.env.VITEST`)
- `instructions.md`: คำสั่งครูตาม spec ข้อ 6 ทุกข้อ รวมคำเปรียบเทียบชุดเดียวกับแอป (หมู่บ้าน = network, กล่องพัสดุ, ใบปะหน้า, รถ, ถนน ตาม handoff ข้อ 6) และกฎว่าห้ามสมมติว่าผู้เรียนรู้ ITN/SRWE
- `README.md`: ขั้นตอนตั้ง Project ใน Claude.ai ทีละขั้นเป็นภาษาไทย (สร้าง Project → วาง instructions.md → อัปโหลด roadmap.md → วิธีใช้ปุ่ม "คัดลอกไปถามครู") และบอกให้รัน `npm run roadmap:export` ทุกครั้งที่เพิ่มบท

- [ ] **Step 1: เขียน test ที่ล้ม** `renderRoadmap` กับภาคเดียวที่มีบท ready ที่มี requires 1 อัน และบท building 1 อัน → มีบรรทัด `## ภาค 9 · x`, `พร้อมเรียน`, `กำลังทำ`, `ต่อจาก:`
- [ ] **Step 2:** รัน test ต้องล้ม
- [ ] **Step 3:** เขียนสคริปต์ แล้วรัน `npm run roadmap:export` เพื่อสร้าง `docs/tutor/roadmap.md`
- [ ] **Step 4:** เขียน `instructions.md` และ `README.md`
- [ ] **Step 5:** `npm test` และ `npm run build` ต้องผ่าน
- [ ] **Step 6: Commit** `docs: Claude.ai tutor project files`

---

### Task 9: ให้ผู้ใช้ลองจริง (spec ข้อ 8.8)

- [ ] **Step 1:** เปิดแอป (`start.bat` หรือ `npm run dev`) ให้ผู้ใช้เรียนบท p0-bits ครบทุกขั้น ดูฉาก ARP แบบใหม่ในบท p0-l4 และลองตั้งครูใน Claude.ai ตาม `docs/tutor/README.md`
- [ ] **Step 2:** ถาม 3 ข้อ: ตรงไหนงง, ภาษาตรงไหนยาก, ฟังเสียงแล้วเป็นยังไง แล้วจดคำตอบไว้ใน `docs/superpowers/round1-handoff.md` หัวข้อใหม่ "ความเห็นบท p0-bits"
- [ ] **Step 3:** ถ้ายังมีจุดที่งง ให้แก้เนื้อหาก่อนเริ่มงานรอบ 2 ข้ออื่น และก่อนเขียนภาค 1
