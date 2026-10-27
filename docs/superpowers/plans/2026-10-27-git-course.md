# วิชา Git & GitHub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มวิชาที่สอง "Git & GitHub ทำงานเป็นทีม" (10 บท 3 ภาค) เข้าแอป LnwNetwork พร้อมหน้าเลือกวิชา ความคืบหน้าแยกวิชา และช่องพิมพ์คำสั่ง git แบบจำลอง

**Architecture:** เพิ่มชนิด `Course` (id, ชื่อ, parts, glossary, storageKey) แล้วให้หน้าแผนที่ หน้าบทเรียน และคลังศัพท์รับวิชาเป็น prop แทนการ import `course` ตรงๆ ส่วน CCNA ยังเป็นวิชาเดิม ข้อมูลเดิม ลิงก์เดิมใช้ได้ทั้งหมด เครื่องจำลอง git เป็นฟังก์ชันล้วน (state เข้า → state + ข้อความออก) แยกจาก UI ทำให้ test ได้ทุกคำสั่ง แล้วใช้เป็น `Lab` ชนิดใหม่ `'git'` ส่วนเนื้อหาบทยังเป็นไฟล์ข้อมูลแบบเดิม และใช้เครื่องเล่นฉาก v2

**Tech Stack:** Vite 5 + React 18 + TypeScript 5, vitest + Testing Library, F5-TTS-THAI ใน `tools/tts/`

**Spec:** `docs/superpowers/specs/2026-10-27-git-course-design.md` (และ `2026-10-27-foundations-first-design.md` ข้อ 3, 3.1, 4 กับ `2026-10-24-ccna-learning-app-design.md` ข้อ 7)

## Global Constraints

- ห้ามเพิ่ม dependency ใหม่ และห้ามใช้บริการเสียเงิน ไม่ต่อ GitHub จริงจากในแอป ไม่ล็อกอิน ไม่ใช้ token (spec ข้อ 8)
- ภาษาไทยเป็นกันเอง ประโยคสั้น ศัพท์อังกฤษแปลไทยครั้งแรกที่ใช้ ทุกคำสั่งบอกว่า "ถ้าไม่พิมพ์คำสั่งนี้จะเกิดอะไร" (spec ข้อ 3)
- บทพูด (`narrationTh`) ห้ามมีตัวเลขอารบิกและวงเล็บ (ข้อยกเว้นเดิม "IPv4" ใช้เฉพาะวิชา CCNA)
- ทุกฉากของวิชาใหม่เป็น `style: 'v2'` และผ่านกฎ 10 ข้อของ foundations-first ข้อ 3.1 ผ่านตัวตรวจ (ระยะห่าง 8 px, chipTh, lifeTh, ศัพท์ห้ามใช้ก่อนสอน)
- สอน **Git Bash เป็นหลัก**, `git switch` เป็นคำสั่งเปลี่ยน branch (บอกว่า `git checkout` ทำได้เหมือนกัน), branch เริ่มต้นชื่อ `main`, ล็อกอินผ่าน Git Credential Manager, SSH อยู่ใน "อยากรู้ลึก" (spec ข้อ 2.6, 9)
- ความคืบหน้า CCNA เดิม key `lnw-ccna-progress-v1` ต้องอยู่ครบ วิชาใหม่ใช้ key `lnw-git-progress-v1`
- id บทของวิชา Git ขึ้นต้นด้วย `g` (เช่น `g0-l1`) และห้ามซ้ำกับวิชาไหนเลย เพราะไฟล์เสียงอยู่ที่ `public/audio/<lessonId>/`
- สีและขนาดใช้ token ใน `src/styles.css` เท่านั้น และเคารพ `prefers-reduced-motion`
- ทุก task จบด้วย `npm test` และ `npm run build` ผ่าน ทำงานบน branch `feat/git-course`
- **ก่อนเริ่ม Task 1:** ผู้ควบคุมงานถามผู้ใช้ก่อนว่าลองเรียนบท CCNA ใหม่ (p0-bits) แล้วหรือยัง และเอาความเห็นมาปรับวิธีสอน (spec ข้อ 9) ถ้าผู้ใช้บอกให้เริ่มเลย ให้เริ่มได้

## Review Focus

