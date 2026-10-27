# คลิปภาษาไทยสำหรับวิชา Git (Task 5)

ค้นเมื่อ 2026-10-28 จากหน้าค้นหา YouTube ทุกคลิปในไฟล์นี้ผ่านการเช็ก 2 อย่าง: oEmbed ตอบ 200 และหน้า watch มี `"playableInEmbed":true`
**สถานะทุกคลิป: `ยังไม่มีคนดูเนื้อหาจริง`** (เลือกจากชื่อคลิป ช่อง ความยาว และคำอธิบายคลิปเท่านั้น ยังไม่มีใครดูจริง ก่อนใช้ในแอปต้องมีคนดูก่อน)
ผู้เรียนใช้ Git Bash (พิมพ์คำสั่ง) จึงเลือกคลิปที่โชว์ terminal ก่อน คลิปที่เป็น GUI/โปรแกรมอื่นระบุไว้ในหมายเหตุ

## ภาค 0 · เริ่มจากศูนย์

### g0-l1 ทำไมต้องมี Git
- **หลัก:** `pe9GU7yNYiE` — Git พื้นฐานสำหรับงาน AI Server · บทที่ 1 ทำไมต้อง Git + commit แรก | ช่อง Panutat Tejasen | 4:43
  - เหตุผล: เปิดด้วยปัญหา `train_final_v2_really_final.py` ตรงกับภาพ `งาน_final_จริงๆ_v3.docx` ของบทเลย แล้วอธิบายว่า commit คือ snapshot ทั้งโปรเจกต์ พร้อมชื่อคนทำและเวลา ใช้ terminal
  - ช่วงที่ควรดู: ทั้งคลิป (สั้น)
- เสริม: `g-qzBp3MOQQ` Git คืออะไร | Saladpuk | 3:54 (สั้นมาก คำอธิบายคลิปมีแค่ลิงก์ TortoiseGit/Git for Windows)
- เสริม: `ULbproWG_Vw` Git คืออะไร | Titor Ps360 | 10:15 (มี timestamp: 00:35 การทำงานแบบเก่า, 01:38 git คืออะไร, 01:52 ข้อดีของ git ดูถึง ~03:00 พอ ที่เหลือเป็นสาธิตคำสั่ง)
- เสริม: `6QE-4sFTtvw` Git กับ GitHub คืออะไร? | AI อะไรกันเนี่ย | 1:03 (เปรียบ Git เป็นปุ่มเซฟในเกม ตรงกับภาพของวิชา)

### g0-l2 ตระกูล Git ต่างกันยังไง
- **หลัก:** `oxoIr7TyGMs` — 🔥 Git CLI vs GitHub Desktop | BorntoDev | 18:18
  - เหตุผล: เทียบ "พิมพ์คำสั่ง" กับ "แอปกดปุ่ม" ตรงประเด็นบทนี้ ส่วน Git Bash คือหน้าต่างพิมพ์คำสั่งบน Windows
  - **ข้อควรระวัง:** คลิปไม่น่าจะพูดถึง GitLab และการแยก "ตัวจดประวัติ / วิธีสั่ง / ที่ฝากงาน" เป็นหัวข้อ ต้องให้บทในแอปเติมเอง
- เสริม: `6QE-4sFTtvw` Git กับ GitHub คืออะไร? | AI อะไรกันเนี่ย | 1:03 (แยก Git กับ GitHub แบบสั้นสุด)
- เสริม: `TainXzrMpHA` ทำความเข้าใจ GitHub สำหรับสาย Coding แบบง่าย ๆ | We Mahidol | 8:24 (เน้นฝั่งเว็บ GitHub)

### g0-l3 repository กับ commit
- **หลัก:** `MX9OUXV45B0` — สอน Git ตอนที่2# - Create Local Repository | CMDev | 14:42
  - เหตุผล: สร้าง repository ในเครื่องแล้วทำตามทีละขั้น (คำอธิบายคลิปไม่บอกรายละเอียด ตัดสินจากชื่อคลิปและลำดับซีรีส์)
- เสริม: `pe9GU7yNYiE` Panutat Tejasen บทที่ 1 (commit แรก) | 4:43
- เสริม: `fJ-U40-0j4o` Panutat Tejasen บทที่ 4 ย้อนเวลาและแก้พลาด | 5:32 (ภาพ "ย้อนไปจุดเซฟ")

