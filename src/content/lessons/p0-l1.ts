import type { Actor, Lesson, SceneAction } from '../types'

// ฉากแบบ v2 (ดู p0-l4): ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })

const ABOVE = { dx: 0, dy: -110 }
const roadBase = ['houseA', 'houseB', 'parcel']
const homeBase = ['home', 'homePc', 'homeLaptop', 'homeCab1', 'homeCab2']
const officeBase = ['officeLbl', 'o1', 'o2', 'o3', 'o4', 'oCab1', 'oCab2', 'oCab3']
const wanBase = ['bkkLbl', 'cmLbl', 'bk1', 'bk2', 'cm1', 'cm2', 'bkCab', 'cmCab', 'wanCab', 'rentLbl']
const netBase = ['net', 'iHome1', 'iHome2', 'iOffice', 'iCafe', 'iCab1', 'iCab2', 'iCab3', 'iCab4']

const actors: Actor[] = [
  // ฉาก 1-2: บ้านสองหลัง ไม่มีถนน แล้วมีถนน
  h({ id: 'houseA', kind: 'house', x: 180, y: 200, label: 'บ้านเอ' }),
  h({ id: 'houseB', kind: 'house', x: 780, y: 200, label: 'บ้านบี' }),
  h({ id: 'parcel', kind: 'card', x: 180, y: 90, lines: ['📦 ของ', 'ถึง: บ้านบี'], tone: 'deliver' }),
  h({ id: 'road', kind: 'cable', x: 180, y: 200, to: 'houseB' }),
  h({ id: 'noRoad', kind: 'label', x: 480, y: 420, label: '❓ ไม่มีถนน ของไปไม่ถึงบ้านบี' }),
  h({ id: 'roadLbl', kind: 'label', x: 480, y: 420, label: '🚚 มีถนนแล้ว รถพาของไปถึง' }),

  // ฉาก 3: คอมก็เหมือนกัน
  h({ id: 'pcA', kind: 'pc', x: 180, y: 200, label: 'คอมเอ' }),
  h({ id: 'pcB', kind: 'pc', x: 780, y: 200, label: 'คอมบี' }),
  h({ id: 'pcCab', kind: 'cable', x: 180, y: 200, to: 'pcB' }),
  h({ id: 'data', kind: 'card', x: 180, y: 90, lines: ['💬 ข้อมูล (data)', 'ถึง: คอมบี'], tone: 'deliver' }),
  h({ id: 'wireLbl', kind: 'label', x: 480, y: 400, label: 'ถนน = สาย หรือ สัญญาณไวไฟ' }),
  h({ id: 'dataLbl', kind: 'label', x: 480, y: 460, label: 'ของที่ส่ง = ข้อมูล (data) เช่น รูป เพลง แชต' }),

  // ฉาก 4: หลายเครื่องต่อถึงกัน = network
  h({ id: 'n1', kind: 'pc', x: 180, y: 200, label: 'คอม 1' }),
  h({ id: 'n2', kind: 'pc', x: 480, y: 200, label: 'คอม 2' }),
  h({ id: 'n3', kind: 'pc', x: 780, y: 200, label: 'คอม 3' }),
  h({ id: 'nCab1', kind: 'cable', x: 180, y: 200, to: 'n2' }),
  h({ id: 'nCab2', kind: 'cable', x: 480, y: 200, to: 'n3' }),
  h({ id: 'nData', kind: 'card', x: 180, y: 90, lines: ['💬 ข้อมูล', 'ถึง: คอม 3'], tone: 'deliver' }),
  h({ id: 'netLbl', kind: 'label', x: 480, y: 420, label: 'Network = เครื่อง + ทางที่ต่อถึงกัน' }),

  // ฉาก 5: บ้านเรา = LAN เล็ก
  h({ id: 'home', kind: 'house', x: 480, y: 150, label: 'บ้านเรา' }),
  h({ id: 'homePc', kind: 'pc', x: 280, y: 350, label: 'คอม' }),
  h({ id: 'homeLaptop', kind: 'laptop', x: 680, y: 350, label: 'โน้ตบุ๊ก' }),
  h({ id: 'homeCab1', kind: 'cable', x: 280, y: 350, to: 'home' }),
  h({ id: 'homeCab2', kind: 'cable', x: 680, y: 350, to: 'home' }),
  h({ id: 'homeLbl', kind: 'label', x: 480, y: 490, label: 'LAN = network ในที่เดียว เช่น ในบ้าน' }),

  // ฉาก 6: ออฟฟิศ = LAN ที่ใหญ่ขึ้น
  h({ id: 'officeLbl', kind: 'label', x: 480, y: 90, label: 'ออฟฟิศ (อยู่ในตึกเดียว)' }),
  h({ id: 'o1', kind: 'pc', x: 210, y: 240, label: 'คอม 1' }),
  h({ id: 'o2', kind: 'pc', x: 390, y: 240, label: 'คอม 2' }),
  h({ id: 'o3', kind: 'pc', x: 570, y: 240, label: 'คอม 3' }),
  h({ id: 'o4', kind: 'pc', x: 750, y: 240, label: 'คอม 4' }),
  h({ id: 'oCab1', kind: 'cable', x: 210, y: 240, to: 'o2' }),
  h({ id: 'oCab2', kind: 'cable', x: 390, y: 240, to: 'o3' }),
  h({ id: 'oCab3', kind: 'cable', x: 570, y: 240, to: 'o4' }),
  h({ id: 'officeLan', kind: 'label', x: 480, y: 420, label: 'ออฟฟิศ ก็เป็น LAN แค่เครื่องเยอะขึ้น' }),

  // ฉาก 7: สาขาไกลกัน = WAN
  h({ id: 'bkkLbl', kind: 'label', x: 180, y: 110, label: 'กรุงเทพ' }),
  h({ id: 'cmLbl', kind: 'label', x: 780, y: 110, label: 'เชียงใหม่' }),
  h({ id: 'bk1', kind: 'pc', x: 110, y: 240 }),
  h({ id: 'bk2', kind: 'pc', x: 250, y: 240 }),
  h({ id: 'cm1', kind: 'pc', x: 710, y: 240 }),
  h({ id: 'cm2', kind: 'pc', x: 850, y: 240 }),
  h({ id: 'bkCab', kind: 'cable', x: 110, y: 240, to: 'bk2' }),
  h({ id: 'cmCab', kind: 'cable', x: 710, y: 240, to: 'cm2' }),
  h({ id: 'wanCab', kind: 'cable', x: 250, y: 240, to: 'cm1' }),
  h({ id: 'rentLbl', kind: 'label', x: 480, y: 150, label: 'สายเส้นยาว เช่าจากค่ายเน็ต' }),
  h({ id: 'wanData', kind: 'card', x: 250, y: 335, lines: ['💬 ข้อมูล', 'ถึง: เชียงใหม่'], tone: 'deliver' }),
  h({ id: 'wanLbl', kind: 'label', x: 480, y: 450, label: 'WAN = ต่อ LAN ที่อยู่ไกลกัน ข้ามเมือง' }),

  // ฉาก 8: Internet = network ทั่วโลกมาต่อกัน
  h({ id: 'net', kind: 'cloud', x: 480, y: 250, label: 'Internet' }),
  h({ id: 'iHome1', kind: 'house', x: 150, y: 130, label: 'บ้าน' }),
  h({ id: 'iHome2', kind: 'house', x: 810, y: 130, label: 'บ้าน' }),
  h({ id: 'iOffice', kind: 'pc', x: 150, y: 390, label: 'ออฟฟิศ' }),
  h({ id: 'iCafe', kind: 'laptop', x: 810, y: 390, label: 'ร้านกาแฟ' }),
  h({ id: 'iCab1', kind: 'cable', x: 150, y: 130, to: 'net' }),
  h({ id: 'iCab2', kind: 'cable', x: 810, y: 130, to: 'net' }),
  h({ id: 'iCab3', kind: 'cable', x: 150, y: 390, to: 'net' }),
  h({ id: 'iCab4', kind: 'cable', x: 810, y: 390, to: 'net' }),
  h({ id: 'iLbl', kind: 'label', x: 480, y: 500, label: 'Internet = network ทั่วโลกมาต่อกัน' }),

  // ฉาก 9: ทำไมต้องมี network
  h({ id: 'why1', kind: 'label', x: 480, y: 150, label: '📁 แชร์ไฟล์ให้กันได้' }),
  h({ id: 'why2', kind: 'label', x: 480, y: 270, label: '🖨️ ใช้ปริ้นเตอร์เครื่องเดียวร่วมกัน' }),
  h({ id: 'why3', kind: 'label', x: 480, y: 390, label: '🌐 ทุกเครื่องออก Internet ได้' }),

  // ฉาก 10: สรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 110, label: 'Network = บ้าน (เครื่อง) + ถนน (สาย/ไวไฟ)' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 220, label: 'LAN = network ในที่เดียว (บ้าน ออฟฟิศ)' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 330, label: 'WAN = network ที่ต่อสาขาไกล ๆ ข้ามเมือง' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 440, label: 'Internet = network ทั่วโลกมาต่อกัน' }),
]