1. ลิงก์เดิม `#/lesson/p0-l1` และ `#/glossary` ต้องพาไปวิชา CCNA เหมือนเดิม ส่วน `#/` เปลี่ยนเป็นหน้าเลือกวิชา → test ใน Task 1
2. ความคืบหน้า CCNA ที่บันทึกไว้ก่อนอัปเดตต้องยังผ่านครบ และไม่ปนกับวิชา Git → test ใน Task 1
3. พิมพ์คำสั่งที่ยังไม่ได้สอน พิมพ์ผิด หรือพิมพ์คำสั่งที่ไม่ใช่ git ในช่องจำลอง ต้องได้คำอธิบายภาษาไทย ไม่ error หรือจอว่าง → test ใน Task 2
4. `git commit -m "แก้หน้าแรก ใหม่"` ที่มีภาษาไทยกับช่องว่างใน quote ต้องแยกคำถูก และ `git commit` ที่ไม่มี `-m` ต้องบอกว่าขาดข้อความ (ไม่เปิด editor) → test ใน Task 2
5. `git push` ตอนที่เพื่อน push ไปก่อนแล้ว ต้องถูกปฏิเสธและบอกให้ pull ก่อน เหมือน git จริง → test ใน Task 2

---

### Task 1: หลายวิชา (Course) หน้าเลือกวิชา และความคืบหน้าแยกวิชา

**Files:**
- Create: `src/content/courses.ts`, `src/content/courses.test.ts`, `src/pages/CoursePicker.tsx`, `src/pages/CoursePicker.test.tsx`, `src/content/git/parts.ts` (โครงบท 10 บทสถานะ `building`), `src/content/git/glossary.ts` (ว่างไว้ก่อน)
- Modify: `src/content/types.ts`, `src/content/index.ts`, `src/router.ts`, `src/App.tsx`, `src/pages/CourseMap.tsx`, `src/pages/LessonPage.tsx`, `src/glossary/GlossaryPage.tsx`, `src/progress/progress.ts`, `src/ui/sticker.ts`, ไฟล์ test ที่เกี่ยวข้อง
- Test: `src/router.test.ts`, `src/progress/progress.test.ts`, `src/pages/CourseMap.test.tsx`, `src/pages/LessonPage.test.tsx`, `src/App.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  // types.ts
  export type CourseId = 'ccna' | 'git'
  export interface Course { id: CourseId; titleTh: string; taglineTh: string; parts: Part[]; glossary: GlossaryTerm[]; storageKey: string }
  // courses.ts
  export const courses: Course[]                      // [ccna, git] ตามลำดับนี้
  export function courseOf(lessonId: LessonId): Course | undefined
  export function courseById(id: string): Course | undefined
  // router.ts
  type Route = { name: 'picker' } | { name: 'map'; course: CourseId } | { name: 'lesson'; id: string } | { name: 'glossary'; course: CourseId }
  // progress.ts
  loadProgress(storage?: Storage, key: string = STORAGE_KEY): Progress
  saveProgress(p: Progress, storage?: Storage, key: string = STORAGE_KEY): void
  ```
