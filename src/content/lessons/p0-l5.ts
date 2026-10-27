import type { Actor, Lesson, SceneAction } from '../types'

// ฉากแบบ v2 (ดู p0-l4): ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })

// ห่อทีละชั้น: ฉากต่อไปเห็นชั้นที่ห่อไปแล้วตั้งแต่เริ่ม
const wrap1 = ['wData', 'wSeg', 'wL2']
const wrap2 = [...wrap1, 'wPkt', 'wL3']
const wrap3 = [...wrap2, 'wTruck', 'wL4']
const osiIds = ['oHead', 'o7', 'o6', 'o5', 'o4', 'o3', 'o2', 'o1']

const actors: Actor[] = [
  // ฉาก 0: ปัญหา เปลี่ยนสายแลนเป็นไวไฟ ต้องเตรียมใหม่หมดไหม
  h({ id: 'zLap', kind: 'laptop', x: 200, y: 200, label: 'โน้ตบุ๊กเรา' }),
  h({ id: 'zSw', kind: 'switch', x: 480, y: 200, label: 'สายแลน' }),
  h({ id: 'zAp', kind: 'router', x: 760, y: 200, label: 'ไวไฟ' }),
  h({ id: 'zCab', kind: 'cable', x: 200, y: 200, to: 'zSw' }),
  h({ id: 'zQ', kind: 'label', x: 480, y: 420, label: '❓ ถอดสายแลน ไปต่อไวไฟ ต้องเตรียมของใหม่หมดไหม' }),

  // ฉาก 1: ส่งของขวัญ ห่อเป็นชั้น ๆ
  h({ id: 'gMe', kind: 'person', x: 130, y: 170, label: 'เรา' }),
  h({ id: 'gGift', kind: 'box', x: 480, y: 170, label: 'ของขวัญ ห่อหลายชั้น' }),
  h({ id: 'gFriend', kind: 'house', x: 830, y: 170, label: 'บ้านเพื่อน' }),
  h({ id: 'gLbl1', kind: 'label', x: 480, y: 320, label: '🎁 ส่งของ ไม่ได้ส่งเปล่า ๆ · ห่อเป็นชั้น ๆ' }),
  h({ id: 'gLbl2', kind: 'label', x: 480, y: 390, label: 'ของอยู่ในสุด · ห่อทับไปทีละชั้น' }),
  h({ id: 'gLbl3', kind: 'label', x: 480, y: 460, label: '💬 ของชั้นในสุดของคอม เช่น ข้อความแชต = data' }),

  // ฉาก 2-5: ห่อทีละชั้น จากในออกนอก
  h({ id: 'wData', kind: 'envelope', x: 110, y: 150, label: 'data' }),
  h({ id: 'wSeg', kind: 'box', x: 290, y: 150, label: 'segment' }),
  h({ id: 'wPkt', kind: 'box', x: 470, y: 150, label: 'packet' }),
  h({ id: 'wTruck', kind: 'truck', x: 650, y: 150, label: 'frame' }),
  h({ id: 'wDst', kind: 'pc', x: 850, y: 150, label: 'คอมเพื่อน' }),
  h({ id: 'wRoad', kind: 'cable', x: 650, y: 150, to: 'wDst' }),
  h({ id: 'wSig', kind: 'card', x: 650, y: 70, lines: ['〰️ bits'], tone: 'deliver' }),
  h({ id: 'wTop', kind: 'label', x: 480, y: 30, label: '🎁 ห่อทับทีละชั้น = encapsulation' }),
  h({ id: 'wL2', kind: 'label', x: 480, y: 290, label: '📦 ใส่เลข port = ส่งให้โปรแกรมไหน → segment' }),
  h({ id: 'wL3', kind: 'label', x: 480, y: 350, label: '🏷️ ติดใบปะหน้า IP ผู้ส่ง ผู้รับ → packet' }),
  h({ id: 'wL4', kind: 'label', x: 480, y: 410, label: '🚚 ขึ้นรถในหมู่บ้าน ติดป้าย MAC → frame' }),
  h({ id: 'wL5', kind: 'label', x: 480, y: 470, label: '〰️ ออกถนน เป็นสัญญาณ บนสาย หรือไวไฟ → bits' }),

  // ฉาก 6: ผู้รับแกะย้อนกลับ จากนอกเข้าใน
  h({ id: 'uFrame', kind: 'truck', x: 130, y: 150, label: 'frame' }),
  h({ id: 'uPkt', kind: 'box', x: 330, y: 150, label: 'packet' }),
  h({ id: 'uSeg', kind: 'box', x: 530, y: 150, label: 'segment' }),
  h({ id: 'uData', kind: 'envelope', x: 730, y: 150, label: 'data' }),
  h({ id: 'uMv', kind: 'card', x: 130, y: 70, lines: ['📬 ของที่มาถึง'], tone: 'deliver' }),
  h({ id: 'uMv2', kind: 'card', x: 530, y: 70, lines: ['📬 ของที่มาถึง'], tone: 'deliver' }),
  h({ id: 'uTop', kind: 'label', x: 480, y: 30, label: '📬 ผู้รับแกะจากนอกเข้าใน = de-encapsulation' }),
  h({ id: 'uL1', kind: 'label', x: 480, y: 290, label: '① รับ bits จากถนน · ดู MAC ส่งมาให้เราไหม' }),
  h({ id: 'uL2', kind: 'label', x: 480, y: 350, label: '② ดู IP ใช่เครื่องเราไหม' }),
  h({ id: 'uL3', kind: 'label', x: 480, y: 410, label: '③ ดู port ให้โปรแกรมไหน' }),
  h({ id: 'uL4', kind: 'label', x: 480, y: 470, label: '④ ได้ data คือข้อความแชต' }),

  // ฉาก 7: เปลี่ยนถนน สายแลน ↔ ไวไฟ กล่องข้างในเหมือนเดิม
  h({ id: 'aLap', kind: 'laptop', x: 130, y: 150, label: 'เสียบสายแลน' }),
  h({ id: 'aSw', kind: 'switch', x: 480, y: 150, label: 'Switch' }),
  h({ id: 'aCab', kind: 'cable', x: 130, y: 150, to: 'aSw' }),
  h({ id: 'aBox', kind: 'card', x: 290, y: 150, lines: ['📦 กล่องเดิม'], tone: 'deliver' }),
  h({ id: 'bLap', kind: 'laptop', x: 130, y: 330, label: 'ต่อไวไฟ' }),
  h({ id: 'bAp', kind: 'router', x: 480, y: 330, label: 'กล่องเน็ตบ้าน (ไวไฟ)' }),
  h({ id: 'bBox', kind: 'card', x: 290, y: 330, lines: ['📦 กล่องเดิม'], tone: 'deliver' }),
  h({ id: 'rL1', kind: 'label', x: 480, y: 450, label: '🔄 เปลี่ยนแค่ชั้นนอก: รถ กับ ถนน' }),
  h({ id: 'rL2', kind: 'label', x: 480, y: 505, label: '📦 ข้างใน data · port · IP ผู้รับ เหมือนเดิม' }),

  // ฉาก 8: OSI 7 ชั้น (ชั้น 1-4 ติดสัญลักษณ์เดียวกับตอนห่อ) / 8b: TCP/IP 4 ชั้น
  h({ id: 'oHead', kind: 'label', x: 250, y: 30, label: 'OSI model · 7 ชั้น' }),
  h({ id: 'o7', kind: 'label', x: 250, y: 92, label: '7 Application · ทางคุยโปรแกรม' }),
  h({ id: 'o6', kind: 'label', x: 250, y: 154, label: '6 Presentation · จัดรูปแบบ' }),
  h({ id: 'o5', kind: 'label', x: 250, y: 216, label: '5 Session · เปิดปิดการคุย' }),
  h({ id: 'o4', kind: 'label', x: 250, y: 278, label: '📦 4 Transport · segment' }),
  h({ id: 'o3', kind: 'label', x: 250, y: 340, label: '🏷️ 3 Network · IP · packet' }),
  h({ id: 'o2', kind: 'label', x: 250, y: 402, label: '🚚 2 Data Link · MAC · frame' }),
  h({ id: 'o1', kind: 'label', x: 250, y: 464, label: '〰️ 1 Physical · bits' }),
  h({ id: 'tHead', kind: 'label', x: 720, y: 30, label: 'TCP/IP model · 4 ชั้น' }),
  h({ id: 'tApp', kind: 'label', x: 720, y: 154, label: 'TCP/IP: Application = 5-7' }),
  h({ id: 'tTra', kind: 'label', x: 720, y: 278, label: 'TCP/IP: Transport = 4' }),
  h({ id: 'tInt', kind: 'label', x: 720, y: 340, label: 'TCP/IP: Internet · IP = 3' }),
  h({ id: 'tNa', kind: 'label', x: 720, y: 433, label: 'TCP/IP: Network Access = 1-2' }),

  // ฉาก 9: เลขชั้นที่ข้อสอบชอบถาม
  h({ id: 'nTop', kind: 'label', x: 590, y: 30, label: '📝 ข้อสอบชอบถาม: Layer = ชั้น' }),
  h({ id: 'nSw', kind: 'switch', x: 130, y: 90, label: 'Switch' }),
  h({ id: 'nR', kind: 'router', x: 130, y: 260, label: 'Router' }),
  h({ id: 'nPc', kind: 'pc', x: 130, y: 420, label: 'คอมปลายทาง' }),
  h({ id: 'nL2', kind: 'label', x: 590, y: 90, label: 'Layer 2 · Data Link · ดู MAC' }),
  h({ id: 'nL3', kind: 'label', x: 590, y: 260, label: 'Layer 3 · Network · ดู IP' }),
  h({ id: 'nL4', kind: 'label', x: 590, y: 420, label: 'Layer 4 · Transport · ดู port' }),
  h({ id: 'nLx', kind: 'label', x: 590, y: 495, label: 'Layer 1 = ถนน · Layer 7 = โปรแกรม' }),

  // ฉาก 10: สรุป + ปูทางภาค 1
  h({ id: 'sum1', kind: 'label', x: 480, y: 50, label: '📦 ส่ง: ห่อจากในออกนอก = encapsulation' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 130, label: '📬 รับ: แกะจากนอกเข้าใน = de-encapsulation' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 210, label: 'data → segment → packet → frame → bits' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 290, label: 'OSI 7 ชั้น · TCP/IP 4 ชั้น · ข้อสอบถามทั้งคู่' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 370, label: 'แยกชั้น: เปลี่ยนชั้นหนึ่ง ไม่ต้องรื้อชั้นอื่น' }),
  h({ id: 'sum6', kind: 'label', x: 480, y: 460, label: '➡️ ภาค 1: เลขฐานสอง · IPv4 · Subnet' }),
]

