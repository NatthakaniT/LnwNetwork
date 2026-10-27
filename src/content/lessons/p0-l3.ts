import type { Actor, Lesson, SceneAction } from '../types'

// ฉากแบบ v2 (ดู p0-l4): ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup
// moveAlong วิ่งจากตำแหน่งของซองเอง ไปจุดที่ 2 เป็นต้นไปของ path (+ offset)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const dim = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'dim', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })

const ABOVE = { dx: 0, dy: -110 }
const moveBase = ['hA', 'hB', 'big']
const shareBase = ['rA', 'rC', 'rSw', 'rSv', 'rc1', 'rc2', 'rc3']
const lostBase = ['lA', 'lB', 'lCab', 'l1', 'l2', 'l4']
const replyBase = ['yPc', 'yWeb', 'yCab']
const gwBase = ['gV', 'gPc', 'gSw', 'gR', 'gNet', 'gWeb', 'gc1', 'gc2', 'gc3', 'gc4']
const dnsBase = ['dPc', 'dDns', 'dWeb', 'dc1', 'dc2']
const storyBase = ['sPc', 'sBad', 'sGood', 'sWeb', 'sc1', 'sc2', 'sc3']

const actors: Actor[] = [
  // ฉาก 1: ย้ายของทั้งห้อง
  h({ id: 'hA', kind: 'house', x: 180, y: 210, label: 'บ้านเรา' }),
  h({ id: 'hB', kind: 'house', x: 780, y: 210, label: 'บ้านเพื่อน' }),
  h({ id: 'big', kind: 'box', x: 480, y: 210, label: 'ของทั้งห้อง' }),
  h({ id: 'mRoad', kind: 'cable', x: 180, y: 210, to: 'hB' }),
  h({ id: 'm1', kind: 'card', x: 330, y: 150, lines: ['📦 กล่อง 1'], tone: 'deliver' }),
  h({ id: 'm2', kind: 'card', x: 330, y: 210, lines: ['📦 กล่อง 2'], tone: 'deliver' }),
  h({ id: 'm3', kind: 'card', x: 330, y: 270, lines: ['📦 กล่อง 3'], tone: 'deliver' }),
  h({ id: 'mLbl1', kind: 'label', x: 480, y: 410, label: '❌ ส่งทีเดียวทั้งก้อน ไม่ไหว' }),
  h({ id: 'mLbl2', kind: 'label', x: 480, y: 410, label: '📦 แบ่งใส่กล่องเล็ก ๆ แล้วทยอยส่ง' }),

  // ฉาก 2: ไฟล์ใหญ่ ถูกแบ่งเป็น packet
  h({ id: 'fA', kind: 'pc', x: 160, y: 220, label: 'คอมเรา' }),
  h({ id: 'fB', kind: 'pc', x: 800, y: 220, label: 'คอมเพื่อน' }),
  h({ id: 'fCab', kind: 'cable', x: 160, y: 220, to: 'fB' }),
  h({ id: 'fFile', kind: 'label', x: 200, y: 80, label: '🎬 ไฟล์คลิป ใหญ่มาก' }),
  h({ id: 'f1', kind: 'card', x: 280, y: 220, lines: ['📦 1'], tone: 'deliver' }),
  h({ id: 'f2', kind: 'card', x: 280, y: 220, lines: ['📦 2'], tone: 'deliver' }),
  h({ id: 'f3', kind: 'card', x: 280, y: 220, lines: ['📦 3'], tone: 'deliver' }),
  h({ id: 'fLbl', kind: 'label', x: 480, y: 440, label: 'Packet = กล่องข้อมูลเล็ก ๆ ที่แบ่งจากไฟล์ใหญ่' }),

  // ฉาก 3: กล่องเล็ก สลับกันวิ่งบนถนนเดียวกัน
  h({ id: 'rA', kind: 'pc', x: 130, y: 110, label: 'คอมเรา' }),
  h({ id: 'rC', kind: 'pc', x: 130, y: 330, label: 'คอมน้อง' }),
  h({ id: 'rSw', kind: 'switch', x: 380, y: 220, label: 'Switch' }),
  h({ id: 'rSv', kind: 'server', x: 820, y: 220, label: 'เซิร์ฟเวอร์' }),
  h({ id: 'rc1', kind: 'cable', x: 130, y: 110, to: 'rSw' }),
  h({ id: 'rc2', kind: 'cable', x: 130, y: 330, to: 'rSw' }),
  h({ id: 'rc3', kind: 'cable', x: 380, y: 220, to: 'rSv' }),
  h({ id: 'ra1', kind: 'card', x: 230, y: 110, lines: ['📦'], tone: 'deliver' }),
  h({ id: 'ra2', kind: 'card', x: 230, y: 110, lines: ['📦'], tone: 'deliver' }),
  h({ id: 'rb1', kind: 'card', x: 230, y: 330, lines: ['✉️'], tone: 'deliver' }),
  h({ id: 'rb2', kind: 'card', x: 230, y: 330, lines: ['✉️'], tone: 'deliver' }),
  h({ id: 'rLbl', kind: 'label', x: 560, y: 490, label: '📦 ของเรา กับ ✉️ ของน้อง สลับกันวิ่ง ใช้ถนนพร้อมกัน' }),

  // ฉาก 4: กล่องหาย ส่งใหม่แค่กล่องเดียว
  h({ id: 'lA', kind: 'pc', x: 160, y: 220, label: 'คอมเรา' }),
  h({ id: 'lB', kind: 'pc', x: 800, y: 220, label: 'คอมเพื่อน' }),
  h({ id: 'lCab', kind: 'cable', x: 160, y: 220, to: 'lB' }),
  h({ id: 'l1', kind: 'card', x: 290, y: 220, lines: ['📦 1'], tone: 'deliver' }),
  h({ id: 'l2', kind: 'card', x: 410, y: 220, lines: ['📦 2'], tone: 'deliver' }),
  h({ id: 'l3', kind: 'card', x: 530, y: 220, lines: ['📦 3'], tone: 'deliver' }),
  h({ id: 'l4', kind: 'card', x: 650, y: 220, lines: ['📦 4'], tone: 'deliver' }),
  h({ id: 'lNew', kind: 'card', x: 300, y: 340, lines: ['📦 3 ส่งใหม่'], tone: 'deliver' }),
  h({ id: 'lGone', kind: 'label', x: 530, y: 130, label: '❌ กล่อง 3 หาย' }),
  h({ id: 'lLbl', kind: 'label', x: 480, y: 440, label: 'หายกล่องเดียว ส่งใหม่แค่กล่องนั้น ไม่ต้องส่งทั้งไฟล์' }),

  // ฉาก 5: ที่อยู่บนกล่อง
  h({ id: 'aPc', kind: 'pc', x: 120, y: 190, label: 'คอมเรา' }),
  h({ id: 'aWeb', kind: 'server', x: 840, y: 190, label: 'เครื่องเว็บ' }),
  h({ id: 'aCard', kind: 'card', x: 480, y: 190, lines: ['📦 กล่อง 1', '📤 ผู้ส่ง: คอมเรา', '📥 ผู้รับ: เครื่องเว็บ'], tone: 'deliver' }),
  h({ id: 'aSrc', kind: 'label', x: 480, y: 360, label: '📤 ผู้ส่ง (source) = คอมเรา' }),
  h({ id: 'aDst', kind: 'label', x: 480, y: 420, label: '📥 ผู้รับ (destination) = เครื่องเว็บ' }),
  h({ id: 'aWhy', kind: 'label', x: 480, y: 490, label: 'เขียนไว้ทุกกล่อง เพราะแต่ละกล่องเดินทางแยกกัน' }),

  // ฉาก 6: ที่อยู่ผู้รับ ใช้ส่ง / ที่อยู่ผู้ส่ง ใช้ตอบกลับ
  h({ id: 'yLbl1', kind: 'label', x: 480, y: 470, label: '📮 ไปรษณีย์ดูที่อยู่ผู้รับ เลยส่งถูกเครื่อง' }),
  h({ id: 'yLbl2', kind: 'label', x: 480, y: 470, label: '↩️ ที่อยู่ผู้ส่ง บอกว่าต้องตอบกลับไปที่ไหน' }),
  h({ id: 'yPc', kind: 'pc', x: 150, y: 250, label: 'คอมเรา' }),
  h({ id: 'yWeb', kind: 'server', x: 810, y: 250, label: 'เครื่องเว็บ' }),
  h({ id: 'yCab', kind: 'cable', x: 150, y: 250, to: 'yWeb' }),
  h({ id: 'yGo', kind: 'card', x: 150, y: 140, lines: ['📦 ถึง: เครื่องเว็บ', 'จาก: คอมเรา'], tone: 'deliver' }),
  h({ id: 'yBack', kind: 'card', x: 810, y: 140, lines: ['📦 ถึง: คอมเรา', 'จาก: เครื่องเว็บ'], tone: 'reply' }),

  // ฉาก 7: ออกนอกหมู่บ้าน ผ่าน Gateway
  h({ id: 'gV', kind: 'label', x: 210, y: 40, label: 'หมู่บ้านเรา' }),
  h({ id: 'gPc', kind: 'pc', x: 110, y: 150, label: 'คอมเรา' }),
  h({ id: 'gSw', kind: 'switch', x: 210, y: 300, label: 'Switch' }),
  h({ id: 'gR', kind: 'router', x: 430, y: 300, label: 'Gateway (Router)' }),
  h({ id: 'gNet', kind: 'cloud', x: 650, y: 300, label: 'Internet' }),
  h({ id: 'gWeb', kind: 'server', x: 850, y: 150, label: 'เครื่องเว็บ' }),
  h({ id: 'gc1', kind: 'cable', x: 110, y: 150, to: 'gSw' }),
  h({ id: 'gc2', kind: 'cable', x: 210, y: 300, to: 'gR' }),
  h({ id: 'gc3', kind: 'cable', x: 430, y: 300, to: 'gNet' }),
  h({ id: 'gc4', kind: 'cable', x: 650, y: 300, to: 'gWeb' }),
  h({ id: 'gBox', kind: 'card', x: 230, y: 150, lines: ['📦 ผู้รับ: เครื่องเว็บ'], tone: 'deliver' }),
  h({ id: 'gDst', kind: 'label', x: 480, y: 445, label: '📦 ผู้รับบนกล่อง = เครื่องเว็บ (ไม่ใช่ Gateway)' }),
  h({ id: 'gLbl', kind: 'label', x: 480, y: 505, label: 'ออกนอกหมู่บ้าน ต้องผ่าน Gateway (ประตูออกหมู่บ้าน)' }),

  // ฉาก 8: DNS = สมุดโทรศัพท์ ถาม → ตอบ → ส่ง
  h({ id: 'dPc', kind: 'pc', x: 150, y: 260, label: 'คอมเรา' }),
  h({ id: 'dDns', kind: 'server', x: 480, y: 100, label: 'DNS (สมุดโทรศัพท์)' }),
  h({ id: 'dWeb', kind: 'server', x: 810, y: 260, label: 'huggingface.co' }),
  h({ id: 'dc1', kind: 'cable', x: 150, y: 260, to: 'dDns' }),
  h({ id: 'dc2', kind: 'cable', x: 150, y: 260, to: 'dWeb' }),
  h({ id: 'dAsk', kind: 'card', x: 150, y: 150, lines: ['❓ huggingface.co', 'เลขที่อยู่อะไร?'], tone: 'reply' }),
  h({ id: 'dAns', kind: 'card', x: 480, y: 250, lines: ['ถึง: คอมเรา', 'huggingface.co', '= เลขที่อยู่นี้ 🔢'], tone: 'reply' }),
  h({ id: 'dBox', kind: 'card', x: 150, y: 150, lines: ['📦 ผู้รับ: เลขของเว็บ'], tone: 'deliver' }),
  h({ id: 'dLbl1', kind: 'label', x: 480, y: 440, label: '1. ถาม DNS: huggingface.co เลขที่อยู่อะไร' }),
  h({ id: 'dLbl2', kind: 'label', x: 480, y: 440, label: '2. ได้เลขที่อยู่ของเว็บ (ไม่ใช่เบอร์โทร)' }),
  h({ id: 'dLbl3', kind: 'label', x: 480, y: 440, label: '3. เขียนเลขนี้บนกล่อง แล้วส่งไปที่เว็บ' }),

  // ฉาก 9: เรื่องจริง สมุดให้เลขผิด
  h({ id: 'sPc', kind: 'pc', x: 150, y: 290, label: 'คอมเรา' }),
  h({ id: 'sBad', kind: 'server', x: 380, y: 100, label: '❌ สมุดของเน็ตบ้าน' }),
  h({ id: 'sGood', kind: 'server', x: 640, y: 100, label: '✅ สมุดอีกเล่ม 🔒' }),
  h({ id: 'sWeb', kind: 'server', x: 810, y: 290, label: 'huggingface.co' }),
  h({ id: 'sc1', kind: 'cable', x: 150, y: 290, to: 'sBad' }),
  h({ id: 'sc2', kind: 'cable', x: 150, y: 290, to: 'sGood' }),
  h({ id: 'sc3', kind: 'cable', x: 150, y: 290, to: 'sWeb' }),
  h({ id: 'sAns1', kind: 'card', x: 380, y: 230, lines: ['ถึง: คอมเรา', '❌ เลขที่อยู่ผิด'], tone: 'reply' }),
  h({ id: 'sAns2', kind: 'card', x: 640, y: 230, lines: ['ถึง: คอมเรา', '✅ เลขที่อยู่ถูก 🔒'], tone: 'reply' }),
  h({ id: 'sBox', kind: 'card', x: 300, y: 410, lines: ['📦 ผู้รับ: huggingface.co'], tone: 'deliver' }),
  h({ id: 'sLbl1', kind: 'label', x: 480, y: 450, label: '❌ เน็ตบ้าน: สมุดให้เลขผิด เปิดไม่ได้' }),
  h({ id: 'sLbl2', kind: 'label', x: 480, y: 505, label: '✅ Chrome: ถามสมุดอีกเล่ม ได้เลขถูก เปิดได้' }),

  // ฉาก 10: สรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 70, label: 'Packet = กล่องเล็ก ๆ ที่แบ่งจากไฟล์ใหญ่' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 160, label: 'ทุกกล่องมีที่อยู่ ผู้ส่ง (source) และผู้รับ (destination)' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 250, label: 'ออกนอกหมู่บ้าน ต้องผ่าน Gateway (ประตูออกหมู่บ้าน)' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 340, label: 'DNS = สมุดโทรศัพท์ เปลี่ยนชื่อเว็บเป็นเลขที่อยู่' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 430, label: 'สมุดให้เลขผิด เว็บก็เปิดไม่ได้ ทั้งที่เว็บไม่ได้เสีย' }),
]

