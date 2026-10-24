# ปรับหน้าตาเว็บใหม่ (ธีมมืด + motion) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ปรับทุกหน้าของเว็บเป็นธีมมืดแบบการ์ดหลายสี (แบบ B) พร้อม motion ที่พอดี และแยกส่วน OSI ในหน้าคลังศัพท์ โดยพฤติกรรมเดิมไม่เปลี่ยน

**Architecture:** ระบบ token สีและ motion กลางใน `src/styles.css` + `src/ui/` (ฟังก์ชัน contrast, hook scroll-reveal, ตัวเลือกข้อความสติกเกอร์) แล้วแต่ละหน้าใช้ token เหล่านี้ผ่าน CSS ประจำ component; ข้อมูล OSI แยกไฟล์ `src/content/osi.ts`; ไม่เพิ่มไลบรารี animation

**Tech Stack:** เดิม (Vite 5, React 18, TS, Vitest) + `@fontsource/kanit` (500/800/900)

**Spec:** `docs/superpowers/specs/2026-10-25-ui-refresh-design.md`

## Global Constraints

- ไม่เปลี่ยนเนื้อหาบทเรียน ถ้อยคำ เสียง ไอคอน หรือ animation ของ actor ในเวที
- test พฤติกรรมเดิมต้องผ่าน (ปลดล็อค ให้คะแนน ห้องทดลอง ลำดับขั้น ค้นศัพท์); test ที่ผูกกับ CSS/DOM หน้าตาแก้ได้แต่ต้องยังตรวจเรื่องเดิม
- สีอยู่ในตัวแปร CSS บน `:root` เท่านั้น (ไม่มี hex ใน component CSS ยกเว้นไฟล์ token)
- พื้น `--bg #0e0f13`, `--surface #181a21`, `--border #2a2d38`, `--text #f1f1ee`, `--text-muted #a3a6b0`; สีภาค `--p0 #c8f169`, `--p1 #ff7ad9`, `--p2 #4c7dff`, `--p3 #ff5a1f`, `--p4 #ffd23f`, `--p5 #4cd4ff`, `--p6 #b58cff`; ถูก `#3fb950` ผิด `#f85149`
- ตัวหนังสือดำ (`--bg`) บนภาค 0,1,4,5; ขาว (`#ffffff`) บนภาค 2,3,6 — ทุกคู่ contrast ≥ 4.5:1 (ตรวจใน test)
- หัวข้อใช้ Kanit 800/900; เนื้อหา Noto Sans Thai ≥ 18px, line-height 1.7
- motion: เปิดหน้าลอยขึ้นแบบ stagger 80-120ms / 500-700ms; ฉลองสั้น ≤ 600ms; ห้ามของวนไม่หยุดในหน้าบทเรียน; ห้ามของตกแต่งขยับในหรือใกล้เวที; ทุก animation ปิดได้ด้วย `prefers-reduced-motion: reduce`
- ไม่มี scroll แนวนอนที่ความกว้าง 1280px
- ข้อความ UI ใหม่เป็นภาษาไทยพูดง่าย ๆ

## Review Focus

1. **ผู้ใช้เปิด "ลดการเคลื่อนไหว" ในเครื่อง** → ไม่มีอะไรลอย เด้ง สั่น วิ่ง หรือวน และไม่มีเนื้อหาค้างที่ `opacity: 0` — test ใน Task 1 (CSS) + Task 6 (เช็คในเบราว์เซอร์)
2. **การ์ดภาคที่ "ยังไม่ถึง" ตัวหนังสือยังอ่านได้** (จางเฉพาะพื้นการ์ด) — test ใน Task 2
3. **ค้นศัพท์แล้วเจอคำที่อยู่ในส่วน OSI** (เช่นค้น "ใบปะหน้า" หรือ "Network layer") และพิมพ์คำที่ไม่มีแล้วเห็นข้อความว่าไม่เจอ ไม่ใช่หน้าว่าง — test ใน Task 3
4. **ศัพท์ 39 คำครบ แต่ละคำแสดงครั้งเดียว** และทุกคำแสดงคำอธิบาย — test ใน Task 3
5. **scroll-reveal ไม่ทำให้ของที่อยู่ในจอตั้งแต่แรกหายไป** (เช่นตอนรีเฟรชกลางหน้า หรือ IntersectionObserver ไม่มี) — test ใน Task 1