export const lesson: Lesson = {
  id: 'p0-l1',
  part: 0,
  order: 1,
  status: 'ready',
  titleTh: 'Network คืออะไร',
  analogyTh: 'ถนนกับรถส่งของ',
  ciscoModules: ['ITN 1'],
  videos: [{ youtubeId: '-0zk67Z__18', titleTh: 'Basic Network ตอนที่ 1 : ทำความรู้จักกับ Network', channel: '9hua Training' }],
  terms: ['network', 'data', 'lan', 'wan', 'internet'],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'ไม่มีถนน', lifeIcon: '🏠',
        lifeTh: 'บ้านสองหลังอยู่ห่างกัน แต่ไม่มีถนนถึงกัน ของที่จะส่งก็ไปไม่ถึง',
        narrationTh: 'ลองนึกดูนะครับ มีบ้านสองหลัง อยู่ห่างกัน บ้านเอ อยากส่งของ ไปให้บ้านบี แต่ระหว่างบ้าน ไม่มีถนนเลย แล้วจะส่งยังไงดี',
        setup: show(...roadBase),
        actions: [glow('parcel'), ...show('noRoad')],
      },
      {
        id: 's2', chipTh: 'มีถนน', lifeIcon: '🚚',
        lifeTh: 'พอมีถนน รถส่งของก็วิ่งเอาของไปถึงบ้านเพื่อนได้',
        narrationTh: 'คำตอบง่ายมากครับ ต้องมีถนนก่อน พอมีถนนแล้ว รถส่งของ ก็วิ่งเอาของ ไปถึงบ้านบีได้',
        setup: show(...roadBase),
        actions: [
          ...show('road'),
          { type: 'trail', path: ['houseA', 'houseB'], tone: 'deliver' },
          { type: 'moveAlong', actor: 'parcel', path: ['houseA', 'houseB'], msPerHop: 2500, offset: ABOVE },
          glow('houseB'),
          ...show('roadLbl'),
        ],
      },
      {
        id: 's3', chipTh: 'คอมก็เหมือนกัน', lifeIcon: '💻',
        lifeTh: 'คอมก็มีถนนของมัน คือสายกับไวไฟ ส่วนของที่ส่งคือรูป เพลง ข้อความแชต',
        narrationTh: 'คอมพิวเตอร์ก็เหมือนกันเลย ถนนของคอม คือสาย หรือสัญญาณไวไฟ ส่วนของที่ส่ง ก็คือข้อมูล ภาษาอังกฤษเรียกว่า data เช่น รูป เพลง ข้อความแชต',
        setup: show('pcA', 'pcB', 'pcCab', 'data'),
        actions: [
          { type: 'trail', path: ['pcA', 'pcB'], tone: 'deliver' },
          { type: 'moveAlong', actor: 'data', path: ['pcA', 'pcB'], msPerHop: 2500, offset: ABOVE },
          ...show('wireLbl', 'dataLbl'),
        ],
      },
      {
        id: 's4', chipTh: 'Network', lifeIcon: '🏘️',
        lifeTh: 'บ้านทั้งหมู่บ้านมีถนนต่อถึงกันหมด ส่งของหากันได้ทุกหลัง',
        narrationTh: 'เครื่องหลายเครื่อง ที่ต่อถึงกัน ด้วยสายหรือไวไฟ จนส่งข้อมูลหากันได้ แบบนี้เรียกว่า network ครับ เหมือนบ้านทั้งหมู่บ้าน ที่มีถนนต่อถึงกันหมด',
        setup: show('n1', 'n2', 'n3', 'nCab1', 'nCab2', 'nData'),
        actions: [
          { type: 'trail', path: ['n1', 'n2', 'n3'], tone: 'deliver' },
          { type: 'moveAlong', actor: 'nData', path: ['n1', 'n2', 'n3'], msPerHop: 1300, offset: ABOVE },
          ...show('netLbl'),
        ],
      },
      {
        id: 's5', chipTh: 'LAN ในบ้าน', lifeIcon: '🏠',
        lifeTh: 'ในบ้านเรา คอมกับโน้ตบุ๊กต่อเน็ตบ้านเดียวกัน อยู่ใกล้ ๆ กัน',
        narrationTh: 'network มีหลายขนาดนะ ขนาดเล็กสุด ก็คือในบ้านเรา คอมกับโน้ตบุ๊ก ต่อสาย หรือไวไฟ เข้าหากัน อยู่ในที่เดียว ระยะใกล้ ๆ แบบนี้เรียกว่า LAN',
        setup: show(...homeBase),
        actions: show('homeLbl'),
      },
      {
        id: 's6', chipTh: 'LAN ออฟฟิศ', lifeIcon: '🏢',
        lifeTh: 'ในออฟฟิศ คอมทุกโต๊ะต่อถึงกัน อยู่ในตึกเดียว บริษัทดูแลสายเอง',
        narrationTh: 'ออฟฟิศ ก็เป็น LAN เหมือนกันครับ แค่มีคอมเยอะขึ้น แต่ยังอยู่ในตึกเดียว ระยะใกล้ ๆ ข้อมูลเลยวิ่งได้เร็ว และบริษัทดูแลสายพวกนี้เอง',
        setup: show(...officeBase),
        actions: show('officeLan'),
      },
      {
        id: 's7', chipTh: 'WAN', lifeIcon: '🛣️',
        lifeTh: 'สาขากรุงเทพกับเชียงใหม่อยู่ไกลกัน ต้องเช่าสายเส้นยาวจากค่ายเน็ต',
        narrationTh: 'ถ้าบริษัท มีสาขาอยู่ไกลกัน เช่น กรุงเทพ กับเชียงใหม่ ต้องต่อสายเส้นยาว ข้ามเมือง แบบนี้เรียกว่า WAN บริษัทเดินสายเองข้ามจังหวัดไม่ไหว ส่วนมากเลยต้องเช่าจากค่ายเน็ต',
        setup: show(...wanBase, 'wanData'),
        actions: [
          { type: 'trail', path: ['bk2', 'cm1'], tone: 'deliver' },
          { type: 'moveAlong', actor: 'wanData', path: ['bk2', 'cm1'], msPerHop: 3000, offset: { dx: 0, dy: 95 } },
          ...show('wanLbl'),
        ],
      },
      {
        id: 's8', chipTh: 'Internet', lifeIcon: '🌏',
        lifeTh: 'บ้าน ออฟฟิศ ร้านกาแฟทั่วโลก ต่อถึงกันหมด',
        narrationTh: 'แล้วถ้าเอา network ทั่วโลก มาต่อกันหมดล่ะ ก็เหมือนบ้านทั้งประเทศ ที่มีถนนต่อถึงกันหมด แต่ใหญ่กว่านั้นอีก เพราะต่อกันทั้งโลก นี่แหละครับ คือ Internet',
        setup: show(...netBase),
        actions: [glow('net'), ...show('iLbl')],
      },
      {
        id: 's9', chipTh: 'ทำไมต้องมี', lifeIcon: '🖨️',
        lifeTh: 'ออฟฟิศที่ต่อเครื่องถึงกัน ส่งไฟล์ให้กันได้ ใช้ปริ้นเตอร์เครื่องเดียว และออกเน็ตได้ทุกโต๊ะ',
        narrationTh: 'แล้วทำไมต้องมี network ล่ะ เพราะพอเครื่องต่อถึงกัน เราแชร์ไฟล์ให้กันได้ ใช้ปริ้นเตอร์เครื่องเดียว ร่วมกันได้ และทุกเครื่อง ก็ออก Internet ได้ด้วย',
        setup: [],
        actions: show('why1', 'why2', 'why3'),
      },
      {
        id: 's10', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'บ้านกับถนน คือเครื่องกับสาย ส่วนชื่อเรียกต่างกันตามระยะทาง',
        narrationTh: 'สรุปนะครับ network คือเครื่องที่ต่อถึงกัน เหมือนบ้านกับถนน ข้อมูลคือของที่ส่ง LAN คือ network ในที่เดียว WAN คือ network ที่ต่อข้ามเมือง และ Internet คือ network ทั่วโลกมาต่อกัน',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4'),
      },
    ],
  },

  lab: {
    kind: 'match',
    introTh: 'จับคู่ของในชีวิตจริง กับของใน network ให้ถูกนะ ลองนึกภาพบ้านกับถนน ที่เพิ่งดูไป',
    items: [
      { id: 'road', textTh: 'ถนน' },
      { id: 'parcel', textTh: 'พัสดุที่ส่งไปมา' },
      { id: 'house', textTh: 'บ้านแต่ละหลัง' },
      { id: 'village', textTh: 'หมู่บ้านเดียวกัน ที่มีถนนต่อถึงกันหมด' },
      { id: 'highway', textTh: 'หมู่บ้านคนละจังหวัด ที่ต่อกันด้วยทางหลวง' },
      { id: 'cable', textTh: 'สาย หรือ สัญญาณไวไฟ' },
      { id: 'data', textTh: 'ข้อมูล เช่น รูป เพลง ข้อความแชต' },
      { id: 'computer', textTh: 'คอมพิวเตอร์แต่ละเครื่อง' },
      { id: 'lan', textTh: 'LAN (network ในที่เดียว)' },
      { id: 'wan', textTh: 'WAN (network ที่ต่อสาขาไกล ๆ เข้าหากัน)' },
    ],
    answer: { road: 'cable', parcel: 'data', house: 'computer', village: 'lan', highway: 'wan' },
    explainTh: 'จับคู่ตามหน้าที่นะ ถามตัวเองว่า ของชิ้นนี้ทำหน้าที่อะไร ถนนมีไว้ให้ของวิ่ง แล้วในคอม อะไรเป็นทางให้ข้อมูลวิ่ง ส่วนหมู่บ้าน ให้ดูที่ระยะทาง ใกล้ หรือไกล',
    rightTh: 'ใช่เลย ถนนคือสาย เพราะเป็นทางให้ข้อมูลวิ่ง ส่วน LAN กับ WAN ต่างกันที่ระยะ ใกล้ในที่เดียว หรือไกลข้ามเมือง',
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'ทำไมคอมสองเครื่อง ต้องมีสาย หรือสัญญาณไวไฟต่อกัน ถึงจะส่งข้อมูลหากันได้',
      choices: [
        { id: 'a', text: 'เพราะสายหรือสัญญาณ เป็นเหมือนถนน ข้อมูลต้องมีทางวิ่งไปถึงอีกเครื่อง' },
        { id: 'b', text: 'เพราะต้องมีสาย คอมถึงจะเปิดติด' },
        { id: 'c', text: 'เพราะต้องมีสาย คอมถึงจะเก็บไฟล์ในเครื่องได้' },
        { id: 'd', text: 'ไม่ต้องมีก็ได้ ข้อมูลลอยไปเองได้' },
      ],
      correct: ['a'],
      explainTh: 'ข้อมูลก็เหมือนพัสดุ ถ้าไม่มีถนน รถก็ไปไม่ถึง สายหรือสัญญาณไวไฟ คือถนนของข้อมูล ไม่มีทาง ข้อมูลก็ไปไม่ถึงอีกเครื่อง',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'คอมเอ กับคอมบี ต่อกันด้วยสายเส้นเดียว ถ้าสายเส้นนี้ขาด จะเกิดอะไรขึ้น',
      choices: [
        { id: 'a', text: 'ข้อมูลจากคอมเอ ส่งไปไม่ถึงคอมบี' },
        { id: 'b', text: 'ข้อมูลจะวิ่งเร็วขึ้น เพราะทางโล่ง' },
        { id: 'c', text: 'คอมบียังได้ข้อมูลครบ เหมือนเดิม' },
        { id: 'd', text: 'ไฟล์ทุกไฟล์ในคอมเอ จะหายหมด' },
      ],
      correct: ['a'],
      explainTh: 'สายคือถนนเส้นเดียวที่มี ถนนขาด รถส่งของก็ไปต่อไม่ได้ ข้อมูลเลยไปไม่ถึงคอมบี แต่ไฟล์ในเครื่องไม่ได้หายนะ แค่ส่งไม่ได้',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'บริษัทมีออฟฟิศที่กรุงเทพ กับเชียงใหม่ อยากให้คอมสองที่ ส่งข้อมูลหากันได้ ต้องใช้ network แบบไหน เพราะอะไร',
      choices: [
        { id: 'a', text: 'WAN เพราะต้องต่อสองเมืองที่อยู่ไกลกัน' },
        { id: 'b', text: 'LAN เพราะเป็นบริษัทเดียวกัน' },
        { id: 'c', text: 'ไม่ต้องต่ออะไรเลย เพราะเป็นบริษัทเดียวกันอยู่แล้ว' },
        { id: 'd', text: 'LAN เพราะ LAN ต่อได้ไกลกว่า WAN' },
      ],
      correct: ['a'],
      explainTh: 'ดูที่ระยะทาง ไม่ใช่ดูว่าบริษัทเดียวกันไหม LAN คือ network ในที่เดียว ส่วนกรุงเทพกับเชียงใหม่ไกลกันมาก ต้องต่อสายเส้นยาวข้ามเมือง แบบนี้คือ WAN',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'ทำไมออฟฟิศ ถึงอยากให้คอมทุกเครื่อง ต่อเป็น network เดียวกัน',
      choices: [
        { id: 'a', text: 'จะได้แชร์ไฟล์ ใช้ปริ้นเตอร์ร่วมกัน และออกเน็ตได้ทุกเครื่อง' },
        { id: 'b', text: 'จะได้ให้คอมทำงานเร็วขึ้นเอง ทั้งที่ไม่ได้ส่งอะไรหากัน' },
        { id: 'c', text: 'เพราะคอมที่ไม่ได้ต่อ network จะเปิดไม่ติด' },
        { id: 'd', text: 'จะได้ประหยัดไฟ ไม่ต้องเสียบปลั๊ก' },
      ],
      correct: ['a'],
      explainTh: 'ต่อ network เพราะอยากส่งของถึงกัน เช่น ส่งไฟล์ให้เพื่อน สั่งปริ้นเตอร์เครื่องเดียวจากทุกโต๊ะ และใช้เน็ตร่วมกัน คอมที่ไม่ต่อ network ก็ยังเปิดใช้ได้ แค่ส่งอะไรหาใครไม่ได้',
    },
    {
      id: 'q5',
      layer: 'en',
      prompt: 'Which type of network is typically used to connect devices within a single building, such as an office?',
      promptTh: 'network แบบไหน ที่ปกติใช้ต่ออุปกรณ์ที่อยู่ในตึกเดียว เช่น ในออฟฟิศ',
      keywords: ['single building'],
      choices: [
        { id: 'a', text: 'LAN', textTh: 'LAN (network ในที่เดียว)' },
        { id: 'b', text: 'WAN', textTh: 'WAN (network ที่ต่อสาขาไกล ๆ เข้าหากัน)' },
        { id: 'c', text: 'The Internet', textTh: 'Internet (network ทั่วโลกมาต่อกัน)' },
        { id: 'd', text: 'None. Devices in one building cannot share a network.', textTh: 'ไม่มี อุปกรณ์ในตึกเดียวกัน ต่อ network ร่วมกันไม่ได้' },
      ],
      correct: ['a'],
      explainTh: 'ตึกเดียว คือที่เดียว ระยะใกล้ ๆ แบบนี้คือ LAN ส่วน WAN ใช้ต่อสาขาไกล ๆ เข้าหากัน',
    },
    {
      id: 'q6',
      layer: 'en',
      prompt: 'Which statement describes a WAN?',
      promptTh: 'ข้อไหนอธิบาย WAN ได้ถูก',
      keywords: ['WAN'],
      choices: [
        { id: 'a', text: 'It connects LANs that are far apart, often using links from a service provider.', textTh: 'มันต่อ LAN ที่อยู่ไกลกัน ส่วนมากใช้สายที่เช่าจากผู้ให้บริการ (เช่น ค่ายเน็ต)' },
        { id: 'b', text: 'It connects devices only inside one home.', textTh: 'มันต่ออุปกรณ์ได้แค่ในบ้านหลังเดียว' },
        { id: 'c', text: 'It connects devices only inside one room.', textTh: 'มันต่ออุปกรณ์ได้แค่ในห้องเดียว' },
        { id: 'd', text: 'It can only send data using wireless signals.', textTh: 'มันส่งข้อมูลได้แค่ทางสัญญาณไร้สาย (ไวไฟ)' },
      ],
      correct: ['a'],
      explainTh: 'WAN คือ network ที่ต่อสาขาไกล ๆ เข้าหากัน ด้วยสายเส้นยาวข้ามเมือง ส่วนมากต้องเช่าจากผู้ให้บริการ เพราะบริษัทเดินสายเองข้ามจังหวัดไม่ไหว ส่วนในบ้าน หรือในห้องเดียว คือ LAN',
    },
    {
      id: 'q7',
      layer: 'en',
      prompt: 'Which two statements describe the Internet? (Choose two.)',
      promptTh: 'ข้อไหน 2 ข้อ ที่อธิบาย Internet ได้ถูก (เลือก 2 ข้อ)',
      keywords: ['two', 'Internet'],
      choices: [
        { id: 'a', text: 'It is a worldwide collection of interconnected networks.', textTh: 'มันคือ network ทั่วโลก ที่มาต่อถึงกัน' },
        { id: 'b', text: 'It is not owned by any single person or company.', textTh: 'ไม่มีคนไหน หรือบริษัทไหน เป็นเจ้าของคนเดียว' },
        { id: 'c', text: 'It is a single LAN owned by one company.', textTh: 'มันคือ LAN วงเดียว ที่บริษัทเดียวเป็นเจ้าของ' },
        { id: 'd', text: 'It is a single wire that connects two computers in the same room.', textTh: 'มันคือสายเส้นเดียว ที่ต่อคอมสองเครื่องในห้องเดียวกัน' },
      ],
      correct: ['a', 'b'],
      explainTh: 'Internet คือการเอา network เล็ก ๆ ทั่วโลกมาต่อกัน เหมือนบ้านทั้งประเทศ ที่มีถนนต่อถึงกันหมด เลยไม่มีใครเป็นเจ้าของคนเดียว มันไม่ใช่ LAN วงเดียว และไม่ใช่สายเส้นเดียว',
    },
  ],
}