export const lesson: Lesson = {
  id: 'p0-l3',
  part: 0,
  order: 3,
  status: 'ready',
  titleTh: 'ข้อมูลเดินทางยังไง',
  analogyTh: 'กล่องพัสดุ',
  ciscoModules: ['ITN 3'],
  videos: [
    { youtubeId: 'jjs02wLiXmQ', titleTh: 'IPv4, Subnet mask, Gateway, DNS คืออะไร ทำงานอย่างไร', channel: '9hua Training',
      noteTh: 'คลิปนี้มีเรื่องเลข IP กับ Subnet mask แบบละเอียดด้วย ช่วงนั้นดูผ่าน ๆ ได้เลย ไม่ต้องเข้าใจตอนนี้ เดี๋ยวบทที่ 4 เล่าให้ฟังทีละขั้น' },
  ],
  terms: ['packet', 'source', 'destination', 'dns', 'domain-name', 'gateway', 'router', 'switch', 'internet', 'ip-address', 'network', 'lan', 'end-device'],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'ของเยอะ', lifeIcon: '🏠',
        lifeTh: 'จะย้ายของทั้งห้องไปบ้านเพื่อนต่างจังหวัด ยกไปทีเดียวทั้งก้อนไม่ไหว',
        narrationTh: 'ลองนึกดูนะครับ เราจะย้ายของทั้งห้อง ไปบ้านเพื่อนต่างจังหวัด ของเยอะมาก ส่งทีเดียวทั้งก้อนไม่ไหว แล้วจะทำยังไงดี',
        setup: show(...moveBase),
        actions: [glow('big'), ...show('mLbl1')],
      },
      {
        id: 's1b', chipTh: 'แบ่งกล่อง', lifeIcon: '📦',
        lifeTh: 'แบ่งของใส่กล่องเล็ก ๆ หลายกล่อง แล้วทยอยส่งทีละกล่อง',
        narrationTh: 'เราก็แบ่งใส่กล่องเล็ก ๆ หลายกล่อง แล้วทยอยส่งไปทีละกล่อง',
        setup: show('hA', 'hB', 'mRoad'),
        actions: [
          { type: 'trail', path: ['hA', 'hB'], tone: 'deliver' },
          ...show('m1', 'm2', 'm3'),
          { type: 'move', actor: 'm1', x: 640, y: 150, ms: 1800 },
          { type: 'move', actor: 'm2', x: 640, y: 210, ms: 2400 },
          { type: 'move', actor: 'm3', x: 640, y: 270, ms: 3000 },
          ...show('mLbl2'),
        ],
      },
      {
        id: 's2', chipTh: 'Packet', lifeIcon: '🎬',
        lifeTh: 'คลิปยาว ๆ ถูกตัดเป็นกล่องเล็ก ๆ หลายกล่อง ก่อนส่งไปหาเพื่อน',
        narrationTh: 'คอมก็ทำแบบนี้เลย ไฟล์ใหญ่ ๆ เช่น คลิป หรือรูป จะถูกแบ่งเป็นกล่องเล็ก ๆ ก่อนส่ง กล่องเล็กแต่ละกล่อง เรียกว่า packet',
        setup: show('fA', 'fB', 'fCab', 'fFile'),
        actions: [
          { type: 'trail', path: ['fA', 'fB'], tone: 'deliver' },
          ...show('f1', 'f2', 'f3'),
          { type: 'move', actor: 'f1', x: 640, y: 220, ms: 2400 },
          { type: 'move', actor: 'f2', x: 520, y: 220, ms: 2400 },
          { type: 'move', actor: 'f3', x: 400, y: 220, ms: 2400 },
          ...show('fLbl'),
        ],
      },
      {
        id: 's3', chipTh: 'ใช้ถนนร่วม', lifeIcon: '🛣️',
        lifeTh: 'รถคันเล็กหลายคันสลับกันวิ่งบนถนนเส้นเดียวได้ ไม่ต้องรอรถคันใหญ่คันเดียววิ่งจนจบ',
        narrationTh: 'ทำไมต้องแบ่ง ข้อแรก จะได้ไม่มีใครใช้ถนนคนเดียวนาน ๆ กล่องของเรา กับกล่องของคนอื่น สลับกันวิ่งได้ ทุกคนเลยใช้ถนนพร้อมกันได้ ไม่ต้องรอใครส่งจนเสร็จ',
        setup: show(...shareBase),
        actions: [
          { type: 'trail', path: ['rA', 'rSw', 'rSv'], tone: 'deliver' },
          { type: 'trail', path: ['rC', 'rSw'], tone: 'deliver' },
          ...show('ra1', 'rb1', 'ra2', 'rb2'),
          // สลับกันออกจาก Switch แล้วเรียงบนถนนเส้นเดียวกัน ของเรา ของน้อง ของเรา ของน้อง
          { type: 'moveAlong', actor: 'ra1', path: ['rA', 'rSw'], msPerHop: 900 },
          { type: 'moveAlong', actor: 'rb1', path: ['rC', 'rSw'], msPerHop: 1150 },
          { type: 'moveAlong', actor: 'ra2', path: ['rA', 'rSw'], msPerHop: 1400 },
          { type: 'moveAlong', actor: 'rb2', path: ['rC', 'rSw'], msPerHop: 1650 },
          glow('rSw'),
          { type: 'move', actor: 'ra1', x: 706, y: 220, ms: 1500 },
          { type: 'move', actor: 'rb1', x: 634, y: 220, ms: 1300 },
          { type: 'move', actor: 'ra2', x: 562, y: 220, ms: 1100 },
          { type: 'move', actor: 'rb2', x: 490, y: 220, ms: 900 },
          ...show('rLbl'),
        ],
      },
      {
        id: 's4', chipTh: 'กล่องหาย', lifeIcon: '❌',
        lifeTh: 'ส่งพัสดุไปสี่กล่อง กล่องที่สามหายกลางทาง เพื่อนได้ไม่ครบ',
        narrationTh: 'ข้อสอง ถ้ามีกล่องหายระหว่างทาง เช่น กล่องที่สามหายไป คอมเพื่อนก็ได้ของไม่ครบ',
        setup: show(...lostBase, 'l3'),
        actions: [{ type: 'hide', actor: 'l3' }, ...show('lGone')],
      },
      {
        id: 's4b', chipTh: 'ส่งใหม่', lifeIcon: '🔁',
        lifeTh: 'ส่งใหม่แค่กล่องที่หาย ไม่ต้องแพ็กของทั้งห้องส่งใหม่',
        narrationTh: 'ก็ส่งใหม่แค่กล่องนั้น ไม่ต้องส่งใหม่ทั้งไฟล์ เร็วกว่ากันเยอะ',
        setup: show(...lostBase, 'lGone'),
        actions: [
          { type: 'trail', path: ['lA', 'lB'], tone: 'deliver' },
          ...show('lNew'),
          { type: 'move', actor: 'lNew', x: 530, y: 220, ms: 2500 },
          ...show('lLbl'),
        ],
      },
      {
        id: 's5', chipTh: 'ที่อยู่บนกล่อง', lifeIcon: '🏷️',
        lifeTh: 'พัสดุทุกกล่องมีใบปะหน้า เขียนชื่อที่อยู่ผู้ส่ง และผู้รับ',
        narrationTh: 'บนกล่องทุกใบ เขียนที่อยู่สองอย่าง ที่อยู่ผู้ส่ง เรียกว่า source และที่อยู่ผู้รับ เรียกว่า destination ต้องเขียนทุกใบ เพราะแต่ละกล่องเดินทางแยกกัน',
        setup: show('aPc', 'aWeb', 'aCard'),
        actions: [glow('aCard'), ...show('aSrc', 'aDst', 'aWhy')],
      },
      {
        id: 's6', chipTh: 'ส่งถูกเครื่อง', lifeIcon: '📮',
        lifeTh: 'ไปรษณีย์อ่านที่อยู่ผู้รับบนใบปะหน้า แล้วส่งกล่องไปถูกบ้าน',
        narrationTh: 'ไปรษณีย์ดูที่อยู่ผู้รับบนกล่อง เลยส่งกล่องไปถูกเครื่อง',
        setup: show(...replyBase),
        actions: [
          { type: 'trail', path: ['yPc', 'yWeb'], tone: 'deliver' },
          ...show('yGo'),
          { type: 'moveAlong', actor: 'yGo', path: ['yPc', 'yWeb'], msPerHop: 2500, offset: ABOVE },
          glow('yWeb'),
          ...show('yLbl1'),
        ],
      },
      {
        id: 's6b', chipTh: 'ตอบกลับ', lifeIcon: '↩️',
        lifeTh: 'คนรับอยากส่งของคืน ก็ดูที่อยู่ผู้ส่งบนใบปะหน้า',
        narrationTh: 'ส่วนที่อยู่ผู้ส่ง มีไว้ให้ปลายทาง รู้ว่าต้องตอบกลับไปที่ไหน เครื่องเว็บเลยส่งกล่องกลับมาหาคอมเราได้',
        setup: show(...replyBase),
        actions: [
          { type: 'trail', path: ['yWeb', 'yPc'], tone: 'reply' },
          ...show('yBack'),
          { type: 'moveAlong', actor: 'yBack', path: ['yWeb', 'yPc'], msPerHop: 2500, offset: ABOVE },
          glow('yPc'),
          ...show('yLbl2'),
        ],
      },
      {
        id: 's7', chipTh: 'Gateway', lifeIcon: '🚪',
        lifeTh: 'ของที่จะไปต่างหมู่บ้าน ต้องออกทางประตูหมู่บ้าน แต่ที่อยู่ผู้รับบนกล่องยังเหมือนเดิม',
        narrationTh: 'ถ้าผู้รับอยู่นอกหมู่บ้าน คอมจะส่งกล่องไปที่ Gateway ก่อน คือประตูออกหมู่บ้าน ที่อยู่ผู้รับบนกล่อง ไม่เปลี่ยนเป็น Gateway นะ เป็นเครื่องเว็บตลอดทาง แล้ว Gateway ก็ส่งต่อไป จนถึงเว็บ',
        setup: show(...gwBase),
        actions: [
          glow('gR'),
          { type: 'trail', path: ['gPc', 'gSw', 'gR', 'gNet', 'gWeb'], tone: 'deliver' },
          ...show('gBox'),
          { type: 'moveAlong', actor: 'gBox', path: ['gPc', 'gSw', 'gR', 'gNet', 'gWeb'], msPerHop: 1100, offset: { dx: 0, dy: -100 } },
          ...show('gDst', 'gLbl'),
        ],
      },
      {
        id: 's8', chipTh: 'ถาม DNS', lifeIcon: '📒',
        lifeTh: 'รู้แค่ชื่อร้าน ก็เปิดสมุดโทรศัพท์หาเบอร์ก่อนโทร',
        narrationTh: 'เวลาจะโทรหาร้าน แต่รู้แค่ชื่อ เราก็เปิดสมุดโทรศัพท์หาเบอร์ คอมก็เหมือนกัน เรารู้แค่ชื่อเว็บ แต่คอมต้องใช้เลขที่อยู่ เลยถามเครื่อง DNS server ให้บอกเลขที่อยู่ของเว็บ',
        setup: show(...dnsBase),
        actions: [
          { type: 'trail', path: ['dPc', 'dDns'], tone: 'reply' },
          ...show('dAsk'),
          { type: 'moveAlong', actor: 'dAsk', path: ['dPc', 'dDns'], msPerHop: 1800, offset: { dx: -240, dy: 0 } },
          ...show('dLbl1'),
        ],
      },
      {
        id: 's8b', chipTh: 'DNS ตอบ', lifeIcon: '☎️',
        lifeTh: 'เปิดสมุดเจอเบอร์ร้านแล้ว จดเบอร์ไว้ก่อนกดโทร',
        narrationTh: 'DNS server เปิดสมุด แล้วตอบกลับมาว่า เว็บนี้ใช้เลขที่อยู่อะไร',
        setup: show(...dnsBase),
        actions: [
          { type: 'trail', path: ['dDns', 'dPc'], tone: 'reply' },
          ...show('dAns'),
          { type: 'moveAlong', actor: 'dAns', path: ['dDns', 'dPc'], msPerHop: 1800, offset: ABOVE },
          ...show('dLbl2'),
        ],
      },
      {
        id: 's8c', chipTh: 'ส่งกล่อง', lifeIcon: '📦',
        lifeTh: 'ได้เบอร์แล้ว ก็โทรหาร้านได้ตรงตัว',
        narrationTh: 'ได้เลขแล้ว คอมก็เขียนเลขนี้ เป็นที่อยู่ผู้รับบนกล่อง แล้วส่งกล่องไปที่เครื่องเว็บ',
        setup: show(...dnsBase),
        actions: [
          { type: 'trail', path: ['dPc', 'dWeb'], tone: 'deliver' },
          ...show('dBox'),
          { type: 'moveAlong', actor: 'dBox', path: ['dPc', 'dWeb'], msPerHop: 2200, offset: ABOVE },
          glow('dWeb'),
          ...show('dLbl3'),
        ],
      },
      {
        id: 's9', chipTh: 'สมุดผิด', lifeIcon: '❌',
        lifeTh: 'สมุดโทรศัพท์พิมพ์เบอร์ร้านผิด โทรไปก็ไม่เจอร้าน ทั้งที่ร้านยังเปิดอยู่',
        narrationTh: 'เรื่องจริงเลยนะ เน็ตบ้านเปิด huggingface.co ไม่ได้ เพราะสมุดของเน็ตบ้าน ให้เลขที่อยู่ผิด กล่องเลยไปไม่ถึงเว็บ',
        setup: show(...storyBase),
        actions: [
          { type: 'trail', path: ['sBad', 'sPc'], tone: 'reply' },
          ...show('sAns1'),
          { type: 'moveAlong', actor: 'sAns1', path: ['sBad', 'sPc'], msPerHop: 1800, offset: ABOVE },
          ...dim('sWeb'),
          ...show('sLbl1'),
        ],
      },
      {
        id: 's9b', chipTh: 'สมุดอีกเล่ม', lifeIcon: '✅',
        lifeTh: 'เปิดสมุดอีกเล่มที่เบอร์ถูก โทรไปก็เจอร้าน',
        narrationTh: 'แต่ Chrome ไปถามสมุดอีกเล่ม แบบเข้ารหัส ได้เลขที่ถูก เลยเปิดได้ ตัวเว็บไม่ได้เสียเลย',
        setup: [...show(...storyBase), ...dim('sBad')],
        actions: [
          { type: 'trail', path: ['sGood', 'sPc'], tone: 'reply' },
          ...show('sAns2'),
          { type: 'moveAlong', actor: 'sAns2', path: ['sGood', 'sPc'], msPerHop: 1800, offset: ABOVE },
          { type: 'trail', path: ['sPc', 'sWeb'], tone: 'deliver' },
          ...show('sBox'),
          { type: 'moveAlong', actor: 'sBox', path: ['sPc', 'sWeb'], msPerHop: 2000, offset: { dx: 0, dy: 120 } },
          glow('sWeb'),
          ...show('sLbl2'),
        ],
      },
      {
        id: 's10', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'แบ่งของเป็นกล่อง ติดใบปะหน้าทุกกล่อง ออกนอกหมู่บ้านผ่านประตู และเปิดสมุดหาที่อยู่ก่อนส่ง',
        narrationTh: 'สรุปนะครับ ไฟล์ใหญ่ถูกแบ่งเป็น packet ทุกกล่องมีที่อยู่ผู้ส่ง และผู้รับ จะออกนอกหมู่บ้าน ต้องผ่าน Gateway และถ้ารู้แค่ชื่อเว็บ ต้องถาม DNS ก่อน ให้ได้เลขที่อยู่ของเว็บ',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'order',
    introTh: 'ตั้งแต่เราพิมพ์ชื่อเว็บ จนหน้าเว็บขึ้นจอ คอมทำอะไรบ้าง\nกดปุ่ม ⬆ ⬇ เลื่อนขั้นตอน ให้ขั้นแรกอยู่บนสุด\nเรียงเสร็จแล้ว กด ตรวจคำตอบ',
    items: [
      { id: 'type', textTh: 'พิมพ์ชื่อเว็บ เช่น huggingface.co' },
      { id: 'ask', textTh: 'ถาม DNS ว่าเว็บนี้ เลขที่อยู่อะไร' },
      { id: 'answer', textTh: 'DNS ตอบเลขที่อยู่ของเว็บกลับมา' },
      { id: 'box', textTh: 'ใส่คำขอหน้าเว็บลงกล่อง (packet) เขียนที่อยู่ผู้ส่ง และผู้รับ' },
      { id: 'gateway', textTh: 'ส่งกล่องออกไปทาง Gateway (ประตูออกหมู่บ้าน)' },
      { id: 'reply', textTh: 'เครื่องเว็บ ส่งหน้าเว็บกลับมา เป็นกล่องเล็ก ๆ หลายกล่อง' },
      { id: 'show', textTh: 'หน้าเว็บขึ้นจอ' },
    ],
    answer: ['type', 'ask', 'answer', 'box', 'gateway', 'reply', 'show'],
    explainTh: 'ลองถามตัวเองทีละขั้นนะ ขั้นนี้ ต้องได้อะไรมาก่อน ถึงจะทำได้\nคอมต้องรู้เลขที่อยู่ของเว็บก่อน ถึงจะเขียนที่อยู่ผู้รับบนกล่องได้\nกล่องต้องมีที่อยู่ครบ ถึงจะส่งออกไปได้\nหน้าเว็บจะขึ้นจอ ก็ต่อเมื่อกล่องจากเว็บมาถึงแล้ว',
    rightTh: 'ใช่เลย ต้องรู้เลขที่อยู่ก่อน ถึงจะเขียนบนกล่องได้ และต้องรอกล่องจากเว็บมาถึง หน้าเว็บถึงจะขึ้นจอ',
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'ถ้า DNS ให้เลขที่อยู่ของเว็บผิด จะเกิดอะไรขึ้น',
      choices: [
        { id: 'a', text: 'เปิดเว็บไม่ได้ เพราะกล่องถูกส่งไปผิดที่ ทั้งที่ตัวเว็บไม่ได้เสีย' },
        { id: 'b', text: 'เปิดได้ปกติ เพราะ Router รู้เองว่าเว็บอยู่ที่ไหน' },
        { id: 'c', text: 'ตัวเว็บจะเสีย คนทั้งโลกเปิดไม่ได้ไปด้วย' },
        { id: 'd', text: 'คอมจะแบ่งไฟล์เป็นกล่องเล็ก ๆ ไม่ได้' },
      ],
      correct: ['a'],
      explainTh: 'คอมเชื่อสมุดโทรศัพท์ ได้เลขอะไรมา ก็เขียนเลขนั้นเป็นที่อยู่ผู้รับ ถ้าเลขผิด กล่องก็ไปผิดที่ ส่วนเว็บจริงไม่ได้เป็นอะไร คนที่ใช้สมุดเล่มอื่น ก็เปิดได้ตามปกติ เหมือนเรื่อง huggingface.co ที่เน็ตบ้านเปิดไม่ได้ แต่ Chrome เปิดได้',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'ทำไมคอมต้องแบ่งไฟล์ใหญ่ เป็นกล่องเล็ก ๆ (packet) ก่อนส่ง',
      choices: [
        { id: 'a', text: 'ถนนจะได้ว่างให้คนอื่นใช้ด้วย และถ้ากล่องหาย ก็ส่งใหม่แค่กล่องเดียว' },
        { id: 'b', text: 'เพื่อให้ไฟล์ในเครื่องเล็กลงตลอดไป' },
        { id: 'c', text: 'เพราะแบ่งแล้ว ไม่ต้องเขียนที่อยู่บนกล่อง' },
        { id: 'd', text: 'เพราะไฟล์ใหญ่ส่งไม่ได้เลย ต้องลบบางส่วนทิ้งก่อน' },
      ],
      correct: ['a'],
      explainTh: 'นึกถึงถนนเส้นเดียว ถ้ารถคันใหญ่คันเดียว วิ่งยาว ๆ คนอื่นต้องรอ แต่ถ้าเป็นกล่องเล็ก ทุกคนสลับกันวิ่งได้ และถ้ามีของหายระหว่างทาง ก็เสียแค่ส่วนเล็ก ๆ ส่งใหม่ได้เร็ว ส่วนไฟล์ในเครื่อง ไม่ได้เปลี่ยนอะไร',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'ทำไมกล่องทุกใบ ต้องเขียนที่อยู่ผู้รับ (destination) ไว้ เขียนแค่กล่องแรกไม่พอ',
      choices: [
        { id: 'a', text: 'เพราะแต่ละกล่องเดินทางแยกกัน ไปรษณีย์ดูที่อยู่ทีละกล่อง' },
        { id: 'b', text: 'ไม่จำเป็น เขียนแค่กล่องแรกก็พอ กล่องอื่นวิ่งตามไปเอง' },
        { id: 'c', text: 'เพราะกล่องที่มีที่อยู่ จะวิ่งเร็วกว่า' },
        { id: 'd', text: 'เพราะผู้รับต้องเอาที่อยู่ ไปเปิดเว็บเอง' },
      ],
      correct: ['a'],
      explainTh: 'ไปรษณีย์หยิบกล่องไหนขึ้นมา ก็ดูที่อยู่บนกล่องนั้นเลย ไม่ได้จำว่ากล่องก่อนหน้าไปไหน กล่องที่ไม่มีที่อยู่ ไปรษณีย์ก็ไม่รู้ว่าจะส่งไปทางไหน',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'คอมเราจะส่งกล่องไปเว็บ ที่อยู่นอกหมู่บ้าน กล่องต้องไปที่ไหนก่อน เพราะอะไร',
      choices: [
        { id: 'a', text: 'Gateway เพราะเป็นประตูออกหมู่บ้าน ของที่จะออกนอกหมู่บ้าน ต้องผ่านทางนี้' },
        { id: 'b', text: 'DNS เพราะ DNS เป็นคนขนกล่องทุกกล่องไปให้' },
        { id: 'c', text: 'ไม่ต้องผ่านอะไร คอมส่งตรงถึงเว็บได้เลย' },
        { id: 'd', text: 'คอมเครื่องข้าง ๆ เพราะอยู่ใกล้ที่สุด' },
      ],
      correct: ['a'],
      explainTh: 'ในหมู่บ้านเดียวกัน ไปรษณีย์ในหมู่บ้านส่งให้กันได้เลย แต่ถ้าปลายทางอยู่นอกหมู่บ้าน ต้องมีคนพาออกไป คือ Router ฝั่งหมู่บ้านเรา ส่วน DNS แค่บอกเลขที่อยู่ ไม่ได้ช่วยขนกล่อง',
    },
    {
      id: 'q5',
      layer: 'en',
      prompt: 'What is the function of DNS?',
      promptTh: 'DNS มีหน้าที่อะไร',
      keywords: ['function', 'DNS'],
      choices: [
        { id: 'a', text: 'It translates domain names, such as www.cisco.com, into IP addresses.', textTh: 'เปลี่ยนชื่อเว็บ (domain name) เช่น www.cisco.com เป็น IP address (เลขที่อยู่ของเครื่อง)' },
        { id: 'b', text: 'It forwards packets between different networks.', textTh: 'ส่งต่อ packet ระหว่าง network ที่ต่างกัน (ข้ามหมู่บ้าน)' },
        { id: 'c', text: 'It connects end devices in the same LAN.', textTh: 'ต่อเครื่องใน LAN เดียวกัน ให้ถึงกัน' },
        { id: 'd', text: 'It splits large files into packets.', textTh: 'แบ่งไฟล์ใหญ่ เป็น packet' },
      ],
      correct: ['a'],
      explainTh: 'DNS คือสมุดโทรศัพท์ เรารู้ชื่อเว็บ (domain name) แต่คอมต้องใช้เลขที่อยู่ ถึงจะส่งกล่องได้ DNS เลยบอกเลขให้ ส่วนการพาของข้ามหมู่บ้าน เป็นงานของไปรษณีย์กลาง การต่อเครื่องในหมู่บ้าน เป็นงานของไปรษณีย์ในหมู่บ้าน ส่วนการแบ่งไฟล์เป็นกล่อง คอมทำเอง ไม่ใช่งานของ DNS',
    },
    {
      id: 'q6',
      layer: 'en',
      prompt: 'A user can open a website by typing its IP address, but not by typing its name. What is the most likely cause?',
      promptTh: 'ผู้ใช้เปิดเว็บได้ ถ้าพิมพ์ IP address (เลขที่อยู่) แต่พิมพ์ชื่อเว็บแล้วเปิดไม่ได้ สาเหตุน่าจะเป็นอะไรมากที่สุด',
      keywords: ['IP address', 'not by typing its name', 'most likely'],
      choices: [
        { id: 'a', text: 'DNS is not working correctly.', textTh: 'DNS ทำงานไม่ถูกต้อง' },
        { id: 'b', text: 'The network cable is unplugged.', textTh: 'สายแลนหลุด' },
        { id: 'c', text: 'The default gateway is not set on the PC.', textTh: 'คอมไม่ได้ตั้ง default gateway (ประตูออกหมู่บ้าน)' },
        { id: 'd', text: 'The web server is turned off.', textTh: 'เครื่องเว็บปิดอยู่' },
      ],
      correct: ['a'],
      explainTh: 'พิมพ์เลขที่อยู่ตรง ๆ แล้วเปิดได้ แปลว่าถนน ประตูออกหมู่บ้าน และตัวเว็บ ใช้ได้หมด เพราะกล่องไปถึงเว็บแล้ว ส่วนที่พัง คือขั้นเปลี่ยนชื่อเว็บเป็นเลขที่อยู่ ให้ดูว่าขั้นนี้ ใครเป็นคนทำ',
    },
    {
      id: 'q7',
      layer: 'en',
      prompt: 'A PC sends a packet to a web server on a remote network. Which two addresses are in the packet? (Choose two.)',
      promptTh: 'คอมส่ง packet ไปเครื่องเว็บ ที่อยู่ network อื่น (นอกหมู่บ้าน) ใน packet มีที่อยู่ 2 อย่างไหน (เลือก 2 ข้อ)',
      keywords: ['remote network', 'two'],
      choices: [
        { id: 'a', text: 'The source IP address of the PC', textTh: 'ที่อยู่ผู้ส่ง (source) เป็น IP address ของคอม' },
        { id: 'b', text: 'The destination IP address of the web server', textTh: 'ที่อยู่ผู้รับ (destination) เป็น IP address ของเครื่องเว็บ' },
        { id: 'c', text: 'The destination IP address of the default gateway', textTh: 'ที่อยู่ผู้รับ (destination) เป็น IP address ของ default gateway' },
        { id: 'd', text: 'The IP address of the DNS server, written on every packet', textTh: 'IP address ของ DNS เขียนไว้บนทุก packet' },
      ],
      correct: ['a', 'b'],
      explainTh: 'บนกล่องมีที่อยู่ผู้ส่ง กับที่อยู่ผู้รับ ผู้รับคือเครื่องที่กล่องต้องไปถึงจริง ๆ ถึงกล่องจะแวะประตูออกหมู่บ้านก่อน ที่อยู่ผู้รับบนกล่อง ก็ไม่เปลี่ยน ส่วน DNS เราแค่ถามเลขจากเขา ไม่ได้เขียนลงทุกกล่อง',
    },
  ],
}
