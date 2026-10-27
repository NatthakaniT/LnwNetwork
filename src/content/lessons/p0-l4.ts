import type { Actor, Device, Lesson, SceneAction } from '../types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const dim = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'dim', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })

// ซองจอดข้างอุปกรณ์: เหนือเครื่องฝั่งซ้าย / ทางซ้ายของเครื่องที่เรียงแนวตั้งฝั่งขวา
const ABOVE = { dx: 0, dy: -95 }
const LEFT = { dx: -180, dy: 0 }

const arpBase = ['me', 'sw', 'pc1', 'pc2', 'pc3', 'ac0', 'ac1', 'ac2', 'ac3', 'nb']
const arpRows: [string, string][] = [['192.168.1.30', 'AA:BB:CC:00:00:03']]
const gwBase = ['gPc', 'gSw', 'gR', 'gNet', 'gc1', 'gc2', 'gc3']
const dupBase = ['dSend', 'dSw', 'd1', 'd2', 'dc0', 'dc1', 'dc2']
const askLines = (ip: string) => ['ถึง: ทุกเครื่อง', `ใครคือ ${ip} ?`]

const actors: Actor[] = [
  // ฉาก 1: คนหนึ่งคน มีเลขสองแบบ
  h({ id: 'man', kind: 'person', x: 260, y: 190, label: 'ตัวเรา' }),
  h({ id: 'home', kind: 'house', x: 700, y: 190, label: 'บ้านเรา' }),
  h({ id: 'lifeLbl1', kind: 'label', x: 480, y: 400, label: '🪪 เลขบัตรประชาชน = ติดตัวเรา ย้ายไปไหนก็เลขเดิม' }),
  h({ id: 'lifeLbl2', kind: 'label', x: 480, y: 465, label: '🏠 บ้านเลขที่ = ติดบ้าน ย้ายบ้านก็ได้เลขใหม่' }),

  // ฉาก 2: MAC address = เลขบัตรประชาชนของเครื่อง
  h({ id: 'mPc', kind: 'pc', x: 480, y: 170, label: 'คอม' }),
  h({ id: 'mLbl1', kind: 'label', x: 480, y: 370, label: '🪪 MAC address = เลขบัตรประชาชนของเครื่อง' }),
  h({ id: 'mLbl2', kind: 'label', x: 480, y: 430, label: 'โรงงานฝังมากับการ์ดแลน (NIC) ติดเครื่องตลอด' }),
  h({ id: 'mLbl3', kind: 'label', x: 480, y: 490, label: 'เช่น AA:BB:CC:11:22:33 · มีเลข 0-9 กับตัว A-F รวม 12 ตัว' }),

  // ฉาก 3: IP address = บ้านเลขที่ / IPv4
  h({ id: 'iPc', kind: 'pc', x: 480, y: 170, label: 'คอม' }),
  h({ id: 'iLbl1', kind: 'label', x: 480, y: 370, label: '🏠 IP address = บ้านเลขที่ของเครื่อง' }),
  h({ id: 'iLbl2', kind: 'label', x: 480, y: 430, label: 'IPv4 เช่น 192.168.1.10 = เลข 4 ชุด คั่นด้วยจุด' }),
  h({ id: 'iLbl3', kind: 'label', x: 480, y: 490, label: 'แต่ละชุด เป็นเลข 0 ถึง 255 · หมู่บ้านเดียวกัน ห้ามซ้ำ' }),

  // ฉาก 4: หิ้วโน้ตบุ๊กไปร้านกาแฟ = ย้ายหมู่บ้าน
  h({ id: 'vHome', kind: 'label', x: 220, y: 60, label: '🏠 หมู่บ้าน: เน็ตบ้าน' }),
  h({ id: 'vCafe', kind: 'label', x: 740, y: 60, label: '☕ หมู่บ้าน: ไวไฟร้านกาแฟ' }),
  h({ id: 'lap', kind: 'laptop', x: 220, y: 220, label: 'IP 192.168.1.10' }),
  h({ id: 'vLbl1', kind: 'label', x: 480, y: 420, label: '🔄 ย้ายหมู่บ้าน ได้ IP ใหม่: 192.168.1.10 → 10.0.0.25' }),
  h({ id: 'vLbl2', kind: 'label', x: 480, y: 480, label: '✅ MAC AA:BB:CC:11:22:33 เลขเดิม (ฝังในการ์ดแลน)' }),

  // ฉาก 5: ข้ามหมู่บ้าน Router ดู IP
  h({ id: 'rVA', kind: 'label', x: 260, y: 50, label: 'หมู่บ้านเอ' }),
  h({ id: 'rVB', kind: 'label', x: 680, y: 50, label: 'หมู่บ้านบี' }),
  h({ id: 'rPc', kind: 'pc', x: 110, y: 170, label: 'คอมเรา' }),
  h({ id: 'rSwA', kind: 'switch', x: 230, y: 320, label: 'Switch' }),
  h({ id: 'rR', kind: 'router', x: 480, y: 320, label: 'Router' }),
  h({ id: 'rSwB', kind: 'switch', x: 730, y: 320, label: 'Switch' }),
  h({ id: 'rDst', kind: 'pc', x: 850, y: 170, label: 'ปลายทาง' }),
  h({ id: 'rc1', kind: 'cable', x: 110, y: 170, to: 'rSwA' }),
  h({ id: 'rc2', kind: 'cable', x: 230, y: 320, to: 'rR' }),
  h({ id: 'rc3', kind: 'cable', x: 480, y: 320, to: 'rSwB' }),
  h({ id: 'rc4', kind: 'cable', x: 730, y: 320, to: 'rDst' }),
  h({ id: 'rBox', kind: 'card', x: 110, y: 85, lines: ['IP ผู้รับ: ปลายทาง'], tone: 'deliver' }),
  h({ id: 'rLbl1', kind: 'label', x: 480, y: 450, label: '🏠 ข้ามหมู่บ้าน: Router ดู IP ผู้รับ แล้วเลือกทาง' }),
  h({ id: 'rLbl2', kind: 'label', x: 480, y: 505, label: 'ส่วนหนึ่งของ IP บอกหมู่บ้าน · ส่วนไหน เดี๋ยวภาค 1 เล่า' }),

  // ฉาก 6: ในหมู่บ้าน ยื่นของด้วย MAC
  h({ id: 'tR', kind: 'router', x: 480, y: 80, label: 'Router' }),
  h({ id: 'tSw', kind: 'switch', x: 480, y: 230, label: 'Switch' }),
  h({ id: 't1', kind: 'pc', x: 200, y: 380, label: 'MAC ...:01' }),
  h({ id: 't2', kind: 'pc', x: 480, y: 380, label: 'MAC ...:02' }),
  h({ id: 't3', kind: 'pc', x: 760, y: 380, label: 'MAC ...:03' }),
  h({ id: 'tc0', kind: 'cable', x: 480, y: 80, to: 'tSw' }),
  h({ id: 'tc1', kind: 'cable', x: 480, y: 230, to: 't1' }),
  h({ id: 'tc2', kind: 'cable', x: 480, y: 230, to: 't2' }),
  h({ id: 'tc3', kind: 'cable', x: 480, y: 230, to: 't3' }),
  h({ id: 'tBox', kind: 'card', x: 650, y: 80, lines: ['ถึง MAC ...:03'], tone: 'deliver' }),
  h({ id: 'tLbl', kind: 'label', x: 480, y: 505, label: '🪪 ในหมู่บ้าน: ยื่นของด้วย MAC ให้ถูกเครื่อง' }),

  // ฉาก ARP (6 ขั้น): คอมเรา Switch คอม 3 เครื่องเรียงแนวตั้ง และสมุดจดของคอมเรา
  h({ id: 'me', kind: 'pc', x: 130, y: 250, label: 'คอมเรา\n192.168.1.10' }),
  h({ id: 'sw', kind: 'switch', x: 360, y: 250, label: 'Switch' }),
  h({ id: 'pc1', kind: 'pc', x: 740, y: 110, label: 'คอม 1\n192.168.1.20', labelSide: 'right' }),
  h({ id: 'pc2', kind: 'pc', x: 740, y: 270, label: 'คอม 2\n192.168.1.25', labelSide: 'right' }),
  h({ id: 'pc3', kind: 'pc', x: 740, y: 430, label: 'คอม 3\n192.168.1.30', labelSide: 'right' }),
  h({ id: 'ac0', kind: 'cable', x: 130, y: 250, to: 'sw' }),
  h({ id: 'ac1', kind: 'cable', x: 360, y: 250, to: 'pc1' }),
  h({ id: 'ac2', kind: 'cable', x: 360, y: 250, to: 'pc2' }),
  h({ id: 'ac3', kind: 'cable', x: 360, y: 250, to: 'pc3' }),
  h({ id: 'nb', kind: 'table', x: 215, y: 443, titleTh: '📒 สมุดจดของคอมเรา', columns: ['IP', 'MAC'], rows: [] }),
  h({ id: 'q0', kind: 'card', x: 130, y: 155, lines: askLines('192.168.1.30'), tone: 'bcast' }),
  h({ id: 'q1', kind: 'card', x: 360, y: 155, lines: askLines('192.168.1.30'), tone: 'bcast' }),
  h({ id: 'q2', kind: 'card', x: 360, y: 155, lines: askLines('192.168.1.30'), tone: 'bcast' }),
  h({ id: 'q3', kind: 'card', x: 360, y: 155, lines: askLines('192.168.1.30'), tone: 'bcast' }),
  h({ id: 'ans', kind: 'card', x: 570, y: 430, lines: ['ถึง: คอมเรา', 'ฉันคือ 192.168.1.30', 'MAC ฉัน: …:00:03'], tone: 'reply' }),
  h({ id: 'pkt', kind: 'card', x: 130, y: 155, lines: ['📦 ถึง MAC …:00:03', 'IP ผู้รับ: 192.168.1.30'], tone: 'deliver' }),

  // ฉาก Gateway: ปลายทางอยู่นอกหมู่บ้าน
  h({ id: 'gLbl1', kind: 'label', x: 480, y: 40, label: '🚪 ปลายทางอยู่นอกหมู่บ้าน: ถามหา MAC ของ Gateway' }),
  h({ id: 'gLbl2', kind: 'label', x: 480, y: 95, label: '📦 IP ผู้รับบนกล่อง = เครื่องปลายทาง (ไม่เปลี่ยน)' }),
  h({ id: 'gPc', kind: 'pc', x: 130, y: 280, label: 'คอมเรา' }),
  h({ id: 'gSw', kind: 'switch', x: 360, y: 280, label: 'Switch' }),
  h({ id: 'gR', kind: 'router', x: 600, y: 280, label: 'Gateway (Router)' }),
  h({ id: 'gNet', kind: 'cloud', x: 840, y: 280, label: 'นอกหมู่บ้าน' }),
  h({ id: 'gc1', kind: 'cable', x: 130, y: 280, to: 'gSw' }),
  h({ id: 'gc2', kind: 'cable', x: 360, y: 280, to: 'gR' }),
  h({ id: 'gc3', kind: 'cable', x: 600, y: 280, to: 'gNet' }),
  h({ id: 'gAsk', kind: 'card', x: 130, y: 185, lines: ['ถึง: ทุกเครื่อง', 'ใครคือ Gateway ?'], tone: 'bcast' }),
  h({ id: 'gAns', kind: 'card', x: 600, y: 170, lines: ['ถึง: คอมเรา', 'ฉันคือ Gateway', 'MAC ฉัน: …:00:01'], tone: 'reply' }),
  h({ id: 'gBox', kind: 'card', x: 130, y: 185, lines: ['📦 ถึง MAC ของ Gateway', 'IP ผู้รับ: ปลายทาง'], tone: 'deliver' }),

  // ฉาก IP ซ้ำ: ถามก่อน แล้วได้คำตอบสองเครื่อง
  h({ id: 'dLbl1', kind: 'label', x: 480, y: 36, label: '❓ IP ซ้ำ: สองเครื่องตอบ ARP · คอมไม่รู้จะส่งให้ใคร' }),
  h({ id: 'dLbl2', kind: 'label', x: 480, y: 86, label: '✅ ใน network เดียวกัน IP ต้องไม่ซ้ำกัน' }),
  h({ id: 'dSend', kind: 'pc', x: 130, y: 315, label: 'คอม 3' }),
  h({ id: 'dSw', kind: 'switch', x: 360, y: 315, label: 'Switch' }),
  h({ id: 'd1', kind: 'pc', x: 740, y: 220, label: 'คอม 1\n192.168.1.10', labelSide: 'right' }),
  h({ id: 'd2', kind: 'pc', x: 740, y: 420, label: 'คอม 2\n192.168.1.10', labelSide: 'right' }),
  h({ id: 'dc0', kind: 'cable', x: 130, y: 315, to: 'dSw' }),
  h({ id: 'dc1', kind: 'cable', x: 360, y: 315, to: 'd1' }),
  h({ id: 'dc2', kind: 'cable', x: 360, y: 315, to: 'd2' }),
  h({ id: 'dQ0', kind: 'card', x: 130, y: 220, lines: askLines('192.168.1.10'), tone: 'bcast' }),
  h({ id: 'dQ1', kind: 'card', x: 360, y: 220, lines: askLines('192.168.1.10'), tone: 'bcast' }),
  h({ id: 'dQ2', kind: 'card', x: 360, y: 220, lines: askLines('192.168.1.10'), tone: 'bcast' }),
  h({ id: 'dA1', kind: 'card', x: 570, y: 210, lines: ['ถึง: คอม 3', 'ฉันคือ 192.168.1.10', 'MAC ฉัน: …:00:01'], tone: 'reply' }),
  h({ id: 'dA2', kind: 'card', x: 570, y: 420, lines: ['ถึง: คอม 3', 'ฉันคือ 192.168.1.10', 'MAC ฉัน: …:00:02'], tone: 'reply' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 70, label: 'MAC address = เลขบัตรประชาชน ฝังในการ์ดแลน ติดเครื่องตลอด' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 160, label: 'IP address = บ้านเลขที่ ย้ายหมู่บ้านก็เปลี่ยน · IPv4 = เลข 4 ชุด' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 250, label: 'ข้ามหมู่บ้าน ใช้ IP · ยื่นของในหมู่บ้าน ใช้ MAC' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 340, label: 'ARP = ตะโกนถามในหมู่บ้าน ใครใช้ IP นี้ ขอ MAC หน่อย' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 430, label: 'ใน network เดียวกัน IP ห้ามซ้ำ' }),
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
  ciscoModules: ['ITN 7', 'ITN 9', 'ITN 11'],
  videos: [
    { youtubeId: 'u6W4u0R5P0w', titleTh: 'Basic Network ตอนที่ 2 : ทำความรู้จักกับ IP Address Version 4', channel: '9hua Training',
      noteTh: 'ตอนนี้จับแค่ว่า IPv4 เป็นเลข 4 ชุด คั่นด้วยจุด แต่ละชุด 0 ถึง 255 ช่วงที่คลิปพูดเรื่องเลข 0 กับ 1 (เลขฐานสอง) เรื่อง Class A B C หรือ Subnet ดูผ่าน ๆ ได้เลย ภาค 1 เล่าให้ฟังทีละขั้น' },
    { youtubeId: 'iAecBW8rflc', titleTh: 'ARP (Address Resolution Protocol)', channel: '9hua Training',
      noteTh: 'ถ้าคลิปพูดเรื่องการแบ่งเป็นชั้น หรือเปิดโปรแกรมดูข้อมูล ดูผ่าน ๆ ได้ บทหน้าเล่าเรื่องชั้น จับแค่ว่า ARP = ตะโกนถามหา MAC ในหมู่บ้าน' },
  ],
  terms: ['mac-address', 'ip-address', 'ipv4', 'arp', 'nic', 'network', 'switch', 'router', 'gateway', 'packet'],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'เลขสองแบบ', lifeIcon: '🪪',
        lifeTh: 'คนหนึ่งคนมีเลขสองแบบ เลขบัตรประชาชนติดตัวเรา ส่วนบ้านเลขที่ติดอยู่กับบ้าน',
        narrationTh: 'ทำไมเครื่องต้องมีที่อยู่ถึงสองแบบ มีแบบเดียวไม่พอเหรอ ลองนึกถึงตัวเราก่อนนะครับ เลขบัตรประชาชน ติดตัวเราไปตลอด ส่วนบ้านเลขที่ เป็นของบ้าน ย้ายบ้านเมื่อไหร่ ก็ได้เลขใหม่',
        setup: show('man', 'home'),
        actions: [glow('man'), ...show('lifeLbl1', 'lifeLbl2')],
      },
      {
        id: 's2', chipTh: 'MAC', lifeIcon: '🪪',
        lifeTh: 'เลขบัตรประชาชนได้มาตั้งแต่เกิด ย้ายไปอยู่ที่ไหนก็ยังเป็นเลขเดิม',
        narrationTh: 'เครื่องก็มีเลขสองแบบเหมือนกัน แบบแรก คือ MAC address เหมือนเลขบัตรประชาชน ของเครื่อง โรงงานฝังมากับการ์ดแลน หรือ NIC ตั้งแต่ผลิต เลขนี้ติดเครื่องไปตลอด',
        setup: show('mPc'),
        actions: show('mLbl1', 'mLbl2', 'mLbl3'),
      },
      {
        id: 's3', chipTh: 'IP', lifeIcon: '🏠',
        lifeTh: 'บ้านเลขที่บอกว่าบ้านอยู่ตรงไหน ในหมู่บ้านเดียวกันจะมีสองบ้านเลขซ้ำกันไม่ได้',
        narrationTh: 'แบบที่สอง คือ IP address เหมือนบ้านเลขที่ เป็นเลขสี่ชุด คั่นด้วยจุด แต่ละชุด ศูนย์ ถึงสองร้อยห้าสิบห้า เรียกว่า IPv4 และในหมู่บ้านเดียวกัน เลขนี้ห้ามซ้ำกันนะ',
        setup: show('iPc'),
        actions: show('iLbl1', 'iLbl2', 'iLbl3'),
      },
      {
        id: 's4', chipTh: 'ย้ายบ้าน', lifeIcon: '☕',
        lifeTh: 'ย้ายไปอยู่หมู่บ้านใหม่ ก็ได้บ้านเลขที่ใหม่ แต่เลขบัตรประชาชนยังเป็นเลขเดิม',
        narrationTh: 'ลองหิ้วโน้ตบุ๊ก จากบ้าน ไปต่อไวไฟร้านกาแฟ ก็เหมือนย้ายไปอีกหมู่บ้าน เลยได้ IP ใหม่ ของหมู่บ้านนั้น แต่ MAC ยังเป็นเลขเดิม เพราะฝังอยู่ในการ์ดแลน',
        setup: show('vHome', 'vCafe', 'lap'),
        actions: [
          { type: 'move', actor: 'lap', x: 740, y: 220, ms: 2500 },
          { type: 'setLabel', actor: 'lap', label: 'IP 10.0.0.25' },
          ...show('vLbl1', 'vLbl2'),
        ],
      },
      {
        id: 's5', chipTh: 'ข้ามหมู่บ้าน', lifeIcon: '📮',
        lifeTh: 'ไปรษณีย์กลางดูที่อยู่บนกล่อง แล้วส่งไปถูกหมู่บ้าน ไม่ต้องรู้จักหน้าคนรับ',
        narrationTh: 'ทำไมต้องมีสองแบบ เพราะ IP บอกได้ ว่าเครื่องอยู่หมู่บ้านไหน Router หรือไปรษณีย์กลาง เลยดู IP ผู้รับ แล้วส่งกล่องไปถูกหมู่บ้าน ส่วน MAC บอกไม่ได้ ว่าเครื่องอยู่ที่ไหน',
        setup: show('rVA', 'rVB', 'rPc', 'rSwA', 'rR', 'rSwB', 'rDst', 'rc1', 'rc2', 'rc3', 'rc4'),
        actions: [
          glow('rR'),
          { type: 'trail', path: ['rPc', 'rSwA', 'rR', 'rSwB', 'rDst'], tone: 'deliver' },
          ...show('rBox'),
          { type: 'moveAlong', actor: 'rBox', path: ['rPc', 'rSwA', 'rR', 'rSwB', 'rDst'], msPerHop: 1100, offset: { dx: 0, dy: -85 } },
          ...show('rLbl1', 'rLbl2'),
        ],
      },
      {
        id: 's6', chipTh: 'ยื่นถึงเครื่อง', lifeIcon: '🛵',
        lifeTh: 'ของมาถึงหมู่บ้านแล้ว ไรเดอร์ต้องยื่นให้ถูกคน',
        narrationTh: 'พอกล่องถึงหมู่บ้านแล้ว ขั้นสุดท้าย ต้องยื่นให้ถูกเครื่อง เลยใช้ MAC โดย Switch จะดู MAC ผู้รับบนกล่อง แล้วส่งไปช่อง ที่เครื่องนั้นเสียบอยู่',
        setup: show('tR', 'tSw', 't1', 't2', 't3', 'tc0', 'tc1', 'tc2', 'tc3'),
        actions: [
          { type: 'trail', path: ['tR', 'tSw', 't3'], tone: 'deliver' },
          ...show('tBox'),
          { type: 'moveAlong', actor: 'tBox', path: ['tR', 'tSw', 't3'], msPerHop: 1500, offset: { dx: 0, dy: -80 } },
          glow('t3'),
          ...show('tLbl'),
        ],
      },

      // ARP: หนึ่งฉากหนึ่งเหตุการณ์ ตามต้นแบบ spike/arp-scene.html
      {
        id: 'arp1', chipTh: 'ปัญหา', lifeIcon: '📦',
        lifeTh: 'เรารู้บ้านเลขที่ของเพื่อน แต่ไรเดอร์ในซอยส่งของตามหน้าคน เราเลยต้องรู้ด้วยว่าใครคือเจ้าของบ้านนั้น',
        narrationTh: 'คนส่งต้องเขียน MAC ผู้รับบนกล่องด้วย แต่คอมเรารู้แค่ IP ของคอมสาม ลองดูสมุดจดของคอมเราสิ ยังว่างอยู่ ไม่รู้ MAC ของเครื่องนี้เลย',
        setup: show(...arpBase),
        actions: [glow('me'), glow('nb')],
      },
      {
        id: 'arp2', chipTh: 'ตะโกนถาม', lifeIcon: '📢',
        lifeTh: 'ยืนหน้าซอยแล้วตะโกนว่า ใครอยู่บ้านเลขที่ 30 ช่วยขานหน่อย ทุกบ้านในซอยได้ยินหมด',
        narrationTh: 'คอมเราเลยตะโกนถามทั้งหมู่บ้าน ว่าใครใช้ IP นี้ การส่งถึงทุกเครื่องแบบนี้ เรียกว่า broadcast Switch ก๊อปคำถาม ส่งออกไปทุกสาย',
        setup: show(...arpBase),
        actions: [
          { type: 'ripple', actor: 'me', tone: 'bcast' },
          { type: 'trail', path: ['me', 'sw'], tone: 'bcast' },
          { type: 'trail', path: ['sw', 'pc1'], tone: 'bcast' },
          { type: 'trail', path: ['sw', 'pc2'], tone: 'bcast' },
          { type: 'trail', path: ['sw', 'pc3'], tone: 'bcast' },
          ...show('q0'),
          { type: 'moveAlong', actor: 'q0', path: ['me', 'sw'], msPerHop: 900, offset: ABOVE },
          // Switch ก๊อปคำถามเป็นสามซอง
          { type: 'hide', actor: 'q0' },
          ...show('q1', 'q2', 'q3'),
          { type: 'moveAlong', actor: 'q1', path: ['sw', 'pc1'], msPerHop: 900, offset: LEFT },
          { type: 'moveAlong', actor: 'q2', path: ['sw', 'pc2'], msPerHop: 900, offset: LEFT },
          { type: 'moveAlong', actor: 'q3', path: ['sw', 'pc3'], msPerHop: 900, offset: LEFT },
        ],
      },
      {
        id: 'arp3', chipTh: 'ใช่ฉันไหม', lifeIcon: '🙋',
        lifeTh: 'บ้านเลขที่ 20 กับ 25 ได้ยินแล้วเงียบ เพราะไม่ใช่บ้านตัวเอง บ้านเลขที่ 30 ยกมือว่าฉันเอง',
        narrationTh: 'ทุกเครื่องเปิดอ่าน แล้วดูว่า IP ที่ถาม ตรงกับของตัวเองไหม คอมหนึ่งกับคอมสองไม่ใช่ ก็เงียบไป ส่วนคอมสามใช่ เพราะเป็นเจ้าของ IP นั้น',
        setup: show(...arpBase),
        actions: [
          { type: 'say', actor: 'pc1', text: 'ไม่ใช่ฉัน', mood: 'no' },
          ...dim('pc1'),
          { type: 'say', actor: 'pc2', text: 'ไม่ใช่ฉัน', mood: 'no' },
          ...dim('pc2'),
          { type: 'say', actor: 'pc3', text: 'ฉันเอง!', mood: 'yes' },
          glow('pc3'),
        ],
      },
      {
        id: 'arp4', chipTh: 'ตอบกลับ', lifeIcon: '🗣️',
        lifeTh: 'เจ้าของบ้านเลขที่ 30 เดินมาบอกเราคนเดียวว่า ผมเอง หน้าตาผมเป็นแบบนี้ ไม่ต้องตะโกนบอกทั้งซอย',
        narrationTh: 'คอมสามตอบกลับ หาคอมเราเครื่องเดียว การส่งถึงเครื่องเดียวแบบนี้ เรียกว่า unicast ในคำตอบมี MAC ของคอมสามอยู่ด้วย',
        setup: [...show(...arpBase), ...dim('pc1', 'pc2'), glow('pc3')],
        actions: [
          { type: 'trail', path: ['pc3', 'sw', 'me'], tone: 'reply' },
          ...show('ans'),
          { type: 'moveAlong', actor: 'ans', path: ['pc3', 'sw', 'me'], msPerHop: 1000, offset: { dx: 0, dy: -110 } },
        ],
      },
      {
        id: 'arp5', chipTh: 'จดลงสมุด', lifeIcon: '📒',
        lifeTh: 'เราจดไว้ในสมุดว่าบ้านเลขที่ 30 คือคนหน้าตาแบบนี้ ครั้งหน้าจะได้ไม่ต้องตะโกนถามอีก',
        narrationTh: 'คอมเราจดลงสมุดว่า IP นี้ คือ MAC นี้ วิธีตะโกนถามหา MAC แบบนี้ เรียกว่า ARP ส่วนสมุดเล่มนี้ เรียกว่าตาราง ARP ครั้งหน้าจะได้ไม่ต้องถามซ้ำ',
        setup: [...show(...arpBase), glow('pc3')],
        actions: [{ type: 'setRows', actor: 'nb', rows: arpRows }, glow('nb')],
      },
      {
        id: 'arp6', chipTh: 'ส่งของจริง', lifeIcon: '🛵',
        lifeTh: 'ไรเดอร์ถือกล่องที่เขียนหน้าผู้รับไว้ชัด ๆ เดินไปส่งบ้านเลขที่ 30 บ้านเดียว บ้านอื่นไม่ได้อะไร',
        narrationTh: 'คราวนี้ส่งของได้แล้ว บนกล่องเขียน MAC ผู้รับ Switch เลยส่งไปที่คอมสามเครื่องเดียว เครื่องอื่นไม่ได้รับ',
        setup: [...show(...arpBase), { type: 'setRows', actor: 'nb', rows: arpRows }, ...dim('pc1', 'pc2')],
        actions: [
          { type: 'trail', path: ['me', 'sw', 'pc3'], tone: 'deliver' },
          ...show('pkt'),
          { type: 'moveAlong', actor: 'pkt', path: ['me', 'sw'], msPerHop: 1000, offset: ABOVE },
          glow('sw'), // Switch ดู MAC ผู้รับ แล้วเลือกสาย (รอซองมาถึงก่อน)
          { type: 'moveAlong', actor: 'pkt', path: ['sw', 'pc3'], msPerHop: 1000, offset: LEFT },
          glow('pc3'),
        ],
      },

      {
        id: 'gw1', chipTh: 'ถาม Gateway', lifeIcon: '🚪',
        lifeTh: 'ของจะไปต่างหมู่บ้าน เราไม่ต้องรู้จักหน้าคนรับ แค่ถามหายามที่ประตูหมู่บ้าน',
        narrationTh: 'ถ้าปลายทางอยู่นอกหมู่บ้าน คอมจะไม่ถามหาเครื่องปลายทาง แต่ถามหา MAC ของ Gateway แทน ซึ่งก็คือประตูออกหมู่บ้าน',
        setup: show(...gwBase, 'gLbl1'),
        actions: [
          { type: 'ripple', actor: 'gPc', tone: 'bcast' },
          { type: 'trail', path: ['gPc', 'gSw', 'gR'], tone: 'bcast' },
          ...show('gAsk'),
          { type: 'moveAlong', actor: 'gAsk', path: ['gPc', 'gSw', 'gR'], msPerHop: 900, offset: ABOVE },
          glow('gR'),
        ],
      },
      {
        id: 'gwr', chipTh: 'Gateway ตอบ', lifeIcon: '🗣️',
        lifeTh: 'ยามที่ประตูหมู่บ้านเดินมาบอกเราคนเดียวว่า ผมเองครับ ของที่จะออกนอกหมู่บ้าน ยื่นมาที่ผมได้เลย',
        narrationTh: 'Gateway ได้ยินว่าถามหาตัวเอง ก็ตอบกลับหาคอมเราเครื่องเดียว แบบ unicast ในคำตอบมี MAC ของ Gateway อยู่ด้วย',
        setup: [...show(...gwBase), glow('gR')],
        actions: [
          { type: 'say', actor: 'gR', text: 'ฉันเอง!', mood: 'yes' },
          { type: 'trail', path: ['gR', 'gSw', 'gPc'], tone: 'reply' },
          ...show('gAns'),
          { type: 'moveAlong', actor: 'gAns', path: ['gR', 'gSw', 'gPc'], msPerHop: 900, offset: { dx: 0, dy: -110 } },
        ],
      },
      {
        id: 'gw2', chipTh: 'ยื่นให้ประตู', lifeIcon: '📦',
        lifeTh: 'ยื่นกล่องให้ยามที่ประตูหมู่บ้าน บนกล่องยังเขียนที่อยู่ปลายทางเหมือนเดิม',
        narrationTh: 'แล้วคอมก็ยื่นกล่องให้ Gateway โดยเขียน MAC ของ Gateway บนกล่อง ส่วน IP ผู้รับบนกล่อง ยังเป็นเครื่องปลายทาง ไม่เปลี่ยน',
        setup: [...show(...gwBase), glow('gR')],
        actions: [
          { type: 'trail', path: ['gPc', 'gSw', 'gR'], tone: 'deliver' },
          ...show('gBox'),
          { type: 'moveAlong', actor: 'gBox', path: ['gPc', 'gSw', 'gR'], msPerHop: 900, offset: ABOVE },
          ...show('gLbl2'),
        ],
      },

      {
        id: 'dup1', chipTh: 'IP ซ้ำ', lifeIcon: '📢',
        lifeTh: 'ตะโกนถามหาบ้านเลขที่ 10 เหมือนทุกครั้ง',
        narrationTh: 'แล้วถ้าสองเครื่อง ใช้ IP เดียวกันล่ะ คอมสามอยากส่งของให้เลขนี้ ก็ตะโกนถามหา MAC ทั้งหมู่บ้านเหมือนเดิม',
        setup: show(...dupBase),
        actions: [
          { type: 'ripple', actor: 'dSend', tone: 'bcast' },
          { type: 'trail', path: ['dSend', 'dSw'], tone: 'bcast' },
          { type: 'trail', path: ['dSw', 'd1'], tone: 'bcast' },
          { type: 'trail', path: ['dSw', 'd2'], tone: 'bcast' },
          ...show('dQ0'),
          { type: 'moveAlong', actor: 'dQ0', path: ['dSend', 'dSw'], msPerHop: 900, offset: ABOVE },
          { type: 'hide', actor: 'dQ0' },
          ...show('dQ1', 'dQ2'),
          { type: 'moveAlong', actor: 'dQ1', path: ['dSw', 'd1'], msPerHop: 900, offset: LEFT },
          { type: 'moveAlong', actor: 'dQ2', path: ['dSw', 'd2'], msPerHop: 900, offset: LEFT },
        ],
      },
      {
        id: 'dup2', chipTh: 'ตอบสองเครื่อง', lifeIcon: '🤷',
        lifeTh: 'มีสองบ้านขานว่าฉันเอง ไรเดอร์เลยไม่รู้ว่าจะส่งให้บ้านไหน',
        narrationTh: 'คราวนี้มีสองเครื่องตอบ คอมเลยไม่รู้ว่าเครื่องไหนตัวจริง ของอาจไปผิดเครื่อง หรือส่งไม่ถึง เดี๋ยวลองในห้องทดลองกัน',
        setup: show(...dupBase),
        actions: [
          { type: 'say', actor: 'd1', text: 'ฉันเอง!', mood: 'yes' },
          { type: 'say', actor: 'd2', text: 'ฉันเอง!', mood: 'yes' },
          { type: 'trail', path: ['d1', 'dSw', 'dSend'], tone: 'reply' },
          { type: 'trail', path: ['d2', 'dSw', 'dSend'], tone: 'reply' },
          ...show('dA1', 'dA2'),
          { type: 'moveAlong', actor: 'dA1', path: ['d1', 'dSw', 'dSend'], msPerHop: 1000, offset: { dx: 0, dy: -162 } },
          { type: 'moveAlong', actor: 'dA2', path: ['d2', 'dSw', 'dSend'], msPerHop: 1000, offset: { dx: 0, dy: 146 } },
          { type: 'say', actor: 'dSend', text: 'MAC ไหนดี?', mood: 'no' },
          ...show('dLbl1', 'dLbl2'),
        ],
      },

      {
        id: 's10', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'บัตรประชาชนติดตัว บ้านเลขที่ติดบ้าน ไม่รู้ว่าใครเป็นเจ้าของบ้าน ก็ตะโกนถามในซอย',
        narrationTh: 'สรุปนะครับ MAC คือเลขบัตรประชาชน ติดเครื่องตลอด IP คือบ้านเลขที่ ย้ายหมู่บ้านก็เปลี่ยน ส่งข้ามหมู่บ้านใช้ IP ยื่นของในหมู่บ้านใช้ MAC และหา MAC ด้วย ARP',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
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
        hintTh: 'กดที่รูปคอม 2 ช่องตั้งค่าจะโผล่ทางขวา ลบเลขเดิมในช่อง IP แล้วพิมพ์ 192.168.1.10 กด บันทึก\nจากนั้นกด ส่งข้อมูล ตอนนี้มีสองเครื่อง อ้างบ้านเลขที่เดียวกัน พอถามหา MAC ก็ตอบมาสองเครื่อง คอมเลยไม่รู้ว่าต้องส่งให้เครื่องไหน',
      },
      {
        type: 'fix',
        from: 'pc2',
        toIp: '192.168.1.10',
        taskTh: 'แก้ IP ของคอม 2 ให้ไม่ซ้ำกับใคร แต่ยังอยู่หมู่บ้านเดิม แล้วส่งจากคอม 2 ไปคอม 1 ให้ถึง',
        hintTh: 'ในตัวอย่างนี้ เครื่องในหมู่บ้านเดียวกัน ใช้เลขสามชุดแรกเหมือนกัน คือ 192.168.1 กฎจริงว่าดูกี่ชุด เรียนในภาค 1 เรื่อง Subnet\n'
          + 'เลยเปลี่ยนแค่ชุดสุดท้าย ให้ไม่ซ้ำ เช่น 192.168.1.20 ห้ามใช้ .10 กับ .12 เพราะคอม 1 กับคอม 3 ใช้อยู่\n'
          + 'ถ้าเปลี่ยนชุดแรก ๆ ด้วย คอม 2 จะหลุดไปอยู่หมู่บ้านอื่น แล้วส่งหาคอม 1 ไม่ถึง\n'
          + 'ถ้าคอม 3 ก็ใช้ .10 อยู่ด้วย ให้กด เริ่มใหม่ ก่อน เพราะ .10 ยังซ้ำอยู่ที่คอม 3 แล้วค่อยแก้คอม 2',
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
