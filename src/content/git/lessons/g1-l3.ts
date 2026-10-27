import type { Actor, Lesson, SceneAction } from '../../types'
import type { Commit, Repo, World } from '../../../gitsim/types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })
const cm = (id: string, x: number, y: number, text: string): Actor => h({ id, kind: 'commit', x, y, label: text })
// ภาพสองสายก่อนรวม: main ขยับไปหนึ่งจุด (m3) สาย login แตกจาก m2 แล้วมีสองจุด (b1 b2)
const fork = ['m1', 'm2', 'm3', 'k2', 'k3', 'b1', 'b2', 'kb1', 'kb2', 'tMain', 'tLogin']

const actors: Actor[] = [
  cm('m1', 120, 240, 'หน้าแรก'), cm('m2', 300, 240, 'เพิ่มปุ่ม'), cm('m3', 480, 240, 'ปรับหัวข้อ'),
  h({ id: 'k2', kind: 'cable', x: 300, y: 240, to: 'm1' }),
  h({ id: 'k3', kind: 'cable', x: 480, y: 240, to: 'm2' }),
  cm('b1', 480, 380, 'ฟอร์ม'), cm('b2', 660, 380, 'ปุ่ม login'),
  h({ id: 'kb1', kind: 'cable', x: 480, y: 380, to: 'm2' }),
  h({ id: 'kb2', kind: 'cable', x: 660, y: 380, to: 'b1' }),
  cm('m4', 760, 240, 'รวมแล้ว'),
  h({ id: 'k4', kind: 'cable', x: 760, y: 240, to: 'm3' }),
  h({ id: 'k4b', kind: 'cable', x: 760, y: 240, to: 'b2' }),
  h({ id: 'tMain', kind: 'label', x: 480, y: 150, label: '🏷️ main  ← HEAD' }),
  h({ id: 'tLogin', kind: 'label', x: 630, y: 320, label: '🏷️ login' }),

  // ฉาก 1: คำสั่ง merge
  h({ id: 'cMg', kind: 'card', x: 170, y: 100, lines: ['$ git switch main', '$ git merge login'], tone: 'deliver' }),
  h({ id: 'nMg', kind: 'label', x: 480, y: 505, label: 'ไม่ merge = สองสายแยกกันอยู่ตลอด' }),
  h({ id: 'twoParents', kind: 'label', x: 760, y: 165, label: '⬇️ จุดรวมมีพ่อแม่สองจุด' }),

  // ฉาก 3: งานชนกัน
  h({ id: 'fA', kind: 'card', x: 250, y: 220, lines: ['index.html ใน main', '<h1>ยินดีต้อนรับสู่ร้านเรา</h1>'], tone: 'deliver' }),
  h({ id: 'fB', kind: 'card', x: 710, y: 220, lines: ['index.html ใน login', '<h1>เข้าสู่ระบบ</h1>'], tone: 'deliver' }),
  h({ id: 'bolt', kind: 'label', x: 480, y: 220, label: '⚡' }),
  h({ id: 'nClash', kind: 'label', x: 480, y: 360, label: 'บรรทัดเดียวกัน แก้คนละแบบ' }),
  h({ id: 'nClash2', kind: 'label', x: 480, y: 420, label: 'Git เลือกแทนเราไม่ได้ จึงหยุดและเรียกว่า conflict' }),

  // ฉาก 4: เครื่องหมายในไฟล์
  h({ id: 'marks', kind: 'card', x: 480, y: 190, lines: ['<<<<<<< HEAD', '<h1>ยินดีต้อนรับสู่ร้านเรา</h1>', '=======', '<h1>เข้าสู่ระบบ</h1>', '>>>>>>> login'] }),
  h({ id: 'mk1', kind: 'label', x: 480, y: 340, label: 'ครึ่งบน = ฝั่งเรา ครึ่งล่าง = ฝั่ง login' }),
  h({ id: 'mk2', kind: 'label', x: 480, y: 400, label: 'Git ไม่ลบอะไรทิ้ง เก็บไว้ให้เราเลือก' }),

  // ฉาก 5: แก้เอง
  h({ id: 'bef', kind: 'card', x: 200, y: 220, lines: ['<<<<<<< HEAD', 'แบบของ main', '=======', 'แบบของ login', '>>>>>>> login'] }),
  h({ id: 'arrow', kind: 'label', x: 480, y: 220, label: '➡️' }),
  h({ id: 'aft', kind: 'card', x: 730, y: 220, lines: ['เหลือแบบเดียว', '<h1>ยินดีต้อนรับ เข้าสู่ระบบ</h1>'], tone: 'deliver' }),
  h({ id: 'nEdit', kind: 'label', x: 480, y: 400, label: 'ไม่ลบเครื่องหมาย = ติดเข้าไปในงานจริง' }),

  // ฉาก 6: add แล้ว commit
  h({ id: 'cFix', kind: 'card', x: 170, y: 100, lines: ['$ git add index.html', '$ git commit -m "รวม"'], tone: 'deliver' }),
  h({ id: 'nFix', kind: 'label', x: 480, y: 505, label: 'ไม่ add = Git ยังถือว่าไฟล์ติดอยู่' }),

  // ฉาก 7: ยกเลิก
  h({ id: 'cAb', kind: 'card', x: 480, y: 200, lines: ['$ git merge --abort'], tone: 'deliver' }),
  h({ id: 'ab1', kind: 'label', x: 480, y: 300, label: 'ไฟล์กลับเป็นก่อนสั่ง merge' }),
  h({ id: 'ab2', kind: 'label', x: 480, y: 370, label: 'งานของใครก็ไม่หาย' }),
  h({ id: 'nAb', kind: 'label', x: 480, y: 460, label: 'ไม่ยกเลิกและไม่แก้ = ค้างกลางทาง' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 80, label: 'merge = รวมอีกสายเข้ามาในสายที่เรายืนอยู่' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 180, label: 'แก้คนละที่ = Git รวมให้เอง ได้จุดรวม' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 280, label: 'แก้ที่เดียวกัน = conflict เราเลือกเอง' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 380, label: 'แก้ไฟล์ แล้ว git add กับ git commit' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 480, label: 'git pull ที่ชนกัน ก็แก้แบบเดียวกัน' }),
]

