import type { Actor, Device, Lesson, SceneAction } from '../types'

const hidden = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const hide = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'hide', actor }))

const endIds = ['e1', 'e2', 'e3', 'eLbl']
const cableIds = ['c1', 'c2', 'cab', 'cData', 'cLbl1', 'cLbl2']
const chainIds = ['d1', 'd2', 'd3', 'd4', 'dc1', 'dc2', 'dc3', 'dLbl1', 'dLbl2']
const starIds = ['st1', 'st2', 'st3', 'st4', 'sw', 'sc1', 'sc2', 'sc3', 'sc4']
const villageIds = ['vA', 'vB', 'a1', 'a2', 'swA', 'ac1', 'ac2', 'b1', 'b2', 'swB', 'bc1', 'bc2']
const homeIds = ['homeBox', 'h1', 'h2', 'h3']

const actors: Actor[] = [
  // ฉาก 1: end device = บ้าน
  { id: 'e1', kind: 'pc', x: 220, y: 200, label: 'คอม' },
  { id: 'e2', kind: 'laptop', x: 480, y: 200, label: 'โน้ตบุ๊ก' },
  { id: 'e3', kind: 'server', x: 740, y: 200, label: 'เซิร์ฟเวอร์ (เก็บเว็บ)' },
  { id: 'eLbl', kind: 'label', x: 480, y: 420, label: 'End device = บ้าน = เครื่องที่ส่ง และรับข้อมูล' },

  // ฉาก 2: สาย = ถนน
  hidden({ id: 'c1', kind: 'pc', x: 200, y: 190, label: 'คอม 1' }),
  hidden({ id: 'c2', kind: 'pc', x: 760, y: 190, label: 'คอม 2' }),
  hidden({ id: 'cab', kind: 'cable', x: 200, y: 190, to: 'c2' }),
  hidden({ id: 'cData', kind: 'envelope', x: 200, y: 190, label: 'ข้อมูล' }),
  hidden({ id: 'cLbl1', kind: 'label', x: 480, y: 380, label: 'สาย (cable) = ถนน ให้ข้อมูลวิ่ง' }),
  hidden({ id: 'cLbl2', kind: 'label', x: 480, y: 450, label: 'สายแลน ส่งเป็นไฟฟ้า · สายไฟเบอร์ ส่งเป็นแสง ไปได้ไกลกว่า' }),

  // ฉาก 3: ต่อคอมเป็นทอด ๆ (ของจริงไม่ทำแบบนี้)
  hidden({ id: 'd1', kind: 'pc', x: 150, y: 200, label: 'คอม 1' }),
  hidden({ id: 'd2', kind: 'pc', x: 370, y: 200, label: 'คอม 2' }),
  hidden({ id: 'd3', kind: 'pc', x: 590, y: 200, label: 'คอม 3' }),
  hidden({ id: 'd4', kind: 'pc', x: 810, y: 200, label: 'คอม 4' }),
  hidden({ id: 'dc1', kind: 'cable', x: 150, y: 200, to: 'd2' }),
  hidden({ id: 'dc2', kind: 'cable', x: 370, y: 200, to: 'd3' }),
  hidden({ id: 'dc3', kind: 'cable', x: 590, y: 200, to: 'd4' }),
  hidden({ id: 'dLbl1', kind: 'label', x: 480, y: 380, label: '✂️ สายเส้นกลางขาด คอม 3 กับคอม 4 หลุดหมด' }),
  hidden({ id: 'dLbl2', kind: 'label', x: 480, y: 450, label: 'คอมส่วนมาก มีช่องเสียบสายแลนแค่ช่องเดียว' }),

  // ฉาก 4-5: ทุกเครื่องเสียบสายเข้า Switch
  hidden({ id: 'st1', kind: 'pc', x: 150, y: 100, label: 'คอม 1' }),
  hidden({ id: 'st2', kind: 'pc', x: 370, y: 100, label: 'คอม 2' }),
  hidden({ id: 'st3', kind: 'pc', x: 590, y: 100, label: 'คอม 3' }),
  hidden({ id: 'st4', kind: 'pc', x: 810, y: 100, label: 'คอม 4' }),
  hidden({ id: 'sw', kind: 'switch', x: 480, y: 320, label: 'Switch' }),
  hidden({ id: 'sc1', kind: 'cable', x: 150, y: 100, to: 'sw' }),
  hidden({ id: 'sc2', kind: 'cable', x: 370, y: 100, to: 'sw' }),
  hidden({ id: 'sc3', kind: 'cable', x: 590, y: 100, to: 'sw' }),
  hidden({ id: 'sc4', kind: 'cable', x: 810, y: 100, to: 'sw' }),
  hidden({ id: 'sEnv', kind: 'envelope', x: 150, y: 100 }),
  hidden({ id: 'sLbl', kind: 'label', x: 480, y: 480, label: 'Switch = ไปรษณีย์ในหมู่บ้าน' }),
  hidden({ id: 's5Lbl', kind: 'label', x: 480, y: 480, label: '✂️ สายเส้นนี้ขาด หลุดแค่คอม 4 เครื่องเดียว' }),

  // ฉาก 6-8: สองหมู่บ้าน กับ Router
  hidden({ id: 'vA', kind: 'label', x: 220, y: 40, label: 'หมู่บ้านเอ' }),
  hidden({ id: 'vB', kind: 'label', x: 740, y: 40, label: 'หมู่บ้านบี' }),
  hidden({ id: 'a1', kind: 'pc', x: 120, y: 140, label: 'คอม 1' }),
  hidden({ id: 'a2', kind: 'pc', x: 320, y: 140, label: 'คอม 2' }),
  hidden({ id: 'swA', kind: 'switch', x: 220, y: 320, label: 'Switch เอ' }),
  hidden({ id: 'ac1', kind: 'cable', x: 120, y: 140, to: 'swA' }),
  hidden({ id: 'ac2', kind: 'cable', x: 320, y: 140, to: 'swA' }),
  hidden({ id: 'b1', kind: 'pc', x: 640, y: 140, label: 'คอม 3' }),
  hidden({ id: 'b2', kind: 'pc', x: 840, y: 140, label: 'คอม 4' }),
  hidden({ id: 'swB', kind: 'switch', x: 740, y: 320, label: 'Switch บี' }),
  hidden({ id: 'bc1', kind: 'cable', x: 640, y: 140, to: 'swB' }),
  hidden({ id: 'bc2', kind: 'cable', x: 840, y: 140, to: 'swB' }),
  hidden({ id: 'vEnv', kind: 'envelope', x: 120, y: 140 }),
  hidden({ id: 'vLbl', kind: 'label', x: 480, y: 480, label: '❌ Switch ส่งของข้ามหมู่บ้านเองไม่ได้' }),
  hidden({ id: 'router', kind: 'router', x: 480, y: 320, label: 'Router' }),
  hidden({ id: 'rc1', kind: 'cable', x: 220, y: 320, to: 'router' }),
  hidden({ id: 'rc2', kind: 'cable', x: 480, y: 320, to: 'swB' }),
  hidden({ id: 'rEnv', kind: 'envelope', x: 120, y: 140 }),
  hidden({ id: 'rLbl', kind: 'label', x: 480, y: 480, label: 'Router = ไปรษณีย์กลาง ส่งของข้ามหมู่บ้าน' }),
  hidden({ id: 'gLbl', kind: 'label', x: 480, y: 480, label: 'Gateway = ประตูออกหมู่บ้าน = Router ฝั่งหมู่บ้านเรา' }),

  // ฉาก 9: กล่องเน็ตที่บ้าน
  hidden({ id: 'homeBox', kind: 'router', x: 480, y: 160, label: 'กล่องเน็ตที่บ้าน' }),
  hidden({ id: 'h1', kind: 'label', x: 480, y: 330, label: '🔌 ช่องเสียบสายหลังกล่อง = Switch' }),
  hidden({ id: 'h2', kind: 'label', x: 480, y: 400, label: '📶 ไวไฟ = ถนนแบบไม่ใช้สาย' }),
  hidden({ id: 'h3', kind: 'label', x: 480, y: 470, label: '🚪 พาของออกไป Internet = Router' }),

  // ฉาก 10: สรุป
  hidden({ id: 'sum1', kind: 'label', x: 480, y: 70, label: 'End device = บ้าน (เครื่องที่ส่ง และรับข้อมูล)' }),
  hidden({ id: 'sum2', kind: 'label', x: 480, y: 160, label: 'สาย (cable) = ถนน' }),
  hidden({ id: 'sum3', kind: 'label', x: 480, y: 250, label: 'Switch = ไปรษณีย์ในหมู่บ้าน ส่งในหมู่บ้านเดียวกัน' }),
  hidden({ id: 'sum4', kind: 'label', x: 480, y: 340, label: 'Router = ไปรษณีย์กลาง ส่งข้ามหมู่บ้าน' }),
  hidden({ id: 'sum5', kind: 'label', x: 480, y: 430, label: 'คุยกันแค่ในหมู่บ้าน ไม่ต้องใช้ Router' }),
]