---

## โครงไฟล์

```
src/styles.css              ← token สี ฟอนต์ ปุ่มพื้นฐาน motion กลาง (แก้)
src/ui/contrast.ts (+test)  ← contrastRatio(hexA, hexB)
src/ui/reveal.ts (+test)    ← useReveal() hook
src/ui/sticker.ts (+test)   ← stickerText(parts, progress)
src/content/osi.ts (+test)  ← OSI_LAYERS, TCPIP_LAYERS
src/pages/map.css           ← หน้าแผนที่
src/pages/lesson.css        ← หน้าบทเรียน + VideoStep
src/glossary/glossary.css   ← คลังศัพท์ + Term (แก้)
src/quiz/quiz.css, src/scenes/ScenePlayer.css, lab ใน styles.css → ย้ายเป็น src/lab/lab.css
```

---

### Task 1: token ฟอนต์ และ motion กลาง

**Files:** Modify `src/styles.css`, `src/main.tsx`, `package.json`, `src/styles.test.ts`; Create `src/ui/contrast.ts`, `src/ui/contrast.test.ts`, `src/ui/reveal.ts`, `src/ui/reveal.test.tsx`

**Interfaces — Produces:**
```ts
export function contrastRatio(a: string, b: string): number            // WCAG 2.x, รับ '#rrggbb'
export const PART_COLORS: Record<number, { bg: string; fg: string }>   // 0..6 ตาม Global Constraints
export function useReveal<T extends HTMLElement>(): React.RefObject<T> // ใส่ class 'is-in' เมื่อเข้าในจอ
```
CSS classes ที่งานถัดไปใช้: `.rise` (+ `.d1`…`.d4` หน่วงเวลา) สำหรับลอยขึ้นตอนเปิดหน้า, `.reveal` + `.is-in` สำหรับเลื่อนมาเห็น, `.pop-in`, `.shake`, `.celebrate`, ตัวแปร `--ease-out: cubic-bezier(.2,.9,.2,1)`, `--ease-bounce: cubic-bezier(.3,1.6,.5,1)`

- [ ] **Step 1: failing tests:** `contrastRatio('#000000','#ffffff')` ≈ 21; ทุกคู่ใน `PART_COLORS` ≥ 4.5; `--text` บน `--bg` ≥ 7; `--text-muted` บน `--surface` ≥ 4.5. `useReveal`: เมื่อ `IntersectionObserver` ไม่มีใน window → ใส่ `is-in` ทันที (Review Focus 5); เมื่อ observer แจ้งว่าเห็น → ใส่ `is-in`. `styles.test.ts`: มีบล็อก `@media (prefers-reduced-motion: reduce)` ที่ตั้ง `animation: none` และ `transition: none` และทำให้ `.rise`/`.reveal` ไม่ซ่อน (`opacity: 1; transform: none`) (Review Focus 1); ปรับ test เดิมให้ตรง token ใหม่แต่ยังตรวจ disabled ดูออก, pre-line, quiz-choice ไม่จาง
- [ ] **Step 2:** run → FAIL
- [ ] **Step 3:** `npm i @fontsource/kanit` (500, 800, 900 import ใน main.tsx); token ใหม่ใน `:root`; ปุ่ม `.btn.primary` ใช้สีภาคถ้ามี `--part` ไม่งั้นใช้ `--p2`; ปุ่มกดยุบ `transform: scale(.97)` ตอน `:active`; keyframes + classes motion
- [ ] **Step 4:** run → PASS; `npm run build` สำเร็จ
- [ ] **Step 5: Commit** `feat: dark theme tokens, Kanit and motion utilities`

