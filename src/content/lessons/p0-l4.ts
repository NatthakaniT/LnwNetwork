import type { Actor, Device, Lesson, SceneAction } from '../types'

const hidden = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const hide = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'hide', actor }))

const lifeIds = ['man', 'home', 'lifeLbl1', 'lifeLbl2']
const macIds = ['mPc', 'mLbl1', 'mLbl2', 'mLbl3']
const ipIds = ['iPc', 'iLbl1', 'iLbl2', 'iLbl3']
const moveIds = ['vHome', 'vCafe', 'lap', 'vLbl1', 'vLbl2']
const routeIds = ['rVA', 'rVB', 'rPc', 'rSwA', 'rR', 'rSwB', 'rDst', 'rc1', 'rc2', 'rc3', 'rc4', 'rBox', 'rLbl1', 'rLbl2']
const lastIds = ['tR', 'tSw', 't1', 't2', 't3', 'tc0', 'tc1', 'tc2', 'tc3', 'tBox', 'tLbl']
const arpIds = ['aAsk', 'aSw', 'a1', 'a2', 'a3', 'ac0', 'ac1', 'ac2', 'ac3', 'aQ1', 'aQ2', 'aQ3', 'aAns', 'aLbl1', 'aLbl2']
const gwIds = ['gPc', 'gSw', 'gR', 'gNet', 'gc1', 'gc2', 'gc3', 'gAsk', 'gBox', 'gLbl1', 'gLbl2']
const dupIds = ['dSend', 'dSw', 'd1', 'd2', 'dc0', 'dc1', 'dc2', 'dBox', 'dLbl1', 'dLbl2']

