import type { Actor, Lesson, SceneAction } from '../types'

const hidden = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const hide = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'hide', actor }))

const moveIds = ['hA', 'hB', 'big', 'mLbl1', 'mLbl2', 'note']
const splitIds = ['fA', 'fB', 'fCab', 'fFile', 'f1', 'f2', 'f3', 'fLbl']
const shareIds = ['rA', 'rC', 'rSw', 'rSv', 'rc1', 'rc2', 'rc3', 'ra1', 'ra2', 'rb1', 'rb2', 'rLbl']
const lostIds = ['lA', 'lB', 'lCab', 'l1', 'l2', 'l4', 'lNew', 'lGone', 'lLbl']
const addrIds = ['aPc', 'aWeb', 'a1', 'a2', 'a3', 'aSrc', 'aDst', 'aWhy']
const replyIds = ['yPc', 'yWeb', 'yCab', 'yGo', 'yBack', 'yLbl1', 'yLbl2']
const gwIds = ['gV', 'gPc', 'gSw', 'gR', 'gNet', 'gWeb', 'gc1', 'gc2', 'gc3', 'gc4', 'gBox', 'gDst', 'gLbl']
const dnsIds = ['dPc', 'dDns', 'dWeb', 'dc1', 'dc2', 'dAsk', 'dLbl1', 'dLbl2']
const storyIds = ['sPc', 'sBad', 'sGood', 'sWeb', 'sc1', 'sc2', 'sc3', 'sAsk1', 'sAsk2', 'sLbl1', 'sLbl2']

