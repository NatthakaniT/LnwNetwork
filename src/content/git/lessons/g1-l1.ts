import type { Actor, Lesson, SceneAction } from '../../types'
import type { Commit, Repo, World } from '../../../gitsim/types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })
const label = (actor: string, text: string): SceneAction => ({ type: 'setLabel', actor, label: text })
const base = ['m1', 'm2', 'm3', 'k2', 'k3'] // เส้นหลักสามจุดเซฟ

// สายหลัก main อยู่แถวบน (y=240) สายแยกอยู่แถวล่าง (y=380) / ป้ายสายอยู่เหนือจุดเซฟที่มันชี้
const cm = (id: string, x: number, y: number, text: string): Actor => h({ id, kind: 'commit', x, y, label: text })

const actors: Actor[] = [
  // ฉาก 1: ปัญหา
  h({ id: 'pA', kind: 'person', x: 260, y: 130, label: 'เรา' }),
  h({ id: 'pB', kind: 'person', x: 760, y: 130, label: 'เพื่อน' }),
  h({ id: 'bad', kind: 'label', x: 480, y: 505, label: 'บนเส้นเดียว งานค้างปนกับงานที่ใช้ได้' }),

  // เส้นหลัก
  cm('m1', 160, 240, 'หน้าแรก'), cm('m2', 380, 240, 'เพิ่มปุ่ม'), cm('m3', 600, 240, 'แก้สี'),
  h({ id: 'k2', kind: 'cable', x: 380, y: 240, to: 'm1' }),
  h({ id: 'k3', kind: 'cable', x: 600, y: 240, to: 'm2' }),
  // สายแยก login
  cm('b1', 780, 380, 'ฟอร์ม login'),
  h({ id: 'kb', kind: 'cable', x: 780, y: 380, to: 'm3' }),

  // ป้ายของสาย (ป้ายคือตัวชี้ ไม่ใช่โฟลเดอร์ก๊อป) กับ HEAD
  h({ id: 'tMain', kind: 'label', x: 600, y: 140, label: '🏷️ main' }),
  h({ id: 'tLogin', kind: 'label', x: 600, y: 185, label: '🏷️ login' }),
  h({ id: 'nCopy', kind: 'label', x: 480, y: 505, label: 'ป้ายอย่างเดียว ไม่มีไฟล์ถูกก๊อป' }),

  // คำสั่ง
  h({ id: 'cBr', kind: 'card', x: 230, y: 90, lines: ['$ git branch login'], tone: 'deliver' }),
  h({ id: 'nBr', kind: 'label', x: 480, y: 505, label: 'ไม่พิมพ์ = ไม่มีสายแยกให้ไปทำงาน' }),
  h({ id: 'cSw', kind: 'card', x: 230, y: 90, lines: ['$ git switch login'], tone: 'deliver' }),
  h({ id: 'nSw', kind: 'label', x: 480, y: 505, label: 'ไม่ switch = commit ยังเข้า main' }),
  h({ id: 'cCm', kind: 'card', x: 230, y: 90, lines: ['$ git commit -m "ทำหน้า login"'], tone: 'deliver' }),
  h({ id: 'nCm', kind: 'label', x: 480, y: 505, label: 'main ยังอยู่ที่เดิม งานค้างไม่ปน' }),
  h({ id: 'cSm', kind: 'card', x: 230, y: 90, lines: ['$ git switch main'], tone: 'deliver' }),
  h({ id: 'fold', kind: 'card', x: 200, y: 420, lines: ['📁 โฟลเดอร์งานตอนนี้', 'index.html', 'ไม่มี login.html'] }),
  h({ id: 'nSm', kind: 'label', x: 480, y: 505, label: 'งานใน login ไม่หาย แค่ไม่อยู่ตรงนี้' }),

  // ฉากทางลัด
  h({ id: 'sc1', kind: 'card', x: 230, y: 200, lines: ['$ git branch login', '$ git switch login'], tone: 'deliver' }),
  h({ id: 'eq', kind: 'label', x: 480, y: 200, label: 'เท่ากับ' }),
  h({ id: 'sc2', kind: 'card', x: 730, y: 200, lines: ['$ git switch -c login'], tone: 'deliver' }),
  h({ id: 'co', kind: 'label', x: 480, y: 330, label: 'git checkout -b login ก็ได้ผลเหมือนกัน' }),
  h({ id: 'noC', kind: 'label', x: 480, y: 440, label: 'ไม่ใส่ -c = บอกว่าไม่มีสายนี้' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 80, label: 'branch = ป้ายชื่อที่ชี้จุดเซฟ' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 180, label: 'git branch ชื่อ = สร้างป้ายใหม่' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 280, label: 'git switch ชื่อ = ย้ายไปทำงานที่สายนั้น' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 380, label: 'commit ต่อท้ายสายที่เราอยู่เท่านั้น' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 480, label: 'git switch -c ทำสองอย่างในคำสั่งเดียว' }),
]