### Task 2: หน้าแผนที่บทเรียน

**Files:** Modify `src/pages/CourseMap.tsx`, `src/pages/CourseMap.test.tsx`; Create `src/pages/map.css`, `src/ui/sticker.ts`, `src/ui/sticker.test.ts`

**Interfaces — Consumes:** `PART_COLORS`, `.rise`; **Produces:** `stickerText(parts: Part[], p: Progress): string`

- [ ] **Step 1: failing tests:** `stickerText` → 0 บทจบ: `'เริ่มกันเลย 💪'`; จบครบทุกบท ready ของภาคใดภาคหนึ่ง (ภาคล่าสุดที่จบ N): `'เก่งมาก ผ่านภาค N แล้ว 🎉'`; อื่น ๆ `'สู้ ๆ ทีละบท 🔥'`. CourseMap: การ์ดหนึ่งใบต่อภาค (7 ใบ) แต่ละใบมี style `--part` ตาม `PART_COLORS`; การ์ดที่ไม่มีบทเปิดได้มีป้าย `'🔒 ยังไม่ถึง'` และ class `locked` (Review Focus 2: class `locked` ไม่ใช้ `filter`/`opacity` กับทั้งการ์ด — test อ่าน map.css ว่า `.part-card.locked` ไม่มี `filter` หรือ `opacity` และใช้ `--part-bg-muted` แทน); บทที่ `now` มี class `now`; ปุ่ม "สอบข้ามบท", "เรียนต่อ", "📖 คลังศัพท์", ข้อความ "เรียนแล้ว N จาก M บท", notice ปิดได้ — ยังอยู่และ test เดิมผ่าน
- [ ] **Step 2:** run → FAIL
- [ ] **Step 3:** ทำตาม mockup `.superpowers/brainstorm/1097-1792819585/content/b-dark.html` ส่วนบน: หัวข้อ Kanit 900 ~2.6rem `.rise`, แถบความคืบหน้าไล่สี `--p0→--p5` วิ่งตอนโหลด, สติกเกอร์ลอย (animation `bob` วนได้เฉพาะหน้านี้), กริด 4 คอลัมน์ ห่อ 4+3, มุมเอียงวน −2°, 1.5°, −1°, 2°, ชี้แล้ว `rotate(0) translateY(-8px) scale(1.03)` ด้วย `--ease-bounce`, การ์ดลอยเข้า stagger, notice เป็นการ์ดลอยที่ `.pop-in`
- [ ] **Step 4:** run → PASS
- [ ] **Step 5: Commit** `feat: colourful dark course map`

### Task 3: หน้าคลังศัพท์ + ส่วน OSI

**Files:** Create `src/content/osi.ts`, `src/content/osi.test.ts`; Modify `src/glossary/GlossaryPage.tsx`, `src/glossary/glossary.css`, `src/glossary/Term.test.tsx` (หรือไฟล์ test ของหน้าคลังศัพท์)

**Interfaces — Produces:**
```ts
export interface OsiLayer { no: 1|2|3|4|5|6|7; termId: string; shortTh: string; color: string }
export const OSI_LAYERS: OsiLayer[]   // เรียง 7 → 1
// 7 application-layer 'ชั้นที่โปรแกรมใช้คุย' --p1 · 6 presentation-layer 'จัดรูปแบบ เข้ารหัส' · 5 session-layer 'เปิด-ปิดการคุย'
// 4 transport-layer 'กล่อง · port' --p5 · 3 network-layer 'ใบปะหน้า · IP' --p0 · 2 data-link-layer 'รถ · MAC' --p4 · 1 physical-layer 'ถนน · สัญญาณ' --p3
export const TCPIP_LAYERS: { termId: string; osi: number[] }[]
// application-layer [7,6,5] · transport-layer [4] · internet-layer [3] · network-access-layer [2,1]
export const OSI_SECTION_IDS: string[]  // 7 ชั้น + internet-layer + network-access-layer
export const OSI_OTHER_IDS: string[]    // osi-model, tcp-ip-model, layer, encapsulation, de-encapsulation, pdu, data, segment, frame, bits, port
```
(สี 6/5 ใช้เฉดของ `--p1` ที่สว่างขึ้นผ่าน `color-mix` หรือตัวแปรใหม่ `--p1-light`, `--p1-lighter` ใน token)

