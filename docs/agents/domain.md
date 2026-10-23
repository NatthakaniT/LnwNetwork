# เอกสาร Domain

วิธีที่ engineering skills ควรใช้เอกสาร domain ของ repo นี้ระหว่างสำรวจ codebase

## ก่อนสำรวจ ให้อ่านสิ่งเหล่านี้

- **`GLOSSARY.md`** ที่ root ของ repo หรือ
- **`GLOSSARY-MAP.md`** ที่ root ของ repo ถ้ามี: ไฟล์นี้ชี้ไปยัง `GLOSSARY.md` หนึ่งไฟล์ต่อหนึ่ง context ให้อ่านเฉพาะไฟล์ที่เกี่ยวกับหัวข้อนั้น
- **`docs/adr/`**: อ่าน ADR ที่เกี่ยวข้องกับส่วนที่กำลังจะทำงาน ใน repo แบบ multi-context ให้ดู `src/<context>/docs/adr/` สำหรับการตัดสินใจเฉพาะ context ด้วย

ถ้าไฟล์เหล่านี้ไม่มีอยู่ **ให้ทำงานต่อไปเงียบ ๆ** ไม่ต้องแจ้งว่าไม่มี และไม่ต้องเสนอให้สร้างล่วงหน้า skill `/domain-modeling` (เรียกผ่าน `/grill-with-docs` และ `/improve-codebase-architecture`) จะสร้างไฟล์เหล่านี้เองเมื่อคำศัพท์หรือการตัดสินใจได้ข้อสรุปจริง

## โครงสร้างไฟล์

repo แบบ single-context (repo ส่วนใหญ่):

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

repo แบบ multi-context (มี `GLOSSARY-MAP.md` ที่ root):

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← การตัดสินใจระดับทั้งระบบ
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← การตัดสินใจเฉพาะ context
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

## ใช้คำศัพท์ตาม glossary

เมื่อผลงานของคุณเอ่ยถึงแนวคิดใน domain (ในชื่อ issue, ข้อเสนอ refactor, สมมติฐาน, ชื่อ test) ให้ใช้คำตามที่นิยามไว้ใน `GLOSSARY.md` อย่าเปลี่ยนไปใช้คำพ้องที่ glossary ระบุว่าให้หลีกเลี่ยง

ถ้าแนวคิดที่ต้องการยังไม่อยู่ใน glossary นั่นคือสัญญาณว่า คุณอาจกำลังคิดคำที่โปรเจกต์ไม่ได้ใช้ (ควรทบทวน) หรือมีช่องว่างจริง (จดไว้ให้ `/domain-modeling`)

## แจ้งเมื่อขัดกับ ADR

ถ้าผลงานของคุณขัดกับ ADR ที่มีอยู่ ให้แจ้งอย่างชัดเจน แทนที่จะทับไปเงียบ ๆ:

> _ขัดกับ ADR-0007 (event-sourced orders) แต่ควรพิจารณาใหม่เพราะ…_
