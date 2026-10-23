import type { Actor, Lesson, SceneAction } from '../types'

const hidden = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const hide = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'hide', actor }))

const actors: Actor[] = [
  // ฉาก 1-4: บ้านสองหลังกับถนน
  { id: 'houseA', kind: 'house', x: 180, y: 170, label: 'บ้านเอ' },
  { id: 'houseB', kind: 'house', x: 780, y: 170, label: 'บ้านบี' },
  { id: 'parcel', kind: 'box', x: 330, y: 180, label: 'ของ' },
  { id: 'wA', kind: 'label', x: 180, y: 300 },
  { id: 'wB', kind: 'label', x: 780, y: 300 },
  hidden({ id: 'road', kind: 'cable', x: 180, y: 300, to: 'wB' }),
  hidden({ id: 'truck', kind: 'truck', x: 180, y: 300, label: 'รถส่งของ' }),
  hidden({ id: 'pcA', kind: 'pc', x: 180, y: 170, label: 'คอมเอ' }),
  hidden({ id: 'pcB', kind: 'pc', x: 780, y: 170, label: 'คอมบี' }),
  hidden({ id: 'roadLbl', kind: 'label', x: 480, y: 400, label: 'ถนน = สาย หรือ สัญญาณไวไฟ' }),
  hidden({ id: 'data', kind: 'envelope', x: 180, y: 300, label: 'ข้อมูล' }),
  hidden({ id: 'netLbl', kind: 'label', x: 480, y: 460, label: 'Network = เครื่อง + ทางที่ต่อถึงกัน' }),

  // ฉาก 5: บ้านเรา = LAN เล็ก
  hidden({ id: 'home', kind: 'house', x: 480, y: 150, label: 'บ้านเรา' }),
  hidden({ id: 'homePc', kind: 'pc', x: 280, y: 330, label: 'คอม' }),
  hidden({ id: 'homeLaptop', kind: 'laptop', x: 680, y: 330, label: 'โน้ตบุ๊ก' }),
  hidden({ id: 'homeCab1', kind: 'cable', x: 280, y: 330, to: 'home' }),
  hidden({ id: 'homeCab2', kind: 'cable', x: 680, y: 330, to: 'home' }),
  hidden({ id: 'homeLbl', kind: 'label', x: 480, y: 470, label: 'LAN = network ในที่เดียว เช่น ในบ้าน' }),

  // ฉาก 6: ออฟฟิศ = LAN ที่ใหญ่ขึ้น
  hidden({ id: 'officeLbl', kind: 'label', x: 480, y: 90, label: 'ออฟฟิศ (อยู่ในตึกเดียว)' }),
  hidden({ id: 'o1', kind: 'pc', x: 210, y: 240, label: 'คอม 1' }),
  hidden({ id: 'o2', kind: 'pc', x: 390, y: 240, label: 'คอม 2' }),
  hidden({ id: 'o3', kind: 'pc', x: 570, y: 240, label: 'คอม 3' }),
  hidden({ id: 'o4', kind: 'pc', x: 750, y: 240, label: 'คอม 4' }),
  hidden({ id: 'oCab1', kind: 'cable', x: 210, y: 240, to: 'o2' }),
  hidden({ id: 'oCab2', kind: 'cable', x: 390, y: 240, to: 'o3' }),
  hidden({ id: 'oCab3', kind: 'cable', x: 570, y: 240, to: 'o4' }),
  hidden({ id: 'officeLan', kind: 'label', x: 480, y: 420, label: 'ออฟฟิศ ก็เป็น LAN แค่เครื่องเยอะขึ้น' }),

  // ฉาก 7: สาขาไกลกัน = WAN
  hidden({ id: 'bkkLbl', kind: 'label', x: 180, y: 110, label: 'กรุงเทพ' }),
  hidden({ id: 'cmLbl', kind: 'label', x: 780, y: 110, label: 'เชียงใหม่' }),
  hidden({ id: 'bk1', kind: 'pc', x: 110, y: 240 }),
  hidden({ id: 'bk2', kind: 'pc', x: 250, y: 240 }),
  hidden({ id: 'cm1', kind: 'pc', x: 710, y: 240 }),
  hidden({ id: 'cm2', kind: 'pc', x: 850, y: 240 }),
  hidden({ id: 'bkCab', kind: 'cable', x: 110, y: 240, to: 'bk2' }),
  hidden({ id: 'cmCab', kind: 'cable', x: 710, y: 240, to: 'cm2' }),
  hidden({ id: 'wanCab', kind: 'cable', x: 250, y: 240, to: 'cm1' }),
  hidden({ id: 'rentLbl', kind: 'label', x: 480, y: 190, label: 'สายเส้นยาว เช่าจากค่ายเน็ต' }),
  hidden({ id: 'wanData', kind: 'envelope', x: 300, y: 240 }),
  hidden({ id: 'wanLbl', kind: 'label', x: 480, y: 420, label: 'WAN = ต่อ LAN ที่อยู่ไกลกัน ข้ามเมือง' }),

  // ฉาก 8: Internet = network ทั่วโลกมาต่อกัน
  hidden({ id: 'net', kind: 'cloud', x: 480, y: 250, label: 'Internet' }),
  hidden({ id: 'iHome1', kind: 'house', x: 150, y: 130, label: 'บ้าน' }),
  hidden({ id: 'iHome2', kind: 'house', x: 810, y: 130, label: 'บ้าน' }),
  hidden({ id: 'iOffice', kind: 'pc', x: 150, y: 390, label: 'ออฟฟิศ' }),
  hidden({ id: 'iCafe', kind: 'laptop', x: 810, y: 390, label: 'ร้านกาแฟ' }),
  hidden({ id: 'iCab1', kind: 'cable', x: 150, y: 130, to: 'net' }),
  hidden({ id: 'iCab2', kind: 'cable', x: 810, y: 130, to: 'net' }),
  hidden({ id: 'iCab3', kind: 'cable', x: 150, y: 390, to: 'net' }),
  hidden({ id: 'iCab4', kind: 'cable', x: 810, y: 390, to: 'net' }),
  hidden({ id: 'iLbl', kind: 'label', x: 480, y: 500, label: 'Internet = network ทั่วโลกมาต่อกัน' }),

  // ฉาก 9: ทำไมต้องมี network
  hidden({ id: 'why1', kind: 'label', x: 480, y: 150, label: '📁 แชร์ไฟล์ให้กันได้' }),
  hidden({ id: 'why2', kind: 'label', x: 480, y: 270, label: '🖨️ ใช้ปริ้นเตอร์เครื่องเดียวร่วมกัน' }),
  hidden({ id: 'why3', kind: 'label', x: 480, y: 390, label: '🌐 ทุกเครื่องออก Internet ได้' }),

  // ฉาก 10: สรุป
  hidden({ id: 'sum1', kind: 'label', x: 480, y: 110, label: 'Network = บ้าน (เครื่อง) + ถนน (สาย/ไวไฟ)' }),
  hidden({ id: 'sum2', kind: 'label', x: 480, y: 220, label: 'LAN = network ในที่เดียว (บ้าน ออฟฟิศ)' }),
  hidden({ id: 'sum3', kind: 'label', x: 480, y: 330, label: 'WAN = network ที่ต่อสาขาไกล ๆ ข้ามเมือง' }),
  hidden({ id: 'sum4', kind: 'label', x: 480, y: 440, label: 'Internet = network ทั่วโลกมาต่อกัน' }),
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
  terms: ['network', 'lan', 'wan', 'internet'],

  scenes: {
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1',
        narrationTh: 'ลองนึกดูนะครับ มีบ้านสองหลัง อยู่ห่างกัน บ้านเอ อยากส่งของ ไปให้บ้านบี แต่ระหว่างบ้าน ไม่มีถนนเลย แล้วจะส่งยังไงดี',
        actions: [{ type: 'highlight', actor: 'parcel' }],
      },
      {
        id: 's2',
        narrationTh: 'คำตอบง่ายมากครับ ต้องมีถนนก่อน พอมีถนนแล้ว รถส่งของ ก็วิ่งเอาของ ไปถึงบ้านบีได้',
        actions: [
          ...hide('parcel'),
          ...show('road', 'truck'),
          { type: 'move', actor: 'truck', x: 780, y: 300, ms: 2500 },
        ],
      },
      {
        id: 's3',
        narrationTh: 'คอมพิวเตอร์ก็เหมือนกันเลย ถนนของคอม คือสาย หรือสัญญาณไวไฟ ส่วนของที่ส่ง ก็คือข้อมูล เช่น รูป เพลง ข้อความแชต',
        actions: [
          ...hide('truck', 'houseA', 'houseB'),
          ...show('pcA', 'pcB', 'roadLbl', 'data'),
          { type: 'move', actor: 'data', x: 780, y: 300, ms: 2500 },
        ],
      },
      {
        id: 's4',
        narrationTh: 'เครื่องหลายเครื่อง ที่ต่อถึงกัน ด้วยสายหรือไวไฟ จนส่งข้อมูลหากันได้ แบบนี้เรียกว่า network ครับ เหมือนบ้านทั้งหมู่บ้าน ที่มีถนนต่อถึงกันหมด',
        actions: [
          ...hide('data', 'roadLbl'),
          { type: 'highlight', actor: 'road' },
          ...show('netLbl'),
        ],
      },
      {
        id: 's5',
        narrationTh: 'network มีหลายขนาดนะ ขนาดเล็กสุด ก็คือในบ้านเรา คอมกับโน้ตบุ๊ก ต่อสาย หรือไวไฟ เข้าหากัน อยู่ในที่เดียว ระยะใกล้ ๆ แบบนี้เรียกว่า LAN',
        actions: [
          ...hide('pcA', 'pcB', 'road', 'netLbl'),
          ...show('home', 'homePc', 'homeLaptop', 'homeCab1', 'homeCab2', 'homeLbl'),
        ],
      },
      {
        id: 's6',
        narrationTh: 'ออฟฟิศ ก็เป็น LAN เหมือนกันครับ แค่มีคอมเยอะขึ้น แต่ยังอยู่ในตึกเดียว ระยะใกล้ ๆ ข้อมูลเลยวิ่งได้เร็ว และบริษัทดูแลสายพวกนี้เอง',
        actions: [
          ...hide('home', 'homePc', 'homeLaptop', 'homeCab1', 'homeCab2', 'homeLbl'),
          ...show('officeLbl', 'o1', 'o2', 'o3', 'o4', 'oCab1', 'oCab2', 'oCab3', 'officeLan'),
        ],
      },
      {
        id: 's7',
        narrationTh: 'ถ้าบริษัท มีสาขาอยู่ไกลกัน เช่น กรุงเทพ กับเชียงใหม่ ต้องต่อสายเส้นยาว ข้ามเมือง แบบนี้เรียกว่า WAN บริษัทเดินสายเองข้ามจังหวัดไม่ไหว ส่วนมากเลยต้องเช่าจากค่ายเน็ต',
        actions: [
          ...hide('officeLbl', 'o1', 'o2', 'o3', 'o4', 'oCab1', 'oCab2', 'oCab3', 'officeLan'),
          ...show('bkkLbl', 'cmLbl', 'bk1', 'bk2', 'cm1', 'cm2', 'bkCab', 'cmCab', 'wanCab', 'rentLbl', 'wanData', 'wanLbl'),
          { type: 'highlight', actor: 'wanCab' },
          { type: 'move', actor: 'wanData', x: 660, y: 240, ms: 3000 },
        ],
      },
      {
        id: 's8',
        narrationTh: 'แล้วถ้าเอา network ทั่วโลก มาต่อกันหมดล่ะ ก็เหมือนบ้านทั้งประเทศ ที่มีถนนต่อถึงกันหมด แต่ใหญ่กว่านั้นอีก เพราะต่อกันทั้งโลก นี่แหละครับ คือ Internet',
        actions: [
          ...hide('bkkLbl', 'cmLbl', 'bk1', 'bk2', 'cm1', 'cm2', 'bkCab', 'cmCab', 'wanCab', 'rentLbl', 'wanData', 'wanLbl'),
          ...show('net', 'iHome1', 'iHome2', 'iOffice', 'iCafe', 'iCab1', 'iCab2', 'iCab3', 'iCab4', 'iLbl'),
        ],
      },
      {
        id: 's9',
        narrationTh: 'แล้วทำไมต้องมี network ล่ะ เพราะพอเครื่องต่อถึงกัน เราแชร์ไฟล์ให้กันได้ ใช้ปริ้นเตอร์เครื่องเดียว ร่วมกันได้ และทุกเครื่อง ก็ออก Internet ได้ด้วย',
        actions: [
          ...hide('net', 'iHome1', 'iHome2', 'iOffice', 'iCafe', 'iCab1', 'iCab2', 'iCab3', 'iCab4', 'iLbl'),
          ...show('why1', 'why2', 'why3'),
        ],
      },
      {
        id: 's10',
        narrationTh: 'สรุปนะครับ network คือเครื่องที่ต่อถึงกัน เหมือนบ้านกับถนน ข้อมูลคือของที่ส่ง LAN คือ network ในที่เดียว WAN คือ network ที่ต่อข้ามเมือง และ Internet คือ network ทั่วโลกมาต่อกัน',
        actions: [
          ...hide('why1', 'why2', 'why3'),
          ...show('sum1', 'sum2', 'sum3', 'sum4'),
        ],
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
        { id: 'd', text: 'It is one cable that connects two computers in the same room.', textTh: 'มันคือสายเส้นเดียว ที่ต่อคอมสองเครื่องในห้องเดียวกัน' },
      ],
      correct: ['a', 'b'],
      explainTh: 'Internet คือการเอา network เล็ก ๆ ทั่วโลกมาต่อกัน เหมือนบ้านทั้งประเทศ ที่มีถนนต่อถึงกันหมด เลยไม่มีใครเป็นเจ้าของคนเดียว มันไม่ใช่ LAN วงเดียว และไม่ใช่สายเส้นเดียว',
    },
  ],
}