- `course` ที่ export จาก `src/content/index.ts` ยังเป็น parts ของ CCNA (ใช้ใน test และสคริปต์เดิม)
- เส้นทาง: `#/` → หน้าเลือกวิชา, `#/c/<courseId>` → แผนที่ของวิชา, `#/c/<courseId>/glossary` → คลังศัพท์ของวิชา, `#/lesson/<id>` → หาวิชาจาก id, `#/glossary` → คลังศัพท์ CCNA, `#/c/<ไม่มีจริง>` → หน้าเลือกวิชา
- วิชา CCNA: `titleTh: 'CCNA'`, `storageKey: 'lnw-ccna-progress-v1'`; วิชา Git: id `git`, `titleTh: 'Git & GitHub'`, `taglineTh: 'ทำงานเป็นทีมกับเพื่อน'`, `storageKey: 'lnw-git-progress-v1'`
- โครงบทวิชา Git (`src/content/git/parts.ts`, ใช้ `build` จาก parts.ts เดิมได้): ภาค 0 `เริ่มจากศูนย์` = `g0-l1 ทำไมต้องมี Git`, `g0-l2 ตระกูล Git ต่างกันยังไง`, `g0-l3 repository กับ commit`, `g0-l4 git add`, `g0-l5 ในเครื่องกับบนเน็ต`; ภาค 1 `ทำงานคู่กับเพื่อน` = `g1-l1 branch`, `g1-l2 Pull Request`, `g1-l3 merge กับ conflict`, `g1-l4 วิธีที่คนนิยมใช้`; ภาค 2 `ใช้จริง` = `g2-l1 push งานจริงครั้งแรก` (`examDomain` ของ Part ใส่ `''` ได้)
- หน้าแผนที่ หัวข้อ `เรียน {titleTh}` และ `taglineTh`; ลิงก์ "กลับแผนที่" ในหน้าบทเรียนชี้ `#/c/<courseId>`; หน้าเลือกวิชามีการ์ดต่อวิชา แสดง `เรียนแล้ว N จาก M บท`
- `Course` มี `requireEnglishQuiz: boolean` (CCNA = true เพราะข้อสอบจริงเป็นภาษาอังกฤษ, Git = false) และ `validateCourse(parts, glossary, opts?: { requireEnglishQuiz?: boolean })` ใช้ค่านี้แทนการบังคับชั้น en ทุกวิชา (ค่าเริ่มต้น true เพื่อให้ test เดิมผ่าน)
- `validateCourse` เรียกแยกต่อวิชาด้วย glossary ของวิชานั้น และมีตัวตรวจใหม่ `checkUniqueLessonIds(courses): string[]` ที่บอก `'รหัสบทซ้ำข้ามวิชา'`

- [ ] **Step 1: สร้าง branch** `git switch -c feat/git-course`
- [ ] **Step 2: เขียน test ที่ล้ม**
  - `router.test.ts`: `parseHash('')` และ `'#/'` → `{ name: 'picker' }`; `'#/c/git'` → `{ name: 'map', course: 'git' }`; `'#/c/git/glossary'` → `{ name: 'glossary', course: 'git' }`; `'#/glossary'` → `{ name: 'glossary', course: 'ccna' }`; `'#/c/xyz'` → `{ name: 'picker' }`; `'#/lesson/p0-l1'` ยังเหมือนเดิม
  - `courses.test.ts`: `courseOf('p0-l1')?.id === 'ccna'`, `courseOf('g0-l1')?.id === 'git'`; `checkUniqueLessonIds(courses)` → `[]`; ทุกวิชาผ่าน `validateCourse(c.parts, c.glossary)` → `[]`; CCNA ยังมี 46 บท วิชา Git มี 10 บท
  - `progress.test.ts`: progress ที่บันทึกด้วย key `lnw-ccna-progress-v1` (`completed: ['p0-l1']`) โหลดด้วย key ของ CCNA ได้ และโหลดด้วย key `lnw-git-progress-v1` ได้ `completed: []`
  - `CoursePicker.test.tsx`: มีการ์ด 2 ใบ ลิงก์ `#/c/ccna` และ `#/c/git` และแสดง `เรียนแล้ว 1 จาก 46 บท` เมื่อ CCNA ผ่าน 1 บท
  - `LessonPage.test.tsx`: ลิงก์ "← กลับแผนที่" ของบท CCNA ชี้ `#/c/ccna`
- [ ] **Step 3:** รัน test ต้องล้ม
- [ ] **Step 4:** เขียนโค้ดตาม Interfaces ทุกหน้ารับ `course: Course` (ค่าเริ่มต้นเป็น CCNA เพื่อให้ test เดิมผ่าน)
- [ ] **Step 5:** `npm test` และ `npm run build` ต้องผ่าน
- [ ] **Step 6: Commit** `feat: multiple courses with picker and per-course progress`

---

### Task 2: เครื่องจำลอง git (ฟังก์ชันล้วน)