// ห้องทดลอง (เวที 800x480): หมู่บ้านเอ ซ้าย / หมู่บ้านบี ขวา / Router ตรงกลางล่าง
const pc = (id: string, label: string, x: number, ip: string, gateway: string, mac: string): Device => ({
  id, kind: 'pc', label, x, y: 90, gateway, ifaces: [{ name: 'eth0', ip, prefix: 24, mac }],
})
const labDevices: Device[] = [
  pc('pc1', 'คอม 1', 100, '192.168.1.10', '192.168.1.1', '02:00:00:aa:01:00'),
  pc('pc2', 'คอม 2', 300, '192.168.1.11', '192.168.1.1', '02:00:00:aa:02:00'),
  { id: 'swA', kind: 'switch', label: 'Switch หมู่บ้านเอ', x: 200, y: 250, ifaces: [{ name: 'p1', mac: '02:00:00:aa:03:01' }] },
  {
    id: 'router', kind: 'router', label: 'Router', x: 400, y: 380,
    ifaces: [
      { name: 'g0/0', ip: '192.168.1.1', prefix: 24, mac: '02:00:00:aa:04:00' },
      { name: 'g0/1', ip: '192.168.2.1', prefix: 24, mac: '02:00:00:aa:04:01' },
    ],
  },
  { id: 'swB', kind: 'switch', label: 'Switch หมู่บ้านบี', x: 600, y: 250, ifaces: [{ name: 'p1', mac: '02:00:00:aa:05:01' }, { name: 'p2', mac: '02:00:00:aa:05:02' }] },
  pc('pc3', 'คอม 3', 500, '192.168.2.10', '192.168.2.1', '02:00:00:aa:06:00'),
  pc('pc4', 'คอม 4', 700, '192.168.2.11', '192.168.2.1', '02:00:00:aa:07:00'),
]