### g0-l4 git add
- **หลัก:** `eSzam5vabTQ` — Git พื้นฐานสำหรับงาน AI Server · บทที่ 2 วงจรทำงานประจำวัน: แก้ → ดู → add → commit | Panutat Tejasen | 4:57
  - เหตุผล: คำอธิบายเริ่มจากภาพ 3 ที่ของ Git (working directory, staging area, repository) และบอกว่า add/commit ย้ายการแก้ไปที่ไหน ตรงกับภาพ "สามที่ของไฟล์" ของวิชา ทำบน terminal จริง
- เสริม: `UUhNhMfcyzM` สอน Git ตอนที่3# - Git Status | CMDev | 11:36
- เสริม: `uo1GpofWRSk` git status, git add ., git commit -m | James AppzStory | 7:03

### g0-l5 ในเครื่องกับบนเน็ต
- **หลัก:** `K3LG7U9uu-U` — Git พื้นฐานสำหรับงาน AI Server · บทที่ 6 Remote: clone, push, pull | Panutat Tejasen | 5:46
  - เหตุผล: อธิบาย remote เป็น repository กลาง ใช้ `git remote add origin`, `git push -u origin main`, `git clone` บน terminal
- เสริม: `1uU7oo4z24Q` สอน Git ตอนที่7# - Push and Pull | CMDev | 8:05
- เสริม: `BTmO1Zp7lwE` การใช้ git clone และ git pull | prasertcbs | 10:17

## ภาค 1 · ทำงานคู่กับเพื่อน

### g1-l1 branch
- **หลัก:** `u7dDKe7cYgs` — Git พื้นฐานสำหรับงาน AI Server · บทที่ 5 Branch: ลองของใหม่โดยไม่พังของเดิม | Panutat Tejasen | 5:58
  - เหตุผล: แตกสายแยกไปทดลอง commit ไม่กระทบ main แล้ว merge หรือทิ้ง ตรงกับภาพ "แยกกันทำคนละห้อง" บน terminal
- เสริม: `royxjMnQqOM` สอน Git ตอนที่9# - Git Branch | CMDev | 8:17
- เสริม: `4NS7_G5LuV8` แตก branch ใหม่สำหรับแต่ละงาน และ merge | LimBogDev | 16:36 (คำอธิบายพูดถึง Git Desktop ใช้ระวัง อาจเป็นแอปกดปุ่ม)

### g1-l2 Pull Request  (จับคู่ได้ไม่ดี)
- **หลัก:** `gZEjfT2TsVM` — สอน Git & GitHub หยุดทำบาปต่อเพื่อนในทีมด้วยการ... | Git The Series Part 2/3 | Superdev Academy | 38:30
  - เหตุผล: คำอธิบายบอกว่าสอน workflow ทีมตั้งแต่แบ่ง Branch, สร้าง Pull Request ไปจนถึง Merge เป็นคลิปไทยที่ครอบคลุม PR ที่สุดที่หา
  - ช่วงที่ควรดู: ไม่มี chapter ในคำอธิบาย ต้องให้คนดูหาช่วง PR เอง (คลิปยาว)
  - **ช่องว่าง:** ไม่พบคลิปไทยสั้นที่สอน PR อย่างเดียว
- เสริม: `GkrfXTlYdmc` วิธีการทำงานร่วมกับผู้อื่นผ่าน Git | นครโค้ด | 38:05 (branch, merge, pull, push ทีม ไม่ชัดว่ามี PR)
- เสริม (ภาษาอังกฤษ ไม่ใช่ไทย): `nCKdihvneS0` How to create a pull request in 4 min | GitHub (ช่องทางการ) | 3:44 (ไม่ใช่ภาษาไทย ตัดสินใจกับผู้ใช้ก่อนใช้)

### g1-l3 merge กับ conflict
- **หลัก:** `u5TfPXI8AOo` — สอน Git ตอนที่8# - Merge Conflict | CMDev | 6:34
  - เหตุผล: สั้น เฉพาะเรื่อง conflict (คำอธิบายคลิปไม่บอกรายละเอียด ตัดสินจากชื่อ)
- เสริม: `ZflU6rNtTQU` การแก้ไขปัญหา Merge Conflict ของ Git | นครโค้ด | 5:24 (แก้ใน VS Code ไม่ใช่ Git Bash ล้วน)
- เสริม: `5TlGWHU_SQc` EP.29 สอนใช้งาน Git คลิปเดียวจบ | BorntoDev | 17:13 (คำอธิบายบอกว่าไปจนถึงแก้ Conflict)