**Files:**
- Create: `src/gitsim/types.ts`, `src/gitsim/parse.ts`, `src/gitsim/run.ts`, `src/gitsim/run.test.ts`, `src/gitsim/parse.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface Commit { id: string; message: string; parent: string | null; parent2?: string; files: Record<string, string> } // files = สภาพไฟล์ทั้งหมดตอน commit
  export interface Repo { commits: Record<string, Commit>; branches: Record<string, string | null>; head: string } // head = ชื่อ branch
  export interface Machine { name: string; files: Record<string, string>; staged: Record<string, string> | null; repo: Repo | null; remote?: 'origin' } // repo null = ยังไม่ได้ init/clone
  export interface World { me: Machine; friend: Machine; github: Repo | null; conflict?: { file: string } }
  export type GitCommand = 'init' | 'status' | 'add' | 'commit' | 'log' | 'branch' | 'switch' | 'checkout' | 'merge' | 'clone' | 'push' | 'pull'
  export interface RunResult { world: World; output: string; explainTh: string; ok: boolean }
  export function tokenize(line: string): string[]          // รองรับ "..." และ '...' ที่มีช่องว่าง/ภาษาไทย
  export function run(world: World, line: string, allowed: GitCommand[]): RunResult
  export function friendDoes(world: World, action: { type: 'commit'; file: string; content: string; message: string } | { type: 'push' }): World
  ```
- id ของ commit ใน world เป็นเลขเรียงต่อกัน 7 ตัวอักษรแบบ hex ที่กำหนดได้ (เช่น `c1a0001`) เพื่อให้ test แน่นอน ไม่สุ่ม
- พฤติกรรมต้องตรง git จริงในกรณีที่สอน (spec ข้อ 9): `add <file>` / `add .`; `commit -m "<msg>"` (ไม่มีอะไร staged → แจ้งว่าไม่มีอะไรให้ commit; ไม่มี `-m` → `explainTh` บอกว่าต้องใส่ข้อความ และในแอปไม่เปิด editor); `status` แสดงไฟล์ที่แก้ / staged; `log` ใหม่สุดก่อน; `branch <name>`, `switch <name>`, `switch -c <name>`, `checkout` = เหมือน switch; `merge <branch>` แบบ fast-forward และแบบ merge commit และถ้าไฟล์เดียวกันแก้ทั้งสองฝั่งต่างกัน → `conflict` และไฟล์มีเครื่องหมาย `<<<<<<<`/`=======`/`>>>>>>>`; หลังแก้ไฟล์ + `add` + `commit` → conflict หาย; `clone` สร้าง repo จาก github; `push` (ถ้า github มี commit ที่เครื่องเราไม่มี → ปฏิเสธ พร้อม `explainTh` ให้ `git pull` ก่อน); `pull` = fetch + merge
- คำสั่งที่ไม่อยู่ใน `allowed` → `ok: false`, `explainTh` บอกว่า "คำสั่งนี้ยังไม่ได้เรียน" ส่วนบรรทัดที่ไม่ขึ้นต้นด้วย `git` หรือ subcommand ที่ไม่รู้จัก → `ok: false` พร้อมคำอธิบายไทย ห้าม throw

- [ ] **Step 1: เขียน test ที่ล้ม** ต่อพฤติกรรมข้างบนอย่างน้อยข้อละ 1 test รวม Review Focus 3–5: `tokenize('git commit -m "แก้หน้าแรก ใหม่"')` → `['git','commit','-m','แก้หน้าแรก ใหม่']`; `run(w,'git commit',…)` → `ok:false` และ `explainTh` มีคำว่า `-m`; `run(w,'ls',…)` → `ok:false`; `run(w,'git rebase main',…)` → `ok:false` ไม่ throw; เพื่อน commit+push แล้วเรา `git push` → `ok:false` และ `explainTh` มี `git pull`; หลัง `git pull` แล้ว `git push` → `ok:true` และ github มี commit ของทั้งสองคน; conflict แล้วแก้ไฟล์ (ใช้ helper `editFile(world, file, content)` ใน test) + add + commit → `world.conflict` เป็น `undefined`
- [ ] **Step 2:** รัน `npx vitest run src/gitsim` ต้องล้ม
- [ ] **Step 3:** เขียน `tokenize`, `run`, `friendDoes` และ `editFile(world, file, content): World` (export ไว้ใช้ใน UI ตอนผู้เรียนแก้ไฟล์ในแบบจำลอง)
- [ ] **Step 4:** test ผ่าน แล้ว `npm test`, `npm run build`
- [ ] **Step 5: Commit** `feat: pure git simulator`

