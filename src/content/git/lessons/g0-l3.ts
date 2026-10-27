import type { Actor, Lesson, SceneAction } from '../../types'
import type { World } from '../../../gitsim/types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })

const actors: Actor[] = [
  // ฉาก 1: Git ยังไม่รู้ว่าจะเซฟอะไร
  h({ id: 'pc1', kind: 'pc', x: 200, y: 200, label: 'เครื่องเรา' }),
  h({ id: 'fa', kind: 'file', x: 490, y: 200, label: 'index.html' }),
  h({ id: 'fb', kind: 'file', x: 760, y: 200, label: 'notes.txt' }),
  h({ id: 'q1', kind: 'label', x: 480, y: 410, label: '🤔 Git จะเซฟอะไร เซฟตอนไหน' }),

  // ฉาก 2: repository
  h({ id: 'fold', kind: 'card', x: 230, y: 230, lines: ['📁 โฟลเดอร์งาน', 'index.html', 'notes.txt'] }),
  h({ id: 'init', kind: 'card', x: 700, y: 130, lines: ['$ git init', 'Initialized empty Git repository'], tone: 'deliver' }),
  h({ id: 'book', kind: 'table', x: 700, y: 330, titleTh: '📒 สมุดประวัติ = repository', columns: ['จุดเซฟ', 'ข้อความ'], rows: [] }),
  h({ id: 'noInit', kind: 'label', x: 480, y: 490, label: 'ไม่ git init = Git ไม่จดอะไรเลย' }),

  // ฉาก 3: commit
  h({ id: 'ws', kind: 'card', x: 190, y: 140, lines: ['📁 โฟลเดอร์งาน', 'index.html'] }),
  h({ id: 'cm', kind: 'card', x: 190, y: 330, lines: ['$ git commit -m "หน้าแรก"'], tone: 'deliver' }),
  h({ id: 'cA', kind: 'commit', x: 480, y: 230, label: 'หน้าแรก' }),
  h({ id: 'bk', kind: 'table', x: 755, y: 250, titleTh: '📒 สมุดประวัติ', columns: ['ใคร เมื่อไร', 'ข้อความ'], rows: [] }),
  h({ id: 'noCm', kind: 'label', x: 480, y: 470, label: 'ไม่ commit = ไม่มีจุดเซฟให้ย้อนกลับ' }),

  // ฉาก 4: เส้นจุดเซฟ
  h({ id: 'tl', kind: 'label', x: 480, y: 90, label: 'เส้นเวลาของจุดเซฟ' }),
  h({ id: 'p1', kind: 'commit', x: 200, y: 230, label: 'หน้าแรก' }),
  h({ id: 'p2', kind: 'commit', x: 480, y: 230, label: 'เพิ่มปุ่ม' }),
  h({ id: 'p3', kind: 'commit', x: 760, y: 230, label: 'แก้สี' }),
  h({ id: 'k21', kind: 'cable', x: 480, y: 230, to: 'p1' }),
  h({ id: 'k32', kind: 'cable', x: 760, y: 230, to: 'p2' }),
  h({ id: 'tip', kind: 'label', x: 760, y: 400, label: '⬆️ จุดล่าสุด' }),
  h({ id: 'old', kind: 'label', x: 300, y: 400, label: 'จุดเก่ายังอยู่ครบ' }),

  // ฉาก 5: git log
  h({ id: 'lg', kind: 'table', x: 480, y: 190, titleTh: '📜 รายการจุดเซฟ', columns: ['รหัส', 'ข้อความ'], rows: [] }),
  h({ id: 'lgCmd', kind: 'card', x: 480, y: 395, lines: ['$ git log'], tone: 'deliver' }),
  h({ id: 'noLg', kind: 'label', x: 480, y: 480, label: 'ไม่พิมพ์ = ไม่เห็นรายการ แต่จุดเซฟยังอยู่' }),

  // ฉาก 6: ลำดับ
  h({ id: 'o1', kind: 'card', x: 170, y: 200, lines: ['git init', 'สร้าง repository'], tone: 'deliver' }),
  h({ id: 'o2', kind: 'card', x: 480, y: 200, lines: ['git add ชื่อไฟล์', 'เลือกไฟล์ที่จะเซฟ'], tone: 'deliver' }),
  h({ id: 'o3', kind: 'card', x: 790, y: 200, lines: ['git commit -m', 'เซฟเป็นจุดเซฟ'], tone: 'deliver' }),
  h({ id: 'ar1', kind: 'label', x: 325, y: 200, label: '→' }),
  h({ id: 'ar2', kind: 'label', x: 635, y: 200, label: '→' }),
  h({ id: 'once', kind: 'label', x: 170, y: 330, label: 'ทำครั้งเดียว' }),
  h({ id: 'loop', kind: 'label', x: 635, y: 330, label: 'ทำซ้ำทุกครั้งที่จะเซฟ' }),
  h({ id: 'noAdd', kind: 'label', x: 480, y: 450, label: 'ข้าม git add = commit ไม่ผ่าน' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 80, label: 'repository = โฟลเดอร์ที่ Git จดประวัติให้' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 180, label: 'git init = เริ่มให้ Git ดูแลโฟลเดอร์' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 280, label: 'commit = จุดเซฟหนึ่งอัน' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 380, label: 'git log = ดูรายการจุดเซฟ' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 480, label: 'ก่อน commit ต้อง git add เลือกไฟล์' }),
]