export const lesson: Lesson = {
  id: 'p0-l2',
  part: 0,
  order: 2,
  status: 'ready',
  titleTh: 'อุปกรณ์มีอะไรบ้าง',
  analogyTh: 'คอม สาย Switch Router = บ้าน ถนน ไปรษณีย์ในหมู่บ้าน ไปรษณีย์กลาง',
  ciscoModules: ['ITN 1', 'ITN 11'],
  videos: [
    { youtubeId: 'WunDlV89wpQ', titleTh: 'Basic Network ตอนที่ 3 ทำความรู้จักกับ Router', channel: '9hua Training' },
    { youtubeId: 'q0t7Wtux-VM', titleTh: 'Basic Network ตอนที่ 5 ทำความรู้จักกับ Switch', channel: '9hua Training' },
  ],
  terms: ['end-device', 'cable', 'switch', 'router', 'gateway', 'ip-address', 'network', 'lan', 'internet'],

  scenes: {
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1',
        narrationTh: 'จำได้ไหมครับ บ้าน คือเครื่อง เช่น คอม โน้ตบุ๊ก หรือเซิร์ฟเวอร์ ที่เก็บเว็บ เครื่องพวกนี้ เป็นคนส่งของ และคนรับของ เราเรียกว่า end device',
        actions: [],
      },
      {
        id: 's2',
        narrationTh: 'ส่วนถนน ก็คือสาย ภาษาอังกฤษเรียกว่า cable สายแลน ส่งข้อมูลเป็นไฟฟ้า สายไฟเบอร์ ส่งเป็นแสง เลยไปได้ไกลกว่า หรือจะใช้ไวไฟแทนสายก็ได้',
        actions: [
          ...hide(...endIds),
          ...show(...cableIds),
          { type: 'move', actor: 'cData', x: 620, y: 190, ms: 2500 },
        ],
      },
      {
        id: 's3',
        narrationTh: 'บทที่แล้ว เราวาดง่าย ๆ ให้เห็นภาพก่อน แต่ของจริง ไม่ต่อคอมเป็นทอด ๆ นะ เพราะคอมส่วนมาก มีช่องเสียบสายแลนช่องเดียว และถ้าสายขาดเส้นเดียว เครื่องที่อยู่ถัดไป ก็หลุดหมด',
        actions: [
          ...hide(...cableIds),
          ...show(...chainIds),
          { type: 'highlight', actor: 'dc2' },
        ],
      },
      {
        id: 's4',
        narrationTh: 'ของจริง เขาเสียบสายจากคอมทุกเครื่อง เข้ากล่องตรงกลาง ชื่อ Switch เหมือนไปรษณีย์ในหมู่บ้าน บ้านไหนจะส่งของ ก็ส่งมาที่ไปรษณีย์ แล้วไปรษณีย์ส่งต่อ ให้บ้านปลายทาง',
        actions: [
          ...hide(...chainIds),
          ...show(...starIds, 'sEnv', 'sLbl'),
          { type: 'moveAlong', actor: 'sEnv', path: ['st1', 'sw', 'st3'], msPerHop: 1500 },
        ],
      },
      {
        id: 's5',
        narrationTh: 'แบบนี้ดีกว่าเยอะ ทุกเครื่องมีสายของตัวเอง สายเส้นไหนขาด ก็หลุดแค่เครื่องนั้น และ Switch จำได้ ว่าเครื่องไหนเสียบช่องไหน เลยส่งของไปถูกเครื่อง',
        actions: [
          ...hide('sEnv', 'sLbl'),
          { type: 'highlight', actor: 'sc4' },
          ...show('s5Lbl'),
        ],
      },
      {
        id: 's6',
        narrationTh: 'ทีนี้มีสองหมู่บ้าน เป็นคนละ network กัน ส่งของในหมู่บ้านเดียวกัน Switch ส่งให้ได้เลย แต่ถ้าจะส่งข้ามหมู่บ้าน Switch ส่งเองไม่ได้ เพราะมันดูแลแค่หมู่บ้านตัวเอง',
        actions: [
          ...hide(...starIds, 's5Lbl'),
          ...show(...villageIds, 'vEnv', 'vLbl'),
          { type: 'moveAlong', actor: 'vEnv', path: ['a1', 'swA', 'a2'], msPerHop: 1500 },
        ],
      },
      {
        id: 's7',
        narrationTh: 'ต้องมี Router ครับ เหมือนไปรษณีย์กลาง ที่มีถนนไปหลายหมู่บ้าน ของที่จะออกนอกหมู่บ้าน ส่งไปที่ Router ก่อน แล้ว Router ส่งต่อ ไปถึงหมู่บ้านปลายทาง',
        actions: [
          ...hide('vEnv', 'vLbl'),
          ...show('router', 'rc1', 'rc2', 'rEnv', 'rLbl'),
          { type: 'moveAlong', actor: 'rEnv', path: ['a1', 'swA', 'router', 'swB', 'b1'], msPerHop: 1100 },
        ],
      },
      {
        id: 's8',
        narrationTh: 'คอมรู้ได้ไง ว่าของต้องออกนอกหมู่บ้าน ดูจากเลขที่อยู่ของเครื่อง เดี๋ยวบทที่สี่เล่าละเอียด ถ้าต้องออก คอมจะส่งไปที่ประตูออกหมู่บ้าน เรียกว่า Gateway ก็คือ Router ฝั่งหมู่บ้านเรา',
        actions: [
          ...hide('rEnv', 'rLbl'),
          { type: 'highlight', actor: 'router' },
          ...show('gLbl'),
        ],
      },
      {
        id: 's9',
        narrationTh: 'กล่องเน็ตที่บ้านเรา ที่ชอบเรียกว่าเราเตอร์ จริง ๆ ในกล่องเดียว มีหลายอย่างรวมกัน มีช่องเสียบสาย ที่ทำงานแบบ Switch มีไวไฟ และมี Router คอยพาของ ออกไป Internet',
        actions: [
          ...hide(...villageIds, 'router', 'rc1', 'rc2', 'gLbl'),
          ...show(...homeIds),
        ],
      },
      {
        id: 's10',
        narrationTh: 'สรุปนะครับ end device คือเครื่องที่ส่งและรับของ สายคือถนน Switch ส่งของในหมู่บ้านเดียวกัน Router ส่งของข้ามหมู่บ้าน ถ้าคุยกันแค่ในหมู่บ้าน ก็ไม่ต้องใช้ Router',
        actions: [
          ...hide(...homeIds),
          ...show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
        ],
      },
    ],
  },

  lab: {
    kind: 'network',
    introTh: 'ห้องทดลองนี้มีสองหมู่บ้าน หมู่บ้านเอ อยู่ซ้าย มีคอม 1 กับคอม 2 ยังไม่ได้เสียบสาย หมู่บ้านบี อยู่ขวา มีคอม 3 กับคอม 4 เสียบสายไว้แล้ว Router อยู่ตรงกลางข้างล่าง ต่อสายกับหมู่บ้านเอไว้แล้ว\n'
      + 'คอมกับ Router มี IP address ตั้งไว้ให้แล้ว คือเลขที่อยู่ของเครื่อง เดี๋ยวบทที่ 4 เล่าละเอียด คอมจด Gateway ไว้ให้ด้วย คือประตูออกหมู่บ้าน ส่วน Switch ไม่ต้องมีเลขพวกนี้ เราเลยไม่ต้องพิมพ์อะไรเลย\n'
      + 'วิธีต่อสาย กดปุ่ม 🔌 ต่อสาย แล้วกดเครื่องสองเครื่องที่อยากต่อ มี 3 เป้าหมาย ทำทีละข้อนะ ถ้าผลการส่งพูดถึง "วง" ให้นึกว่าคือหมู่บ้าน',
    start: {
      devices: labDevices,
      links: [
        { a: { device: 'router', iface: 'g0/0' }, b: { device: 'swA', iface: 'p1' } },
        { a: { device: 'pc3', iface: 'eth0' }, b: { device: 'swB', iface: 'p1' } },
        { a: { device: 'pc4', iface: 'eth0' }, b: { device: 'swB', iface: 'p2' } },
      ],
    },
    palette: [],
    goals: [
      {
        type: 'deliver',
        from: 'pc1',
        toIp: '192.168.1.11',
        taskTh: 'ต่อคอม 1 กับคอม 2 เข้า Switch หมู่บ้านเอ แล้วส่งของจากคอม 1 ไปคอม 2',
        hintTh: 'กด 🔌 ต่อสาย แล้วกดคอม 1 ตามด้วย Switch หมู่บ้านเอ ทำแบบเดียวกันกับคอม 2 แล้วกด ส่งข้อมูล อย่าต่อคอม 1 ตรงไปคอม 2 นะ เพราะคอมมีช่องเสียบสายช่องเดียว ต่อตรงแล้วช่องเต็ม จะไปหา Router ไม่ได้ Switch เลยเป็นไปรษณีย์ในหมู่บ้าน ให้ทุกเครื่องมาเจอกัน',
      },
      {
        type: 'fail',
        from: 'pc1',
        toIp: '192.168.2.10',
        reasonIncludes: 'มีช่องสำหรับวงของ 192.168.2.10 แล้ว แต่ช่องนั้นยังไม่มีสายต่อไปถึง คอม 3',
        taskTh: 'ลองส่งไปคอม 3 ที่หมู่บ้านบี ยังไม่ต้องต่อสายเพิ่ม ดูว่าของไปติดตรงไหน',
        hintTh: 'กด ส่งข้อมูล ได้เลย ยังไม่ต้องต่อสายเพิ่ม คอม 1 จะฝากของไว้ที่ Gateway (ประตูออกหมู่บ้าน) ก่อน ซึ่งก็คือ Router ตอนนี้ Router มีช่องไว้รอหมู่บ้านบีแล้ว แต่ช่องนั้นยังไม่มีสาย ของเลยไปไม่ถึงคอม 3 ถ้ายังไม่ผ่าน เช็กสองอย่าง คอม 1 ต้องเสียบเข้า Switch หมู่บ้านเอ ไม่ใช่ต่อตรงกับคอม 2 และถ้าเผลอต่อ Router เข้า Switch หมู่บ้านบีไปแล้ว ให้กดสายเส้นนั้น แล้วกด ถอดสาย',
      },
      {
        type: 'deliver',
        from: 'pc1',
        toIp: '192.168.2.10',
        taskTh: 'ต่อสายให้ Router ไปถึงหมู่บ้านบี แล้วส่งของจากคอม 1 ไปคอม 3 ให้ถึง',
        hintTh: 'Router มีช่องไว้รอหมู่บ้านบีอยู่แล้ว แค่ยังไม่มีถนน ต่อสายจาก Router ไป Switch หมู่บ้านบี เส้นเดียว แล้วกด ส่งข้อมูล อีกที Router จะรับของจากหมู่บ้านเอ แล้วส่งต่อไปหมู่บ้านบีให้',
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'ออฟฟิศหนึ่ง มีคอม 10 เครื่อง อยู่ใน network เดียวกัน (หมู่บ้านเดียวกัน) อยากส่งไฟล์หากัน ต้องมีอะไรเป็นตัวกลาง เพราะอะไร',
      choices: [
        { id: 'a', text: 'Switch เพราะมันส่งของให้เครื่องในหมู่บ้านเดียวกันได้เลย' },
        { id: 'b', text: 'Router เพราะส่งอะไรก็ตาม ต้องผ่าน Router ทุกครั้ง' },
        { id: 'c', text: 'ไม่ต้องมีตัวกลาง เอาสายต่อจากคอมไปคอมเป็นทอด ๆ ก็พอ' },
        { id: 'd', text: 'เซิร์ฟเวอร์ เพราะเซิร์ฟเวอร์เป็นคนส่งของให้ทุกเครื่อง' },
      ],
      correct: ['a'],
      explainTh: 'ถามตัวเองก่อนว่า ของจะไปในหมู่บ้านเดียวกัน หรือข้ามหมู่บ้าน ถ้าอยู่หมู่บ้านเดียวกัน ไปรษณีย์ในหมู่บ้านก็ส่งให้ได้ ไม่ต้องพึ่งไปรษณีย์กลาง ส่วนการต่อคอมเป็นทอด ๆ ทำจริงไม่ได้ เพราะคอมส่วนมากมีช่องเสียบสายช่องเดียว',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'คอม 1 อยู่หมู่บ้านเอ จะส่งของไปคอม 3 ที่หมู่บ้านบี แต่ไม่มี Router ต่อสองหมู่บ้านเลย จะเกิดอะไรขึ้น',
      choices: [
        { id: 'a', text: 'ส่งไม่ถึง เพราะ Switch ส่งของข้ามหมู่บ้านเองไม่ได้' },
        { id: 'b', text: 'ส่งถึง เพราะ Switch ส่งไปได้ทุกหมู่บ้าน' },
        { id: 'c', text: 'ส่งถึง แต่ช้าลงนิดหน่อย' },
        { id: 'd', text: 'คอม 1 จะส่งของหาคอม 2 ในหมู่บ้านเอไม่ได้ด้วย' },
      ],
      correct: ['a'],
      explainTh: 'Switch เป็นไปรษณีย์ในหมู่บ้าน ดูแลแค่หมู่บ้านตัวเอง ของที่จะไปคนละ network ต้องมีไปรษณีย์กลางคอยส่งต่อ ถ้าไม่มี ของก็ออกนอกหมู่บ้านไม่ได้ แต่ส่งกันในหมู่บ้านเดียวกัน ยังได้ตามปกติ',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'ทำไมการเสียบสายจากคอมทุกเครื่อง เข้า Switch ถึงดีกว่าการต่อคอมเป็นทอด ๆ',
      choices: [
        { id: 'a', text: 'เพราะทุกเครื่องมีสายของตัวเอง สายเส้นไหนขาด ก็หลุดแค่เครื่องเดียว' },
        { id: 'b', text: 'เพราะ Switch ทำให้คอมทุกเครื่องเปิดเครื่องได้เร็วขึ้น' },
        { id: 'c', text: 'เพราะต่อ Switch แล้ว ไม่ต้องใช้สายอีกเลย' },
        { id: 'd', text: 'เพราะ Switch ทำให้ส่งข้ามหมู่บ้านได้ โดยไม่ต้องมี Router' },
      ],
      correct: ['a'],
      explainTh: 'นึกถึงถนนในหมู่บ้าน ถ้าบ้านต่อถนนกันเป็นทอด ๆ ถนนขาดช่วงเดียว บ้านที่อยู่ถัดไปก็ตัดขาดหมด แต่ถ้าทุกบ้าน มีถนนของตัวเองไปถึงไปรษณีย์ ถนนเส้นไหนขาด ก็เดือดร้อนแค่บ้านหลังนั้น',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'ถ้า Router เสีย แต่ Switch หมู่บ้านเอยังดีอยู่ คอม 1 กับคอม 2 ในหมู่บ้านเอ ยังส่งของหากันได้ไหม เพราะอะไร',
      choices: [
        { id: 'a', text: 'ได้ เพราะส่งกันในหมู่บ้านเดียวกัน Switch ส่งให้ได้ ไม่ต้องผ่าน Router' },
        { id: 'b', text: 'ไม่ได้ เพราะทุกการส่ง ต้องผ่าน Router' },
        { id: 'c', text: 'ไม่ได้ เพราะ Router เสีย สายทุกเส้นจะใช้ไม่ได้ไปด้วย' },
        { id: 'd', text: 'ได้ แต่ต้องย้ายคอมไปหมู่บ้านบีก่อน' },
      ],
      correct: ['a'],
      explainTh: 'ไปรษณีย์กลาง ใช้ตอนส่งข้ามหมู่บ้านเท่านั้น ของที่ส่งกันในหมู่บ้านเดียวกัน วิ่งผ่านไปรษณีย์ในหมู่บ้านอย่างเดียว เลยไม่เกี่ยวกับไปรษณีย์กลางที่เสีย สิ่งที่หายไป คือการส่งของออกนอกหมู่บ้าน',
    },
    {
      id: 'q5',
      layer: 'en',
      prompt: 'Which network device is used to forward data between different networks?',
      promptTh: 'อุปกรณ์ตัวไหน ที่ใช้ส่งข้อมูลต่อ ระหว่าง network ที่ต่างกัน (ข้ามหมู่บ้าน)',
      keywords: ['between different networks'],
      choices: [
        { id: 'a', text: 'Router', textTh: 'Router (เราเตอร์)' },
        { id: 'b', text: 'Switch', textTh: 'Switch (สวิตช์)' },
        { id: 'c', text: 'Laptop', textTh: 'โน้ตบุ๊ก' },
        { id: 'd', text: 'Server', textTh: 'เซิร์ฟเวอร์' },
      ],
      correct: ['a'],
      explainTh: 'ต่าง network กัน ก็คือคนละหมู่บ้าน ของที่จะข้ามหมู่บ้าน ต้องให้ไปรษณีย์กลางส่งต่อ ส่วนไปรษณีย์ในหมู่บ้าน ดูแลแค่หมู่บ้านตัวเอง และโน้ตบุ๊กกับเซิร์ฟเวอร์ เป็นคนส่งและคนรับของ ไม่ได้ช่วยส่งต่อให้ใคร',
    },
    {
      id: 'q6',
      layer: 'en',
      prompt: 'Which two devices are end devices? (Choose two.)',
      promptTh: 'อุปกรณ์ 2 ตัวไหน เป็น end device (เลือก 2 ข้อ)',
      keywords: ['two', 'end devices'],
      choices: [
        { id: 'a', text: 'Laptop', textTh: 'โน้ตบุ๊ก' },
        { id: 'b', text: 'Server', textTh: 'เซิร์ฟเวอร์' },
        { id: 'c', text: 'Switch', textTh: 'Switch (สวิตช์)' },
        { id: 'd', text: 'Router', textTh: 'Router (เราเตอร์)' },
      ],
      correct: ['a', 'b'],
      explainTh: 'end device คือเครื่องที่เป็นคนส่ง และคนรับข้อมูล เหมือนบ้านแต่ละหลัง ส่วนอุปกรณ์ที่ทำหน้าที่ช่วยส่งต่อ เหมือนไปรษณีย์ ไม่นับเป็น end device',
    },
    {
      id: 'q7',
      layer: 'en',
      prompt: 'What is the purpose of the default gateway on a PC?',
      promptTh: 'Default gateway ที่ตั้งไว้ในคอม มีไว้ทำอะไร',
      keywords: ['default gateway'],
      choices: [
        { id: 'a', text: 'It is the router address that the PC uses to send data to other networks.', textTh: 'เป็นที่อยู่ของ Router ที่คอมใช้ส่งข้อมูลออกไป network อื่น' },
        { id: 'b', text: 'It is needed for every message to a PC in the same LAN.', textTh: 'ต้องใช้ทุกครั้ง ที่ส่งหาคอมใน LAN เดียวกัน' },
        { id: 'c', text: 'It is the cable that connects the PC to the switch.', textTh: 'เป็นสายที่ต่อคอมเข้ากับ Switch' },
        { id: 'd', text: 'It stores web pages for the PC.', textTh: 'ใช้เก็บหน้าเว็บให้คอม' },
      ],
      correct: ['a'],
      explainTh: 'Gateway คือประตูออกหมู่บ้าน ของที่จะไปหมู่บ้านอื่น คอมจะส่งไปที่ประตูนี้ก่อน แล้วประตูนี้ ก็คือ Router ฝั่งหมู่บ้านเรา ส่วนการส่งในหมู่บ้านเดียวกัน ไม่ต้องผ่านประตูนี้เลย',
    },
  ],
}