---

### Task 3: ห้องทดลองชนิด git (ช่องพิมพ์คำสั่ง + ภาพสามที่ + เส้นประวัติ)

**Files:**
- Create: `src/lab/GitLabView.tsx`, `src/lab/GitLabView.test.tsx`, `src/lab/gitlab.css`, `src/gitsim/goals.ts`, `src/gitsim/goals.test.ts`
- Modify: `src/content/types.ts` (Lab union), `src/content/index.ts` (ตรวจ GitLab), `src/pages/LessonPage.tsx` (render)

**Interfaces:**
- Consumes: Task 2 ทั้งหมด
- Produces:
  ```ts
  export type GitGoal =
    | { type: 'state'; taskTh: string; hintTh: string; check: 'committed' | 'staged' | 'pushed' | 'pulled' | 'onBranch' | 'merged' | 'conflictFixed' | 'cloned'; arg?: string }
  export interface GitLab { kind: 'git'; introTh: string; start: World; allowed: GitCommand[]; goals: GitGoal[]; friendScript?: { afterGoal: number; action: Parameters<typeof friendDoes>[1] }[] }
  // Lab = NetworkLab | ActivityLab | GitLab
  export function checkGitGoal(world: World, g: GitGoal): boolean   // ใน src/gitsim/goals.ts + test
  ```
- UI (หน้าตาแบบ Git Bash: พื้นเข้ม ตัว monospace มี prompt `$`): ช่องพิมพ์ + ประวัติคำสั่งและ output; ข้างๆ คือภาพ **โฟลเดอร์งาน → กล่องรอปิดผนึก → ประวัติ** ของเครื่องเรา และเส้นประวัติของ **เครื่องเรา / GitHub / เครื่องเพื่อน** (จุด = commit, เส้นแยก = branch, ชื่อ branch ติดที่จุดล่าสุด) ทุกอย่างอัปเดตทันทีหลังพิมพ์ คลิกชื่อไฟล์ในโฟลเดอร์งานเพื่อแก้ข้อความได้ (ใช้ `editFile`)
- `explainTh` ของผลแต่ละคำสั่งแสดงเป็นกล่องอธิบายไทยใต้ output
- เป้าหมาย: แสดงทีละข้อ (`taskTh` ตลอด, `hintTh` เมื่อกดขอ) ผ่านข้อสุดท้ายแล้วเรียก `onDone` ครั้งเดียว `friendScript` ทำงานอัตโนมัติหลังผ่านเป้าหมายข้อที่กำหนด และขึ้นข้อความ `เพื่อนเพิ่ง push งานขึ้น GitHub` 
- ตัวตรวจใน `validateCourse` สำหรับ GitLab: `allowed` ไม่ว่าง, goal ไม่ว่าง, `friendScript.afterGoal` อยู่ในช่วงของ goals

- [ ] **Step 1: เขียน test ที่ล้ม** `checkGitGoal` ทุกชนิด; GitLabView: พิมพ์ `git init` แล้วกด Enter → เห็น output และภาพประวัติว่าง; พิมพ์คำสั่งที่ยังไม่อนุญาต → เห็น `explainTh`; ทำเป้าหมายครบ → `onDone` 1 ครั้ง; `friendScript` ทำงานหลังเป้าหมายที่กำหนดแล้วเห็นข้อความเพื่อน
- [ ] **Step 2:** รัน test ต้องล้ม
- [ ] **Step 3:** เขียนโค้ด
- [ ] **Step 4:** `npm test`, `npm run build`
- [ ] **Step 5: Commit** `feat: git lab with simulated Git Bash`

---

### Task 4: ฉากภาพเคลื่อนไหวสำหรับ git + กล่อง "ลองของจริง"

**Files:**
- Modify: `src/content/types.ts`, `src/scenes/actors.tsx`, `src/scenes/layout.ts` (+ test), `src/pages/LessonPage.tsx`, `src/pages/lesson.css`
- Create: `src/pages/RealTry.tsx`, `src/pages/RealTry.test.tsx`