export const lesson: Lesson = {
  id: 'p0-l5',
  part: 0,
  order: 6,
  status: 'ready',
  titleTh: 'การห่อของเป็นชั้น ๆ',
  analogyTh: 'ห่อพัสดุทีละชั้น',
  ciscoModules: ['ITN 3'],
  videos: [
    { youtubeId: '4DkRRKjFCsk', titleTh: 'OSI 7 Layers (Short Version with Video Graphics)', channel: '9hua Training',
      noteTh: 'คลิปนี้สั้น เล่า OSI ครบ 7 ชั้น ดูให้เห็นภาพรวมก่อน จำชื่อชั้นไม่ได้ ไม่เป็นไร เดี๋ยวภาพทบทวนเล่าทีละชั้น ด้วยเรื่องห่อพัสดุ' },
    { youtubeId: 'e7s_D4YZznA', titleTh: 'TCP IP Model and OSI Model ฉบับคนทำงานจริง EP.1', channel: '9hua Training',
      noteTh: 'คลิปเสริมนี้ยาว เล่าแบบคนทำงานจริง ช่วงไหนที่บทนี้ยังไม่ได้สอน ดูผ่าน ๆ ได้ จับแค่ว่า OSI มี 7 ชั้น TCP/IP มี 4 ชั้น ฝั่งส่งห่อจากในออกนอก ฝั่งรับแกะย้อนกลับ' },
  ],
  terms: [
    'layer', 'osi-model', 'tcp-ip-model', 'encapsulation', 'de-encapsulation', 'pdu',
    'data', 'segment', 'packet', 'frame', 'bits', 'port',
    'application-layer', 'presentation-layer', 'session-layer', 'transport-layer', 'network-layer', 'internet-layer', 'data-link-layer', 'physical-layer', 'network-access-layer',
    'ip-address', 'mac-address', 'switch', 'router',
  ],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's0', chipTh: 'ปัญหา', lifeIcon: '🔌',
        lifeTh: 'เปลี่ยนจากส่งของทางรถเป็นทางเรือ ต้องแกะของในกล่องออกมาแพ็กใหม่หมดไหม',
        narrationTh: 'ถ้าเราถอดสายแลน แล้วมาต่อไวไฟแทน แชตที่กำลังส่งอยู่ คอมต้องเตรียมใหม่หมดไหม คำตอบอยู่ที่วิธีที่คอมห่อของ มาดูกันครับ',
        setup: show('zLap', 'zSw', 'zAp', 'zCab'),
        actions: [glow('zLap'), ...show('zQ')],
      },
      {
        id: 's1', chipTh: 'ห่อเป็นชั้น', lifeIcon: '🎁',
        lifeTh: 'ส่งของขวัญให้เพื่อน เราห่อเป็นชั้น ๆ ของอยู่ในสุด',
        narrationTh: 'ลองนึกดูนะครับ จะส่งของขวัญให้เพื่อน เราไม่ได้ส่งของเปล่า ๆ แต่ห่อเป็นชั้น ๆ ของอยู่ในสุด แล้วห่อทับทีละชั้น คอมก็ส่งแบบนี้ ของชั้นในสุด เช่น ข้อความแชต เรียกว่า data',
        setup: show('gMe', 'gGift', 'gFriend'),
        actions: [glow('gGift'), ...show('gLbl1', 'gLbl2', 'gLbl3')],
      },
      {
        id: 's2', chipTh: 'segment', lifeIcon: '📦',
        lifeTh: 'ใส่ของลงกล่อง แล้วเขียนว่าให้ใครในบ้าน',
        narrationTh: 'เริ่มห่อ ใส่ของลงกล่อง แล้วเขียนว่าให้ใคร เพราะบ้านหลังหนึ่งมีหลายคน คอมก็มีหลายโปรแกรม เลยใส่เลข port บอกว่าส่งให้โปรแกรมไหน กล่องชั้นนี้ เรียกว่า segment',
        setup: show('wData'),
        actions: [...show('wSeg', 'wL2'), glow('wSeg')],
      },
      {
        id: 's3', chipTh: 'packet', lifeIcon: '🏷️',
        lifeTh: 'ติดใบปะหน้า เขียนบ้านเลขที่ของผู้ส่งและผู้รับ',
        narrationTh: 'ชั้นต่อไป ติดใบปะหน้า เขียน IP หรือบ้านเลขที่ ของผู้ส่งและผู้รับ Router หรือไปรษณีย์กลาง ดูชั้นนี้ เพื่อส่งข้ามหมู่บ้าน กล่องที่ติดใบปะหน้าแล้ว เรียกว่า packet',
        setup: show(...wrap1),
        actions: [...show('wPkt', 'wL3'), glow('wPkt')],
      },
      {
        id: 's4', chipTh: 'frame', lifeIcon: '🚚',
        lifeTh: 'เอากล่องขึ้นรถในหมู่บ้าน รถติดป้ายบอกว่าจะไปจอดบ้านไหน',
        narrationTh: 'แล้วเอากล่องขึ้นรถในหมู่บ้าน ติดป้าย MAC ผู้รับ บทก่อนบอกว่า MAC อยู่บนกล่อง จริง ๆ ติดอยู่บนรถ Switch ดูแค่ป้ายนี้ ข้ามหมู่บ้านก็เปลี่ยนรถ ชั้นนี้เรียกว่า frame',
        setup: show(...wrap2),
        actions: [...show('wTruck', 'wL4'), glow('wTruck')],
      },
      {
        id: 's5', chipTh: 'bits', lifeIcon: '🛣️',
        lifeTh: 'รถวิ่งออกไปบนถนน ถนนอาจเป็นทางลาดยางหรือทางน้ำ',
        narrationTh: 'ชั้นนอกสุด คือถนน ทั้งหมดถูกส่งออกไป เป็นสัญญาณไฟฟ้าบนสายแลน หรือคลื่นไวไฟ ทีละ bit เรียกว่า bits การห่อทับทีละชั้นแบบนี้ เรียกว่า encapsulation',
        setup: show(...wrap3),
        actions: [
          ...show('wRoad', 'wDst', 'wTop', 'wL5'),
          { type: 'trail', path: ['wTruck', 'wDst'], tone: 'deliver' },
          ...show('wSig'),
          { type: 'moveAlong', actor: 'wSig', path: ['wTruck', 'wDst'], msPerHop: 2500, offset: { dx: 0, dy: -80 } },
        ],
      },
      {
        id: 's6', chipTh: 'แกะชั้นนอก', lifeIcon: '📬',
        lifeTh: 'เพื่อนรับของ ดูป้ายรถว่ามาส่งบ้านเราไหม แล้วดูใบปะหน้าว่าใช่บ้านเลขที่เราไหม',
        narrationTh: 'ฝั่งผู้รับ ก็แกะย้อนกลับ จากนอกเข้าใน รับสัญญาณมา ดู MAC ว่าส่งมาให้เราไหม แล้วดู IP ว่าใช่เครื่องเราไหม',
        setup: show('uFrame', 'uPkt', 'uSeg', 'uData'),
        actions: [
          { type: 'trail', path: ['uFrame', 'uPkt', 'uSeg'], tone: 'deliver' },
          ...show('uMv'),
          { type: 'moveAlong', actor: 'uMv', path: ['uFrame', 'uPkt', 'uSeg'], msPerHop: 1800, offset: { dx: 0, dy: -80 } },
          ...show('uL1', 'uL2'),
        ],
      },
      {
        id: 's6b', chipTh: 'ได้ data', lifeIcon: '🎁',
        lifeTh: 'ใช่บ้านเราแล้ว ก็ดูว่าให้ใครในบ้าน แล้วเปิดกล่อง เจอของขวัญ',
        narrationTh: 'ใช่เครื่องเราแล้ว ก็ดู port ว่าให้โปรแกรมไหน จนได้ข้อความแชต การแกะย้อนกลับแบบนี้ เรียกว่า de-encapsulation',
        // ห่อชั้นนอกแกะไปแล้วจากฉากก่อน: ซองจอดอยู่เหนือ segment
        setup: [...show('uFrame', 'uPkt', 'uSeg', 'uData', 'uL1', 'uL2', 'uMv2'), { type: 'trail', path: ['uFrame', 'uPkt', 'uSeg'], tone: 'deliver' }],
        actions: [
          { type: 'trail', path: ['uSeg', 'uData'], tone: 'deliver' },
          { type: 'moveAlong', actor: 'uMv2', path: ['uSeg', 'uData'], msPerHop: 1800, offset: { dx: 0, dy: -80 } },
          glow('uData'),
          ...show('uL3', 'uL4', 'uTop'),
        ],
      },
      {
        id: 's7', chipTh: 'ทำไมแยกชั้น', lifeIcon: '🔄',
        lifeTh: 'เปลี่ยนจากรถเป็นเรือ ก็เปลี่ยนแค่วิธีขน กล่องข้างในไม่ต้องแพ็กใหม่',
        narrationTh: 'ทำไมต้องแยกเป็นชั้น เพราะแต่ละคน ทำแค่งานของตัวเอง และเปลี่ยนชั้นหนึ่ง ไม่ต้องรื้อชั้นอื่น เช่น เปลี่ยนจากสายแลน มาต่อไวไฟ ก็เปลี่ยนแค่รถกับถนน กล่องข้างในไม่ต้องห่อใหม่',
        setup: show('aLap', 'aSw', 'aCab', 'bLap', 'bAp'),
        actions: [
          { type: 'trail', path: ['aLap', 'aSw'], tone: 'deliver' },
          { type: 'trail', path: ['bLap', 'bAp'], tone: 'deliver' },
          ...show('aBox', 'bBox'),
          { type: 'moveAlong', actor: 'aBox', path: ['aLap', 'aSw'], msPerHop: 2000, offset: { dx: 220, dy: 0 } },
          { type: 'moveAlong', actor: 'bBox', path: ['bLap', 'bAp'], msPerHop: 2000, offset: { dx: 220, dy: 0 } },
          ...show('rL1', 'rL2'),
        ],
      },
      {
        id: 's8', chipTh: 'OSI', lifeIcon: '🏢',
        lifeTh: 'ตึกเจ็ดชั้น นับชั้นหนึ่งจากพื้นถนนขึ้นไป',
        narrationTh: 'ข้อสอบเรียกชั้นว่า Layer นับเลขจากถนนขึ้นไป ชั้นหนึ่งถึงสี่ คือถนน รถ ใบปะหน้า กล่อง OSI model มีเจ็ดชั้น จำนวนนี้เป็นข้อตกลงที่ใช้กันทั่วโลก ไม่มีสูตร',
        setup: [],
        actions: show(...osiIds),
      },
      {
        id: 's8b', chipTh: 'TCP/IP', lifeIcon: '🏠',
        lifeTh: 'บ้านอีกแบบ เอาบางชั้นมารวมเป็นห้องเดียว เหลือสี่ชั้น',
        narrationTh: 'ส่วน TCP/IP model รวมบางชั้นเข้าด้วยกัน เหลือสี่ชั้น ก็เป็นข้อตกลงเหมือนกัน ข้อสอบถามทั้งสองแบบ',
        setup: show(...osiIds),
        actions: show('tHead', 'tApp', 'tTra', 'tInt', 'tNa'),
      },
      {
        id: 's9', chipTh: 'เลขชั้น', lifeIcon: '📮',
        lifeTh: 'แต่ละคนดูแค่ชั้นที่ตัวเองใช้ ไปรษณีย์ในหมู่บ้านดูป้ายรถ ไปรษณีย์กลางดูใบปะหน้า',
        narrationTh: 'ข้อสอบชอบถามเลขชั้น ชั้นที่สอง Data Link layer ดู MAC เป็นงานของ Switch ชั้นที่สาม Network layer ดู IP เป็นงานของ Router ส่วนชั้นที่สี่ Transport layer ดู port',
        setup: show('nTop', 'nSw', 'nR', 'nPc'),
        actions: [glow('nSw'), glow('nR'), ...show('nL2', 'nL3', 'nL4', 'nLx')],
      },
      {
        id: 's10', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'ส่งของห่อจากในออกนอก รับของแกะจากนอกเข้าใน',
        narrationTh: 'สรุปนะครับ ส่งของ ห่อจากในออกนอก รับของ แกะจากนอกเข้าใน ภาคหนึ่ง เราจะเริ่มจากเลขฐานสอง แล้วไป IPv4 และ Subnet ว่าคอมรู้ได้ไง ว่าใครอยู่หมู่บ้านเดียวกัน',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5', 'sum6'),
      },
    ],
  },

  lab: {
    kind: 'order',
    introTh: 'ส่งข้อความแชตหาเพื่อน คอมห่อของเป็นชั้น ๆ ยังไง\nกดปุ่ม ⬆ ⬇ เลื่อน ให้ชั้นในสุดอยู่บนสุด ชั้นนอกสุดอยู่ล่างสุด\nเรียงเสร็จแล้ว กด ตรวจคำตอบ',
    items: [
      { id: 'data', textTh: 'ข้อมูลที่จะส่ง เช่น ข้อความแชต' },
      { id: 'port', textTh: 'ใส่เลข port บอกว่าส่งให้โปรแกรมไหน' },
      { id: 'ip', textTh: 'ติดใบปะหน้า IP ของผู้ส่ง และผู้รับ' },
      { id: 'mac', textTh: 'ติดป้าย MAC สำหรับช่วงในหมู่บ้าน' },
      { id: 'signal', textTh: 'ส่งออกไปเป็นสัญญาณ บนสาย หรือไวไฟ' },
    ],
    answer: ['data', 'port', 'ip', 'mac', 'signal'],
    explainTh: 'ของชิ้นในสุด คือข้อมูลจริงที่จะส่ง แต่ละชั้นห่อทับชั้นก่อนหน้า\n'
      + 'ลองถามทีละชั้นว่า ชั้นนี้ใครต้องดู และดูตอนไหน\n'
      + 'ชั้นที่ต้องใช้ก่อนระหว่างทาง ต้องอยู่ข้างนอก ชั้นที่ใช้ตอนถึงเครื่องปลายทางแล้ว อยู่ข้างใน\n'
      + 'ชั้นนอกสุด ต้องเป็นสิ่งที่วิ่งบนถนนได้',
    rightTh: 'ใช่เลย ข้อมูลอยู่ในสุด แล้วห่อทับทีละชั้น ชั้นที่ใช้ทีหลังอยู่ข้างใน ส่วนชั้นนอกสุด คือสัญญาณที่วิ่งบนสายได้',
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'ทำไมคอมต้องห่อข้อมูลเป็นชั้น ๆ ไม่เขียนทุกอย่างรวมไว้ที่เดียว',
      choices: [
        { id: 'a', text: 'แต่ละชั้นมีงานของตัวเอง คนระหว่างทางดูแค่ชั้นที่ตัวเองใช้ และเปลี่ยนชั้นหนึ่งได้ โดยไม่ต้องรื้อชั้นอื่น' },
        { id: 'b', text: 'ห่อหลายชั้น จะได้ไม่มีใครเปิดอ่านข้อมูลได้' },
        { id: 'c', text: 'ห่อแล้วข้อมูลเล็กลง เลยส่งได้เร็วขึ้น' },
        { id: 'd', text: 'เพราะสายแลน รับข้อมูลได้ทีละชั้นเท่านั้น' },
      ],
      correct: ['a'],
      explainTh: 'นึกถึงส่งพัสดุ คนขับรถในหมู่บ้าน ไม่ต้องรู้ว่าในกล่องมีอะไร ดูแค่ป้ายบนรถ ไปรษณีย์กลางก็ดูแค่ใบปะหน้า แบ่งงานกันแบบนี้ ทุกคนทำงานง่าย อยากเปลี่ยนวิธีส่ง ก็เปลี่ยนแค่ชั้นที่เกี่ยว\nส่วนการห่อเพิ่ม ทำให้ของใหญ่ขึ้นนิดหน่อย ไม่ได้เล็กลง และไม่ได้เป็นการล็อกข้อมูล',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'กำลังส่งแชตหาเพื่อน แล้วถอดสายแลน ไปต่อไวไฟแทน การห่อชั้นไหนต้องเปลี่ยน',
      choices: [
        { id: 'a', text: 'แค่ชั้นนอก คือรถกับถนน ส่วนข้อมูล เลข port และ IP ผู้รับ เหมือนเดิม' },
        { id: 'b', text: 'ต้องห่อใหม่หมดทุกชั้น ตั้งแต่ข้อมูลข้างใน' },
        { id: 'c', text: 'เปลี่ยนแค่เลข port เพราะเปลี่ยนโปรแกรม' },
        { id: 'd', text: 'เปลี่ยน IP ผู้รับ เป็น IP ของกล่องไวไฟ' },
      ],
      correct: ['a'],
      explainTh: 'ถนนเปลี่ยนจากสาย เป็นคลื่นไวไฟ ก็ต้องเปลี่ยนชั้นที่ติดกับถนน คือวิธีวิ่ง กับรถ เพราะการ์ดไวไฟ มี MAC ของมันเอง\nแต่ของในกล่อง ยังจะไปหาเพื่อนคนเดิม โปรแกรมเดิม เลยไม่ต้องแกะห่อใหม่ นี่แหละข้อดีของการแยกชั้น',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'Switch ทำงานอยู่ชั้นไหน เพราะอะไร',
      choices: [
        { id: 'a', text: 'ชั้นที่ 2 (Data Link layer) เพราะ Switch ดูแค่ MAC เพื่อส่งของในหมู่บ้าน' },
        { id: 'b', text: 'ชั้นที่ 3 (Network layer) เพราะ Switch ดู IP เพื่อเลือกทางข้ามหมู่บ้าน' },
        { id: 'c', text: 'ชั้นที่ 4 (Transport layer) เพราะ Switch ดูเลข port ว่าส่งให้โปรแกรมไหน' },
        { id: 'd', text: 'ชั้นที่ 1 (Physical layer) เพราะ Switch เป็นแค่สาย' },
      ],
      correct: ['a'],
      explainTh: 'นึกถึงไปรษณีย์ในหมู่บ้าน ดูป้ายบนรถ ว่าจะยื่นให้บ้านไหนในหมู่บ้าน ไม่ได้แกะดูใบปะหน้า ป้ายบนรถนั้นคือ MAC ให้หาว่าชั้นไหนใช้ MAC\nการดู IP เพื่อส่งข้ามหมู่บ้าน เป็นงานของ Router',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'ฝั่งผู้รับ แกะห่อจากชั้นไหนก่อน เพราะอะไร',
      choices: [
        { id: 'a', text: 'จากชั้นนอกสุดก่อน เพราะชั้นนอกห่อทับชั้นในไว้ ต้องแกะออกก่อน ถึงจะเห็นชั้นใน' },
        { id: 'b', text: 'จากชั้นในสุดก่อน เพราะอยากได้ข้อความแชตเร็ว ๆ' },
        { id: 'c', text: 'แกะชั้นไหนก่อนก็ได้ ผลเหมือนกัน' },
        { id: 'd', text: 'ไม่ต้องแกะ โปรแกรมอ่านทั้งห่อได้เลย' },
      ],
      correct: ['a'],
      explainTh: 'นึกถึงตอนรับพัสดุ ต้องเอาของลงจากรถ ดูใบปะหน้า แล้วค่อยเปิดกล่อง จะหยิบของข้างใน ทั้งที่กล่องยังปิดอยู่ไม่ได้\nคอมก็แกะย้อนลำดับที่ห่อ ดูทีละชั้นว่าใช่ของเราไหม จนเหลือข้อมูลจริง ส่งให้โปรแกรม',
    },
    {
      id: 'q5',
      layer: 'en',
      prompt: 'Which OSI layer is responsible for logical addressing?',
      promptTh: 'OSI ชั้นไหน ดูแลเรื่องที่อยู่แบบ logical (ที่อยู่ที่ตั้งเองได้ ย้ายหมู่บ้านก็เปลี่ยน)',
      keywords: ['OSI layer', 'logical addressing'],
      choices: [
        { id: 'a', text: 'Network layer', textTh: 'Network layer (ชั้นที่ 3 ใบปะหน้า IP)' },
        { id: 'b', text: 'Data Link layer', textTh: 'Data Link layer (ชั้นที่ 2 ป้าย MAC)' },
        { id: 'c', text: 'Transport layer', textTh: 'Transport layer (ชั้นที่ 4 เลข port)' },
        { id: 'd', text: 'Physical layer', textTh: 'Physical layer (ชั้นที่ 1 ถนน สัญญาณ)' },
      ],
      correct: ['a'],
      explainTh: 'logical address คือที่อยู่ที่ตั้งเองได้ ย้ายหมู่บ้านก็เปลี่ยน เหมือนบ้านเลขที่ ก็คือ IP ส่วน MAC ฝังมากับการ์ดแลน ข้อสอบเรียกว่า physical address ให้หาว่า IP อยู่ชั้นไหน',
    },
    {
      id: 'q6',
      layer: 'en',
      prompt: 'What is the PDU at the Data Link layer?',
      promptTh: 'ของที่ห่อแล้ว (PDU) ในชั้น Data Link เรียกว่าอะไร',
      keywords: ['PDU', 'Data Link layer'],
      choices: [
        { id: 'a', text: 'Frame', textTh: 'frame (กล่องบนรถในหมู่บ้าน ติดป้าย MAC)' },
        { id: 'b', text: 'Packet', textTh: 'packet (กล่องติดใบปะหน้า IP)' },
        { id: 'c', text: 'Segment', textTh: 'segment (ข้อมูลที่ใส่เลข port)' },
        { id: 'd', text: 'Bits', textTh: 'bits (สัญญาณบนถนน)' },
      ],
      correct: ['a'],
      explainTh: 'Data Link คือชื่อของชั้นที่ 2 ชั้นของป้าย MAC นึกภาพตอนเอากล่องขึ้นรถในหมู่บ้าน แล้วติดป้าย MAC พอห่อเสร็จ ของชิ้นนี้ก็เรียกตามรถคันนั้น ส่วนใบปะหน้า IP อยู่ชั้น 3 และสัญญาณบนถนนอยู่ชั้น 1',
    },
    {
      id: 'q7',
      layer: 'en',
      prompt: 'Which TCP/IP model layer corresponds to OSI layers 5, 6, and 7?',
      promptTh: 'ชั้นไหนของ TCP/IP model ตรงกับชั้นที่ 5 6 และ 7 ของ OSI',
      keywords: ['TCP/IP model', 'OSI layers 5, 6, and 7'],
      choices: [
        { id: 'a', text: 'Application', textTh: 'Application (ชั้นที่โปรแกรมใช้คุย บนสุด)' },
        { id: 'b', text: 'Transport', textTh: 'Transport (ชั้นเลข port)' },
        { id: 'c', text: 'Internet', textTh: 'Internet (ชั้นใบปะหน้า IP)' },
        { id: 'd', text: 'Network Access', textTh: 'Network Access (รถในหมู่บ้าน กับถนน)' },
      ],
      correct: ['a'],
      explainTh: 'ชั้น 5 6 7 ของ OSI อยู่บนสุด เป็นชั้นที่โปรแกรมใช้คุยกับ network ไม่ใช่ตัวโปรแกรมเอง TCP/IP model ไม่ได้แยกสามชั้นนี้ แต่รวมเป็นชั้นบนสุดชั้นเดียว ให้ดูว่าชั้นบนสุดของ TCP/IP ชื่ออะไร',
    },
  ],
}