const actors: Actor[] = [
  // ฉาก 1: ย้ายของทั้งห้อง
  { id: 'note', kind: 'label', x: 480, y: 40, label: 'ℹ️ คลิปมีเรื่อง Subnet mask ด้วย ส่วนนั้นข้ามไปก่อนได้ เรียนทีหลัง' },
  { id: 'hA', kind: 'house', x: 180, y: 210, label: 'บ้านเรา' },
  { id: 'hB', kind: 'house', x: 780, y: 210, label: 'บ้านเพื่อน' },
  { id: 'big', kind: 'box', x: 480, y: 210, label: 'ของทั้งห้อง' },
  { id: 'mLbl1', kind: 'label', x: 480, y: 410, label: '❌ ส่งทีเดียวทั้งก้อน ไม่ไหว' },
  { id: 'mLbl2', kind: 'label', x: 480, y: 470, label: '📦 แบ่งใส่กล่องเล็ก ๆ แล้วทยอยส่ง' },

  // ฉาก 2: ไฟล์ใหญ่ ถูกแบ่งเป็น packet
  hidden({ id: 'fA', kind: 'pc', x: 160, y: 220, label: 'คอมเรา' }),
  hidden({ id: 'fB', kind: 'pc', x: 800, y: 220, label: 'คอมเพื่อน' }),
  hidden({ id: 'fCab', kind: 'cable', x: 160, y: 220, to: 'fB' }),
  hidden({ id: 'fFile', kind: 'label', x: 160, y: 80, label: '🎬 ไฟล์คลิป ใหญ่มาก' }),
  hidden({ id: 'f1', kind: 'box', x: 160, y: 220, label: '1' }),
  hidden({ id: 'f2', kind: 'box', x: 160, y: 220, label: '2' }),
  hidden({ id: 'f3', kind: 'box', x: 160, y: 220, label: '3' }),
  hidden({ id: 'fLbl', kind: 'label', x: 480, y: 440, label: 'Packet = กล่องข้อมูลเล็ก ๆ ที่แบ่งจากไฟล์ใหญ่' }),

  // ฉาก 3: กล่องเล็ก สลับกันวิ่งบนถนนเดียวกัน
  hidden({ id: 'rA', kind: 'pc', x: 130, y: 110, label: 'คอมเรา' }),
  hidden({ id: 'rC', kind: 'pc', x: 130, y: 330, label: 'คอมน้อง' }),
  hidden({ id: 'rSw', kind: 'switch', x: 420, y: 220, label: 'Switch' }),
  hidden({ id: 'rSv', kind: 'server', x: 820, y: 220, label: 'เซิร์ฟเวอร์' }),
  hidden({ id: 'rc1', kind: 'cable', x: 130, y: 110, to: 'rSw' }),
  hidden({ id: 'rc2', kind: 'cable', x: 130, y: 330, to: 'rSw' }),
  hidden({ id: 'rc3', kind: 'cable', x: 420, y: 220, to: 'rSv' }),
  hidden({ id: 'ra1', kind: 'box', x: 130, y: 110 }),
  hidden({ id: 'ra2', kind: 'box', x: 130, y: 110 }),
  hidden({ id: 'rb1', kind: 'envelope', x: 130, y: 330 }),
  hidden({ id: 'rb2', kind: 'envelope', x: 130, y: 330 }),
  hidden({ id: 'rLbl', kind: 'label', x: 560, y: 490, label: '📦 ของเรา กับ ✉️ ของน้อง สลับกันวิ่ง ใช้ถนนพร้อมกัน' }),

  // ฉาก 4: กล่องหาย ส่งใหม่แค่กล่องเดียว
  hidden({ id: 'lA', kind: 'pc', x: 160, y: 220, label: 'คอมเรา' }),
  hidden({ id: 'lB', kind: 'pc', x: 800, y: 220, label: 'คอมเพื่อน' }),
  hidden({ id: 'lCab', kind: 'cable', x: 160, y: 220, to: 'lB' }),
  hidden({ id: 'l1', kind: 'box', x: 290, y: 220, label: '1' }),
  hidden({ id: 'l2', kind: 'box', x: 410, y: 220, label: '2' }),
  hidden({ id: 'l4', kind: 'box', x: 650, y: 220, label: '4' }),
  hidden({ id: 'lNew', kind: 'box', x: 160, y: 220, label: '3 ส่งใหม่' }),
  hidden({ id: 'lGone', kind: 'label', x: 530, y: 80, label: '❌ กล่อง 3 หาย' }),
  hidden({ id: 'lLbl', kind: 'label', x: 480, y: 440, label: 'หายกล่องเดียว ส่งใหม่แค่กล่องนั้น ไม่ต้องส่งทั้งไฟล์' }),

  // ฉาก 5: ที่อยู่บนกล่อง
  hidden({ id: 'aPc', kind: 'pc', x: 120, y: 190, label: 'คอมเรา' }),
  hidden({ id: 'aWeb', kind: 'server', x: 840, y: 190, label: 'เครื่องเว็บ' }),
  hidden({ id: 'a1', kind: 'box', x: 330, y: 190, label: 'กล่อง 1' }),
  hidden({ id: 'a2', kind: 'box', x: 480, y: 190, label: 'กล่อง 2' }),
  hidden({ id: 'a3', kind: 'box', x: 630, y: 190, label: 'กล่อง 3' }),
  hidden({ id: 'aSrc', kind: 'label', x: 480, y: 360, label: '📤 ผู้ส่ง (source) = คอมเรา' }),
  hidden({ id: 'aDst', kind: 'label', x: 480, y: 420, label: '📥 ผู้รับ (destination) = เครื่องเว็บ' }),
  hidden({ id: 'aWhy', kind: 'label', x: 480, y: 490, label: 'เขียนไว้ทุกกล่อง เพราะแต่ละกล่องเดินทางแยกกัน' }),

  // ฉาก 6: ที่อยู่ผู้รับ ใช้ส่ง / ที่อยู่ผู้ส่ง ใช้ตอบกลับ
  hidden({ id: 'yLbl1', kind: 'label', x: 480, y: 40, label: '📮 ไปรษณีย์ดูที่อยู่ผู้รับ เลยส่งถูกเครื่อง' }),
  hidden({ id: 'yLbl2', kind: 'label', x: 480, y: 95, label: '↩️ ที่อยู่ผู้ส่ง บอกว่าต้องตอบกลับไปที่ไหน' }),
  hidden({ id: 'yPc', kind: 'pc', x: 150, y: 250, label: 'คอมเรา' }),
  hidden({ id: 'yWeb', kind: 'server', x: 810, y: 250, label: 'เครื่องเว็บ' }),
  hidden({ id: 'yCab', kind: 'cable', x: 150, y: 250, to: 'yWeb' }),
  hidden({ id: 'yGo', kind: 'box', x: 150, y: 250, label: 'ไป: เครื่องเว็บ' }),
  hidden({ id: 'yBack', kind: 'box', x: 810, y: 420, label: 'กลับ: คอมเรา' }),

  // ฉาก 7: ออกนอกหมู่บ้าน ผ่าน Gateway
  hidden({ id: 'gV', kind: 'label', x: 210, y: 40, label: 'หมู่บ้านเรา' }),
  hidden({ id: 'gPc', kind: 'pc', x: 110, y: 150, label: 'คอมเรา' }),
  hidden({ id: 'gSw', kind: 'switch', x: 210, y: 300, label: 'Switch' }),
  hidden({ id: 'gR', kind: 'router', x: 430, y: 300, label: 'Gateway (Router)' }),
  hidden({ id: 'gNet', kind: 'cloud', x: 650, y: 300, label: 'Internet' }),
  hidden({ id: 'gWeb', kind: 'server', x: 850, y: 150, label: 'เครื่องเว็บ' }),
  hidden({ id: 'gc1', kind: 'cable', x: 110, y: 150, to: 'gSw' }),
  hidden({ id: 'gc2', kind: 'cable', x: 210, y: 300, to: 'gR' }),
  hidden({ id: 'gc3', kind: 'cable', x: 430, y: 300, to: 'gNet' }),
  hidden({ id: 'gc4', kind: 'cable', x: 650, y: 300, to: 'gWeb' }),
  hidden({ id: 'gBox', kind: 'box', x: 110, y: 150 }),
  hidden({ id: 'gDst', kind: 'label', x: 480, y: 445, label: '📦 ผู้รับบนกล่อง = เครื่องเว็บ (ไม่ใช่ Gateway)' }),
  hidden({ id: 'gLbl', kind: 'label', x: 480, y: 505, label: 'ออกนอกหมู่บ้าน ต้องผ่าน Gateway (ประตูออกหมู่บ้าน)' }),

  // ฉาก 8: DNS = สมุดโทรศัพท์
  hidden({ id: 'dPc', kind: 'pc', x: 150, y: 260, label: 'คอมเรา' }),
  hidden({ id: 'dDns', kind: 'server', x: 480, y: 100, label: 'DNS (สมุดโทรศัพท์)' }),
  hidden({ id: 'dWeb', kind: 'server', x: 810, y: 260, label: 'huggingface.co' }),
  hidden({ id: 'dc1', kind: 'cable', x: 150, y: 260, to: 'dDns' }),
  hidden({ id: 'dc2', kind: 'cable', x: 150, y: 260, to: 'dWeb' }),
  hidden({ id: 'dAsk', kind: 'envelope', x: 150, y: 260 }),
  hidden({ id: 'dLbl1', kind: 'label', x: 480, y: 420, label: '1. ถาม DNS: huggingface.co เลขที่อยู่อะไร' }),
  hidden({ id: 'dLbl2', kind: 'label', x: 480, y: 480, label: '2. ได้เลขที่อยู่ แล้วค่อยส่งกล่องไปที่เว็บ' }),

  // ฉาก 9: เรื่องจริง สมุดให้เลขผิด
  hidden({ id: 'sPc', kind: 'pc', x: 150, y: 290, label: 'คอมเรา' }),
  hidden({ id: 'sBad', kind: 'server', x: 360, y: 100, label: '❌ สมุดของเน็ตบ้าน' }),
  hidden({ id: 'sGood', kind: 'server', x: 640, y: 100, label: '✅ สมุดอีกเล่ม 🔒' }),
  hidden({ id: 'sWeb', kind: 'server', x: 810, y: 290, label: 'huggingface.co' }),
  hidden({ id: 'sc1', kind: 'cable', x: 150, y: 290, to: 'sBad' }),
  hidden({ id: 'sc2', kind: 'cable', x: 150, y: 290, to: 'sGood' }),
  hidden({ id: 'sc3', kind: 'cable', x: 150, y: 290, to: 'sWeb' }),
  hidden({ id: 'sAsk1', kind: 'envelope', x: 150, y: 290 }),
  hidden({ id: 'sAsk2', kind: 'envelope', x: 150, y: 290 }),
  hidden({ id: 'sLbl1', kind: 'label', x: 480, y: 450, label: '❌ เน็ตบ้าน: สมุดให้เลขผิด เปิดไม่ได้' }),
  hidden({ id: 'sLbl2', kind: 'label', x: 480, y: 505, label: '✅ Chrome: ถามสมุดอีกเล่ม ได้เลขถูก เปิดได้' }),

  // ฉาก 10: สรุป
  hidden({ id: 'sum1', kind: 'label', x: 480, y: 70, label: 'Packet = กล่องเล็ก ๆ ที่แบ่งจากไฟล์ใหญ่' }),
  hidden({ id: 'sum2', kind: 'label', x: 480, y: 160, label: 'ทุกกล่องมีที่อยู่ ผู้ส่ง (source) และผู้รับ (destination)' }),
  hidden({ id: 'sum3', kind: 'label', x: 480, y: 250, label: 'ออกนอกหมู่บ้าน ต้องผ่าน Gateway (ประตูออกหมู่บ้าน)' }),
  hidden({ id: 'sum4', kind: 'label', x: 480, y: 340, label: 'DNS = สมุดโทรศัพท์ เปลี่ยนชื่อเว็บเป็นเลขที่อยู่' }),
  hidden({ id: 'sum5', kind: 'label', x: 480, y: 430, label: 'สมุดให้เลขผิด เว็บก็เปิดไม่ได้ ทั้งที่เว็บไม่ได้เสีย' }),
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
    { youtubeId: 'jjs02wLiXmQ', titleTh: 'IPv4, Subnet mask, Gateway, DNS คืออะไร ทำงานอย่างไร', channel: '9hua Training' },
  ],
  terms: ['packet', 'source', 'destination', 'dns', 'gateway', 'router', 'switch', 'internet', 'ip-address', 'network'],

  scenes: {
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1',
        narrationTh: 'ลองนึกดูนะครับ เราจะย้ายของทั้งห้อง ไปบ้านเพื่อนต่างจังหวัด ของเยอะมาก ส่งทีเดียวทั้งก้อนไม่ไหว เราก็แบ่งใส่กล่องเล็ก ๆ หลายกล่อง แล้วทยอยส่งไป',
        actions: [{ type: 'highlight', actor: 'big' }],
      },
      {
        id: 's2',
        narrationTh: 'คอมก็ทำแบบนี้เลย ไฟล์ใหญ่ ๆ เช่น คลิป หรือรูป จะถูกแบ่งเป็นกล่องเล็ก ๆ ก่อนส่ง กล่องเล็กแต่ละกล่อง เรียกว่า packet',
        actions: [
          ...hide(...moveIds),
          ...show(...splitIds),
          { type: 'move', actor: 'f1', x: 640, y: 220, ms: 2400 },
          { type: 'move', actor: 'f2', x: 520, y: 220, ms: 2400 },
          { type: 'move', actor: 'f3', x: 400, y: 220, ms: 2400 },
        ],
      },
      {
        id: 's3',
        narrationTh: 'ทำไมต้องแบ่ง ข้อแรก จะได้ไม่มีใครใช้ถนนคนเดียวนาน ๆ กล่องของเรา กับกล่องของคนอื่น สลับกันวิ่งได้ ทุกคนเลยใช้ถนนพร้อมกันได้ ไม่ต้องรอใครส่งจนเสร็จ',
        actions: [
          ...hide(...splitIds),
          ...show(...shareIds),
          { type: 'highlight', actor: 'rc3' },
          { type: 'moveAlong', actor: 'ra1', path: ['rA', 'rSw', 'rSv'], msPerHop: 900 },
          { type: 'moveAlong', actor: 'rb1', path: ['rC', 'rSw', 'rSv'], msPerHop: 1150 },
          { type: 'moveAlong', actor: 'ra2', path: ['rA', 'rSw', 'rSv'], msPerHop: 1400 },
          { type: 'moveAlong', actor: 'rb2', path: ['rC', 'rSw', 'rSv'], msPerHop: 1650 },
        ],
      },
      {
        id: 's4',
        narrationTh: 'ข้อสอง ถ้ามีกล่องหายระหว่างทาง ก็ส่งใหม่แค่กล่องนั้น ไม่ต้องส่งใหม่ทั้งไฟล์ เร็วกว่ากันเยอะ',
        actions: [
          ...hide(...shareIds),
          ...show(...lostIds),
          { type: 'move', actor: 'lNew', x: 530, y: 220, ms: 2500 },
        ],
      },
      {
        id: 's5',
        narrationTh: 'บนกล่องทุกใบ เขียนที่อยู่สองอย่าง ที่อยู่ผู้ส่ง เรียกว่า source และที่อยู่ผู้รับ เรียกว่า destination ต้องเขียนทุกใบ เพราะแต่ละกล่องเดินทางแยกกัน',
        actions: [
          ...hide(...lostIds),
          ...show(...addrIds),
        ],
      },
      {
        id: 's6',
        narrationTh: 'ไปรษณีย์ดูที่อยู่ผู้รับ เลยส่งกล่องถูกเครื่อง ส่วนที่อยู่ผู้ส่ง มีไว้ให้ปลายทาง รู้ว่าต้องตอบกลับไปที่ไหน',
        actions: [
          ...hide(...addrIds),
          ...show(...replyIds),
          { type: 'move', actor: 'yGo', x: 560, y: 250, ms: 2500 },
          { type: 'move', actor: 'yBack', x: 310, y: 420, ms: 3000 },
        ],
      },
      {
        id: 's7',
        narrationTh: 'ถ้าผู้รับอยู่นอกหมู่บ้าน คอมจะส่งกล่องไปที่ Gateway ก่อน คือประตูออกหมู่บ้าน บนกล่อง ที่อยู่ผู้รับ เป็นเครื่องเว็บเหมือนเดิมนะ แล้ว Router ส่งต่อไป จนถึงเว็บ',
        actions: [
          ...hide(...replyIds),
          ...show(...gwIds),
          { type: 'highlight', actor: 'gR' },
          { type: 'moveAlong', actor: 'gBox', path: ['gPc', 'gSw', 'gR', 'gNet', 'gWeb'], msPerHop: 1100 },
        ],
      },
      {
        id: 's8',
        narrationTh: 'เวลาจะโทรหาร้าน แต่รู้แค่ชื่อ เราก็เปิดสมุดโทรศัพท์หาเบอร์ คอมก็เหมือนกัน เรารู้แค่ชื่อเว็บ แต่คอมต้องใช้เลขที่อยู่ เลยถามเครื่องที่ชื่อ DNS ให้บอกเลขที่อยู่ของเว็บ',
        actions: [
          ...hide(...gwIds),
          ...show(...dnsIds),
          { type: 'moveAlong', actor: 'dAsk', path: ['dPc', 'dDns', 'dPc', 'dWeb'], msPerHop: 1300 },
        ],
      },
      {
        id: 's9',
        narrationTh: 'เรื่องจริงเลยนะ เน็ตบ้านเปิด huggingface.co ไม่ได้ เพราะสมุดของเน็ตบ้าน ให้เลขที่อยู่ผิด แต่ Chrome ไปถามสมุดอีกเล่ม แบบเข้ารหัส ได้เลขที่ถูก เลยเปิดได้ ตัวเว็บไม่ได้เสียเลย',
        actions: [
          ...hide(...dnsIds),
          ...show(...storyIds),
          { type: 'moveAlong', actor: 'sAsk1', path: ['sPc', 'sBad'], msPerHop: 1300 },
          { type: 'moveAlong', actor: 'sAsk2', path: ['sPc', 'sGood', 'sPc', 'sWeb'], msPerHop: 1500 },
        ],
      },
      {
        id: 's10',
        narrationTh: 'สรุปนะครับ ไฟล์ใหญ่ถูกแบ่งเป็น packet ทุกกล่องมีที่อยู่ผู้ส่ง และผู้รับ จะออกนอกหมู่บ้าน ต้องผ่าน Gateway และก่อนส่ง ต้องถาม DNS ให้ได้เลขที่อยู่ของเว็บ',
        actions: [
          ...hide(...storyIds),
          ...show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
        ],
      },
    ],
  },

  lab: {
    kind: 'order',
    introTh: 'เราพิมพ์ชื่อเว็บ จนหน้าเว็บขึ้นจอ คอมทำอะไรบ้าง\nกดปุ่ม ⬆ ⬇ เลื่อนขั้นตอน ให้ขั้นแรกอยู่บนสุด\nเรียงเสร็จแล้ว กด ตรวจคำตอบ',
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
      explainTh: 'DNS คือสมุดโทรศัพท์ เรารู้ชื่อเว็บ แต่คอมต้องใช้เลขที่อยู่ ถึงจะส่งกล่องได้ DNS เลยบอกเลขให้ ส่วนการพาของข้ามหมู่บ้าน เป็นงานของไปรษณีย์กลาง และการต่อเครื่องในหมู่บ้าน เป็นงานของไปรษณีย์ในหมู่บ้าน',
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