- [ ] **Step 1: failing tests:** ทุก `termId` ใน osi.ts มีอยู่ใน glossary; `OSI_SECTION_IDS` กับ `OSI_OTHER_IDS` ไม่ซ้ำกัน. GlossaryPage: แสดงแถบ 7 ชั้นเรียง 7→1 พร้อม `shortTh`; กรอบ TCP/IP 4 กรอบจัดแถวด้วย CSS grid ให้ตรงชั้น (`grid-row` ตาม `osi`); กดชั้น 3 → เห็น `th` และ `explainTh` เดิมของ `network-layer`; **ทุกคำใน glossary แสดงครั้งเดียวในหน้า** และ**ทุกการ์ดศัพท์แสดง `explainTh`** (Review Focus 4: นับ 39); คำในกลุ่ม OSI_SECTION แสดงในส่วน OSI เท่านั้น (ในรายการชั้น หรือในการ์ดใต้แถบ) ไม่ซ้ำในกลุ่มตามภาค; ค้น "ใบปะหน้า" → ชั้น 3 ยังเห็น (ค้นรวม `shortTh`), ค้น "network layer" → เห็น (Review Focus 3); ค้นคำที่ไม่มี → `'ไม่เจอคำที่ค้นหา ลองพิมพ์คำอื่นดู'`
- [ ] **Step 2:** run → FAIL
- [ ] **Step 3:** ลำดับหน้า: หัวข้อ + ช่องค้นหา → ส่วน "OSI Model · 7 ชั้น" (แถบ + TCP/IP + กล่องคำอธิบายชั้นที่เลือก, เริ่มต้นเลือกชั้น 3) → "ศัพท์ OSI อื่น ๆ" เป็นการ์ดมีคำอธิบาย → ศัพท์อื่นจัดกลุ่มตามภาคเหมือนเดิม เป็นการ์ด 2 คอลัมน์ มีคำอธิบาย; ชี้แถบชั้นแล้วเลื่อนขวา 8px; การ์ดเลื่อนมาเห็นด้วย `useReveal`; ตอนค้นหา ซ่อนชั้นที่ไม่ตรงคำค้น
- [ ] **Step 4:** run → PASS
- [ ] **Step 5: Commit** `feat: glossary with OSI section and explained term cards`

### Task 4: โครงหน้าบทเรียน + ขั้นคลิป

**Files:** Modify `src/pages/LessonPage.tsx`, `src/pages/VideoStep.tsx`, tests; Create `src/pages/lesson.css` (ย้ายกฎหน้าบทเรียนออกจาก styles.css)

- [ ] **Step 1: failing tests:** `.lesson-page` มี style `--part` ตาม `PART_COLORS[lesson.part]`; แท็บขั้นมีตัวบอกขั้นปัจจุบัน `.steps-indicator` ที่ style `--i` = index ขั้นปัจจุบัน; เปลี่ยนขั้นแล้ว `.step-body` มี `key` ใหม่ (remount เพื่อเล่น `.rise`); `.video-note` เป็นสติกเกอร์ (class `sticker-note`); test เดิมของ LessonPage/VideoStep ผ่าน
- [ ] **Step 2:** run → FAIL
- [ ] **Step 3:** หัวบท Kanit 900 + เส้นสีภาค, ป้าย "ตรงกับ Cisco" เป็นแคปซูล, แท็บเป็นแคปซูล + แถบเลื่อน `transform: translateX(calc(var(--i) * 100%))` ด้วย `--ease-out`, ปุ่ม "ไปขั้นต่อไป" สีภาค, กรอบคลิปโค้ง 16px + เงา, ข้อความสอบข้ามบทหน้าเดียวกัน
- [ ] **Step 4:** run → PASS
- [ ] **Step 5: Commit** `feat: lesson page shell with part colour and step transitions`