**Interfaces:**
- Produces: `ActorKind` เพิ่ม `'commit'` (จุดกลม มีป้าย id/ข้อความสั้นได้) และ `'file'` (ไอคอนไฟล์ มีชื่อไฟล์) ใช้คู่กับ `cable` (เส้นเชื่อม commit), `card`, `table`, `pc`, `cloud` ที่มีอยู่แล้ว; `layout.ts` `boxOf` รองรับสองชนิดใหม่
- `Lesson.realTry?: { introTh: string; steps: { cmd: string; expectTh: string }[] }` แสดงเป็นกล่อง `ลองของจริงใน Git Bash` ในขั้นลองเล่น ต่อจากห้องทดลอง (แต่ละขั้นมีคำสั่งแบบ monospace + ปุ่มคัดลอก ใช้ pattern เดียวกับ AskTutor + ผลที่ควรเห็น) ไม่บังคับ ไม่นับเป็นเงื่อนไขผ่านขั้น
- ศัพท์ใน `realTry` อยู่ในการตรวจลำดับศัพท์ (`learnerTexts`)

- [ ] **Step 1: เขียน test ที่ล้ม** `boxOf` ของ commit/file; ฉาก v2 ที่มี commit สองจุดห่างกัน 40 px → `overlaps` เจอ; RealTry แสดงทุก step และปุ่มคัดลอกแต่ละอัน; `learnerTexts` ครอบ realTry
- [ ] **Step 2–4:** ล้ม → เขียน → `npm test`, `npm run build`
- [ ] **Step 5: Commit** `feat: commit/file actors and real Git Bash try box`

---

### Task 5: หาคลิปภาษาไทย

**Files:**
- Create: `docs/superpowers/plans/2026-10-27-git-course-videos.md`