// โลกเริ่มต้นของห้องทดลอง: main มีสองจุดเซฟ เรายืนอยู่ที่ branch idea ที่ยังไม่มีงานของตัวเอง
const c1: Commit = { id: 'c1a0001', message: 'หน้าแรก', parent: null, files: { 'index.html': '<h1>หน้าแรก</h1>' } }
const c2: Commit = { id: 'c1a0002', message: 'เพิ่มปุ่ม', parent: c1.id, files: { 'index.html': '<h1>หน้าแรก</h1>\n<button>เริ่ม</button>' } }
const repo: Repo = { commits: { [c1.id]: c1, [c2.id]: c2 }, branches: { main: c2.id, idea: c2.id }, head: 'idea' }
const start: World = {
  me: { name: 'me', files: { ...c2.files }, staged: null, repo },
  friend: { name: 'friend', files: {}, staged: null, repo: null },
  github: null,
}

export const lesson: Lesson = {
  id: 'g1-l1',
  part: 1,
  order: 1,
  status: 'ready',
  titleTh: 'branch',
  analogyTh: 'แยกกันทำคนละห้อง ห้องใครห้องมัน สมุดฉบับหลักที่ทุกคนใช้ไม่ถูกแตะ จนกว่าจะถึงตอนรวมงาน',
  ciscoModules: [],
  requires: [
    { lesson: 'g0-l3', useTh: 'commit ต่อกันเป็นเส้นจุดเซฟ บทนี้จะเห็นว่าเส้นนั้นแตกเป็นสองสายได้' },
    { lesson: 'g0-l5', useTh: 'เพื่อนทำงานอยู่อีกเครื่อง บทนี้ดูว่าจะไม่ให้งานของเราและเพื่อนปนกันยังไง' },
  ],
  precheck: [
    {
      id: 'c1',
      layer: 'th',
      reviewLesson: 'g0-l3',
      prompt: 'จุดเซฟแต่ละอันที่ commit ไว้ ต่อกับจุดก่อนหน้ายังไง',
      choices: [
        { id: 'a', text: 'ทุกจุดชี้กลับไปหาจุดก่อนหน้า ต่อกันเป็นเส้น จุดเก่าไม่ถูกทับ' },
        { id: 'b', text: 'ไม่ต่อกัน แต่ละจุดเป็นอิสระ' },
        { id: 'c', text: 'จุดใหม่ทับจุดเก่า เหลือจุดเดียว' },
      ],
      correct: ['a'],
      explainTh: 'commit ต่อกันเป็นเส้น ทุกจุดจำว่าจุดก่อนหน้าคือจุดไหน จุดเก่าอยู่ครบ บทนี้ใช้ความจริงข้อนี้ในการแตกเป็นสองสาย',
    },
    {
      id: 'c2',
      layer: 'th',
      reviewLesson: 'g0-l5',
      prompt: 'เพื่อนอยู่คนละเครื่อง ถ้าเพื่อน push งานขึ้น GitHub แล้ว เครื่องเรารู้เองไหม',
      choices: [
        { id: 'a', text: 'ไม่รู้เอง ต้องพิมพ์ git pull ไปดึงมา' },
        { id: 'b', text: 'รู้เอง เพราะต่ออินเทอร์เน็ตอยู่' },
        { id: 'c', text: 'รู้ แต่ต้องรอหนึ่งวัน' },
      ],
      correct: ['a'],
      explainTh: 'แต่ละที่จดประวัติของตัวเอง GitHub ไม่ส่งมาให้เอง ต้องเราไปดึง บทนี้และบทถัดไปจะใช้เรื่องนี้ต่อ',
    },
  ],
  videos: [
    { youtubeId: 'u7dDKe7cYgs', titleTh: 'Git พื้นฐานสำหรับงาน AI Server · บทที่ 5 Branch: ลองของใหม่โดยไม่พังของเดิม', channel: 'Panutat Tejasen',
      noteTh: 'คลิปสั้น แตกสายไปลองของใหม่บน terminal โดยไม่แตะสายหลัก ตรงกับภาพแยกกันทำคนละห้องของบทนี้ ถ้าในคลิปเห็นคำสั่ง git checkout นั่นทำงานเหมือน git switch ที่เราเรียน ส่วนช่วงท้ายที่เป็นการรวมสายกลับ ยังไม่ต้องจำ เรียนในบทหลัง ตัวอย่างเป็นงาน AI ไม่ต้องสนใจเนื้อหางาน' },
  ],
  terms: ['branch', 'head'],
  deepDives: [
    {
      titleTh: 'ทำไมสร้าง branch ได้เร็วและไม่กินที่',
      bodyTh: 'เพราะ branch ไม่ใช่โฟลเดอร์ที่ก๊อปไฟล์ทั้งหมด มันเป็นแค่ป้ายชื่อหนึ่งอันที่เขียนว่า ตอนนี้ชี้จุดเซฟไหน สร้างป้ายใหม่จึงใช้เวลาไม่ถึงวินาที และมีกี่สายก็ไม่ทำให้ไฟล์งานบวมขึ้น Git เก็บเฉพาะส่วนที่เปลี่ยนต่อจากจุดเดิม เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'ตั้งชื่อ branch ยังไงดี',
      bodyTh: 'ตั้งให้บอกว่าสายนี้ทำอะไร เช่น login หรือ fix-button ใช้ตัวอังกฤษพิมพ์เล็กและใช้ขีดคั่นคำ ห้ามมีช่องว่างเพราะ Git จะอ่านเป็นสองคำ ตั้งชื่อสั้น ๆ ที่เพื่อนเห็นแล้วเดาได้ว่าเป็นงานอะไร เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'คลิปเก่า ๆ ใช้ git checkout ไม่ใช่ git switch',
      bodyTh: 'ก่อน Git รุ่นสองจุดยี่สิบสาม ต้องใช้ git checkout ทั้งย้ายสาย ทั้งกู้ไฟล์ จึงมีสองหน้าที่ในคำสั่งเดียวและทำให้สับสน ภายหลังแยกเป็น git switch สำหรับย้ายสาย คอร์สนี้ใช้ git switch เป็นหลัก ถ้าเห็นคลิปหรือบทความใช้ git checkout ชื่อสาย หรือ git checkout -b ชื่อสาย ผลเหมือนกัน เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
  ],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'ปัญหา', lifeIcon: '🍳',
        lifeTh: 'ครัวเดียวกัน ลูกค้ารอกินเมนูเดิม ถ้าลองสูตรใหม่ในหม้อเดิมแล้วทำพัง ลูกค้าก็ได้กินของพังไปด้วย',
        narrationTh: 'เรากับเพื่อนทำโปรเจกต์เดียวกัน ถ้าต่างคนต่างแก้บนเส้นเดียว งานที่ยังไม่เสร็จของเรา จะไปปนกับงานที่ใช้ได้แล้ว แล้วทุกคนก็เจอของพังพร้อมกัน',
        setup: show('pA', 'pB', ...base),
        actions: [
          { type: 'say', actor: 'pA', text: 'ฉันแก้หน้า login อยู่', mood: 'yes' },
          { type: 'say', actor: 'pB', text: 'ฉันก็แก้หน้าเดิม', mood: 'yes' },
          glow('m3'), ...show('bad'),
        ],
      },
      {
        id: 's2', chipTh: 'branch คือป้าย', lifeIcon: '🏷️',
        lifeTh: 'เหมือนแปะโพสต์อิทที่หน้าสมุด ไม่ได้ถ่ายเอกสารทั้งเล่ม แค่จำว่าตอนนี้เรากำลังทำถึงหน้าไหน',
        narrationTh: 'branch คือสายงานหนึ่งสาย ข้างในมันคือป้ายชื่อที่ชี้จุดเซฟหนึ่งจุด ตอนนี้มีป้ายเดียวชื่อ main ชี้จุดล่าสุด ส่วน HEAD คือป้ายบอกว่าเรายืนอยู่สายไหน',
        setup: [...show(...base, 'tMain'), label('tMain', '🏷️ main  ← HEAD')],
        actions: [glow('tMain'), glow('m3')],
      },
      {
        id: 's3', chipTh: 'git branch', lifeIcon: '🆕',
        lifeTh: 'แปะโพสต์อิทแผ่นที่สองที่หน้าเดิม ยังไม่ได้ย้ายไปไหน แค่จดไว้ว่ามีสายใหม่',
        narrationTh: 'git branch login สร้างป้ายใหม่ชื่อ login ชี้จุดเดียวกับ main ไม่มีไฟล์ถูกก๊อปเลย และเรายังอยู่ที่ main ถ้าไม่พิมพ์คำสั่งนี้ ก็ไม่มีสายแยกให้ไปทำงาน',
        setup: [...show(...base, 'tMain'), label('tMain', '🏷️ main  ← HEAD')],
        actions: [...show('cBr'), glow('cBr'), ...show('tLogin'), glow('tLogin'), ...show('nBr')],
      },
      {
        id: 's4', chipTh: 'git switch', lifeIcon: '🚪',
        lifeTh: 'ย้ายจากห้องหนึ่งไปอีกห้อง ของในห้องเดิมยังอยู่ครบ แค่เราเดินไปทำงานห้องใหม่',
        narrationTh: 'git switch login ย้ายเราไปทำงานที่สาย login ป้าย HEAD ย้ายตามมา ตอนนี้ commit ที่ทำจะต่อท้ายสาย login ถ้าไม่ switch commit จะยังเข้า main อยู่',
        setup: [...show(...base, 'tMain', 'tLogin'), label('tMain', '🏷️ main  ← HEAD'), label('tLogin', '🏷️ login')],
        actions: [...show('cSw'), glow('cSw'), label('tMain', '🏷️ main'), label('tLogin', '🏷️ login  ← HEAD'), glow('tLogin'), ...show('nSw')],
      },
      {
        id: 's5', chipTh: 'commit บนสายใหม่', lifeIcon: '✏️',
        lifeTh: 'เขียนร่างในห้องของตัวเอง สมุดฉบับหลักที่อยู่อีกห้องยังเหมือนเดิม',
        narrationTh: 'ตอนนี้ commit จะเกิดบนสาย login ป้าย login เลื่อนไปชี้จุดใหม่ ส่วนป้าย main ยังอยู่ที่เดิม งานที่ยังไม่เสร็จของเราจึงไม่ไปปนกับ main',
        setup: [...show(...base, 'tMain', 'tLogin'), label('tMain', '🏷️ main'), label('tLogin', '🏷️ login  ← HEAD')],
        actions: [
          ...show('cCm'), glow('cCm'),
          ...show('kb', 'b1'), glow('b1'),
          { type: 'move', actor: 'tLogin', x: 790, y: 320, ms: 600 },
          ...show('nCm'),
        ],
      },
      {
        id: 's6', chipTh: 'สลับกลับ main', lifeIcon: '🔁',
        lifeTh: 'เดินกลับห้องแรก เปิดสมุดฉบับหลัก ร่างที่เขียนในห้องใหม่ไม่อยู่ตรงนี้ แต่ไม่ได้หายไปไหน',
        narrationTh: 'git switch main พากลับสายหลัก ไฟล์ในโฟลเดอร์งานเปลี่ยนกลับเป็นของ main ไฟล์ login ที่เพิ่งทำหายไปจากหน้าจอ แต่ยังอยู่ครบในสาย login แค่ไม่อยู่ตรงนี้',
        setup: [
          ...show(...base, 'kb', 'b1', 'tMain', 'tLogin'),
          label('tMain', '🏷️ main'), label('tLogin', '🏷️ login  ← HEAD'),
          { type: 'move', actor: 'tLogin', x: 790, y: 320, ms: 0 },
        ],
        actions: [...show('cSm'), glow('cSm'), label('tLogin', '🏷️ login'), label('tMain', '🏷️ main  ← HEAD'), glow('tMain'), ...show('fold', 'nSm')],
      },
      {
        id: 's7', chipTh: 'ทางลัด', lifeIcon: '⚡',
        lifeTh: 'ย้ายเข้าห้องใหม่พร้อมสร้างห้องในก้าวเดียว แทนที่จะสร้างห้องก่อนแล้วค่อยเดินเข้าไป',
        narrationTh: 'ทางลัด git switch -c login สร้างสายใหม่แล้วย้ายไปเลยในคำสั่งเดียว คำสั่ง git checkout ก็ทำแบบเดียวกันได้ ถ้าไม่ใส่ -c Git จะบอกว่าไม่มีสายชื่อนี้',
        setup: [],
        actions: [...show('sc1', 'eq', 'sc2'), glow('sc2'), ...show('co', 'noC')],
      },
      {
        id: 's8', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'แยกกันทำคนละห้อง ห้องใครห้องมัน ไม่ทับกัน',
        narrationTh: 'สรุป branch คือป้ายชื่อที่ชี้จุดเซฟ git branch สร้างป้าย git switch ย้ายไปทำงานที่สายนั้น และ commit ต่อท้ายสายที่เราอยู่เท่านั้น',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'git',
    introTh: 'ตอนนี้เรายืนอยู่ที่ branch ชื่อ idea ที่ยังไม่มีงานของตัวเอง ส่วน main มีสองจุดเซฟ ลองย้ายสาย สร้างสายใหม่ ทำงานในนั้น แล้วกลับมาดูว่า main ไม่โดนแตะ ดูภาพประวัติทางขวาเปลี่ยนตามทุกคำสั่ง',
    start,
    allowed: ['status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout'],
    goals: [
      { type: 'state', taskTh: 'ย้ายไปทำงานที่สาย main', hintTh: 'พิมพ์ git switch main', check: 'onBranch', arg: 'main' },
      { type: 'state', taskTh: 'สร้างสายใหม่ชื่อ login และย้ายไปอยู่ที่นั่น ในคำสั่งเดียว', hintTh: 'พิมพ์ git switch -c login', check: 'onBranch', arg: 'login' },
      { type: 'state', taskTh: 'คลิกชื่อไฟล์ index.html ในโฟลเดอร์งานเพื่อแก้ไข กดบันทึกไฟล์ แล้ว add กับ commit โดยข้อความมีคำว่า login', hintTh: 'พิมพ์ git add index.html แล้วพิมพ์ git commit -m "ทำหน้า login"', check: 'committed', arg: 'login' },
      { type: 'state', taskTh: 'กลับไปที่สาย main แล้วคลิกดูไฟล์ index.html ว่ายังเป็นของเดิมไหม', hintTh: 'พิมพ์ git switch main', check: 'onBranch', arg: 'main' },
    ],
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'พอสร้าง branch ใหม่ด้วย git branch login ข้างในเกิดอะไรขึ้นจริง ๆ',
      choices: [
        { id: 'a', text: 'Git ก๊อปไฟล์ทั้งโปรเจกต์ไปไว้อีกโฟลเดอร์หนึ่ง' },
        { id: 'b', text: 'Git สร้างป้ายชื่อใหม่ชี้ที่จุดเซฟเดียวกับที่เราอยู่ ไม่มีไฟล์ถูกก๊อป' },
        { id: 'c', text: 'Git ลบประวัติเก่าทิ้งแล้วเริ่มใหม่' },
        { id: 'd', text: 'Git ส่งสายใหม่ขึ้น GitHub ทันที' },
      ],
      correct: ['b'],
      explainTh: 'branch คือป้ายชื่อที่ชี้จุดเซฟ จึงสร้างได้เร็วและไม่กินที่ การส่งขึ้น GitHub เป็นอีกคำสั่งหนึ่ง คือ push',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'พิมพ์ git branch login แล้ว commit ทันทีโดยไม่ switch จุดเซฟใหม่ไปอยู่ที่สายไหน',
      choices: [
        { id: 'a', text: 'สาย login เพราะเพิ่งสร้าง' },
        { id: 'b', text: 'สายที่เรายืนอยู่เดิม เช่น main เพราะ git branch แค่สร้างป้าย ไม่ได้ย้ายเรา' },
        { id: 'c', text: 'ทั้งสองสายพร้อมกัน' },
        { id: 'd', text: 'ไม่ไปที่ไหนเลย Git ไม่ยอม commit' },
      ],
      correct: ['b'],
      explainTh: 'commit ต่อท้ายสายที่ HEAD ชี้อยู่เสมอ git branch ไม่ย้าย HEAD ต้อง git switch ถึงจะย้าย นี่คือเหตุที่มีทางลัด git switch -c',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'ทำงานบนสาย login แล้ว commit ไปหนึ่งอัน จากนั้น git switch main ไฟล์ที่เพิ่งทำหายไปจากโฟลเดอร์งาน งานนั้นหายไปจริงไหม',
      choices: [
        { id: 'a', text: 'หายจริง ต้องทำใหม่' },
        { id: 'b', text: 'ไม่หาย ยังอยู่ครบในสาย login แค่ไฟล์ในโฟลเดอร์เปลี่ยนไปตามสายที่เราอยู่ สลับกลับไปก็เห็นอีก' },
        { id: 'c', text: 'ไม่หาย แต่ถูกย้ายเข้า main อัตโนมัติ' },
        { id: 'd', text: 'ไม่หาย แต่ต้อง git log ก่อนถึงจะเห็น' },
      ],
      correct: ['b'],
      explainTh: 'จุดเซฟอยู่ในประวัติ ไม่ได้อยู่ในโฟลเดอร์งาน โฟลเดอร์งานแสดงสภาพของสายที่เราอยู่ตอนนี้เท่านั้น สลับสายก็แค่เปลี่ยนสิ่งที่แสดง',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'ทำไมทีมถึงแยก branch ทำงานใหม่ แทนที่จะแก้บน main ตรง ๆ',
      choices: [
        { id: 'a', text: 'เพื่อให้งานที่ยังไม่เสร็จหรือยังพัง ไม่ไปปนกับ main ที่คนอื่นใช้อยู่' },
        { id: 'b', text: 'เพราะ Git บังคับว่าห้าม commit บน main' },
        { id: 'c', text: 'เพื่อให้ไฟล์เล็กลง' },
        { id: 'd', text: 'เพื่อไม่ต้อง commit' },
      ],
      correct: ['a'],
      explainTh: 'main ควรเป็นสายที่ใช้ได้เสมอ ทำงานใหม่ในสายแยก พอเสร็จและตรวจแล้วค่อยรวมกลับ ถ้าพังก็พังเฉพาะสายนั้น',
    },
  ],
}
