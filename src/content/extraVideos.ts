import type { LessonId, VideoRef } from './types'

const arm = (youtubeId: string, titleTh: string, noteTh: string): VideoRef => ({ youtubeId, titleTh, channel: '9arm', noteTh })

const LONG = 'คลิปเสริมจากช่อง 9arm ยาวกว่าครึ่งชั่วโมง เล่าเป็นเรื่องเล่าภาพรวม ไม่ใช่เนื้อหาข้อสอบ ดูตอนอยากรู้เพิ่มก็พอ'
const SHORT = 'คลิปเสริมจากช่อง 9arm สั้น ๆ เล่าภาพรวม ดูหลังคลิปหลักแล้ว ถ้ายังอยากเห็นอีกมุมหนึ่ง'

/** คลิปเสริมของแต่ละบท ต่อท้ายคลิปของบทเสมอ คลิปหลัก (ตัวแรก) ยังเป็นของบทนั้นเอง */
export const extraVideos: Record<LessonId, VideoRef[]> = {
  'p0-l1': [
    arm('Q8hUYTE6QUw', 'อินเตอร์เน็ททำงานด้วยแสง', LONG),
    arm('1CmzeqE3bFw', 'เรื่องยุ่งเหยิงของสายใต้ทะเล', LONG),
  ],
  'p0-l3': [arm('PPtQuSYK13o', 'DNS Server แบบขอสั้นๆ', SHORT)],
  'p0-bits': [arm('Uw85MNAFF3M', 'นายอาร์มสอน Computer Architecture', LONG)],
  'p0-l4': [arm('wgBdzjiSHRk', 'ทำไม IP Address เราซ้ำกัน', LONG + ' บางช่วงเล่าเรื่องที่ภาคหลัง ๆ ค่อยสอน ดูผ่าน ๆ ได้')],
  'p1-l7': [
    arm('8vdsCMn3MOc', 'ทำไมสาย LAN เส้นละแสนก็อาจไม่ช่วย', 'คลิปเสริมจากช่อง 9arm เล่าเรื่องสาย LAN แบบสนุก ๆ ไม่ใช่เนื้อหาข้อสอบ'),
  ],
  'p1-l8': [
    arm('lGA9-COR3e4', 'WIFI6 แบบขอสั้นๆ', SHORT),
    arm('3nzfxwufQe8', 'Mesh Wifi แบบขอสั้นๆ', SHORT),
  ],
  'p1-l9': [
    arm('hWe-JuRW0oc', 'Cloud แบบขอสั้นๆ', SHORT),
    arm('LLFptsWhZOA', 'Edge Computing แบบขอสั้นๆ', SHORT),
  ],
  'p2-l8': [arm('3nzfxwufQe8', 'Mesh Wifi แบบขอสั้นๆ', SHORT)],
  'p4-l2': [arm('PPtQuSYK13o', 'DNS Server แบบขอสั้นๆ', SHORT)],
  'p4-l3': [arm('wgBdzjiSHRk', 'ทำไม IP Address เราซ้ำกัน', LONG)],
  'p5-l1': [
    arm('H8xGcyoJ21E', 'Cybersecurity แบบขอสั้นๆ', SHORT),
    arm('OmRaEgULVeg', 'ใช้ WIFI สาธารณะแล้วโดน Hack จริงมั้ย?', 'คลิปเสริมจากช่อง 9arm เล่าภัยจากไวไฟสาธารณะ ดูหลังคลิปหลัก'),
  ],
  'p5-l2': [arm('qmL3hey8Dd0', 'Password แบบขอสั้นๆ', SHORT)],
  'p5-l6': [
    arm('2xc5TVIjI_I', 'VPN แบบขอสั้นๆ', SHORT),
    arm('21DDNcn1eus', 'ใช้ VPN ปกปิดตัวตนคุณได้แค่ไหน?', 'คลิปเสริมจากช่อง 9arm เล่าว่า VPN ช่วยได้แค่ไหน ดูหลังคลิปหลัก'),
  ],
  'p5-l7': [arm('OmRaEgULVeg', 'ใช้ WIFI สาธารณะแล้วโดน Hack จริงมั้ย?', 'คลิปเสริมจากช่อง 9arm เล่าภัยจากไวไฟสาธารณะ ดูหลังคลิปหลัก')],
}

export const withExtraVideos = (l: { id: LessonId; videos: VideoRef[] }) => [...l.videos, ...(extraVideos[l.id] ?? [])]
