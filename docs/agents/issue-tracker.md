# Issue tracker: Markdown ในเครื่อง

issue และ spec ของ repo นี้เก็บเป็นไฟล์ markdown ใน `.scratch/`

## ข้อตกลง

- หนึ่ง feature ต่อหนึ่งโฟลเดอร์: `.scratch/<feature-slug>/`
- spec อยู่ที่ `.scratch/<feature-slug>/spec.md`
- issue สำหรับลงมือทำ แยกเป็นหนึ่งไฟล์ต่อหนึ่ง ticket ที่ `.scratch/<feature-slug>/issues/<NN>-<slug>.md` เรียงเลขเริ่มจาก `01` ห้ามรวมทุก ticket ไว้ในไฟล์เดียว
- สถานะ triage บันทึกเป็นบรรทัด `Status:` ใกล้ด้านบนของไฟล์ issue แต่ละไฟล์
- ความคิดเห็นและประวัติการสนทนา ต่อท้ายไฟล์ใต้หัวข้อ `## Comments`

## เมื่อ skill บอกว่า "publish to the issue tracker"

สร้างไฟล์ใหม่ภายใต้ `.scratch/<feature-slug>/` (สร้างโฟลเดอร์ถ้ายังไม่มี)

## เมื่อ skill บอกว่า "fetch the relevant ticket"

อ่านไฟล์ตาม path ที่อ้างถึง โดยปกติผู้ใช้จะส่ง path หรือเลข issue มาให้โดยตรง

## การดำเนินการ wayfinding

ใช้โดย `/wayfinder` โดย **map** คือไฟล์หนึ่งไฟล์ที่มีไฟล์ **child** หนึ่งไฟล์ต่อหนึ่ง ticket

- **Map**: `.scratch/<effort>/map.md` (เนื้อหาส่วน Notes / Decisions-so-far / Fog)
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md` เรียงเลขเริ่มจาก `01` โดยมีคำถามอยู่ในเนื้อหา บรรทัด `Type:` ระบุประเภท ticket (`research`/`prototype`/`grilling`/`task`) และบรรทัด `Status:` ระบุ `claimed`/`resolved`
- **Blocking**: บรรทัด `Blocked by: NN, NN` ใกล้ด้านบน ticket จะถือว่าไม่ถูก block เมื่อทุกไฟล์ที่ระบุมีสถานะ `resolved`
- **Frontier**: ไล่ดู `.scratch/<effort>/issues/` หาไฟล์ที่ยังเปิดอยู่ ไม่ถูก block และยังไม่มีใคร claim เลขน้อยสุดได้ก่อน
- **Claim**: ตั้ง `Status: claimed` แล้วบันทึกไฟล์ก่อนเริ่มงาน
- **Resolve**: ต่อท้ายคำตอบใต้หัวข้อ `## Answer` ตั้ง `Status: resolved` แล้วเพิ่มตัวชี้บริบท (สรุปสั้น + ลิงก์) ลงในส่วน Decisions-so-far ของ `map.md`
