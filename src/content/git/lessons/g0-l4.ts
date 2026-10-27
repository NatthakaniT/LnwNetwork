import type { Actor, Lesson, SceneAction } from '../../types'
import type { World } from '../../../gitsim/types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })
const mv = (actor: string, x: number, y: number, ms = 900): SceneAction => ({ type: 'move', actor, x, y, ms })
const zones = ['zh1', 'zh2', 'zh3', 'ar1', 'ar2']

const actors: Actor[] = [
  // ฉาก 1: อยากเซฟแค่ไฟล์ที่เสร็จ
  h({ id: 'pa', kind: 'file', x: 240, y: 200, label: 'index.html\nเสร็จแล้ว ✅' }),
  h({ id: 'pb', kind: 'file', x: 720, y: 200, label: 'notes.txt\nยังทำไม่เสร็จ 🚧' }),
  h({ id: 'pq', kind: 'label', x: 480, y: 410, label: '🤔 อยากเซฟแค่ไฟล์ที่เสร็จ ทำยังไง' }),

  // หัวคอลัมน์สามที่ (ใช้ฉาก 2 ถึง 5)
  h({ id: 'zh1', kind: 'label', x: 170, y: 100, label: 'โฟลเดอร์งาน' }),
  h({ id: 'zh2', kind: 'label', x: 480, y: 100, label: 'กล่อง staging area' }),
  h({ id: 'zh3', kind: 'label', x: 790, y: 100, label: 'ประวัติ repository' }),
  h({ id: 'ar1', kind: 'label', x: 325, y: 270, label: '→' }),
  h({ id: 'ar2', kind: 'label', x: 635, y: 270, label: '→' }),

  // ฉาก 2-4: ไฟล์เดินทาง
  h({ id: 'f1', kind: 'file', x: 170, y: 270, label: 'index.html' }),
  h({ id: 'cmdAdd', kind: 'card', x: 480, y: 430, lines: ['$ git add index.html'], tone: 'deliver' }),
  h({ id: 'noAdd', kind: 'label', x: 480, y: 495, label: 'ไม่ add = ไฟล์อยู่นอกกล่อง commit ไม่มีมัน' }),
  h({ id: 'cmdCm', kind: 'card', x: 480, y: 430, lines: ['$ git commit -m "หน้าแรก"'], tone: 'deliver' }),
  h({ id: 'noCm', kind: 'label', x: 480, y: 495, label: 'ไม่ commit = ของในกล่องยังไม่เป็นจุดเซฟ' }),
  h({ id: 'cmt1', kind: 'commit', x: 790, y: 270, label: 'หน้าแรก' }),

  // ฉาก 5: เลือกบางไฟล์
  h({ id: 'g1', kind: 'file', x: 170, y: 190, label: 'index.html' }),
  h({ id: 'g2', kind: 'file', x: 170, y: 360, label: 'notes.txt' }),
  h({ id: 'cmtB', kind: 'commit', x: 790, y: 190, label: 'มีแค่ index.html' }),
  h({ id: 'cmdTwo', kind: 'card', x: 480, y: 465, lines: ['$ git add index.html', '$ git commit -m "หน้าแรก"'], tone: 'deliver' }),

  // ฉาก 6: git status
  h({ id: 'st', kind: 'table', x: 480, y: 190, titleTh: '🔎 git status บอกว่าอยู่ที่ไหน', columns: ['ไฟล์', 'อยู่ที่ไหน'], rows: [] }),
  h({ id: 'stCmd', kind: 'card', x: 480, y: 390, lines: ['$ git status'], tone: 'deliver' }),
  h({ id: 'noSt', kind: 'label', x: 480, y: 470, label: 'ไม่พิมพ์ = ไม่รู้ว่าอะไรอยู่ในกล่อง' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 80, label: 'ไฟล์เดินทางผ่านสามที่' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 180, label: 'git add = ย้ายเข้ากล่อง staging area' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 280, label: 'git commit = ปิดผนึก เก็บเป็นจุดเซฟ' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 380, label: 'git status = ดูว่าไฟล์อยู่ที่ไหน' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 480, label: 'ได้เลือกเองว่าจะเซฟอะไรบ้าง' }),
]