const actors: Actor[] = [
  // ฉาก 1: คนหนึ่งคน มีเลขสองแบบ
  { id: 'man', kind: 'person', x: 260, y: 190, label: 'ตัวเรา' },
  { id: 'home', kind: 'house', x: 700, y: 190, label: 'บ้านเรา' },
  { id: 'lifeLbl1', kind: 'label', x: 480, y: 400, label: '🪪 เลขบัตรประชาชน = ติดตัวเรา ย้ายไปไหนก็เลขเดิม' },
  { id: 'lifeLbl2', kind: 'label', x: 480, y: 465, label: '🏠 บ้านเลขที่ = ติดบ้าน ย้ายบ้านก็ได้เลขใหม่' },

  // ฉาก 2: MAC address = เลขบัตรประชาชนของเครื่อง
  hidden({ id: 'mPc', kind: 'pc', x: 480, y: 170, label: 'คอม' }),
  hidden({ id: 'mLbl1', kind: 'label', x: 480, y: 370, label: '🪪 MAC address = เลขบัตรประชาชนของเครื่อง' }),
  hidden({ id: 'mLbl2', kind: 'label', x: 480, y: 430, label: 'โรงงานฝังมากับการ์ดแลน (NIC) ติดเครื่องตลอด' }),
  hidden({ id: 'mLbl3', kind: 'label', x: 480, y: 490, label: 'เช่น AA:BB:CC:11:22:33 · มีเลข 0-9 กับตัว A-F รวม 12 ตัว' }),

  // ฉาก 3: IP address = บ้านเลขที่ / IPv4
  hidden({ id: 'iPc', kind: 'pc', x: 480, y: 170, label: 'คอม' }),
  hidden({ id: 'iLbl1', kind: 'label', x: 480, y: 370, label: '🏠 IP address = บ้านเลขที่ของเครื่อง' }),
  hidden({ id: 'iLbl2', kind: 'label', x: 480, y: 430, label: 'IPv4 เช่น 192.168.1.10 = เลข 4 ชุด คั่นด้วยจุด' }),
  hidden({ id: 'iLbl3', kind: 'label', x: 480, y: 490, label: 'แต่ละชุด เป็นเลข 0 ถึง 255 · หมู่บ้านเดียวกัน ห้ามซ้ำ' }),

  // ฉาก 4: หิ้วโน้ตบุ๊กไปร้านกาแฟ = ย้ายหมู่บ้าน
  hidden({ id: 'vHome', kind: 'label', x: 220, y: 60, label: '🏠 หมู่บ้าน: เน็ตบ้าน' }),
  hidden({ id: 'vCafe', kind: 'label', x: 740, y: 60, label: '☕ หมู่บ้าน: ไวไฟร้านกาแฟ' }),
  hidden({ id: 'lap', kind: 'laptop', x: 220, y: 220, label: 'IP 192.168.1.10' }),
  hidden({ id: 'vLbl1', kind: 'label', x: 480, y: 420, label: '🔄 ย้ายหมู่บ้าน ได้ IP ใหม่: 192.168.1.10 → 10.0.0.25' }),
  hidden({ id: 'vLbl2', kind: 'label', x: 480, y: 480, label: '✅ MAC AA:BB:CC:11:22:33 เลขเดิม (ฝังในการ์ดแลน)' }),

  // ฉาก 5: ข้ามหมู่บ้าน Router ดู IP
  hidden({ id: 'rVA', kind: 'label', x: 190, y: 50, label: 'หมู่บ้านเอ' }),
  hidden({ id: 'rVB', kind: 'label', x: 770, y: 50, label: 'หมู่บ้านบี' }),
  hidden({ id: 'rPc', kind: 'pc', x: 110, y: 170, label: 'คอมเรา' }),
  hidden({ id: 'rSwA', kind: 'switch', x: 230, y: 320, label: 'Switch' }),
  hidden({ id: 'rR', kind: 'router', x: 480, y: 320, label: 'Router' }),
  hidden({ id: 'rSwB', kind: 'switch', x: 730, y: 320, label: 'Switch' }),
  hidden({ id: 'rDst', kind: 'pc', x: 850, y: 170, label: 'ปลายทาง' }),
  hidden({ id: 'rc1', kind: 'cable', x: 110, y: 170, to: 'rSwA' }),
  hidden({ id: 'rc2', kind: 'cable', x: 230, y: 320, to: 'rR' }),
  hidden({ id: 'rc3', kind: 'cable', x: 480, y: 320, to: 'rSwB' }),
  hidden({ id: 'rc4', kind: 'cable', x: 730, y: 320, to: 'rDst' }),
  hidden({ id: 'rBox', kind: 'box', x: 110, y: 170 }),
  hidden({ id: 'rLbl1', kind: 'label', x: 480, y: 450, label: '🏠 ข้ามหมู่บ้าน: Router ดู IP ผู้รับ แล้วเลือกทาง' }),
  hidden({ id: 'rLbl2', kind: 'label', x: 480, y: 505, label: 'ส่วนหนึ่งของ IP บอกหมู่บ้าน · ส่วนไหน เดี๋ยวภาค 1 เล่า' }),

  // ฉาก 6: ในหมู่บ้าน ยื่นของด้วย MAC
  hidden({ id: 'tR', kind: 'router', x: 480, y: 80, label: 'Router' }),
  hidden({ id: 'tSw', kind: 'switch', x: 480, y: 230, label: 'Switch' }),
  hidden({ id: 't1', kind: 'pc', x: 200, y: 380, label: 'MAC ...:01' }),
  hidden({ id: 't2', kind: 'pc', x: 480, y: 380, label: 'MAC ...:02' }),
  hidden({ id: 't3', kind: 'pc', x: 760, y: 380, label: 'MAC ...:03' }),
  hidden({ id: 'tc0', kind: 'cable', x: 480, y: 80, to: 'tSw' }),
  hidden({ id: 'tc1', kind: 'cable', x: 480, y: 230, to: 't1' }),
  hidden({ id: 'tc2', kind: 'cable', x: 480, y: 230, to: 't2' }),
  hidden({ id: 'tc3', kind: 'cable', x: 480, y: 230, to: 't3' }),
  hidden({ id: 'tBox', kind: 'box', x: 480, y: 80, label: 'ถึง MAC ...:03' }),
  hidden({ id: 'tLbl', kind: 'label', x: 480, y: 505, label: '🪪 ในหมู่บ้าน: ยื่นของด้วย MAC ให้ถูกเครื่อง' }),

  // ฉาก 7: ARP = ตะโกนถามในหมู่บ้าน
  hidden({ id: 'aLbl1', kind: 'label', x: 480, y: 40, label: '📢 คอมเรา: ใครใช้ IP 192.168.1.30 ขอ MAC หน่อย' }),
  hidden({ id: 'aLbl2', kind: 'label', x: 480, y: 95, label: '🙋 คอม 3: ฉันเอง นี่ MAC ของฉัน · เครื่องอื่นเงียบ' }),
  hidden({ id: 'aAsk', kind: 'pc', x: 150, y: 230, label: 'คอมเรา' }),
  hidden({ id: 'aSw', kind: 'switch', x: 480, y: 230, label: 'Switch' }),
  hidden({ id: 'a1', kind: 'pc', x: 300, y: 400, label: 'คอม 1' }),
  hidden({ id: 'a2', kind: 'pc', x: 540, y: 400, label: 'คอม 2' }),
  hidden({ id: 'a3', kind: 'pc', x: 790, y: 400, label: 'คอม 3 · 192.168.1.30' }),
  hidden({ id: 'ac0', kind: 'cable', x: 150, y: 230, to: 'aSw' }),
  hidden({ id: 'ac1', kind: 'cable', x: 480, y: 230, to: 'a1' }),
  hidden({ id: 'ac2', kind: 'cable', x: 480, y: 230, to: 'a2' }),
  hidden({ id: 'ac3', kind: 'cable', x: 480, y: 230, to: 'a3' }),
  hidden({ id: 'aQ1', kind: 'envelope', x: 150, y: 230 }),
  hidden({ id: 'aQ2', kind: 'envelope', x: 150, y: 230 }),
  hidden({ id: 'aQ3', kind: 'envelope', x: 150, y: 230 }),
  hidden({ id: 'aAns', kind: 'envelope', x: 790, y: 400 }),

  // ฉาก 8: ปลายทางนอกหมู่บ้าน ถาม MAC ของ Gateway
  hidden({ id: 'gLbl1', kind: 'label', x: 480, y: 40, label: '🚪 ปลายทางอยู่นอกหมู่บ้าน: ถามหา MAC ของ Gateway' }),
  hidden({ id: 'gLbl2', kind: 'label', x: 480, y: 95, label: '📦 IP ผู้รับบนกล่อง = เครื่องปลายทาง (ไม่เปลี่ยน)' }),
  hidden({ id: 'gPc', kind: 'pc', x: 130, y: 280, label: 'คอมเรา' }),
  hidden({ id: 'gSw', kind: 'switch', x: 360, y: 280, label: 'Switch' }),
  hidden({ id: 'gR', kind: 'router', x: 600, y: 280, label: 'Gateway (Router)' }),
  hidden({ id: 'gNet', kind: 'cloud', x: 840, y: 280, label: 'นอกหมู่บ้าน' }),
  hidden({ id: 'gc1', kind: 'cable', x: 130, y: 280, to: 'gSw' }),
  hidden({ id: 'gc2', kind: 'cable', x: 360, y: 280, to: 'gR' }),
  hidden({ id: 'gc3', kind: 'cable', x: 600, y: 280, to: 'gNet' }),
  hidden({ id: 'gAsk', kind: 'envelope', x: 130, y: 280 }),
  hidden({ id: 'gBox', kind: 'box', x: 130, y: 280 }),

  // ฉาก 9: IP ซ้ำ
  hidden({ id: 'dLbl1', kind: 'label', x: 480, y: 40, label: '❓ IP ซ้ำ: ไม่รู้ว่าต้องส่งให้เครื่องไหน' }),
  hidden({ id: 'dLbl2', kind: 'label', x: 480, y: 95, label: '✅ ใน network เดียวกัน IP ต้องไม่ซ้ำกัน' }),
  hidden({ id: 'dSend', kind: 'pc', x: 140, y: 300, label: 'คอม 3' }),
  hidden({ id: 'dSw', kind: 'switch', x: 400, y: 300, label: 'Switch' }),
  hidden({ id: 'd1', kind: 'pc', x: 700, y: 190, label: 'คอม 1 · 192.168.1.10' }),
  hidden({ id: 'd2', kind: 'pc', x: 700, y: 400, label: 'คอม 2 · 192.168.1.10' }),
  hidden({ id: 'dc0', kind: 'cable', x: 140, y: 300, to: 'dSw' }),
  hidden({ id: 'dc1', kind: 'cable', x: 400, y: 300, to: 'd1' }),
  hidden({ id: 'dc2', kind: 'cable', x: 400, y: 300, to: 'd2' }),
  hidden({ id: 'dBox', kind: 'box', x: 140, y: 300, label: 'ไปเครื่องไหน?' }),

  // ฉาก 10: สรุป
  hidden({ id: 'sum1', kind: 'label', x: 480, y: 70, label: 'MAC address = เลขบัตรประชาชน ฝังในการ์ดแลน ติดเครื่องตลอด' }),
  hidden({ id: 'sum2', kind: 'label', x: 480, y: 160, label: 'IP address = บ้านเลขที่ ย้ายหมู่บ้านก็เปลี่ยน · IPv4 = เลข 4 ชุด' }),
  hidden({ id: 'sum3', kind: 'label', x: 480, y: 250, label: 'ข้ามหมู่บ้าน ใช้ IP · ยื่นของในหมู่บ้าน ใช้ MAC' }),
  hidden({ id: 'sum4', kind: 'label', x: 480, y: 340, label: 'ARP = ตะโกนถามในหมู่บ้าน ใครใช้ IP นี้ ขอ MAC หน่อย' }),
  hidden({ id: 'sum5', kind: 'label', x: 480, y: 430, label: 'ใน network เดียวกัน IP ห้ามซ้ำ' }),
]