### g1-l4 วิธีที่คนนิยมใช้ (GitHub Flow, .gitignore, commit message)  (ครอบคลุมบางส่วน)
- **หลัก:** `clYb3xng5Zw` — Git พื้นฐานสำหรับงาน AI Server · บทที่ 3 .gitignore: อะไรไม่ควรเข้า Git | Panutat Tejasen | 4:37
  - เหตุผล: อธิบาย 3 กลุ่มไฟล์ที่ไม่ควรเข้า Git (ไฟล์ใหญ่, ไฟล์โปรแกรมสร้างเอง, ความลับอย่าง .env) พร้อมเหตุผล
  - **ช่องว่าง:** หลักนี้ครอบแค่ .gitignore ส่วน GitHub Flow ให้ใช้ `gZEjfT2TsVM` (ด้านล่าง) ส่วน commit message ใช้ `P-J8c9LBzic`
- เสริม: `gZEjfT2TsVM` Superdev Part 2/3 | 38:30 (branch → PR → merge คือแกนของ GitHub Flow)
- เสริม: `P-J8c9LBzic` การใช้ข้อความ Conventional Commits ของ Git | นครโค้ด | 6:05 (เป็นรูปแบบเฉพาะ Conventional Commits ใช้เป็นแค่ตัวอย่าง)
- เสริม: `voznFsh1_vI` ไฟล์ gitignore ใช้ยังไง มีไว้ทำไม | MilerDev | 8:08
- เสริม: `cYVOZUBARho` สอน Git ตอนที่6# - Git Ignored | CMDev | 6:49

## ภาค 2 · ใช้จริง

### g2-l1 push งานจริงครั้งแรก  (login/collaborator ไม่มีคลิปไทยตรง)
- **หลัก:** `4Z8fGcx5N2A` — เรียนรู้พื้นฐานการใช้งาน Git & Github (git init, add, commit, remote, push) | MilerDev | 14:29
  - เหตุผล: ตั้งแต่ init ถึง push ครั้งแรกในคลิปเดียว ตามชื่อคลิป
- เสริม: `BDoNSr3rMf4` สอน git เบื้องต้น: การใช้ git push ไปยัง remote repository บน github | prasertcbs | 14:08
- เสริม: `DV-JWKq-1BI` สอนเอาโค้ดโปรเจคขึ้น GitHub เพื่อให้เขียนโค้ดร่วมกับเพื่อนๆ | Boppin' Code | 8:01 (ตามคำอธิบายเกี่ยวกับการทำงานกับเพื่อนร่วมทีม ไม่ชัดว่ามีเชิญ collaborator)
- เสริม (ภาษาอังกฤษ): `bZhtmmZinWo` Connect Git to GitHub on Windows 11, first push, no password | Fix It Faster IT | 1:51 (อธิบาย Git Credential Manager ที่มากับ Git for Windows ตรงเรื่อง "ล็อกอินตอน push" แต่ไม่ใช่ภาษาไทย)
- **ช่องว่าง:** ไม่พบคลิปไทยที่อธิบายการล็อกอินตอน push (token / Credential Manager) หรือการเชิญ collaborator ตรง ๆ บทนี้ต้องเขียนเองในแอป

## สรุป
- บทที่มีคลิปหลักที่ตรงเรื่อง: g0-l1, g0-l3, g0-l4, g0-l5, g1-l1, g1-l3 (6 บท) ส่วน g0-l2, g1-l2, g1-l4, g2-l1 มีคลิปหลักแต่ครอบคลุมไม่ครบ (ระบุช่องว่างไว้ข้างบน) ทั้ง 10 บทมีคลิปหลักที่ผ่านการตรวจ embed
- ช่องที่ซ้ำ:
  - **Panutat Tejasen** ซีรีส์ "Git พื้นฐานสำหรับงาน AI Server" 7 ตอน ตอนละ 4-6 นาที ทำบน terminal พูดถึง add/commit, .gitignore, remote, branch ตรงกับผู้เรียนแบบพิมพ์คำสั่งมากที่สุด (ตัวอย่างเป็นงาน AI/Python และมีบทเฉพาะ server ไม่ใช่ทุกตอนที่ใช้ได้)
  - **CMDev** "สอน Git ตอนที่ 1-12" ซีรีส์ยาว ตอนละ 6-15 นาที (ตอนที่ 1 `juK3OwMIBu8` Intro Version Control 7:31 ใช้เสริมบท 1 ได้ แต่คำอธิบายไม่บอกรายละเอียด)
  - **นครโค้ด**, **MilerDev**, **prasertcbs**, **Superdev Academy** มีหลายคลิป แต่ยาวหรือผสมหลายหัวข้อ
- ข้อควรทำก่อนใช้ในแอป: ให้คนดูจริงก่อนอย่างน้อยคลิปหลักทุกบท โดยเฉพาะคลิปที่คำอธิบายไม่บอกเนื้อหา (CMDev) และดูว่าคลิปใช้ Git Bash หรือโปรแกรมอื่น