- [ ] **Step 1:** หาคลิป YouTube ภาษาไทยที่อธิบาย git/GitHub เข้าใจง่าย อย่างน้อย 1 คลิปหลักต่อบท (10 บท) และคลิปเสริมถ้ามี เช็กทุกคลิปด้วย oEmbed (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json` → 200) และ `"playableInEmbed":true` ในหน้า watch ห้ามเดา id
- [ ] **Step 2:** จดลงไฟล์: บท → youtubeId, ชื่อคลิป, ช่อง, ความยาว, ช่วงที่ควรดู (ถ้าดูได้จากชื่อบท/คำอธิบายคลิป), และสถานะ `ยังไม่มีคนดูเนื้อหาจริง`
- [ ] **Step 3: Commit** `docs: Thai video picks for the git course`

---

### Task 6: บท g0-l1 และ g0-l2 (ทำไมต้องมี Git, ตระกูล Git)

**Files:**
- Create: `src/content/git/lessons/g0-l1.ts`, `g0-l2.ts` + `.test.tsx` ต่อบท, `public/audio/g0-l1/*.mp3`, `public/audio/g0-l2/*.mp3`
- Modify: `src/content/git/parts.ts`, `src/content/git/glossary.ts`

**Interfaces:**
- Consumes: Task 1, 4, 5 (คลิปจากไฟล์ Task 5)
- เนื้อหาตาม spec ข้อ 3 ภาค 0 บท 1–2 เป๊ะ รวม "ทำไมต้องมีหลายตัว" และ GitLab เป็นเจ้าอื่น และตาม spec ข้อ 2.6: GitHub Desktop อธิบายว่าปุ่มไหนตรงกับคำสั่งไหน แต่ไม่สอนเป็นหลัก
- g0-l1 ไม่มี precheck (เป็นบทแรกของวิชา) g0-l2 มี `requires` → g0-l1 และ precheck 2 ข้อ
- ห้องทดลอง: g0-l1 ใช้ ActivityLab `order` (เรียงปัญหาที่ git แก้ได้) g0-l2 ใช้ ActivityLab `match` (จับคู่ git / Git Bash / GitHub Desktop / GitHub กับหน้าที่)
- quiz ชั้นไทยอย่างเดียวได้ (วิชา Git ตั้ง `requireEnglishQuiz: false` ไว้แล้วใน Task 1)
- เสียง: `npm run narration:export` แล้วรันตาม `tools/tts/README.md`

- [ ] **Step 1–5:** test ของบท (ready, v2, requires/precheck, คลิปหลักมาจาก Task 5, บทพูดไม่มีตัวเลข/วงเล็บ, validateCourse ของวิชา git → `[]`) → ล้ม → เขียน → เสียง → `npm test`, `npm run build` → commit `feat(git-content): lessons g0-l1 and g0-l2`

---

### Task 7: บท g0-l3, g0-l4, g0-l5 (commit, add, push/pull/clone)

เหมือน Task 6 สำหรับบท 3–5 ตาม spec ข้อ 3 และภาพในข้อ 4 (เส้นจุดเซฟ, สามที่ของไฟล์, เครื่องเรา / GitHub / เครื่องเพื่อน) ห้องทดลองเป็น GitLab: g0-l3 `allowed: ['init','status','add','commit','log']` เป้าหมาย committed; g0-l4 เน้น status/add (staged ก่อน committed); g0-l5 เพิ่ม `clone','push','pull'` และ `friendScript` ที่เพื่อน push แล้วเราต้อง pull g0-l5 มี `realTry` ชุดแรก (`git --version`, `git config --global user.name`, `git config --global user.email`, `git init`, `git add`, `git commit -m`, `git log`) commit `feat(git-content): lessons g0-l3 to g0-l5`

---

### Task 8: ภาค 1 บท g1-l1 ถึง g1-l4 (branch, Pull Request, merge/conflict, วิธีที่นิยม)

เหมือน Task 6 ตาม spec ข้อ 3 ภาค 1 ห้องทดลอง GitLab: g1-l1 `branch/switch`; g1-l2 Pull Request สอนผ่านฉากและ ActivityLab `order` (ขั้นตอนบนเว็บ GitHub ไม่จำลองเว็บ) ; g1-l3 `merge` + conflict ที่แก้ได้ในแอป; g1-l4 GitHub Flow + `.gitignore` + commit message ที่ดี (ActivityLab `match` ข้อความ commit ดี/ไม่ดี) g1-l4 มี `realTry` (`git switch -c`, `git push -u origin <branch>`) "อยากรู้ลึก": rebase, cherry-pick, GitHub Actions (spec ข้อ 8) commit `feat(git-content): part 1 lessons`

---

### Task 9: ภาค 2 บท g2-l1 (push งานจริงครั้งแรก) + ไฟล์ครู

**Files:**
- Create: `src/content/git/lessons/g2-l1.ts` (+ test, เสียง)
- Modify: `scripts/export-roadmap.ts` (+ test) ให้เขียน `docs/tutor/roadmap-ccna.md` และ `docs/tutor/roadmap-git.md` (ลบ `roadmap.md` เดิม), `docs/tutor/README.md`, `docs/tutor/instructions.md`

- เนื้อหา: สร้าง repo บน GitHub, `git remote add origin`, `git push -u origin main`, หน้าต่างล็อกอินของ Git Credential Manager (ไม่ใส่รหัสผ่านในคำสั่ง ไม่ใช้ token ในแอป), เชิญเพื่อนเป็น collaborator, เพื่อน `git clone` ทั้งหมดอยู่ใน `realTry` + ฉาก; SSH อยู่ใน "อยากรู้ลึก"
- `renderRoadmap` ใช้เหมือนเดิมต่อวิชา; README บอกให้อัปโหลด roadmap ของวิชาที่กำลังเรียน และคำสั่ง `npm run roadmap:export`; instructions.md เพิ่มส่วนวิชา Git (สอน Git Bash เป็นหลัก, `git switch`, `main`)
- commit `feat(git-content): first real push lesson and tutor roadmaps`

---

### Task 10: ให้ผู้ใช้ลองจริง

- [ ] **Step 1:** เปิดแอป ให้ผู้ใช้เลือกวิชา Git เรียน g0-l1 ถึง g0-l5 และลองช่องพิมพ์คำสั่งจำลอง
- [ ] **Step 2:** ถาม 3 ข้อ: ตรงไหนงง, ภาษาตรงไหนยาก, ช่องพิมพ์คำสั่งเหมือน Git Bash จริงพอไหม แล้วจดลง `docs/superpowers/round1-handoff.md` หัวข้อ "ความเห็นวิชา Git"
- [ ] **Step 3:** แก้จุดที่งงก่อนให้ผู้ใช้ไป push งานจริงกับเพื่อน
