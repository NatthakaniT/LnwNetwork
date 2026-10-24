// ข้อมูลส่วน OSI ของหน้าคลังศัพท์ (ไม่แก้ GlossaryTerm; คำอธิบายเต็มอยู่ใน glossary.ts)
// คำสั้นใช้คำเปรียบเทียบเดียวกับบท p0-l5

export interface OsiLayer { no: 1 | 2 | 3 | 4 | 5 | 6 | 7; termId: string; shortTh: string; color: string }

/** 7 ชั้นของ OSI เรียงจากบนลงล่าง (7 → 1); color เป็น token ใน styles.css (ตัวหนังสือบนแถบใช้ --bg) */
export const OSI_LAYERS: OsiLayer[] = [
  { no: 7, termId: 'application-layer', shortTh: 'ชั้นที่โปรแกรมใช้คุย', color: 'var(--p1)' },
  { no: 6, termId: 'presentation-layer', shortTh: 'จัดรูปแบบ เข้ารหัส', color: 'var(--p1-light)' },
  { no: 5, termId: 'session-layer', shortTh: 'เปิด-ปิดการคุย', color: 'var(--p1-lighter)' },
  { no: 4, termId: 'transport-layer', shortTh: 'กล่อง · port', color: 'var(--p5)' },
  { no: 3, termId: 'network-layer', shortTh: 'ใบปะหน้า · IP', color: 'var(--p0)' },
  { no: 2, termId: 'data-link-layer', shortTh: 'รถ · MAC', color: 'var(--p4)' },
  { no: 1, termId: 'physical-layer', shortTh: 'ถนน · สัญญาณ', color: 'var(--p3)' },
]

/** TCP/IP 4 ชั้น กับชั้น OSI ที่แต่ละชั้นครอบ (เรียงบนลงล่าง) */
export const TCPIP_LAYERS: { termId: string; osi: number[] }[] = [
  { termId: 'application-layer', osi: [7, 6, 5] },
  { termId: 'transport-layer', osi: [4] },
  { termId: 'internet-layer', osi: [3] },
  { termId: 'network-access-layer', osi: [2, 1] },
]

/** คำที่อยู่ในส่วน "OSI Model · 7 ชั้น": 7 ชั้น + ชั้นของ TCP/IP ที่ชื่อไม่ซ้ำกับ OSI */
export const OSI_SECTION_IDS: string[] = [
  ...OSI_LAYERS.map((l) => l.termId),
  'internet-layer',
  'network-access-layer',
]

/** คำในกลุ่ม "ศัพท์ OSI อื่น ๆ" */
export const OSI_OTHER_IDS: string[] = [
  'osi-model', 'tcp-ip-model', 'layer', 'encapsulation', 'de-encapsulation',
  'pdu', 'data', 'segment', 'frame', 'bits', 'port',
]