// ห้องทดลอง (เวที 800x480): หมู่บ้านเดียว คอม 3 เครื่อง เสียบเข้า Switch ไว้แล้ว ไม่มี Router
const pc = (id: string, label: string, x: number, ip: string, mac: string): Device => ({
  id, kind: 'pc', label, x, y: 110, ifaces: [{ name: 'eth0', ip, prefix: 24, mac }],
})
const labDevices: Device[] = [
  pc('pc1', 'คอม 1', 150, '192.168.1.10', '02:00:00:bb:01:00'),
  pc('pc2', 'คอม 2', 400, '192.168.1.11', '02:00:00:bb:02:00'),
  pc('pc3', 'คอม 3', 650, '192.168.1.12', '02:00:00:bb:03:00'),
  {
    id: 'sw', kind: 'switch', label: 'Switch', x: 400, y: 330,
    ifaces: [{ name: 'p1', mac: '02:00:00:bb:04:01' }, { name: 'p2', mac: '02:00:00:bb:04:02' }, { name: 'p3', mac: '02:00:00:bb:04:03' }],
  },
]

export const lesson: Lesson = {
  id: 'p0-l4',
  part: 0,
  order: 4,
  status: 'ready',
  titleTh: 'ที่อยู่ 2 แบบ: MAC กับ IP',
  analogyTh: 'เลขบัตรประชาชน กับบ้านเลขที่',
  ciscoModules: ['ITN 7', 'ITN 9'],
  videos: [
    { youtubeId: 'u6W4u0R5P0w', titleTh: 'Basic Network ตอนที่ 2 : ทำความรู้จักกับ IP Address Version 4', channel: '9hua Training',
      noteTh: 'ตอนนี้จับแค่ว่า IPv4 เป็นเลข 4 ชุด คั่นด้วยจุด แต่ละชุด 0 ถึง 255 ถ้าคลิปเล่าเรื่อง Class ของ IP เลขฐานสอง หรือ Subnet ช่วงนั้นดูผ่าน ๆ ได้เลย ภาค 1 เล่าให้ฟังทีละขั้น' },
    { youtubeId: 'iAecBW8rflc', titleTh: 'ARP (Address Resolution Protocol)', channel: '9hua Training' },
  ],
  terms: ['mac-address', 'ip-address', 'ipv4', 'arp', 'nic', 'network', 'switch', 'router', 'gateway', 'packet'],

  scenes: {
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1',
        narrationTh: 'ลองนึกดูนะครับ เรามีเลขสองแบบ เลขบัตรประชาชน ติดตัวเราไปตลอด ย้ายไปไหนก็เลขเดิม ส่วนบ้านเลขที่ เป็นของบ้าน ย้ายบ้านเมื่อไหร่ ก็ได้บ้านเลขที่ใหม่',
        actions: [{ type: 'highlight', actor: 'man' }],
      },
      {
        id: 's2',
        narrationTh: 'เครื่องก็มีเลขสองแบบเหมือนกัน แบบแรก คือ MAC address เหมือนเลขบัตรประชาชน ของเครื่อง โรงงานฝังมากับการ์ดแลน หรือ NIC ตั้งแต่ผลิต เลขนี้ติดเครื่องไปตลอด',
        actions: [...hide(...lifeIds), ...show(...macIds)],
      },
      {
        id: 's3',
        narrationTh: 'แบบที่สอง คือ IP address เหมือนบ้านเลขที่ ของเครื่อง เป็นเลขสี่ชุด คั่นด้วยจุด แต่ละชุด เป็นเลขศูนย์ ถึงสองร้อยห้าสิบห้า แบบนี้เรียกว่า IPv4 ในหมู่บ้านเดียวกัน ห้ามซ้ำ',
        actions: [...hide(...macIds), ...show(...ipIds)],
      },
      {
        id: 's4',
        narrationTh: 'ลองหิ้วโน้ตบุ๊ก จากบ้าน ไปต่อไวไฟร้านกาแฟ ก็เหมือนย้ายไปอีกหมู่บ้าน เลยได้ IP ใหม่ ของหมู่บ้านนั้น แต่ MAC ยังเป็นเลขเดิม เพราะฝังอยู่ในการ์ดแลน',
        actions: [
          ...hide(...ipIds),
          ...show(...moveIds),
          { type: 'move', actor: 'lap', x: 740, y: 220, ms: 2500 },
          { type: 'setLabel', actor: 'lap', label: 'IP 10.0.0.25' },
        ],
      },
      {
        id: 's5',
        narrationTh: 'ทำไมต้องมีสองแบบ เพราะ IP บอกได้ ว่าเครื่องอยู่หมู่บ้านไหน Router ไปรษณีย์กลาง เลยดู IP ผู้รับ แล้วส่งกล่องไปถูกหมู่บ้าน ส่วน MAC บอกไม่ได้เลย ว่าเครื่องอยู่ที่ไหน',
        actions: [
          ...hide(...moveIds),
          ...show(...routeIds),
          { type: 'highlight', actor: 'rR' },
          { type: 'moveAlong', actor: 'rBox', path: ['rPc', 'rSwA', 'rR', 'rSwB', 'rDst'], msPerHop: 1100 },
        ],
      },
      {
        id: 's6',
        narrationTh: 'พอกล่องถึงหมู่บ้านแล้ว ขั้นสุดท้าย ต้องยื่นให้ถูกเครื่อง ในหมู่บ้าน เลยใช้ MAC Switch ดู MAC บนกล่อง แล้วส่งไปช่อง ที่เครื่องนั้นเสียบอยู่',
        actions: [
          ...hide(...routeIds),
          ...show(...lastIds),
          { type: 'highlight', actor: 'tc3' },
          { type: 'moveAlong', actor: 'tBox', path: ['tR', 'tSw', 't3'], msPerHop: 1500 },
        ],
      },
      {
        id: 's7',
        narrationTh: 'แล้วคอมรู้ MAC ของเพื่อนได้ไง ก็ตะโกนถามทั้งหมู่บ้าน ว่าใครใช้ IP นี้ ขอ MAC หน่อย ทุกเครื่องได้ยิน แต่ตอบแค่เจ้าของ IP นั้น วิธีนี้ เรียกว่า ARP',
        actions: [
          ...hide(...lastIds),
          ...show(...arpIds),
          { type: 'moveAlong', actor: 'aQ1', path: ['aAsk', 'aSw', 'a1'], msPerHop: 1200 },
          { type: 'moveAlong', actor: 'aQ2', path: ['aAsk', 'aSw', 'a2'], msPerHop: 1200 },
          { type: 'moveAlong', actor: 'aQ3', path: ['aAsk', 'aSw', 'a3'], msPerHop: 1200 },
          // คำตอบรอให้คำถามไปถึงก่อน แล้วค่อยวิ่งกลับมาที่คอมเรา
          { type: 'moveAlong', actor: 'aAns', path: ['a3', 'a3', 'a3', 'aSw', 'aAsk'], msPerHop: 1200 },
          { type: 'highlight', actor: 'a3' },
        ],
      },
      {
        id: 's8',
        narrationTh: 'ถ้าปลายทางอยู่นอกหมู่บ้าน คอมจะถามหา MAC ของ Gateway แทน แล้วยื่นกล่องให้ประตูออกหมู่บ้าน ส่วน IP ผู้รับบนกล่อง ยังเป็นเครื่องปลายทาง ไม่เปลี่ยน',
        actions: [
          ...hide(...arpIds),
          ...show(...gwIds),
          { type: 'highlight', actor: 'gR' },
          { type: 'moveAlong', actor: 'gAsk', path: ['gPc', 'gSw', 'gR', 'gSw', 'gPc'], msPerHop: 900 },
          { type: 'moveAlong', actor: 'gBox', path: ['gPc', 'gPc', 'gPc', 'gPc', 'gPc', 'gSw', 'gR', 'gNet'], msPerHop: 900 },
        ],
      },
      {
        id: 's9',
        narrationTh: 'แล้วถ้าสองเครื่อง ใช้ IP เดียวกันล่ะ เหมือนสองบ้าน มีเลขที่เดียวกัน ไปรษณีย์ไม่รู้ว่าต้องส่งหลังไหน ของก็ส่งไม่ถึง หรือไปผิดเครื่อง เดี๋ยวลองทำในห้องทดลองกัน',
        actions: [
          ...hide(...gwIds),
          ...show(...dupIds),
          { type: 'highlight', actor: 'd1' },
          { type: 'highlight', actor: 'd2' },
          { type: 'moveAlong', actor: 'dBox', path: ['dSend', 'dSw'], msPerHop: 1500 },
        ],
      },
      {
        id: 's10',
        narrationTh: 'สรุปนะครับ MAC คือเลขบัตรประชาชน ติดเครื่องตลอด IP คือบ้านเลขที่ ย้ายหมู่บ้านก็เปลี่ยน ส่งข้ามหมู่บ้านใช้ IP ยื่นของในหมู่บ้านใช้ MAC และหา MAC ด้วย ARP',
        actions: [
          ...hide(...dupIds),
          ...show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
        ],
      },
    ],
  },

  lab: {
    kind: 'network',
    introTh: 'ห้องทดลองนี้มีหมู่บ้านเดียว คอม 1 คอม 2 คอม 3 เสียบสายเข้า Switch ไว้แล้ว ไม่ต้องต่อสายเพิ่ม ตอนนี้ คอม 1 ใช้ IP 192.168.1.10 คอม 2 ใช้ 192.168.1.11 คอม 3 ใช้ 192.168.1.12\n'
      + 'บทนี้เราจะพิมพ์ IP เอง วิธีทำ กดที่รูปคอม ช่องตั้งค่าจะโผล่ทางขวา ลบเลขเดิมในช่อง IP แล้วพิมพ์เลขใหม่ แล้วกด บันทึก (eth0 คือชื่อช่องเสียบสายของคอม)\n'
      + 'ช่อง ขนาดวง ปล่อยไว้เหมือนเดิม เรื่องนี้ภาค 1 เล่า ถ้าผลการส่งพูดถึง "วง" ให้นึกว่าคือหมู่บ้าน มี 2 เป้าหมาย ทำทีละข้อนะ',
    start: {
      devices: labDevices,
      links: [
        { a: { device: 'pc1', iface: 'eth0' }, b: { device: 'sw', iface: 'p1' } },
        { a: { device: 'pc2', iface: 'eth0' }, b: { device: 'sw', iface: 'p2' } },
        { a: { device: 'pc3', iface: 'eth0' }, b: { device: 'sw', iface: 'p3' } },
      ],
    },
    palette: [],
    goals: [
      {
        type: 'fail',
        from: 'pc3',
        toIp: '192.168.1.10',
        reasonIncludes: 'IP ซ้ำ! มี 2 เครื่องใช้ 192.168.1.10 พร้อมกัน',
        taskTh: 'ตั้ง IP ของคอม 2 ให้ซ้ำกับคอม 1 คือ 192.168.1.10 แล้วกด ส่งข้อมูล จากคอม 3 ไปคอม 1 ดูว่าเกิดอะไรขึ้น',
        hintTh: 'กดที่รูปคอม 2 ช่องตั้งค่าจะโผล่ทางขวา ลบเลขเดิมในช่อง IP แล้วพิมพ์ 192.168.1.10 กด บันทึก\nจากนั้นกด ส่งข้อมูล ตอนนี้มีสองเครื่อง อ้างบ้านเลขที่เดียวกัน ไปรษณีย์เลยไม่รู้ว่าต้องยื่นให้เครื่องไหน',
      },
      {
        type: 'fix',
        from: 'pc2',
        toIp: '192.168.1.10',
        taskTh: 'แก้ IP ของคอม 2 ให้ไม่ซ้ำกับใคร แต่ยังอยู่หมู่บ้านเดิม แล้วส่งจากคอม 2 ไปคอม 1 ให้ถึง',
        hintTh: 'ในตัวอย่างนี้ เครื่องในหมู่บ้านเดียวกัน ใช้เลขสามชุดแรกเหมือนกัน คือ 192.168.1 กฎจริงว่าดูกี่ชุด เรียนในภาค 1 เรื่อง Subnet\n'
          + 'เลยเปลี่ยนแค่ชุดสุดท้าย ให้ไม่ซ้ำ เช่น 192.168.1.20 ห้ามใช้ .10 กับ .12 เพราะคอม 1 กับคอม 3 ใช้อยู่\n'
          + 'ถ้าเปลี่ยนชุดแรก ๆ ด้วย คอม 2 จะหลุดไปอยู่หมู่บ้านอื่น แล้วส่งหาคอม 1 ไม่ถึง',
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'ทำไมเครื่องต้องมีทั้ง MAC address และ IP address มีแบบเดียวไม่พอเหรอ',
      choices: [
        { id: 'a', text: 'IP บอกว่าเครื่องอยู่หมู่บ้านไหน ใช้ส่งข้ามหมู่บ้าน ส่วน MAC ใช้ยื่นของให้ถูกเครื่อง ในหมู่บ้าน' },
        { id: 'b', text: 'มีไว้สำรองกัน ถ้าเลขหนึ่งเสีย ก็ใช้อีกเลขแทน' },
        { id: 'c', text: 'MAC ใช้ส่งข้ามหมู่บ้าน ส่วน IP ใช้แค่ในหมู่บ้าน' },
        { id: 'd', text: 'ไม่จำเป็น ใช้ MAC อย่างเดียว ก็ส่งได้ทั่วโลก' },
      ],
      correct: ['a'],
      explainTh: 'นึกถึงพัสดุข้ามจังหวัด ไปรษณีย์กลางต้องรู้ก่อน ว่าจะส่งไปหมู่บ้านไหน เลขบัตรประชาชนบอกไม่ได้ว่าคนอยู่ที่ไหน แต่บ้านเลขที่บอกได้ พอของถึงหมู่บ้านแล้ว ค่อยดูว่าใครคือตัวจริง สองเลขเลยทำงานคนละช่วง ไม่ได้มีไว้แทนกัน',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'ถ้าคอมสองเครื่อง ใน network เดียวกัน ตั้ง IP เป็นเลขเดียวกัน จะเกิดอะไรขึ้น',
      choices: [
        { id: 'a', text: 'ส่งของไปที่เลขนั้นแล้วมีปัญหา เพราะไม่รู้ว่าต้องส่งให้เครื่องไหน ของอาจไม่ถึง หรือไปผิดเครื่อง' },
        { id: 'b', text: 'ไม่มีปัญหา เพราะ MAC ไม่ซ้ำกัน เดี๋ยวก็แยกกันได้เอง' },
        { id: 'c', text: 'สองเครื่องจะช่วยกันรับของ คนละครึ่ง ส่งเร็วขึ้น' },
        { id: 'd', text: 'Switch จะเปลี่ยน IP ให้เครื่องหนึ่งเอง' },
      ],
      correct: ['a'],
      explainTh: 'บ้านเลขที่มีไว้ให้หาบ้านเจอ ถ้าสองบ้านใช้เลขเดียวกัน คนส่งของก็ไม่รู้จะไปหลังไหน คอมหาเครื่องจาก IP ก่อน แล้วค่อยตะโกนถามหา MAC ด้วย ARP พอมีสองเครื่องตอบ ก็ไม่รู้ว่าเครื่องไหนคือตัวจริง ต้องแก้ให้ IP ไม่ซ้ำ เหมือนที่ทำในห้องทดลอง',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'หิ้วโน้ตบุ๊กจากบ้าน ไปต่อไวไฟที่ร้านกาแฟ (ไป network อื่น) เลขไหนเปลี่ยน',
      choices: [
        { id: 'a', text: 'IP เปลี่ยน เพราะย้ายไปอยู่หมู่บ้านใหม่ แต่ MAC เป็นเลขเดิม' },
        { id: 'b', text: 'MAC เปลี่ยน แต่ IP เป็นเลขเดิม' },
        { id: 'c', text: 'เปลี่ยนทั้งสองเลข' },
        { id: 'd', text: 'ไม่เปลี่ยนเลยสักเลข' },
      ],
      correct: ['a'],
      explainTh: 'นึกถึงตอนเราย้ายบ้าน บ้านเลขที่ต้องเปลี่ยนตามที่อยู่ใหม่ ไม่งั้นไปรษณีย์หาไม่เจอ แต่เลขบัตรประชาชนติดตัวเรา ย้ายไปไหนก็เลขเดิม การ์ดแลนก็อยู่ในโน้ตบุ๊ก ย้ายไปด้วยกันทั้งเครื่อง',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'คอม 1 รู้ IP ของคอม 2 ที่อยู่หมู่บ้านเดียวกันแล้ว แต่ยังไม่รู้ MAC คอม 1 จะทำยังไง',
      choices: [
        { id: 'a', text: 'ใช้ ARP ตะโกนถามทั้งหมู่บ้าน ว่าใครใช้ IP นี้ แล้วเจ้าของ IP ตอบ MAC กลับมา' },
        { id: 'b', text: 'ถาม DNS ให้บอก MAC ของคอม 2' },
        { id: 'c', text: 'ส่งกล่องไปที่ Gateway ให้ Router หา MAC ให้' },
        { id: 'd', text: 'เดา MAC เอาเอง แล้วลองส่งไปเรื่อย ๆ' },
      ],
      correct: ['a'],
      explainTh: 'คอมรู้บ้านเลขที่แล้ว แต่ยังไม่รู้ว่าใครคือตัวจริง ปลายทางอยู่หมู่บ้านเดียวกัน ไม่ต้องออกประตูหมู่บ้าน ก็ถามกันเองได้ ทุกเครื่องได้ยินคำถาม แต่เจ้าของเลขที่นั้นตอบคนเดียว ส่วน DNS เป็นสมุดที่เปลี่ยนชื่อเว็บเป็น IP ไม่ได้มีเลข MAC',
    },
    {
      id: 'q5',
      layer: 'en',
      prompt: 'Which protocol is used to discover the MAC address of a host when its IPv4 address is known?',
      promptTh: 'โปรโตคอล (วิธีคุยกัน) ไหน ใช้หา MAC address ของเครื่อง เมื่อรู้ IPv4 address ของเครื่องนั้นแล้ว',
      keywords: ['MAC address', 'IPv4 address', 'known'],
      choices: [
        { id: 'a', text: 'ARP', textTh: 'ARP (ตะโกนถามในหมู่บ้าน ว่าใครใช้ IP นี้)' },
        { id: 'b', text: 'DNS', textTh: 'DNS (สมุดโทรศัพท์ เปลี่ยนชื่อเว็บเป็น IP)' },
        { id: 'c', text: 'DHCP', textTh: 'DHCP (แจก IP ให้เครื่องอัตโนมัติ เรียนในภาค 4)' },
        { id: 'd', text: 'ICMP', textTh: 'ICMP (ใช้ตอน ping เช็กว่าส่งถึงไหม เรียนทีหลัง)' },
      ],
      correct: ['a'],
      explainTh: 'โจทย์บอกว่ารู้ IP แล้ว แต่อยากได้ MAC คือรู้บ้านเลขที่ แต่อยากรู้เลขบัตรประชาชนของคนในบ้าน วิธีที่ตะโกนถามในหมู่บ้านแล้วได้ MAC กลับมา มีอยู่วิธีเดียวในตัวเลือก',
    },
    {
      id: 'q6',
      layer: 'en',
      prompt: 'Which address is permanently assigned to a NIC by the manufacturer?',
      promptTh: 'ที่อยู่แบบไหน ที่โรงงานผู้ผลิตฝังไว้ในการ์ดแลน (NIC) ตั้งแต่แรก',
      keywords: ['permanently', 'NIC', 'manufacturer'],
      choices: [
        { id: 'a', text: 'MAC address', textTh: 'MAC address (เลขบัตรประชาชนของเครื่อง)' },
        { id: 'b', text: 'IPv4 address', textTh: 'IPv4 address (บ้านเลขที่ของเครื่อง)' },
        { id: 'c', text: 'Default gateway address', textTh: 'ที่อยู่ของ default gateway (ประตูออกหมู่บ้าน)' },
        { id: 'd', text: 'DNS server address', textTh: 'ที่อยู่ของเครื่อง DNS server' },
      ],
      correct: ['a'],
      explainTh: 'คำว่า permanently แปลว่าถาวร และ manufacturer คือโรงงานผู้ผลิต ให้หาเลขที่ติดมากับการ์ดแลนตั้งแต่ผลิต ย้ายไปไหนก็ไม่เปลี่ยน เหมือนเลขบัตรประชาชน ส่วนเลขที่เปลี่ยนตาม network ที่ไปต่อ เป็นเลขที่ตั้งทีหลัง',
    },
    {
      id: 'q7',
      layer: 'en',
      prompt: 'PC1 sends a packet to a server on a remote network. Which destination MAC address does PC1 use?',
      promptTh: 'คอม 1 ส่ง packet ไปเครื่องเซิร์ฟเวอร์ ที่อยู่ network อื่น (นอกหมู่บ้าน) คอม 1 ใช้ MAC ผู้รับเป็นของใคร',
      keywords: ['remote network', 'destination MAC address'],
      choices: [
        { id: 'a', text: 'The MAC address of the default gateway', textTh: 'MAC ของ default gateway (ประตูออกหมู่บ้าน)' },
        { id: 'b', text: 'The MAC address of the server', textTh: 'MAC ของเครื่องเซิร์ฟเวอร์ปลายทาง' },
        { id: 'c', text: 'The MAC address of the switch', textTh: 'MAC ของ Switch' },
        { id: 'd', text: 'The MAC address of the DNS server', textTh: 'MAC ของเครื่อง DNS server' },
      ],
      correct: ['a'],
      explainTh: 'MAC ใช้ยื่นของให้คนในหมู่บ้านเดียวกันเท่านั้น ปลายทางอยู่นอกหมู่บ้าน คอม 1 จึงยื่นกล่องให้คนที่จะพาออกนอกหมู่บ้าน แล้วใช้ MAC ของคนนั้น ส่วน IP ผู้รับบนกล่อง ยังเป็นเครื่องปลายทางเหมือนเดิม',
    },
  ],
}
