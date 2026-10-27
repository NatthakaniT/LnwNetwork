import type { Actor, Lesson, SceneAction } from '../../types'
import type { Commit, Machine, Repo, World } from '../../../gitsim/types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })
const base = ['hm', 'hh', 'hf', 'kMH', 'kFH'] // เครื่องเรา / GitHub / เครื่องเพื่อน พร้อมสาย

// สามคอลัมน์: เครื่องเรา x=170, GitHub x=480, เครื่องเพื่อน x=790 / จุดเซฟอยู่ซ้ายของคอลัมน์ ป้ายอยู่ขวา แถวละ 80
const cm = (id: string, x: number, y: number, label: string): Actor => h({ id, kind: 'commit', x, y, label, labelSide: 'right' })

const actors: Actor[] = [
  h({ id: 'hm', kind: 'pc', x: 170, y: 130, label: 'เครื่องเรา' }),
  h({ id: 'hh', kind: 'cloud', x: 480, y: 130, label: 'GitHub' }),
  h({ id: 'hf', kind: 'pc', x: 790, y: 130, label: 'เครื่องเพื่อน' }),
  h({ id: 'kMH', kind: 'cable', x: 170, y: 130, to: 'hh' }),
  h({ id: 'kFH', kind: 'cable', x: 790, y: 130, to: 'hh' }),

  // จุดเซฟของแต่ละที่ (เห็นว่าแต่ละที่รู้อะไร)
  cm('m1', 90, 300, 'เริ่มต้น'), cm('m2', 90, 380, 'ปรับหน้าแรก'),
  cm('h1', 400, 300, 'เริ่มต้น'), cm('h2', 400, 380, 'ปรับหน้าแรก'), cm('hx', 400, 380, 'เพื่อนเพิ่ม about'),
  cm('f1', 710, 300, 'เริ่มต้น'), cm('f2', 710, 380, 'ปรับหน้าแรก'),
  h({ id: 'km2', kind: 'cable', x: 90, y: 380, to: 'm1' }),
  h({ id: 'kh2', kind: 'cable', x: 400, y: 380, to: 'h1' }),
  h({ id: 'khx', kind: 'cable', x: 400, y: 380, to: 'h1' }),
  h({ id: 'kf2', kind: 'cable', x: 710, y: 380, to: 'f1' }),

  // คำสั่งและป้ายบอกว่าถ้าไม่พิมพ์จะเกิดอะไร
  h({ id: 'note1', kind: 'label', x: 480, y: 330, label: '🙈 เพื่อนมองไม่เห็นงานของเรา' }),
  h({ id: 'tagR', kind: 'label', x: 480, y: 445, label: 'remote = repository ที่อยู่ไกล ชื่อเล่น origin' }),
  h({ id: 'cmdClone', kind: 'card', x: 480, y: 500, lines: ['$ git clone ลิงก์ของ GitHub'], tone: 'deliver' }),
  h({ id: 'noClone', kind: 'label', x: 480, y: 420, label: 'ไม่ clone = ไม่มีไฟล์โปรเจกต์ในเครื่อง' }),
  h({ id: 'cmdCm', kind: 'card', x: 480, y: 500, lines: ['$ git commit -m "ปรับหน้าแรก"'], tone: 'deliver' }),
  h({ id: 'noCm', kind: 'label', x: 480, y: 445, label: 'commit = เซฟในเครื่อง ยังไม่ส่งไปไหน' }),
  h({ id: 'cmdPush', kind: 'card', x: 480, y: 500, lines: ['$ git push'], tone: 'deliver' }),
  h({ id: 'noPush', kind: 'label', x: 480, y: 445, label: 'ไม่ push = งานอยู่แค่ในเครื่องเรา' }),
  h({ id: 'notKnow', kind: 'label', x: 480, y: 445, label: 'GitHub มีแล้ว แต่เครื่องเพื่อนยังไม่มี' }),
  h({ id: 'cmdPull', kind: 'card', x: 480, y: 500, lines: ['$ git pull'], tone: 'deliver' }),
  h({ id: 'noPull', kind: 'label', x: 480, y: 445, label: 'ไม่ pull = เครื่องเพื่อนยังเป็นของเก่า' }),
  h({ id: 'rej', kind: 'label', x: 480, y: 445, label: 'GitHub มีจุดเซฟที่เราไม่มี ต้อง pull ก่อน' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 80, label: 'clone = ดึงทั้งก้อนลงเครื่อง ครั้งแรก' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 180, label: 'commit = เซฟในเครื่อง ยังไม่ส่งไปไหน' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 280, label: 'push = ส่งจุดเซฟขึ้น GitHub' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 380, label: 'pull = ดึงจุดเซฟใหม่ลงเครื่อง' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 480, label: 'ทุกที่จดประวัติของตัวเอง ต้องส่งต้องดึงเอง' }),
]

