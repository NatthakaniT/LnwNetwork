import type { Actor, Lesson, SceneAction } from '../../types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })
const cm = (id: string, x: number, y: number, label: string): Actor => h({ id, kind: 'commit', x, y, label, labelSide: 'right' })
const cmd = (id: string, x: number, y: number, line: string): Actor => h({ id, kind: 'card', x, y, lines: [line], tone: 'deliver' })

const actors: Actor[] = [
  // ฉาก 1: สร้าง repository เปล่าบน GitHub
  h({ id: 'newrepo', kind: 'card', x: 480, y: 200, lines: ['🌐 github.com → New', 'ตั้งชื่อ repository', 'ไม่ติ๊ก Add a README'] }),
  h({ id: 'noNew', kind: 'label', x: 480, y: 360, label: 'ไม่สร้าง = ไม่มีที่ให้ส่งงานขึ้น' }),
  h({ id: 'readmeWarn', kind: 'label', x: 480, y: 440, label: 'ติ๊ก README = push ครั้งแรกจะถูกปฏิเสธ' }),

  // ฉาก 2: remote add
  h({ id: 'me', kind: 'pc', x: 170, y: 130, label: 'เครื่องเรา' }),
  h({ id: 'gh', kind: 'cloud', x: 790, y: 130, label: 'GitHub' }),
  h({ id: 'kMG', kind: 'cable', x: 170, y: 130, to: 'gh' }),
  cmd('cmdRemote', 480, 300, '$ git remote add origin ลิงก์ของ repo'),
  h({ id: 'noRem', kind: 'label', x: 480, y: 430, label: 'ไม่ผูก = Git ไม่รู้ว่าจะส่งไปที่ไหน' }),

  // ฉาก 3: ตั้งชื่อสายเป็น main
  cmd('cmdBr', 480, 220, '$ git branch -M main'),
  h({ id: 'whyMain', kind: 'label', x: 480, y: 340, label: 'Windows บางเครื่องตั้งชื่อสายแรกว่า master' }),
  h({ id: 'noBr', kind: 'label', x: 480, y: 430, label: 'ไม่ตั้ง = ชื่อสายอาจไม่ตรงกับที่ทีมใช้' }),

  // ฉาก 4: push -u
  cm('m1', 110, 260, 'เริ่มต้น'), cm('h1', 730, 260, 'เริ่มต้น'),
  cmd('cmdPush', 480, 350, '$ git push -u origin main'),
  h({ id: 'noPush', kind: 'label', x: 480, y: 440, label: 'ไม่ push = งานอยู่แค่ในเครื่องเรา' }),
  h({ id: 'dashU', kind: 'label', x: 480, y: 495, label: '-u จำไว้ ครั้งหน้าพิมพ์แค่ git push' }),

  // ฉาก 5: หน้าต่างล็อกอิน
  h({ id: 'win', kind: 'card', x: 480, y: 200, lines: ['🔐 Git Credential Manager', 'Sign in to GitHub', 'เลือก Sign in with your browser'] }),
  h({ id: 'okLogin', kind: 'label', x: 480, y: 340, label: 'ล็อกอินที่หน้าต่างนี้เท่านั้น' }),
  h({ id: 'noType', kind: 'label', x: 480, y: 410, label: '🚫 ห้ามพิมพ์รหัสผ่านลงในคำสั่ง' }),
  h({ id: 'remember', kind: 'label', x: 480, y: 480, label: 'ล็อกอินครั้งเดียว ครั้งหน้าจำให้เอง' }),

  // ฉาก 6: เช็กผล
  h({ id: 'st', kind: 'card', x: 480, y: 210, lines: ['$ git status', "up to date with 'origin/main'"] }),
  h({ id: 'seeFiles', kind: 'label', x: 480, y: 340, label: 'รีเฟรชหน้า repo บนเว็บ เห็นไฟล์ขึ้นแล้ว' }),
  h({ id: 'noChk', kind: 'label', x: 480, y: 430, label: 'ไม่เช็ก = ไม่รู้ว่าส่งขึ้นไปจริงไหม' }),

  // ฉาก 7: เชิญเพื่อนเป็น collaborator
  h({ id: 'inv', kind: 'card', x: 480, y: 200, lines: ['🌐 Settings → Collaborators', 'Add people', 'ใส่ชื่อ GitHub ของเพื่อน'] }),
  h({ id: 'accept', kind: 'label', x: 480, y: 340, label: 'เพื่อนกดรับคำเชิญ' }),
  h({ id: 'noInv', kind: 'label', x: 480, y: 430, label: 'ไม่เชิญ = เพื่อน push เข้า repo เราไม่ได้' }),

  // ฉาก 8: เพื่อน clone
  h({ id: 'fr', kind: 'pc', x: 790, y: 130, label: 'เครื่องเพื่อน' }),
  h({ id: 'gh2', kind: 'cloud', x: 170, y: 130, label: 'GitHub' }),
  h({ id: 'kFG', kind: 'cable', x: 790, y: 130, to: 'gh2' }),
  cmd('cmdClone', 480, 300, '$ git clone ลิงก์ของ repo'),
  cm('f1', 710, 400, 'เริ่มต้น'),
  h({ id: 'noClone', kind: 'label', x: 480, y: 480, label: 'ไม่ clone = เครื่องเพื่อนไม่มีไฟล์' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 80, label: 'remote add origin = ผูกลิงก์ GitHub' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 180, label: 'branch -M main = ตั้งชื่อสายเป็น main' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 280, label: 'push -u origin main = ส่งขึ้นครั้งแรก' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 380, label: 'ล็อกอินที่หน้าต่าง ไม่พิมพ์รหัสผ่าน' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 480, label: 'เชิญเพื่อน แล้วเพื่อน clone' }),
]