### Task 5: คำถาม ห้องทดลอง กิจกรรม เวที ป๊อปอัปศัพท์

**Files:** Modify `src/quiz/QuizView.tsx`, `src/quiz/quiz.css`, `src/lab/LabView.tsx`, `src/lab/ActivityView.tsx`, `src/scenes/ScenePlayer.css`, `src/glossary/glossary.css` (Term), `src/ErrorBoundary.tsx`; Create `src/lab/lab.css`; tests

- [ ] **Step 1: failing tests:** ตอบถูก → ตัวเลือกที่ถูกได้ class `celebrate`; ตอบผิด → ตัวเลือกที่เลือกได้ class `shake`; หน้าคะแนนตอนผ่านได้ `celebrate`; ผลการส่งในห้องทดลองเป็นการ์ด `.pop-in` (key เปลี่ยนทุกครั้งที่ส่ง); กด ⬆/⬇ ใน ActivityView แล้วรายการที่ขยับได้ class `moved` ชั่วคราว; ScenePlayer.css ใช้ token (ไม่มี hex) และ **ไม่มีการแก้ `actors.tsx`**; test เดิมทั้งหมดผ่าน
- [ ] **Step 2:** run → FAIL
- [ ] **Step 3:** ตัวเลือกเป็นการ์ดโค้ง 14px ชี้แล้วยกเล็กน้อย; `shake` 400ms; `celebrate` เรืองเขียว 600ms; ผลการส่งสีถูก/ผิด; การ์ดเป้าหมายเด่นด้วยเส้นสีภาค; เวที: พื้นเปลี่ยนเป็น `--surface` เข้มขึ้นเล็กน้อย กรอบ `--border` มุม 16px — เช็คว่าป้ายใต้ไอคอนยังอ่านชัด (สีป้ายเดิมบนพื้นใหม่ contrast ≥ 4.5 — ใส่ test ด้วย `contrastRatio` ถ้าสีป้ายเป็นค่าคงที่); คำบรรยายยังพื้นดำตัวขาว ≥22px; Term popover + ErrorBoundary ใช้มุม/สีเดียวกัน
- [ ] **Step 4:** run → PASS
- [ ] **Step 5: Commit** `feat: motion feedback for quiz, lab and activity`

### Task 6: เช็คในเบราว์เซอร์จริงและ deploy

- [ ] **Step 1:** `npm test`, `npm run build`, `npm run build:pages` ผ่าน
- [ ] **Step 2:** เปิดทุกหน้าที่ 1280×720 (แผนที่, บท p0-l2 ทุกขั้น, คลังศัพท์, สอบข้ามบท) ถ่ายภาพหน้าจอ ไม่มี scroll แนวนอน ไม่มี error ใน console
- [ ] **Step 3:** จำลอง `prefers-reduced-motion: reduce` แล้วเปิดแผนที่และคลังศัพท์ — ไม่มีอะไรขยับ และไม่มีเนื้อหาค้างหาย (Review Focus 1)
- [ ] **Step 4:** ตัดของเกินอย่างน้อย 1 อย่างตามแนวทาง frontend-design ข้อ "critique" ถ้าเจอ
- [ ] **Step 5:** push เข้า main → GitHub Actions deploy → เปิด https://natthakanit.github.io/LnwNetwork/ เช็คหน้าแผนที่และคลังศัพท์