const mk = (name: string) => ({ name, files: {}, staged: null, repo: null })
const start: World = {
  me: { ...mk('me'), files: { 'index.html': '<h1>หน้าแรก</h1>', 'notes.txt': 'จดไว้ก่อน ยังไม่เสร็จ' } },
  friend: mk('friend'),
  github: null,
}

export const lesson: Lesson = {
  id: 'g0-l4',
  part: 0,
  order: 4,
  status: 'ready',
  titleTh: 'git add',
  analogyTh: 'เลือกของใส่กล่องก่อนปิดผนึก',
  ciscoModules: [],
  requires: [
    { lesson: 'g0-l3', useTh: 'commit คือจุดเซฟ และก่อน commit ต้อง git add บทนี้อธิบายว่า git add ทำอะไร ทำไมต้องมีขั้นนี้' },
  ],
  precheck: [
    {
      id: 'c1',
      layer: 'th',
      reviewLesson: 'g0-l3',
      prompt: 'ถ้าไม่พิมพ์ git init ในโฟลเดอร์ Git จะเป็นยังไง',
      choices: [
        { id: 'a', text: 'Git ยังไม่ได้ดูแลโฟลเดอร์นี้ จึงไม่จดประวัติอะไรเลย' },
        { id: 'b', text: 'Git จดประวัติให้เองอยู่ดี' },
        { id: 'c', text: 'ไฟล์ในโฟลเดอร์จะถูกลบ' },
      ],
      correct: ['a'],
      explainTh: 'git init คือการเปิดสมุดประวัติเล่มใหม่ในโฟลเดอร์ ถ้ายังไม่เปิดสมุด ก็ไม่มีที่จดจุดเซฟ ไฟล์ไม่เสียหาย',
    },
    {
      id: 'c2',
      layer: 'th',
      reviewLesson: 'g0-l3',
      prompt: 'commit หนึ่งอันคืออะไร',
      choices: [
        { id: 'a', text: 'การส่งไฟล์ให้เพื่อน' },
        { id: 'b', text: 'จุดเซฟหนึ่งจุด เก็บสภาพไฟล์ตอนนั้นพร้อมข้อความที่เราเขียน' },
        { id: 'c', text: 'ชื่อของโฟลเดอร์ที่ Git ดูแล' },
      ],
      correct: ['b'],
      explainTh: 'commit เหมือนกดเซฟเกมหนึ่งครั้ง Git เก็บสภาพไฟล์ไว้ให้ย้อนกลับได้ ยังไม่ได้ส่งให้ใคร',
    },
  ],
  videos: [
    { youtubeId: 'eSzam5vabTQ', titleTh: 'Git พื้นฐานสำหรับงาน AI Server · บทที่ 2 วงจรทำงานประจำวัน แก้ ดู add commit', channel: 'Panutat Tejasen',
      noteTh: 'คลิปสั้น เริ่มด้วยภาพสามที่ของไฟล์ ตรงกับภาพในบทนี้ แล้วทำให้ดูบน terminal จริง ฟังว่า add กับ commit ย้ายการแก้ไขไปที่ไหน ตัวอย่างเป็นงาน AI ไม่ต้องสนใจเนื้อหางาน สนใจแค่ลำดับ แก้ ดู add commit ช่วงไหนฟังไม่ทัน ข้ามได้' },
  ],
  terms: ['staging'],
  deepDives: [
    {
      titleTh: 'git add ตามด้วยจุด คืออะไร',
      bodyTh: 'git add ตามด้วยจุด หมายถึงเอาทุกไฟล์ที่เปลี่ยนในโฟลเดอร์นี้ใส่กล่อง สะดวกเวลาแก้หลายไฟล์ แต่ถ้ามีไฟล์ที่ยังไม่พร้อม ก็จะถูกใส่ไปด้วย ให้พิมพ์ git status ดูก่อนเสมอว่าอะไรอยู่ในกล่อง เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'แก้ไฟล์ซ้ำหลังจาก add แล้วเป็นยังไง',
      bodyTh: 'git add เก็บสภาพไฟล์ตอนที่พิมพ์ ถ้าแก้ไฟล์ต่ออีกหลังจากนั้น สิ่งที่แก้เพิ่มจะยังไม่อยู่ในกล่อง git status จะบอกว่าไฟล์เดียวกันอยู่ทั้งในกล่องและมีส่วนที่แก้เพิ่มอยู่ข้างนอก ต้อง git add อีกรอบถึงจะเอาส่วนที่แก้เพิ่มเข้าไปด้วย เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
  ],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'เซฟแค่บางไฟล์', lifeIcon: '🎒',
        lifeTh: 'จะส่งพัสดุ แต่ของบนโต๊ะมีทั้งของที่พร้อมส่งกับของที่ยังทำไม่เสร็จ ไม่อยากเหมาส่งไปหมด',
        narrationTh: 'แก้ไปสองไฟล์ ไฟล์หนึ่งเสร็จแล้ว อีกไฟล์ยังทำไม่เสร็จ อยากเซฟแค่ไฟล์ที่เสร็จ ถ้า Git เซฟทุกไฟล์เสมอ ก็เลือกไม่ได้ จึงมีขั้นเลือกไฟล์ก่อนเซฟ',
        setup: show('pa', 'pb'),
        actions: [...show('pq'), glow('pq')],
      },
      {
        id: 's2', chipTh: 'สามที่ของไฟล์', lifeIcon: '📦',
        lifeTh: 'ของอยู่บนโต๊ะ แล้วย้ายเข้ากล่อง แล้วปิดผนึกส่งเข้าคลัง ผ่านสามที่ตามลำดับ',
        narrationTh: 'ไฟล์เดินทางผ่านสามที่ แรกคือโฟลเดอร์งานที่เราแก้ไฟล์ สองคือกล่องรอปิดผนึก ชื่อทางการคือ staging area สามคือประวัติ ซึ่งก็คือ repository',
        setup: show('f1', ...zones),
        actions: [glow('zh1'), glow('zh2'), glow('zh3')],
      },
      {
        id: 's3', chipTh: 'git add', lifeIcon: '📥',
        lifeTh: 'หยิบของจากโต๊ะใส่กล่อง ของยังไม่ถูกปิดผนึก ยังหยิบออกมาเปลี่ยนได้',
        narrationTh: 'git add ย้ายไฟล์จากโฟลเดอร์งานเข้ากล่อง เหมือนเลือกของใส่กล่องก่อนปิดผนึก ถ้าไม่พิมพ์ git add ไฟล์จะอยู่นอกกล่อง และ commit ครั้งนี้จะไม่มีมัน',
        setup: show('f1', ...zones),
        actions: [...show('cmdAdd'), glow('cmdAdd'), mv('f1', 480, 270), ...show('noAdd')],
      },
      {
        id: 's4', chipTh: 'git commit', lifeIcon: '🔏',
        lifeTh: 'ปิดผนึกกล่องแล้วส่งเข้าคลัง กล่องกลับมาว่าง พร้อมใส่ของชุดต่อไป',
        narrationTh: 'git commit ปิดผนึกทุกอย่างในกล่อง แล้วเก็บเป็นจุดเซฟในประวัติ กล่องจะว่างลง ถ้าไม่พิมพ์ git commit ของในกล่องก็ยังไม่เป็นจุดเซฟ',
        setup: [...show('f1', ...zones), mv('f1', 480, 270, 0)],
        actions: [...show('cmdCm'), glow('cmdCm'), mv('f1', 790, 270), { type: 'hide', actor: 'f1' }, ...show('cmt1'), glow('cmt1'), ...show('noCm')],
      },
      {
        id: 's5', chipTh: 'เลือกแค่บางไฟล์', lifeIcon: '🎯',
        lifeTh: 'ส่งพัสดุเฉพาะของที่พร้อม ของที่ยังไม่เสร็จวางอยู่บนโต๊ะต่อ ไม่ถูกส่งไปด้วย',
        narrationTh: 'ลอง add แค่ index.html แล้ว commit จุดเซฟจะมีแค่ไฟล์นั้น ส่วน notes.txt ยังอยู่นอกกล่อง ไม่ถูกเซฟ นี่คือเหตุผลที่ Git มีกล่องไว้เลือกก่อน',
        setup: show('g1', 'g2', ...zones),
        actions: [
          ...show('cmdTwo'), glow('cmdTwo'),
          mv('g1', 480, 190), mv('g1', 790, 190), { type: 'hide', actor: 'g1' },
          ...show('cmtB'), glow('cmtB'),
          { type: 'say', actor: 'g2', text: 'ยังอยู่นอกกล่อง', mood: 'no' },
        ],
      },
      {
        id: 's6', chipTh: 'git status', lifeIcon: '🔎',
        lifeTh: 'ก่อนปิดผนึก เปิดกล่องดูอีกทีว่าใส่ของถูกชิ้นหรือเปล่า',
        narrationTh: 'ลืมไปแล้วว่าอะไรอยู่ในกล่อง ให้พิมพ์ git status มันบอกว่าแต่ละไฟล์อยู่ที่ไหน ถ้าไม่พิมพ์ก็ไม่รู้ ดูก่อน commit ทุกครั้งเป็นนิสัยที่ดี',
        setup: show('st'),
        actions: [
          ...show('stCmd'), glow('stCmd'),
          { type: 'setRows', actor: 'st', rows: [['index.html', 'อยู่ในกล่องแล้ว']] },
          { type: 'setRows', actor: 'st', rows: [['index.html', 'อยู่ในกล่องแล้ว'], ['notes.txt', 'ยังอยู่นอกกล่อง']] },
          ...show('noSt'),
        ],
      },
      {
        id: 's7', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'เลือกของใส่กล่องก่อนปิดผนึก',
        narrationTh: 'สรุป ไฟล์ผ่านสามที่ git add ย้ายเข้ากล่อง git commit ปิดผนึกเก็บเป็นจุดเซฟ git status ดูว่าอะไรอยู่ที่ไหน เราจึงเลือกเองได้ว่าจะเซฟอะไร',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'git',
    introTh: 'ในโฟลเดอร์งานมีสองไฟล์ index.html กับ notes.txt ทำให้จุดเซฟแรกมีแค่ index.html แล้วค่อยเอา notes.txt ตามเข้ากล่อง ดูภาพสามที่ของไฟล์ทางขวาเปลี่ยนตามทุกคำสั่ง',
    start,
    allowed: ['init', 'status', 'add', 'commit', 'log'],
    goals: [
      { type: 'state', taskTh: 'ให้ Git ดูแลโฟลเดอร์นี้', hintTh: 'พิมพ์ git init', check: 'onBranch', arg: 'main' },
      { type: 'state', taskTh: 'ใส่ index.html ลงกล่อง เฉพาะไฟล์นี้ไฟล์เดียว', hintTh: 'พิมพ์ git add index.html แล้วพิมพ์ git status ดูว่า notes.txt ยังอยู่นอกกล่อง', check: 'staged', arg: 'index.html' },
      { type: 'state', taskTh: 'ปิดผนึกกล่องเป็นจุดเซฟแรก', hintTh: 'พิมพ์ git commit -m "หน้าแรก"', check: 'committed' },
      { type: 'state', taskTh: 'เอา notes.txt ตามเข้ากล่องบ้าง ถ้า notes.txt ถูกเซฟไปแล้ว (เช่นเผลอพิมพ์ git add .) ให้กดชื่อไฟล์ notes.txt ทางขวา แก้ข้อความ กดบันทึกไฟล์ ก่อน เพราะ git add เก็บได้เฉพาะไฟล์ที่เปลี่ยน', hintTh: 'พิมพ์ git add notes.txt แล้วพิมพ์ git status ดู ถ้าไม่ขึ้นว่าอยู่ในกล่อง ให้แก้ไฟล์ notes.txt แล้วกดบันทึกไฟล์ก่อน แล้วพิมพ์ git add notes.txt ใหม่', check: 'staged', arg: 'notes.txt' },
    ],
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'git add ทำอะไร',
      choices: [
        { id: 'a', text: 'ย้ายไฟล์จากโฟลเดอร์งานเข้ากล่อง staging area รอ commit ยังไม่ได้เป็นจุดเซฟ' },
        { id: 'b', text: 'เซฟไฟล์เป็นจุดเซฟทันที' },
        { id: 'c', text: 'ส่งไฟล์ขึ้นอินเทอร์เน็ต' },
        { id: 'd', text: 'สร้างโฟลเดอร์ใหม่' },
      ],
      correct: ['a'],
      explainTh: 'git add เหมือนหยิบของใส่กล่อง ยังไม่ปิดผนึก ตัวที่เซฟเป็นจุดเซฟจริงคือ git commit และการส่งขึ้นอินเทอร์เน็ตเป็นอีกเรื่องที่ยังไม่ได้เรียน',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'add แค่ index.html แล้ว commit ส่วน notes.txt ที่ไม่ได้ add จะเป็นยังไง',
      choices: [
        { id: 'a', text: 'ถูกเซฟไปด้วยเพราะอยู่โฟลเดอร์เดียวกัน' },
        { id: 'b', text: 'ยังอยู่ในโฟลเดอร์งานเหมือนเดิม ไม่ถูกเซฟในจุดเซฟนี้ ไม่ได้หาย' },
        { id: 'c', text: 'ถูกลบ' },
        { id: 'd', text: 'Git ฟ้อง error แล้ว commit ไม่ผ่าน' },
      ],
      correct: ['b'],
      explainTh: 'commit เซฟเฉพาะของที่อยู่ในกล่อง ไฟล์ที่ไม่ได้ add แค่รออยู่นอกกล่อง ไม่หาย และไม่เสียหาย เลือก add รอบหน้าก็ได้',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'ใช้คำสั่งไหนดูว่าตอนนี้ไฟล์ไหนอยู่ในกล่อง ไฟล์ไหนยังอยู่นอกกล่อง',
      choices: [
        { id: 'a', text: 'git init' },
        { id: 'b', text: 'git status' },
        { id: 'c', text: 'git commit' },
        { id: 'd', text: 'git add' },
      ],
      correct: ['b'],
      explainTh: 'git status บอกว่าแต่ละไฟล์อยู่ที่ไหน ถ้าไม่ดูก็ไม่รู้ว่า commit รอบนี้จะมีอะไรบ้าง จึงควรพิมพ์ก่อน commit ทุกครั้ง',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'add ไฟล์เข้ากล่องแล้ว แต่ไม่ได้ commit ไฟล์นั้นเป็นจุดเซฟแล้วหรือยัง',
      choices: [
        { id: 'a', text: 'เป็นแล้ว เพราะอยู่ในกล่องแล้ว' },
        { id: 'b', text: 'ยังไม่เป็น ของในกล่องแค่รอปิดผนึก ต้อง commit ก่อนถึงจะเป็นจุดเซฟ' },
        { id: 'c', text: 'เป็นแล้ว แต่ย้อนกลับไม่ได้' },
        { id: 'd', text: 'Git ลบไฟล์ออกจากกล่องเองหลังหนึ่งวัน' },
      ],
      correct: ['b'],
      explainTh: 'กล่องที่ยังไม่ปิดผนึกยังไม่ใช่ของที่ส่งเข้าคลัง git commit คือการปิดผนึกและเก็บเข้าประวัติ ถ้าไม่ commit ก็ไม่มีจุดเซฟให้ย้อนกลับ',
    },
  ],
}