export const lesson: Lesson = {
  id: 'g2-l1',
  part: 2,
  order: 1,
  status: 'ready',
  titleTh: 'push งานจริงครั้งแรก',
  analogyTh: 'เปิดตู้เซฟกลางของห้อง เอาลิงก์ตู้มาจดไว้ในมือถือ ส่งของใส่ตู้ครั้งแรกต้องโชว์บัตรกับเจ้าหน้าที่ แล้วให้กุญแจเพื่อนมาหยิบของได้',
  ciscoModules: [],
  requires: [
    { lesson: 'g0-l5', useTh: 'บทนี้พิมพ์ git push กับ git clone จริงเป็นครั้งแรก ต่อจากภาพเครื่องเรา GitHub และเครื่องเพื่อนที่เพิ่งเรียน' },
    { lesson: 'g0-l3', useTh: 'ต้องมีจุดเซฟอย่างน้อยหนึ่งอันในเครื่องก่อน ถึงจะมีอะไรให้ push' },
    { lesson: 'g1-l4', useTh: 'ชื่อสาย main ที่ทีมใช้เป็นสายหลัก และ .gitignore กันของลับไม่ให้ขึ้นไปกับ push' },
  ],
  precheck: [
    {
      id: 'c1',
      layer: 'th',
      reviewLesson: 'g0-l5',
      prompt: 'ในคำสั่ง git push origin main คำว่า origin หมายถึงอะไร',
      choices: [
        { id: 'a', text: 'ชื่อเล่นของ remote คือ repository ที่อยู่บน GitHub' },
        { id: 'b', text: 'ชื่อของเรา' },
        { id: 'c', text: 'ชื่อไฟล์ที่จะส่ง' },
      ],
      correct: ['a'],
      explainTh: 'origin เป็นชื่อเล่นที่ใช้แทนลิงก์ยาว ๆ ของ remote พอ git บอกว่าส่งไป origin ก็รู้ว่าส่งไปที่ GitHub',
    },
    {
      id: 'c2',
      layer: 'th',
      reviewLesson: 'g0-l3',
      prompt: 'ถ้าเพิ่งสร้างโฟลเดอร์ใหม่ ยังไม่เคย commit เลย แล้ว push จะมีอะไรให้ส่งไหม',
      choices: [
        { id: 'a', text: 'มี Git ส่งไฟล์ในโฟลเดอร์ให้เอง' },
        { id: 'b', text: 'ไม่มี push ส่งเฉพาะจุดเซฟ ต้อง commit อย่างน้อยหนึ่งครั้งก่อน' },
        { id: 'c', text: 'มี แต่ส่งเฉพาะชื่อไฟล์' },
      ],
      correct: ['b'],
      explainTh: 'push ส่งจุดเซฟ ไม่ได้ส่งไฟล์ที่ยังไม่ได้ commit ถ้าไม่มีจุดเซฟ Git จะบอกว่าไม่มีอะไรให้ส่ง',
    },
  ],
  videos: [
    { youtubeId: '4Z8fGcx5N2A', titleTh: 'เรียนรู้พื้นฐานการใช้งาน Git & Github (git init, add, commit, remote, push)', channel: 'MilerDev',
      noteTh: 'คลิปนี้ตรงกับบทนี้บางส่วน คือตั้งแต่ commit ไปจนถึง remote และ push ครั้งแรก ส่วนหน้าต่างล็อกอินของ Git Credential Manager และการเชิญเพื่อนเป็น collaborator ไม่มีคลิปภาษาไทยที่อธิบายตรง ๆ บทนี้จึงสอนสองเรื่องนั้นเองในแอป อย่าลืมว่าในคลิปอาจใช้โปรแกรมหรือชื่อสายไม่เหมือนเรา ให้ทำตามที่แอปบอก' },
    { youtubeId: 'BDoNSr3rMf4', titleTh: 'สอน git เบื้องต้น: การใช้ git push ไปยัง remote repository บน github', channel: 'prasertcbs',
      noteTh: 'เสริม ดูเฉพาะช่วงที่ push ไปยัง GitHub ได้เห็นผลลัพธ์จริงของคำสั่ง ยาวสิบสี่นาที ไม่ต้องดูหมด' },
    { youtubeId: 'DV-JWKq-1BI', titleTh: 'สอนเอาโค้ดโปรเจคขึ้น GitHub เพื่อให้เขียนโค้ดร่วมกับเพื่อนๆ', channel: "Boppin' Code",
      noteTh: 'เสริม ภาพรวมการเอาโปรเจกต์ขึ้น GitHub เพื่อทำงานกับเพื่อน สั้นแปดนาที ยังไม่ชัดว่าคลิปพูดถึงการเชิญ collaborator หรือไม่ ถ้าไม่เจอ ให้ทำตามขั้นตอนในบทนี้' },
    { youtubeId: 'bZhtmmZinWo', titleTh: 'Connect Git to GitHub on Windows 11, first push, no password (ภาษาอังกฤษ)', channel: 'Fix It Faster IT',
      noteTh: 'เสริม เป็นภาษาอังกฤษ ยาวไม่ถึงสองนาที ดูเพื่อเห็นหน้าต่างล็อกอินของ Git Credential Manager ตอน push ครั้งแรกในเครื่องจริง ดูแค่ภาพก็พอ ไม่ต้องฟังเสียง' },
  ],
  terms: ['collaborator', 'gcm'],
  deepDives: [
    {
      titleTh: 'ลิงก์แบบ SSH ต่างจากลิงก์ HTTPS ยังไง',
      bodyTh: 'ลิงก์ที่ใช้ในบทนี้ขึ้นต้นด้วย https เป็นแบบที่ใช้ล็อกอินผ่านหน้าต่างเบราว์เซอร์ อีกแบบคือ SSH ขึ้นต้นด้วย git ที่อักขระแอต ใช้กุญแจคู่ที่สร้างไว้ในเครื่องแทนการล็อกอิน ตั้งค่ายุ่งกว่าเล็กน้อยแต่ไม่ต้องล็อกอินซ้ำ มือใหม่ใช้ https ไปก่อนได้เลย เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'ทำไมห้ามเอารหัสผ่านหรือ token ไปใส่ในคำสั่ง',
      bodyTh: 'token คือรหัสยาว ๆ ที่ GitHub ออกให้แทนรหัสผ่านสำหรับโปรแกรม ถ้าพิมพ์ลงในคำสั่ง มันจะติดอยู่ในประวัติคำสั่งของเครื่อง และถ้าเผลอเขียนลงไฟล์ที่ push ก็รั่วให้ทุกคน การล็อกอินผ่าน Git Credential Manager เก็บรหัสในที่ที่ปลอดภัยของ Windows ให้เอง จึงไม่ต้องจับรหัสเลย แอปนี้ไม่ขอรหัสหรือ token เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'repository แบบ Public กับ Private ต่างกันยังไง',
      bodyTh: 'Public คือใครในโลกก็เปิดดูได้ แต่ยังแก้ได้เฉพาะคนที่เราเชิญ Private คือเห็นได้เฉพาะเรากับคนที่เชิญเท่านั้น งานที่ทำกับเพื่อนในห้องเลือก Private ไว้ก่อนได้ ทั้งสองแบบเชิญเพื่อนเป็น collaborator ได้เหมือนกัน เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
  ],

  realTry: {
    introTh: 'ลองใน Git Bash ของจริง เตรียมสามอย่างก่อน หนึ่ง โฟลเดอร์ my-first-repo จากภาคก่อนที่มี commit แล้ว สอง repository เปล่าบน GitHub ชื่อเดียวกัน สร้างด้วยปุ่ม New และไม่ติ๊กสร้าง README สาม เพื่อนที่มีบัญชี GitHub แล้วเปิด Git Bash ในโฟลเดอร์ my-first-repo พิมพ์ทีละบรรทัด ให้เปลี่ยน ชื่อคุณ เป็นชื่อบัญชี GitHub ของคุณ ห้ามพิมพ์รหัสผ่านหรือ token ในคำสั่งใด ๆ ถ้าขึ้นหน้าต่างล็อกอิน ให้ล็อกอินที่หน้าต่างนั้น สองบรรทัดสุดท้ายให้เพื่อนทำในเครื่องของเพื่อนเอง หลังจากที่เราเชิญเพื่อนเป็น collaborator บนเว็บ GitHub แล้ว',
    steps: [
      { cmd: 'git remote add origin https://github.com/ชื่อคุณ/my-first-repo.git', expectTh: 'ไม่มีข้อความตอบกลับ แปลว่าสำเร็จ Git จำแล้วว่า origin คือ repository บน GitHub ตัวนี้ ถ้าไม่พิมพ์ พอ push จะขึ้นว่าไม่มีปลายทางให้ส่ง ถ้าขึ้นว่า origin มีอยู่แล้ว แปลว่าเคยผูกไว้ ข้ามไปได้' },
      { cmd: 'git remote -v', expectTh: 'เห็นสองบรรทัด ขึ้นต้นด้วย origin ตามด้วยลิงก์ ท้ายบรรทัดเป็น fetch กับ push แปลว่าผูกถูกแล้ว ถ้าไม่เห็นอะไรเลย แปลว่ายังไม่ได้ผูก' },
      { cmd: 'git branch -M main', expectTh: 'ไม่มีข้อความตอบกลับ แปลว่าสำเร็จ สายที่ยืนอยู่ชื่อ main แล้ว Windows บางเครื่องตั้งชื่อสายแรกว่า master ถ้าไม่พิมพ์ ชื่อสายอาจไม่ตรงกับที่ทีมใช้' },
      { cmd: 'git push -u origin main', expectTh: 'ครั้งแรกจะมีหน้าต่าง Git Credential Manager เด้งขึ้นให้ล็อกอิน GitHub ในเบราว์เซอร์ ล็อกอินเสร็จกลับมาที่ Git Bash จะเห็นข้อความส่งขึ้นและบอกว่าสาย main ตั้งค่าให้ตามต้นทางแล้ว ถ้าขึ้นว่าถูกปฏิเสธเพราะมีของที่เราไม่มี แปลว่าตอนสร้าง repository ไปติ๊กสร้าง README ไว้ ให้พิมพ์ git pull origin main แล้วลองใหม่' },
      { cmd: 'git status', expectTh: 'เห็นข้อความว่า Your branch is up to date with origin main แปลว่าเครื่องเรากับ GitHub ตรงกัน แล้วลองรีเฟรชหน้า repository บนเว็บ จะเห็นไฟล์ขึ้นมา' },
      { cmd: 'git clone https://github.com/ชื่อคุณ/my-first-repo.git', expectTh: 'ให้เพื่อนพิมพ์ในเครื่องเพื่อน หลังรับคำเชิญแล้ว เพื่อนจะเห็นข้อความกำลังดึงของลงมา และได้โฟลเดอร์ my-first-repo ใหม่ ถ้า repository เป็น Private และยังไม่ได้เชิญ จะขึ้นว่าหา repository ไม่เจอ' },
      { cmd: 'git log --oneline', expectTh: 'ให้เพื่อนพิมพ์ในโฟลเดอร์ my-first-repo ที่เพิ่ง clone เห็นรายการจุดเซฟเหมือนที่เราเห็น แปลว่าประวัติมาครบ' },
    ],
  },

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'สร้างที่เก็บบนเว็บ', lifeIcon: '🗄️',
        lifeTh: 'ขอตู้เซฟกลางเปล่า ๆ มาหนึ่งตู้ก่อน ยังไม่ใส่อะไรเลย',
        narrationTh: 'เริ่มจากสร้าง repository เปล่าบนเว็บ GitHub กดปุ่ม New ตั้งชื่อ แล้วอย่าติ๊กสร้างไฟล์ README เพราะเราต้องการที่เก็บที่ว่างจริง ๆ',
        setup: show('newrepo'),
        actions: [glow('newrepo'), ...show('noNew', 'readmeWarn')],
      },
      {
        id: 's2', chipTh: 'ผูกลิงก์', lifeIcon: '📇',
        lifeTh: 'จดที่อยู่ตู้เซฟลงมือถือ แล้วตั้งชื่อว่า บ้าน ครั้งหน้าบอกแค่ชื่อก็ไปถูก',
        narrationTh: 'จากนั้นบอก Git ในเครื่องเราว่าตู้กลางอยู่ที่ไหน พิมพ์ git remote add origin ตามด้วยลิงก์ของ repository ถ้าไม่ผูก Git ก็ไม่รู้ว่าจะส่งไปที่ไหน',
        setup: show('me', 'gh'),
        actions: [...show('cmdRemote'), glow('cmdRemote'), ...show('kMG', 'noRem')],
      },
      {
        id: 's3', chipTh: 'ตั้งชื่อสาย main', lifeIcon: '🏷️',
        lifeTh: 'ติดป้ายชื่อมาตรฐานให้กล่อง ทีมจะได้เรียกตรงกันหมด',
        narrationTh: 'ต่อมาตั้งชื่อสายเป็น main ด้วยคำสั่ง git branch ขีดเอ็ม main บน Windows บางเครื่องสายแรกชื่อ master ถ้าไม่ตั้ง ชื่ออาจไม่ตรงกับที่ทีมใช้',
        setup: show('cmdBr'),
        actions: [glow('cmdBr'), ...show('whyMain', 'noBr')],
      },
      {
        id: 's4', chipTh: 'push ครั้งแรก', lifeIcon: '📤',
        lifeTh: 'ยกกล่องแรกไปใส่ตู้เซฟกลาง และบอกตู้ว่าครั้งหน้ากล่องนี้ไปที่เดิม',
        narrationTh: 'แล้วส่งขึ้นด้วย git push ขีดยู origin main ขีดยู คือให้ Git จำปลายทางไว้ ครั้งหน้าพิมพ์แค่ git push ถ้าไม่ push งานอยู่แค่ในเครื่องเรา',
        setup: show('me', 'gh', 'kMG', 'm1'),
        actions: [...show('cmdPush'), glow('cmdPush'), ...show('h1'), glow('h1'), ...show('noPush', 'dashU')],
      },
      {
        id: 's5', chipTh: 'หน้าต่างล็อกอิน', lifeIcon: '🪪',
        lifeTh: 'ครั้งแรกเจ้าหน้าที่ตู้เซฟขอดูบัตร โชว์ที่เคาน์เตอร์ ไม่ใช่ตะโกนเลขบัตรให้ทั้งห้องได้ยิน',
        narrationTh: 'ตอน push ครั้งแรก จะมีหน้าต่างของ Git Credential Manager เด้งขึ้นให้ล็อกอิน GitHub ในเบราว์เซอร์ ล็อกอินที่หน้าต่างนั้น ห้ามพิมพ์รหัสผ่านลงในคำสั่ง',
        setup: show('win'),
        actions: [glow('win'), ...show('okLogin', 'noType', 'remember')],
      },
      {
        id: 's6', chipTh: 'เช็กผล', lifeIcon: '✅',
        lifeTh: 'ส่งของแล้วเปิดตู้ดูอีกที ว่าของอยู่ในตู้จริง',
        narrationTh: 'พิมพ์ git status ถ้าขึ้นว่า up to date แปลว่าเครื่องเรากับ GitHub ตรงกันแล้ว ลองรีเฟรชหน้า repository บนเว็บ จะเห็นไฟล์ขึ้นมา',
        setup: show('st'),
        actions: [glow('st'), ...show('seeFiles', 'noChk')],
      },
      {
        id: 's7', chipTh: 'เชิญเพื่อน', lifeIcon: '🔑',
        lifeTh: 'ทำกุญแจตู้เซฟให้เพื่อนหนึ่งดอก เพื่อนต้องรับกุญแจก่อนถึงจะใช้ได้',
        narrationTh: 'ให้เพื่อนส่งงานเข้ามาได้ ต้องเชิญเป็น collaborator ไปที่ Settings เลือก Collaborators กด Add people ใส่ชื่อ GitHub ของเพื่อน แล้วเพื่อนกดรับคำเชิญ',
        setup: show('inv'),
        actions: [glow('inv'), ...show('accept', 'noInv')],
      },
      {
        id: 's8', chipTh: 'เพื่อน clone', lifeIcon: '📥',
        lifeTh: 'เพื่อนถือกุญแจมา ถ่ายสำเนาของทั้งตู้กลับไปไว้ที่โต๊ะตัวเอง',
        narrationTh: 'เพื่อนรับคำเชิญแล้ว ก็พิมพ์ git clone ตามด้วยลิงก์ใน Git Bash ของเพื่อน ได้สำเนาทั้งก้อนพร้อมประวัติ ถ้าไม่ clone เครื่องเพื่อนก็ไม่มีไฟล์',
        setup: show('fr', 'gh2', 'kFG'),
        actions: [...show('cmdClone'), glow('cmdClone'), ...show('f1'), glow('f1'), ...show('noClone')],
      },
      {
        id: 's9', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'จดที่อยู่ตู้ ติดป้ายชื่อ ส่งของโดยโชว์บัตรที่เคาน์เตอร์ แล้วให้กุญแจเพื่อน',
        narrationTh: 'สรุป ผูกลิงก์ด้วย remote add ตั้งชื่อสายเป็น main ส่งขึ้นด้วย push ขีดยู ล็อกอินที่หน้าต่าง ไม่พิมพ์รหัสผ่าน แล้วเชิญเพื่อนให้ clone',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'match',
    introTh: 'ลองจับคู่คำสั่งทางซ้าย กับสิ่งที่คำสั่งนั้นทำทางขวา แต่ละคำสั่งมีคำตอบของตัวเองหนึ่งอัน',
    items: [
      { id: 'a1', textTh: 'git remote add origin ลิงก์' },
      { id: 'a2', textTh: 'git remote -v' },
      { id: 'a3', textTh: 'git branch -M main' },
      { id: 'a4', textTh: 'git push -u origin main' },
      { id: 'a5', textTh: 'git clone ลิงก์' },
      { id: 'a6', textTh: 'git pull' },
      { id: 'r1', textTh: 'บอก Git ว่า origin คือ repository ตัวนี้บน GitHub' },
      { id: 'r2', textTh: 'แสดงรายชื่อ remote ที่ผูกไว้พร้อมลิงก์' },
      { id: 'r3', textTh: 'เปลี่ยนชื่อสายที่ยืนอยู่ให้เป็น main' },
      { id: 'r4', textTh: 'ส่งขึ้น GitHub ครั้งแรก และจำปลายทางไว้ให้ครั้งหน้าพิมพ์สั้นลง' },
      { id: 'r5', textTh: 'ดึงสำเนาทั้งก้อนพร้อมประวัติลงเครื่องที่ยังไม่มีอะไรเลย' },
      { id: 'r6', textTh: 'ดึงจุดเซฟใหม่ที่เพื่อนส่งขึ้นไป ลงมาในโฟลเดอร์ที่มีอยู่แล้ว' },
    ],
    answer: { a1: 'r1', a2: 'r2', a3: 'r3', a4: 'r4', a5: 'r5', a6: 'r6' },
    explainTh: 'ให้ดูว่าคำสั่งนั้นทำงานกับอะไร ตัวที่ผูกหรือดูรายชื่อ remote ไม่ได้ส่งงานเลย ตัวที่ตั้งชื่อสายเปลี่ยนแค่ในเครื่อง ส่วนสองตัวที่ย้ายงานระหว่างเครื่องกับ GitHub ให้ดูว่าฝั่งนั้นมีโฟลเดอร์งานอยู่แล้วหรือยัง',
    rightTh: 'ใช่เลย ผูกลิงก์ ตั้งชื่อสาย แล้วค่อยส่ง ส่วนเพื่อนใช้ clone ครั้งแรก และใช้ pull ทุกครั้งหลังจากนั้น',
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'พิมพ์ git push ขึ้นว่าไม่มีปลายทางให้ส่ง ทั้งที่ commit แล้ว น่าจะลืมคำสั่งไหน',
      choices: [
        { id: 'a', text: 'git clone เพราะต้องดึงของลงก่อน' },
        { id: 'b', text: 'git add เพราะยังไม่ได้เก็บไฟล์' },
        { id: 'c', text: 'git remote add origin ลิงก์ เพราะ Git ยังไม่รู้ว่า GitHub อยู่ที่ไหน' },
        { id: 'd', text: 'git status เพราะต้องเช็กก่อน' },
      ],
      correct: ['c'],
      explainTh: 'commit เป็นการเซฟในเครื่อง ส่วน push ต้องมีปลายทาง การผูก origin คือการบอกปลายทางนั้น ถ้าไม่ผูก Git ไม่มีที่ให้ส่ง',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'push ครั้งแรกแล้วมีหน้าต่างเด้งขึ้นให้ล็อกอิน GitHub ควรทำอะไร',
      choices: [
        { id: 'a', text: 'ล็อกอินในหน้าต่างหรือเบราว์เซอร์ที่เด้งขึ้นมา' },
        { id: 'b', text: 'ปิดหน้าต่าง แล้วพิมพ์รหัสผ่านต่อท้ายคำสั่ง git push' },
        { id: 'c', text: 'ส่งรหัสผ่านให้เพื่อนช่วยล็อกอิน' },
        { id: 'd', text: 'เอารหัสผ่านไปเขียนไว้ในไฟล์ในโฟลเดอร์งาน' },
      ],
      correct: ['a'],
      explainTh: 'Git Credential Manager ออกแบบมาให้ล็อกอินที่หน้าต่างนั้น แล้วจำให้ ไม่ต้องจับรหัสเอง รหัสที่พิมพ์ในคำสั่งหรือเขียนในไฟล์เสี่ยงรั่ว',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'เพื่อนมีบัญชี GitHub แต่ push เข้า repository ส่วนตัวของเราไม่ได้ สาเหตุที่เป็นไปได้มากที่สุดคืออะไร',
      choices: [
        { id: 'a', text: 'ยังไม่ได้เชิญเพื่อนเป็น collaborator หรือเพื่อนยังไม่ได้กดรับคำเชิญ' },
        { id: 'b', text: 'เพื่อนใช้ Git Bash แต่เราใช้ GitHub Desktop' },
        { id: 'c', text: 'ชื่อสายของเพื่อนยาวเกินไป' },
        { id: 'd', text: 'GitHub ห้ามสองคนใช้ repository เดียวกัน' },
      ],
      correct: ['a'],
      explainTh: 'repository ส่วนตัวเปิดให้เฉพาะเจ้าของกับคนที่ถูกเชิญ เชิญแล้วเพื่อนต้องกดรับก่อนด้วย ส่วนโปรแกรมที่ใช้ไม่ต่างกัน เพราะทั้งสองฝั่งคุยกับ GitHub เหมือนกัน',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'ใส่ -u ใน git push -u origin main มีประโยชน์อะไร',
      choices: [
        { id: 'a', text: 'บังคับส่งทับของเก่าบน GitHub' },
        { id: 'b', text: 'ให้ Git จำว่าสาย main คู่กับ origin ครั้งหน้าพิมพ์แค่ git push ก็พอ' },
        { id: 'c', text: 'ข้ามขั้นตอนล็อกอิน' },
        { id: 'd', text: 'ส่งไฟล์ที่ไม่ได้ commit ไปด้วย' },
      ],
      correct: ['b'],
      explainTh: '-u ตั้งปลายทางเริ่มต้นให้สายนั้น ไม่ได้บังคับส่งทับ ไม่ได้ข้ามการล็อกอิน และไม่ได้ส่งไฟล์ที่ยังไม่ commit',
    },
  ],
}