// โลกเริ่มต้นของห้องทดลอง: main กับ login ต่างแก้หัวข้อใน index.html คนละแบบ (ชนกัน) login มี login.html เพิ่ม (ไม่ชน) เรายืนอยู่ที่ login
const c1: Commit = { id: 'c1a0001', message: 'หน้าแรก', parent: null, files: { 'index.html': '<h1>ยินดีต้อนรับ</h1>' } }
const c2: Commit = { id: 'c1a0002', message: 'ปรับหัวข้อ', parent: c1.id, files: { 'index.html': '<h1>ยินดีต้อนรับสู่ร้านเรา</h1>' } }
const c3: Commit = { id: 'c1a0003', message: 'ทำหน้า login', parent: c1.id, files: { 'index.html': '<h1>เข้าสู่ระบบ</h1>', 'login.html': '<form>กรอกชื่อ</form>' } }
const repo: Repo = { commits: { [c1.id]: c1, [c2.id]: c2, [c3.id]: c3 }, branches: { main: c2.id, login: c3.id }, head: 'login' }
const start: World = {
  me: { name: 'me', files: { ...c3.files }, staged: null, repo },
  friend: { name: 'friend', files: {}, staged: null, repo: null },
  github: null,
}

export const lesson: Lesson = {
  id: 'g1-l3',
  part: 1,
  order: 3,
  status: 'ready',
  titleTh: 'merge กับ conflict',
  analogyTh: 'เย็บร่างจากห้องแยกกลับเข้าสมุดฉบับหลัก ถ้าสองคนเขียนช่องเดียวกันคนละแบบ คนเย็บต้องเลือกเอง',
  ciscoModules: [],
  requires: [
    { lesson: 'g1-l2', useTh: 'บนเว็บ GitHub มีปุ่ม Merge pull request บทนี้ดูว่าในเครื่องเราทำเรื่องเดียวกันด้วยคำสั่งยังไง และเกิดอะไรถ้างานชนกัน' },
    { lesson: 'g0-l4', useTh: 'แก้ conflict เสร็จต้อง git add แล้วค่อย commit บทนี้ใช้สองคำสั่งนี้ปิดงาน' },
  ],
  precheck: [
    {
      id: 'c1',
      layer: 'th',
      reviewLesson: 'g1-l2',
      prompt: 'ปุ่ม Merge pull request บนเว็บ GitHub ทำอะไร',
      choices: [
        { id: 'a', text: 'รวมงานของสายที่ขอ เข้ากับสายหลักบน GitHub' },
        { id: 'b', text: 'ลบสายทิ้ง' },
        { id: 'c', text: 'ส่งอีเมลหาเพื่อน' },
      ],
      correct: ['a'],
      explainTh: 'Merge คือการรวมงานของสองสายเข้าด้วยกัน บนเว็บทำด้วยปุ่ม บทนี้จะทำเรื่องเดียวกันในเครื่องเราด้วยคำสั่ง',
    },
    {
      id: 'c2',
      layer: 'th',
      reviewLesson: 'g0-l4',
      prompt: 'git add ทำอะไร',
      choices: [
        { id: 'a', text: 'ย้ายไฟล์เข้ากล่องรอปิดผนึก เลือกไว้ว่าจะเซฟไฟล์นี้ในรอบ commit ถัดไป' },
        { id: 'b', text: 'ส่งไฟล์ขึ้น GitHub' },
        { id: 'c', text: 'ลบไฟล์' },
      ],
      correct: ['a'],
      explainTh: 'git add เลือกไฟล์ใส่กล่อง git commit ปิดผนึกเป็นจุดเซฟ บทนี้ใช้ทั้งสองคำสั่งตอนปิดงานที่ติดปัญหา',
    },
  ],
  videos: [
    { youtubeId: 'u5TfPXI8AOo', titleTh: 'สอน Git ตอนที่8# - Merge Conflict', channel: 'CMDev',
      noteTh: 'คลิปสั้นที่เลือกจากชื่อเรื่อง คำอธิบายคลิปไม่บอกรายละเอียด เรายังไม่ได้ตรวจเนื้อหาจริง จึงยังไม่รู้ว่าคลิปแก้ปัญหาใน Git Bash หรือในโปรแกรมแก้โค้ด ถ้าเห็นเครื่องหมายหัวลูกศรหลายตัวในไฟล์ นั่นคือตัวเดียวกับที่เราเรียนในบทนี้ ถ้าคลิปใช้ปุ่มกดในโปรแกรมอื่น ให้ดูแค่ว่าเกิดอะไร แล้วกลับมาทำตามบทนี้' },
  ],
  terms: ['conflict', 'merge-commit'],
  deepDives: [
    {
      titleTh: 'ถ้า main ไม่เคยขยับ Git แค่เลื่อนป้ายตามไป',
      bodyTh: 'ถ้าตั้งแต่แยกสาย main ไม่มีจุดเซฟใหม่เลย การ merge ไม่ต้องสร้างจุดรวม Git แค่เลื่อนป้าย main ไปยืนที่เดียวกับสายที่เอามารวม เรียกว่า fast-forward ผลคือประวัติเป็นเส้นตรง ไม่มีรอยแยก ต่างจากบทนี้ที่ main ขยับไปแล้วเลยต้องมีจุดรวม เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'ลด conflict ได้ยังไง',
      bodyTh: 'conflict เกิดเมื่อสองคนแก้ที่เดียวกันโดยไม่รู้กัน ลดได้ด้วยการแบ่งงานให้แตะไฟล์คนละไฟล์ pull ของเพื่อนมาบ่อย ๆ ก่อนเริ่มงานใหม่ และแยกสายสั้น ๆ ทำเสร็จแล้วรวมเร็ว สายที่อยู่ห่างจาก main นานจะชนเยอะ เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'โปรแกรมแก้โค้ดช่วยแก้ conflict ได้',
      bodyTh: 'โปรแกรมอย่าง VS Code เห็นเครื่องหมายแล้วขึ้นปุ่มให้กดเลือก เช่น เอาฝั่งเรา เอาฝั่งอีกสาย หรือเอาทั้งสอง ปุ่มพวกนี้แค่แก้ไฟล์ให้เหมือนที่เราทำด้วยมือ ยังต้อง git add กับ git commit เหมือนเดิม เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
  ],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'รวมสาย merge', lifeIcon: '🔀',
        lifeTh: 'เอาร่างที่เขียนในห้องแยก กลับมาเย็บรวมในสมุดฉบับหลัก',
        narrationTh: 'merge คือการรวมงานของอีกสายเข้ามาในสายที่เรายืนอยู่ ต้องไปยืนที่สายปลายทางก่อน เช่น git switch main แล้ว git merge login ถ้าไม่ merge สองสายก็แยกกันตลอด',
        setup: show(...fork, 'tMain', 'tLogin'),
        actions: [...show('cMg'), glow('cMg'), glow('tMain'), ...show('nMg')],
      },
      {
        id: 's2', chipTh: 'ไม่ชนกัน', lifeIcon: '🧩',
        lifeTh: 'สองคนเขียนคนละหน้าของสมุด คนเย็บแค่เอามาต่อกัน ไม่ต้องถามใคร',
        narrationTh: 'ถ้าสองสายแก้คนละไฟล์หรือคนละบรรทัด Git รวมให้เอง และสร้างจุดเซฟรวมที่มีพ่อแม่สองจุด เรียกว่า merge commit เส้นสองสายมาบรรจบกันตรงนี้',
        setup: show(...fork),
        actions: [...show('k4', 'k4b', 'm4'), glow('m4'), ...show('twoParents')],
      },
      {
        id: 's3', chipTh: 'งานชนกัน', lifeIcon: '⚡',
        lifeTh: 'สองคนเขียนเลขที่บ้านคนละเลขลงช่องเดียวกัน คนเย็บรวมตัดสินใจเองไม่ได้ว่าจะเอาเลขไหน',
        narrationTh: 'แต่ถ้าสองสายแก้บรรทัดเดียวกันของไฟล์เดียวกันคนละแบบ Git ตัดสินใจแทนเราไม่ได้ จึงหยุดรวม และบอกว่ามี conflict คือรอยชนที่ต้องให้คนเลือก',
        setup: show('fA', 'fB'),
        actions: [...show('bolt'), glow('bolt'), ...show('nClash', 'nClash2')],
      },
      {
        id: 's4', chipTh: 'เครื่องหมายในไฟล์', lifeIcon: '🪧',
        lifeTh: 'คนเย็บแปะป้ายสองอันในสมุด ชี้ว่าตรงนี้มีสองแบบ รอเจ้าของมาเลือก',
        narrationTh: 'Git เขียนทั้งสองแบบลงในไฟล์เลย คั่นด้วยเครื่องหมายพิเศษ ครึ่งบนคือฝั่งเรา ครึ่งล่างคือฝั่งสายที่เอามารวม Git ไม่ลบอะไรทิ้ง เก็บไว้ให้เราเลือกเอง',
        setup: [],
        actions: [...show('marks'), glow('marks'), ...show('mk1', 'mk2')],
      },
      {
        id: 's5', chipTh: 'แก้เอง', lifeIcon: '✏️',
        lifeTh: 'เจ้าของสมุดลบป้ายออก แล้วเขียนช่องนั้นให้เหลือคำตอบเดียวที่ต้องการ',
        narrationTh: 'งานของเราคือเปิดไฟล์ ลบเครื่องหมายทิ้งทั้งหมด แล้วเหลือข้อความที่ต้องการ จะเลือกฝั่งใดฝั่งหนึ่งหรือเขียนผสมก็ได้ ถ้าไม่ลบ เครื่องหมายจะติดเข้าไปในงานจริง',
        setup: show('bef'),
        actions: [...show('arrow', 'aft'), glow('aft'), ...show('nEdit')],
      },
      {
        id: 's6', chipTh: 'add แล้ว commit', lifeIcon: '✅',
        lifeTh: 'เซ็นชื่อว่าช่องนี้ตรวจแล้ว แล้วเย็บเข้าเล่มเป็นอันเสร็จ',
        narrationTh: 'แก้เสร็จพิมพ์ git add ชื่อไฟล์ เพื่อบอกว่าไฟล์นี้แก้เรียบร้อยแล้ว แล้ว git commit สร้างจุดรวมให้ ถ้าไม่ add Git ยังถือว่าไฟล์ติดอยู่ และไม่ยอมให้ commit',
        setup: show(...fork),
        actions: [...show('cFix'), glow('cFix'), ...show('k4', 'k4b', 'm4'), glow('m4'), ...show('nFix')],
      },
      {
        id: 's7', chipTh: 'ยกเลิกก่อนได้', lifeIcon: '↩️',
        lifeTh: 'ยังไม่พร้อมเย็บ ก็วางเข็มลง ทุกอย่างกลับเป็นเหมือนก่อนเริ่ม',
        narrationTh: 'ถ้าเจอ conflict แล้วยังไม่พร้อมแก้ พิมพ์ git merge --abort เพื่อยกเลิกการรวม ถ้าไม่ยกเลิกและไม่แก้ เราจะค้างกลางทาง commit หรือสลับสายไม่ได้',
        setup: [],
        actions: [...show('cAb'), glow('cAb'), ...show('ab1', 'ab2', 'nAb')],
      },
      {
        id: 's8', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'เย็บร่างจากห้องแยกกลับเข้าสมุดฉบับหลัก ช่องไหนชนกันเจ้าของเลือกเอง',
        narrationTh: 'สรุป merge รวมอีกสายเข้ามา คนละที่ Git รวมให้เอง ที่เดียวกันเป็น conflict ต้องแก้ไฟล์ แล้ว add กับ commit ส่วน pull ที่ชนกัน ก็แก้แบบเดียวกัน',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'git',
    introTh: 'สาย main กับสาย login ต่างแก้หัวข้อใน index.html คนละแบบ และสาย login เพิ่มไฟล์ login.html ด้วย เรายืนอยู่ที่ login ตอนนี้ ลองรวม login เข้า main แล้วแก้ conflict ที่เกิดขึ้น ดูภาพประวัติทางขวาเปลี่ยนตามทุกคำสั่ง',
    start,
    allowed: ['status', 'add', 'commit', 'log', 'branch', 'switch', 'checkout', 'merge'],
    goals: [
      { type: 'state', taskTh: 'ย้ายไปยืนที่สาย main เพราะเราจะรวมงานเข้ามาที่นี่', hintTh: 'พิมพ์ git switch main', check: 'onBranch', arg: 'main' },
      { type: 'state', taskTh: 'รวมสาย login เข้ามา จะเจอ conflict ที่ index.html คลิกชื่อไฟล์เพื่อแก้ ลบเครื่องหมายทิ้งแล้วเหลือข้อความเดียว กดบันทึกไฟล์ แล้ว add กับ commit', hintTh: 'พิมพ์ git merge login แล้วแก้ index.html พิมพ์ git add index.html แล้วพิมพ์ git commit -m "รวม login" ถ้าอยากถอยพิมพ์ git merge --abort', check: 'conflictFixed' },
    ],
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'สองสายแก้คนละไฟล์กัน แล้ว git merge จะเกิดอะไร',
      choices: [
        { id: 'a', text: 'ติด conflict ทุกครั้งที่ merge' },
        { id: 'b', text: 'Git รวมให้เอง และสร้าง merge commit ที่มีพ่อแม่สองจุด ไม่ต้องแก้อะไร' },
        { id: 'c', text: 'Git ลบไฟล์ของสายหนึ่งทิ้ง' },
        { id: 'd', text: 'Git ไม่ยอมรวม ต้อง push ก่อน' },
      ],
      correct: ['b'],
      explainTh: 'conflict เกิดเฉพาะตอนแก้ที่เดียวกันคนละแบบ ถ้าแก้คนละที่ Git รู้ว่าเอาของใครตรงไหน จึงรวมเองได้',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'ทำไม Git ถึงไม่เลือกให้เองตอนเกิด conflict',
      choices: [
        { id: 'a', text: 'เพราะ Git ทำงานช้า' },
        { id: 'b', text: 'เพราะ Git ไม่รู้ว่าแบบไหนถูกตามที่เราต้องการ ถ้าเลือกผิดจะทำงานของใครคนหนึ่งหายไปเงียบ ๆ' },
        { id: 'c', text: 'เพราะเป็นข้อผิดพลาดของโปรแกรม' },
        { id: 'd', text: 'เพราะต้องรอเพื่อนอนุมัติ' },
      ],
      correct: ['b'],
      explainTh: 'Git เข้าใจแค่ว่าสองฝั่งต่างกัน ไม่เข้าใจว่าแบบไหนตรงกับความตั้งใจ จึงหยุดแล้วให้คนตัดสิน นี่เป็นเรื่องปกติ ไม่ใช่โปรแกรมพัง',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'แก้ไฟล์ที่ conflict แล้ว แต่ลืมลบเครื่องหมายบรรทัดต้นกับบรรทัดปิด แล้ว add กับ commit ไปเลย จะเกิดอะไร',
      choices: [
        { id: 'a', text: 'Git จับได้และไม่ยอมให้ commit' },
        { id: 'b', text: 'commit ผ่าน และเครื่องหมายพวกนั้นติดอยู่ในไฟล์จริง เพราะ Git เช็กแค่ว่าเรา add แล้ว ไม่ได้อ่านเนื้อหา' },
        { id: 'c', text: 'Git ลบเครื่องหมายให้เอง' },
        { id: 'd', text: 'ไฟล์ถูกลบทิ้ง' },
      ],
      correct: ['b'],
      explainTh: 'git add คือคำยืนยันของเราว่าไฟล์นี้เรียบร้อยแล้ว Git เชื่อเรา จึงต้องเปิดไฟล์ดูอีกรอบก่อน add ว่าไม่เหลือเครื่องหมายแล้ว',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'เพิ่ง merge แล้วเจอ conflict หลายไฟล์ ยังไม่พร้อมแก้ อยากกลับไปเป็นก่อน merge ทำอะไรได้',
      choices: [
        { id: 'a', text: 'พิมพ์ git merge --abort' },
        { id: 'b', text: 'ลบทั้งโฟลเดอร์แล้ว clone ใหม่' },
        { id: 'c', text: 'พิมพ์ git push' },
        { id: 'd', text: 'ไม่มีทาง ต้องแก้ให้เสร็จเท่านั้น' },
      ],
      correct: ['a'],
      explainTh: 'git merge --abort ยกเลิกการรวมที่ค้างอยู่ ไฟล์กลับเป็นก่อนสั่ง merge ไม่มีอะไรหาย ลองใหม่ตอนพร้อมได้',
    },
  ],
}