const mk = (name: string) => ({ name, files: {}, staged: null, repo: null })
const start: World = {
  me: { ...mk('me'), files: { 'index.html': '<h1>หน้าแรกของฉัน</h1>' } },
  friend: mk('friend'),
  github: null,
}

export const lesson: Lesson = {
  id: 'g0-l3',
  part: 0,
  order: 3,
  status: 'ready',
  titleTh: 'repository กับ commit',
  analogyTh: 'เซฟเกมแต่ละช่อง กับสมุดบันทึกประจำร้านที่จดทุกครั้งที่เซฟ',
  ciscoModules: [],
  requires: [
    { lesson: 'g0-l1', useTh: 'Git เหมือนปุ่มเซฟของงาน จดไว้ว่าใครเซฟเมื่อไร และย้อนกลับได้ บทนี้ดูว่าปุ่มเซฟนั้นทำงานยังไง' },
    { lesson: 'g0-l2', useTh: 'เราสั่ง Git ด้วยการพิมพ์ใน Git Bash บทนี้จะพิมพ์คำสั่งจริงชุดแรก' },
  ],
  precheck: [
    {
      id: 'c1',
      layer: 'th',
      reviewLesson: 'g0-l1',
      prompt: 'Git จดอะไรไว้ในแต่ละจุดเซฟ',
      choices: [
        { id: 'a', text: 'จดว่าใครเซฟ เมื่อไร และเก็บสภาพงานตอนนั้นไว้ให้ย้อนกลับได้' },
        { id: 'b', text: 'จดแค่ชื่อไฟล์ ไม่เก็บเนื้อหา' },
        { id: 'c', text: 'จดเฉพาะเวลา ไม่รู้ว่าใครเซฟ' },
      ],
      correct: ['a'],
      explainTh: 'จุดเซฟของ Git เหมือนเซฟเกม เก็บสภาพงานทั้งหมดตอนนั้นไว้ และจดว่าใครเซฟเมื่อไร จึงย้อนกลับมาที่จุดไหนก็ได้',
    },
    {
      id: 'c2',
      layer: 'th',
      reviewLesson: 'g0-l2',
      prompt: 'Git Bash ทำหน้าที่อะไร',
      choices: [
        { id: 'a', text: 'เป็นเว็บให้ฝากงานบนอินเทอร์เน็ต' },
        { id: 'b', text: 'เป็นหน้าต่างให้พิมพ์คำสั่งสั่ง Git บน Windows' },
        { id: 'c', text: 'เป็นโปรแกรมที่จดประวัติงานแทน Git' },
      ],
      correct: ['b'],
      explainTh: 'Git Bash เป็นแค่หน้าต่างพิมพ์คำสั่ง ตัวที่จดประวัติจริงคือ Git ส่วนเว็บฝากงานคือ GitHub บทนี้เราจะพิมพ์คำสั่งใน Git Bash ให้ Git จด',
    },
  ],
  videos: [
    { youtubeId: 'MX9OUXV45B0', titleTh: 'สอน Git ตอนที่ 2 Create Local Repository', channel: 'CMDev',
      noteTh: 'คลิปนี้สร้างโฟลเดอร์ที่ให้ Git ดูแลในเครื่องแล้วทำตามทีละขั้น ตรงกับสิ่งที่บทนี้สอน คำอธิบายคลิปไม่ได้บอกรายละเอียด เลือกจากชื่อและลำดับของซีรีส์ ผู้สอนอาจใช้โปรแกรมพิมพ์คำสั่งอื่น ไม่ใช่ Git Bash แต่คำสั่งเหมือนกัน ฟังว่าเขาพิมพ์อะไรก่อนหลัง ไม่ต้องจำ ช่วงไหนฟังไม่ทัน ข้ามได้' },
  ],
  terms: ['repository', 'commit'],
  deepDives: [
    {
      titleTh: 'git init สร้างอะไรขึ้นมา',
      bodyTh: 'พอพิมพ์ git init ในโฟลเดอร์ จะมีโฟลเดอร์ซ่อนชื่อ .git โผล่ขึ้นมาข้างใน นั่นคือสมุดประวัติของ repository ที่เก็บจุดเซฟทั้งหมด ถ้าลบโฟลเดอร์ .git ทิ้ง โฟลเดอร์นั้นจะกลับไปเป็นโฟลเดอร์ธรรมดาและประวัติหายหมด ไฟล์งานของเรายังอยู่ แต่จุดเซฟไม่อยู่แล้ว เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'ทำไมต้องใส่ -m กับข้อความ',
      bodyTh: 'ตัว -m ย่อมาจาก message คือข้อความอธิบายจุดเซฟ พิมพ์ต่อท้ายได้เลยในเครื่องหมายคำพูด ถ้าไม่ใส่ -m Git จริง ๆ จะเปิดโปรแกรมแก้ข้อความให้พิมพ์ ซึ่งคนเริ่มใหม่มักติดอยู่ตรงนั้น ในห้องทดลองของคอร์สนี้ถ้าไม่ใส่จะเตือนว่าขาดข้อความ ข้อความที่ดีควรสั้น และบอกว่าจุดเซฟนี้ทำอะไร เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
  ],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'เซฟอะไร เมื่อไร', lifeIcon: '🎮',
        lifeTh: 'เกมมีปุ่มเซฟ แต่ต้องกดเองเมื่อถึงจุดที่อยากเก็บไว้ เกมไม่เดาเอง',
        narrationTh: 'Git เหมือนปุ่มเซฟ แต่มันไม่รู้เองว่าต้องดูแลโฟลเดอร์ไหน และต้องเซฟตอนไหน เราต้องบอกเอง บทนี้ดูสองคำ คือ repository กับ commit',
        setup: show('pc1', 'fa', 'fb'),
        actions: [...show('q1'), glow('q1')],
      },
      {
        id: 's2', chipTh: 'repository', lifeIcon: '📒',
        lifeTh: 'ร้านค้าวางสมุดบัญชีไว้ในร้าน สมุดเล่มนั้นจดเฉพาะเรื่องของร้านนี้',
        narrationTh: 'ขั้นแรกบอก Git ว่าให้ดูแลโฟลเดอร์ไหน พิมพ์ git init ในโฟลเดอร์นั้น จะได้สมุดประวัติเปล่า เรียกว่า repository ถ้าไม่พิมพ์ Git จะไม่จดอะไรเลย',
        setup: show('fold'),
        actions: [...show('init'), glow('init'), ...show('book'), ...show('noInit')],
      },
      {
        id: 's3', chipTh: 'commit', lifeIcon: '💾',
        lifeTh: 'กดเซฟเกมหนึ่งครั้ง เกมจดไว้ว่าเซฟตอนไหน และเก็บสภาพเกมตอนนั้นไว้',
        narrationTh: 'commit คือการกดเซฟหนึ่งครั้ง พิมพ์ git commit -m แล้วใส่ข้อความ Git เก็บสภาพไฟล์เป็นจุดเซฟ พร้อมจดว่าใครเซฟเมื่อไร ถ้าไม่ commit ก็ไม่มีจุดเซฟ',
        setup: show('ws'),
        actions: [
          ...show('cm'), glow('cm'),
          { type: 'trail', path: ['ws', 'cA'], tone: 'deliver' },
          ...show('cA'), glow('cA'),
          ...show('bk'),
          { type: 'setRows', actor: 'bk', rows: [['เรา เมื่อกี้', 'หน้าแรก']] },
          ...show('noCm'),
        ],
      },
      {
        id: 's4', chipTh: 'ต่อเป็นเส้น', lifeIcon: '🚂',
        lifeTh: 'ตู้รถไฟต่อกันเป็นขบวน ทุกตู้ต่อกับตู้ก่อนหน้า ตู้เก่าไม่หายไปไหน',
        narrationTh: 'commit ต่อกันเป็นเส้น ทุกจุดชี้กลับไปหาจุดก่อนหน้า จุดเก่าไม่ถูกทับ จุดล่าสุดอยู่ขวาสุด ข้อความสั้น ๆ ช่วยให้รู้ว่าแต่ละจุดทำอะไรไป',
        setup: show('tl', 'p1'),
        actions: [...show('k21', 'p2'), ...show('k32', 'p3'), glow('p3'), ...show('tip', 'old')],
      },
      {
        id: 's5', chipTh: 'ดูรายการ', lifeIcon: '📜',
        lifeTh: 'เปิดสมุดบัญชีอ่านย้อนหลังได้ว่าเคยจดอะไรไว้บ้าง โดยไม่ต้องแก้อะไร',
        narrationTh: 'git log แสดงรายการจุดเซฟทั้งหมด จากใหม่ไปเก่า แต่ละอันมีรหัสกับข้อความที่เราเขียนไว้ ถ้าไม่พิมพ์ก็แค่ไม่เห็นรายการ จุดเซฟยังอยู่ครบ',
        setup: show('lg'),
        actions: [
          ...show('lgCmd'), glow('lgCmd'),
          { type: 'setRows', actor: 'lg', rows: [['c1a0003', 'แก้สี']] },
          { type: 'setRows', actor: 'lg', rows: [['c1a0003', 'แก้สี'], ['c1a0002', 'เพิ่มปุ่ม']] },
          { type: 'setRows', actor: 'lg', rows: [['c1a0003', 'แก้สี'], ['c1a0002', 'เพิ่มปุ่ม'], ['c1a0001', 'หน้าแรก']] },
          ...show('noLg'),
        ],
      },
      {
        id: 's6', chipTh: 'ลำดับคำสั่ง', lifeIcon: '🧾',
        lifeTh: 'เปิดสมุดใหม่ครั้งเดียว แล้วทุกครั้งที่ขายของ ก็เลือกรายการ แล้วค่อยจดลงสมุด',
        narrationTh: 'ลำดับคือ git init ครั้งเดียว แล้ววนทำ git add เลือกไฟล์ กับ git commit เซฟ ถ้าข้าม git add จะ commit ไม่ผ่าน เพราะยังไม่ได้เลือกอะไร บทหน้าบอกว่าทำไม',
        setup: show('o1'),
        actions: [...show('ar1', 'o2'), ...show('ar2', 'o3'), ...show('once', 'loop'), ...show('noAdd')],
      },
      {
        id: 's7', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'เซฟเกมแต่ละช่อง กับสมุดบันทึกประจำร้านที่จดทุกครั้งที่เซฟ',
        narrationTh: 'สรุป repository คือโฟลเดอร์ที่ Git จดประวัติให้ git init เริ่มจด commit คือจุดเซฟหนึ่งอัน git log ดูรายการ และก่อน commit ต้อง git add เลือกไฟล์',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'git',
    introTh: 'ในโฟลเดอร์งานมีไฟล์ index.html อยู่หนึ่งไฟล์ ลองให้ Git ดูแลโฟลเดอร์นี้ แล้วทำ commit แรก ดูภาพประวัติทางขวาเปลี่ยนตามทุกคำสั่ง',
    start,
    allowed: ['init', 'status', 'add', 'commit', 'log'],
    goals: [
      { type: 'state', taskTh: 'สร้าง repository ให้โฟลเดอร์นี้', hintTh: 'พิมพ์ git init', check: 'onBranch', arg: 'main' },
      { type: 'state', taskTh: 'ทำ commit แรก เลือกไฟล์ก่อน แล้วเซฟ', hintTh: 'พิมพ์ git add index.html แล้วพิมพ์ git commit -m "หน้าแรก"', check: 'committed' },
    ],
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'ถ้าไม่พิมพ์ git init แต่ไปสั่ง git commit เลย จะเกิดอะไร',
      choices: [
        { id: 'a', text: 'Git สร้างจุดเซฟให้เองอยู่ดี' },
        { id: 'b', text: 'ใช้ไม่ได้ เพราะโฟลเดอร์นี้ยังไม่ใช่ repository Git ยังไม่ได้จดอะไรไว้' },
        { id: 'c', text: 'ไฟล์ทั้งหมดถูกลบ' },
        { id: 'd', text: 'Git จดไว้ในโฟลเดอร์อื่นแทน' },
      ],
      correct: ['b'],
      explainTh: 'git init คือการเปิดสมุดประวัติเล่มใหม่ ถ้ายังไม่เปิดสมุด ก็ไม่มีที่ให้จดจุดเซฟ ไฟล์ไม่เสียหาย แค่ Git ยังไม่ได้ดูแลโฟลเดอร์นี้',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'commit หนึ่งอันคืออะไร',
      choices: [
        { id: 'a', text: 'จุดเซฟหนึ่งจุด เก็บสภาพไฟล์ตอนนั้น พร้อมจดว่าใครเซฟเมื่อไรและข้อความที่เขียน' },
        { id: 'b', text: 'การส่งไฟล์ให้เพื่อน' },
        { id: 'c', text: 'ไฟล์หนึ่งไฟล์ในโฟลเดอร์' },
        { id: 'd', text: 'คำสั่งลบไฟล์เก่า' },
      ],
      correct: ['a'],
      explainTh: 'commit เหมือนกดเซฟเกมหนึ่งครั้ง เก็บทุกอย่างตอนนั้นไว้ ยังไม่ได้ส่งให้ใคร และไม่ได้ลบอะไร',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'แก้ index.html แล้วสั่ง git commit เลยโดยไม่ได้ git add จะเป็นยังไง',
      choices: [
        { id: 'a', text: 'ผ่าน และ Git เซฟ index.html ให้' },
        { id: 'b', text: 'ไม่ผ่าน เพราะยังไม่ได้เลือกไฟล์ จึงไม่มีอะไรให้เซฟ' },
        { id: 'c', text: 'ผ่าน แต่จุดเซฟจะว่างเปล่า' },
        { id: 'd', text: 'Git ลบ index.html ทิ้ง' },
      ],
      correct: ['b'],
      explainTh: 'commit เซฟเฉพาะไฟล์ที่เราเลือกไว้ด้วย git add ถ้ายังไม่เลือก Git ก็ไม่มีอะไรจะเซฟ เลยหยุดและบอกให้ git add ก่อน',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'ทำ commit เพิ่มอีกอัน จุดเซฟเก่าจะเป็นยังไง',
      choices: [
        { id: 'a', text: 'ยังอยู่ครบ จุดใหม่ต่อท้ายจุดเก่า' },
        { id: 'b', text: 'ถูกทับหาย เหลือจุดล่าสุดจุดเดียว' },
        { id: 'c', text: 'ถูกรวมกันเป็นอันเดียว' },
        { id: 'd', text: 'ถูกลบเมื่อพิมพ์ git log' },
      ],
      correct: ['a'],
      explainTh: 'เหมือนเซฟเกมหลายช่อง ช่องใหม่ไม่ทับช่องเก่า git log แค่แสดงรายการ ไม่ได้ลบอะไร',
    },
  ],
}