// โลกเริ่มต้นของห้องทดลอง: GitHub มี commit เดียว เพื่อนโคลนไว้แล้ว เครื่องเรายังว่าง
const first: Commit = { id: 'c1a0001', message: 'เริ่มต้น', parent: null, files: { 'index.html': '<h1>หน้าแรก</h1>' } }
const hubRepo: Repo = { commits: { [first.id]: first }, branches: { main: first.id }, head: 'main' }
const mk = (name: string): Machine => ({ name, files: {}, staged: null, repo: null })
const start: World = {
  me: mk('me'),
  friend: { ...mk('friend'), files: { ...first.files }, repo: structuredClone(hubRepo), remote: 'origin' },
  github: structuredClone(hubRepo),
}

export const lesson: Lesson = {
  id: 'g0-l5',
  part: 0,
  order: 5,
  status: 'ready',
  titleTh: 'ในเครื่องกับบนเน็ต',
  analogyTh: 'สมุดบัญชีของแต่ละร้าน กับตู้เซฟกลางที่ถ่ายสำเนาไปมา',
  ciscoModules: [],
  requires: [
    { lesson: 'g0-l3', useTh: 'commit คือจุดเซฟที่อยู่ในเครื่องเรา บทนี้ดูว่าจะเอาจุดเซฟไปให้เพื่อนยังไง' },
    { lesson: 'g0-l4', useTh: 'ก่อน commit ต้อง git add ใส่กล่องก่อน บทนี้จะใช้ทั้งสองคำสั่งต่อกับการส่งงาน' },
  ],
  precheck: [
    {
      id: 'c1',
      layer: 'th',
      reviewLesson: 'g0-l3',
      prompt: 'พอ commit แล้ว จุดเซฟนั้นอยู่ที่ไหน',
      choices: [
        { id: 'a', text: 'อยู่ในประวัติของ repository ในเครื่องเรา' },
        { id: 'b', text: 'ถูกส่งไปที่เพื่อนทันที' },
        { id: 'c', text: 'อยู่บนอินเทอร์เน็ต' },
      ],
      correct: ['a'],
      explainTh: 'commit เก็บจุดเซฟลงสมุดประวัติของเครื่องเราเท่านั้น ยังไม่ได้ส่งไปไหน การส่งให้เพื่อนเป็นอีกเรื่อง ซึ่งบทนี้จะสอน',
    },
    {
      id: 'c2',
      layer: 'th',
      reviewLesson: 'g0-l4',
      prompt: 'git add แล้วไม่ได้ commit ไฟล์นั้นเป็นจุดเซฟหรือยัง',
      choices: [
        { id: 'a', text: 'ยัง ไฟล์อยู่ในกล่อง staging area รอปิดผนึก ต้อง commit ก่อน' },
        { id: 'b', text: 'เป็นแล้ว' },
        { id: 'c', text: 'ไฟล์ถูกลบออกจากโฟลเดอร์งาน' },
      ],
      correct: ['a'],
      explainTh: 'git add แค่ย้ายไฟล์เข้ากล่อง git commit คือการปิดผนึกและเก็บเป็นจุดเซฟ ถ้าไม่ commit ก็ยังไม่มีจุดเซฟ',
    },
  ],
  videos: [
    { youtubeId: 'K3LG7U9uu-U', titleTh: 'Git พื้นฐานสำหรับงาน AI Server · บทที่ 6 Remote clone push pull', channel: 'Panutat Tejasen',
      noteTh: 'คลิปสั้น อธิบายที่เก็บกลางเป็น repository อีกก้อน แล้วทำ clone push pull บน terminal ให้ดู ในคลิปจะมีคำสั่ง git remote add origin ซึ่งใช้ตอนผูกโปรเจกต์ที่มีอยู่แล้วกับ GitHub ยังไม่ต้องใช้ในบทนี้ ตัวอย่างเป็นงาน AI ไม่ต้องสนใจเนื้อหางาน ฟังว่าทิศทางของ push กับ pull ต่างกันยังไง ช่วงไหนฟังไม่ทัน ข้ามได้' },
  ],
  terms: ['remote', 'origin', 'clone', 'push', 'pull'],
  deepDives: [
    {
      titleTh: 'ปุ่มใน GitHub Desktop ตรงกับคำสั่งไหน',
      bodyTh: 'ปุ่ม Commit ตรงกับ git commit ปุ่ม Push origin ตรงกับ git push ปุ่ม Pull origin ตรงกับ git pull และปุ่ม Fetch origin ตรงกับ git fetch ที่แค่ดูว่า GitHub มีของใหม่ไหมแต่ยังไม่รวมเข้ามา ทุกปุ่มคือคำสั่งที่ห่อไว้ให้กด ถ้าเข้าใจคำสั่งแล้ว ใช้แอปตามได้ทันที เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'git pull ทำสองอย่างในคำสั่งเดียว',
      bodyTh: 'git pull คือ git fetch ต่อด้วย git merge fetch ดึงจุดเซฟใหม่ลงมาไว้ในเครื่อง ส่วน merge เอามารวมกับงานเรา ตอนนี้แค่รู้ว่าถ้างานเราไม่ชนกับของเพื่อน การรวมจะเกิดเองเงียบ ๆ ส่วนกรณีชนกัน จะสอนในภาคต่อไป เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'ตอน push ครั้งแรกกับ GitHub จริงจะมีอะไรเด้งขึ้นมา',
      bodyTh: 'Git Bash บน Windows มีตัวช่วยชื่อ Git Credential Manager ตอน push ครั้งแรกจะเปิดหน้าต่างให้ล็อกอิน GitHub ในเบราว์เซอร์ ล็อกอินที่หน้านั้นเท่านั้น ห้ามพิมพ์รหัสผ่านลงใน Git Bash และห้ามส่งรหัสให้ใคร หลังล็อกอินแล้ว ตัวช่วยจะจำให้ ไม่ต้องล็อกอินอีก ภาค 2 จะพาทำจริงทีละขั้น ตอนนี้ไม่ต้องใช้ เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
  ],

  realTry: {
    introTh: 'ลองใน Git Bash ของจริง ยังไม่ต้องต่อ GitHub สร้างโฟลเดอร์ใหม่ชื่อ my-first-repo แล้วสร้างไฟล์ hello.txt ในนั้นด้วยโปรแกรมจดบันทึก จากนั้นคลิกขวาในโฟลเดอร์เลือก Open Git Bash here แล้วพิมพ์ทีละบรรทัด ห้ามใส่รหัสผ่านหรือ token ที่ไหน',
    steps: [
      { cmd: 'git --version', expectTh: 'ขึ้นเลขเวอร์ชัน เช่น git version ตามด้วยตัวเลข ถ้าขึ้นว่าไม่รู้จักคำสั่ง แปลว่ายังไม่ได้ติดตั้ง Git หรือเปิดผิดโปรแกรม' },
      { cmd: 'git config --global user.name "ชื่อคุณ"', expectTh: 'ไม่มีข้อความตอบกลับ แปลว่าสำเร็จ Git จะใส่ชื่อนี้ในทุก commit ของเรา ถ้าไม่ตั้ง บางเครื่องจะ commit ไม่ผ่านและให้ตั้งก่อน' },
      { cmd: 'git config --global user.email "อีเมลของคุณ"', expectTh: 'ไม่มีข้อความตอบกลับ แปลว่าสำเร็จ ใส่อีเมลอะไรก็ได้ที่เป็นของเรา ใช้ติดป้ายว่า commit ไหนเป็นของใคร' },
      { cmd: 'git init', expectTh: 'ขึ้นข้อความ Initialized empty Git repository ตามด้วยที่อยู่โฟลเดอร์ ถ้าไม่พิมพ์ Git จะยังไม่ดูแลโฟลเดอร์นี้' },
      { cmd: 'git add hello.txt', expectTh: 'ไม่มีข้อความตอบกลับ แปลว่าสำเร็จ ไฟล์เข้ากล่อง staging area แล้ว ลองพิมพ์ git status จะเห็นไฟล์อยู่ใต้ Changes to be committed' },
      { cmd: 'git commit -m "จุดเซฟแรกของฉัน"', expectTh: 'ขึ้นบรรทัดที่มี root-commit และข้อความที่ใส่ไว้ กับบอกว่ามีไฟล์เปลี่ยนไปหนึ่งไฟล์ แปลว่าจุดเซฟแรกเกิดแล้ว' },
      { cmd: 'git log', expectTh: 'เห็นจุดเซฟที่เพิ่งทำ มีรหัสยาว ๆ ชื่อกับอีเมลที่ตั้งไว้ และข้อความ จุดเซฟแรกของฉัน ถ้าหน้าจอค้างอยู่ในโหมดอ่าน กดปุ่ม q เพื่อออก' },
    ],
  },

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'อยู่แค่ในเครื่อง', lifeIcon: '🏠',
        lifeTh: 'ร้านเราจดสมุดบัญชีไว้ในร้าน ร้านอื่นเปิดดูไม่ได้ ถ้าไม่ได้ถ่ายสำเนาไปให้',
        narrationTh: 'ตอนนี้จุดเซฟอยู่ในเครื่องเราเท่านั้น เพื่อนอยู่อีกเครื่อง มองไม่เห็น จะทำงานด้วยกันได้ ต้องมีที่กลางบนอินเทอร์เน็ตให้ทุกคนเข้าถึง',
        setup: show('hm', 'hf', 'm1'),
        actions: [...show('note1'), glow('note1')],
      },
      {
        id: 's2', chipTh: 'ที่กลาง remote', lifeIcon: '🗄️',
        lifeTh: 'ตู้เซฟกลางของห้อง ใครก็ฝากและมาเอาของได้ เราตั้งชื่อเล่นให้ตู้ไว้เรียกสั้น ๆ',
        narrationTh: 'ที่กลางแบบนี้เรียกว่า remote คือ repository อีกก้อนที่อยู่ไกลออกไป เช่น GitHub เครื่องเราตั้งชื่อเล่นให้มันว่า origin เพื่อไม่ต้องจำที่อยู่ยาว ๆ',
        setup: show(...base, 'h1'),
        actions: [glow('hh'), ...show('tagR')],
      },
      {
        id: 's3', chipTh: 'clone', lifeIcon: '📋',
        lifeTh: 'ถ่ายสำเนาสมุดบัญชีของตู้เซฟกลางทั้งเล่ม เอามาไว้ที่ร้านเรา',
        narrationTh: 'git clone ดึงสำเนาทั้งก้อนจาก GitHub ลงเครื่อง พร้อมประวัติทั้งหมด และตั้งชื่อ origin ให้อัตโนมัติ ถ้าไม่ clone ก็ไม่มีไฟล์โปรเจกต์ในเครื่องเรา',
        setup: show(...base, 'h1', 'f1'),
        actions: [
          ...show('cmdClone'), glow('cmdClone'),
          { type: 'trail', path: ['hh', 'hm'], tone: 'deliver' },
          ...show('m1'), glow('m1'),
          ...show('noClone'),
        ],
      },
      {
        id: 's4', chipTh: 'commit ในเครื่อง', lifeIcon: '✏️',
        lifeTh: 'จดสมุดบัญชีของร้านเราเพิ่มหนึ่งบรรทัด ตู้เซฟกลางกับร้านอื่นยังไม่รู้เรื่อง',
        narrationTh: 'เรา commit เพิ่มหนึ่งอัน จุดเซฟใหม่อยู่แค่ในเครื่องเรา GitHub กับเครื่องเพื่อนยังไม่รู้เรื่อง เพราะ commit คือเซฟในเครื่อง ไม่ได้ส่งไปไหน',
        setup: show(...base, 'm1', 'h1', 'f1'),
        actions: [
          ...show('cmdCm'), glow('cmdCm'),
          ...show('km2', 'm2'), glow('m2'),
          { type: 'say', actor: 'hh', text: 'ยังไม่รู้', mood: 'no' },
          { type: 'say', actor: 'hf', text: 'ยังไม่รู้', mood: 'no' },
          ...show('noCm'),
        ],
      },
      {
        id: 's5', chipTh: 'push', lifeIcon: '📤',
        lifeTh: 'เอาสำเนาหน้าที่จดใหม่ไปใส่ตู้เซฟกลาง คนอื่นเปิดตู้ก็เห็น',
        narrationTh: 'git push ส่งจุดเซฟใหม่ของเราขึ้น GitHub ตอนนี้เพื่อนเข้าไปดูได้แล้ว ถ้าไม่ push งานก็อยู่แค่ในเครื่องเรา',
        setup: show(...base, 'm1', 'km2', 'm2', 'h1', 'f1'),
        actions: [
          ...show('cmdPush'), glow('cmdPush'),
          { type: 'trail', path: ['hm', 'hh'], tone: 'deliver' },
          ...show('kh2', 'h2'), glow('h2'),
          ...show('noPush'),
        ],
      },
      {
        id: 's6', chipTh: 'เพื่อนยังไม่มี', lifeIcon: '🙈',
        lifeTh: 'ตู้เซฟกลางมีหน้าใหม่แล้ว แต่สมุดของร้านเพื่อนยังเป็นฉบับเก่า จนกว่าเขาจะไปถ่ายสำเนา',
        narrationTh: 'แต่ GitHub ไม่ได้ส่งมาให้เพื่อนเอง เครื่องเพื่อนยังมีแค่จุดเซฟเดิม เพราะแต่ละที่จดประวัติของตัวเอง ใครอยากได้ของใหม่ ต้องไปดึงมาเอง',
        setup: show(...base, 'm1', 'km2', 'm2', 'h1', 'kh2', 'h2', 'f1'),
        actions: [
          { type: 'say', actor: 'hf', text: 'ยังเห็นแค่ของเก่า', mood: 'no' },
          glow('h2'), glow('f1'),
          ...show('notKnow'),
        ],
      },
      {
        id: 's7', chipTh: 'pull', lifeIcon: '📥',
        lifeTh: 'ไปที่ตู้เซฟกลาง ถ่ายสำเนาหน้าใหม่ แล้วเอามาต่อในสมุดของร้านเรา',
        narrationTh: 'เพื่อนพิมพ์ git pull ดึงจุดเซฟใหม่จาก GitHub ลงมารวมในเครื่องเขา ถ้าไม่พิมพ์ เครื่องเขาก็ยังเป็นของเก่าไปเรื่อย ๆ',
        setup: show(...base, 'm1', 'km2', 'm2', 'h1', 'kh2', 'h2', 'f1'),
        actions: [
          ...show('cmdPull'), glow('cmdPull'),
          { type: 'trail', path: ['hh', 'hf'], tone: 'deliver' },
          ...show('kf2', 'f2'), glow('f2'),
          ...show('noPull'),
        ],
      },
      {
        id: 's8', chipTh: 'push ถูกปฏิเสธ', lifeIcon: '🚫',
        lifeTh: 'ตู้เซฟกลางไม่ยอมให้ทับหน้าที่เพื่อนเพิ่งใส่ไว้ ต้องเอาหน้านั้นมาต่อสมุดเราก่อน',
        narrationTh: 'ถ้าเพื่อน push ไปก่อน แล้วเรา push ตาม GitHub จะไม่รับ เพราะมีจุดเซฟที่เรายังไม่มี Git กันไม่ให้ทับงานเพื่อน ให้ pull มารวมก่อน แล้วค่อย push ใหม่',
        setup: show('hm', 'hh', 'kMH', 'm1', 'km2', 'm2', 'h1', 'khx', 'hx'),
        actions: [
          ...show('cmdPush'), glow('cmdPush'),
          { type: 'say', actor: 'hh', text: 'ไม่รับ ต้อง pull ก่อน', mood: 'no' },
          ...show('rej'),
        ],
      },
      {
        id: 's9', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'สมุดบัญชีของแต่ละร้าน กับตู้เซฟกลางที่ถ่ายสำเนาไปมา',
        narrationTh: 'สรุป clone ดึงทั้งก้อนครั้งแรก commit เซฟในเครื่อง push ส่งขึ้น GitHub pull ดึงของใหม่ลงมา ทุกที่จดประวัติของตัวเอง ต้องส่งและดึงเอง',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'git',
    introTh: 'GitHub มีโปรเจกต์อยู่แล้วหนึ่งจุดเซฟ เครื่องเรายังว่าง เพื่อนจำลองจะ push งานใหม่ขึ้น GitHub ระหว่างที่เราทำ ดูภาพเครื่องเรา เครื่องเพื่อน และ GitHub ทางขวาเปลี่ยนตามทุกคำสั่ง',
    start,
    allowed: ['status', 'add', 'commit', 'log', 'clone', 'push', 'pull'],
    goals: [
      { type: 'state', taskTh: 'ดึงสำเนาโปรเจกต์จาก GitHub ลงเครื่องเรา', hintTh: 'พิมพ์ git clone ตามด้วยลิงก์อะไรก็ได้ ในห้องนี้พิมพ์แค่ git clone ก็พอ', check: 'cloned' },
      { type: 'state', taskTh: 'เพื่อนเพิ่ง push งานใหม่ขึ้น GitHub ดึงงานของเพื่อนลงมาที่เครื่องเรา', hintTh: 'พิมพ์ git pull แล้วพิมพ์ git log ดูว่ามีจุดเซฟของเพื่อนเพิ่มมา', check: 'pulled' },
      { type: 'state', taskTh: 'คลิกชื่อไฟล์ index.html ในโฟลเดอร์งานเพื่อแก้ไข กดบันทึกไฟล์ แล้ว add กับ commit โดยข้อความมีคำว่า ของฉัน', hintTh: 'พิมพ์ git add index.html แล้วพิมพ์ git commit -m "หน้าแรกของฉัน"', check: 'committed', arg: 'ของฉัน' },
      { type: 'state', taskTh: 'ส่งจุดเซฟของเราขึ้น GitHub', hintTh: 'พิมพ์ git push', check: 'pushed' },
    ],
    friendScript: [
      { afterGoal: 0, action: { type: 'commit', file: 'about.txt', content: 'เกี่ยวกับเรา', message: 'เพิ่มหน้า about' } },
      { afterGoal: 0, action: { type: 'push' } },
    ],
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'commit แล้ว เพื่อนที่อยู่คนละเครื่องเห็นจุดเซฟนั้นทันทีไหม',
      choices: [
        { id: 'a', text: 'เห็นทันที เพราะ Git ส่งให้เอง' },
        { id: 'b', text: 'ยังไม่เห็น commit เซฟแค่ในเครื่องเรา ต้อง push ขึ้น GitHub เพื่อนถึงจะดึงไปได้' },
        { id: 'c', text: 'เห็นเมื่อเรา clone' },
        { id: 'd', text: 'เห็นเมื่อเรา git add' },
      ],
      correct: ['b'],
      explainTh: 'commit คือเซฟในสมุดของเครื่องเรา ไม่ได้ส่งไปไหน ต้อง push ขึ้นที่กลางก่อน ถ้าไม่ push งานก็อยู่แค่ในเครื่องเรา',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'เพื่อน push งานใหม่ขึ้น GitHub แล้ว เครื่องเรารู้เรื่องนี้เองไหม',
      choices: [
        { id: 'a', text: 'รู้เอง เพราะเครื่องเรากับ GitHub ต่อกันอยู่' },
        { id: 'b', text: 'ไม่รู้ แต่ละที่จดประวัติของตัวเอง ต้องพิมพ์ git pull ไปดึงมา' },
        { id: 'c', text: 'รู้ แต่ต้อง git add ก่อน' },
        { id: 'd', text: 'ไม่รู้ และไม่มีทางดึงมาได้' },
      ],
      correct: ['b'],
      explainTh: 'GitHub ไม่ส่งของใหม่มาให้เอง ต้องเราไปดึง ถ้าไม่ pull เครื่องเรายังเป็นของเก่า',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'git push ถูกปฏิเสธเพราะเพื่อน push ไปก่อน ควรทำอะไรต่อ',
      choices: [
        { id: 'a', text: 'พิมพ์ git push ซ้ำจนกว่าจะผ่าน' },
        { id: 'b', text: 'ลบโปรเจกต์ทิ้งแล้ว clone ใหม่' },
        { id: 'c', text: 'พิมพ์ git pull เพื่อรวมงานเพื่อนเข้ามาก่อน แล้วค่อย git push ใหม่' },
        { id: 'd', text: 'รอให้เพื่อนลบงานของเขา' },
      ],
      correct: ['c'],
      explainTh: 'GitHub ไม่ยอมให้ทับจุดเซฟที่เรายังไม่มี Git กันงานเพื่อนหาย ให้ pull มารวมก่อน แล้ว push ก็จะผ่าน',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'clone กับ pull ต่างกันยังไง',
      choices: [
        { id: 'a', text: 'clone ดึงทั้งก้อนพร้อมประวัติ ใช้ตอนเริ่มครั้งแรก ส่วน pull ดึงเฉพาะจุดเซฟใหม่มารวมกับที่มีอยู่' },
        { id: 'b', text: 'ต่างกันแค่ชื่อ ใช้แทนกันได้เสมอ' },
        { id: 'c', text: 'clone ส่งขึ้น GitHub ส่วน pull ลงเครื่อง' },
        { id: 'd', text: 'pull ใช้ครั้งแรก clone ใช้ครั้งต่อไป' },
      ],
      correct: ['a'],
      explainTh: 'clone เหมือนถ่ายสำเนาสมุดทั้งเล่ม ส่วน pull เหมือนไปถ่ายเฉพาะหน้าใหม่มาต่อ ทิศทางส่งขึ้น GitHub คือ push',
    },
  ],
}
