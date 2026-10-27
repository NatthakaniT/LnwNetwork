import type { Actor, Lesson, SceneAction } from '../../types'

// ฉากแบบ v2: ทุกอย่างซ่อนไว้ก่อน แต่ละฉากโชว์ของที่ตัวเองใช้ใน setup (เวทีเริ่มใหม่ทุกฉาก)
const h = (a: Actor): Actor => ({ ...a, hidden: true })
const show = (...ids: string[]): SceneAction[] => ids.map((actor) => ({ type: 'show', actor }))
const glow = (actor: string): SceneAction => ({ type: 'glow', actor })
const cm = (id: string, x: number, y: number, text: string): Actor => h({ id, kind: 'commit', x, y, label: text })
const wide = ['m1', 'm2', 'm3', 'k2', 'k3'] // ภาพกว้างแบบบท branch: เส้น main สามจุด
const top = ['hm', 'hh', 'kMH'] // เครื่องเรา / GitHub พร้อมสาย

const actors: Actor[] = [
  // ภาพกว้าง: main สามจุด สาย login หนึ่งจุด และจุดรวม
  cm('m1', 160, 240, 'หน้าแรก'), cm('m2', 380, 240, 'เพิ่มปุ่ม'), cm('m3', 600, 240, 'แก้สี'),
  h({ id: 'k2', kind: 'cable', x: 380, y: 240, to: 'm1' }),
  h({ id: 'k3', kind: 'cable', x: 600, y: 240, to: 'm2' }),
  cm('b1', 780, 380, 'ฟอร์ม login'),
  h({ id: 'kb', kind: 'cable', x: 780, y: 380, to: 'm3' }),
  cm('m4', 820, 240, 'รวม login'),
  h({ id: 'k4', kind: 'cable', x: 820, y: 240, to: 'm3' }),
  h({ id: 'k4b', kind: 'cable', x: 820, y: 240, to: 'b1' }),

  // ฉาก 1: ปัญหา
  h({ id: 'pA', kind: 'person', x: 260, y: 130, label: 'เรา' }),
  h({ id: 'pB', kind: 'person', x: 760, y: 130, label: 'เพื่อน' }),
  h({ id: 'noReview', kind: 'label', x: 480, y: 505, label: 'ไม่มีใครเห็นก่อนรวม จุดผิดหลุดเข้า main' }),

  // เครื่องเรา / GitHub / เครื่องเพื่อน
  h({ id: 'hm', kind: 'pc', x: 210, y: 100, label: 'เครื่องเรา' }),
  h({ id: 'hh', kind: 'cloud', x: 710, y: 100, label: 'GitHub' }),
  h({ id: 'kMH', kind: 'cable', x: 210, y: 100, to: 'hh' }),

  // ฉาก 2: push สายขึ้นเว็บ (ซ้ายคือเครื่องเรา ขวาคือ GitHub)
  cm('lM', 110, 300, 'main'), cm('lB', 290, 300, 'login'),
  h({ id: 'klB', kind: 'cable', x: 290, y: 300, to: 'lM' }),
  cm('rM', 610, 300, 'main'), cm('rB', 790, 300, 'login'),
  h({ id: 'krB', kind: 'cable', x: 790, y: 300, to: 'rM' }),
  h({ id: 'cPush', kind: 'card', x: 480, y: 450, lines: ['$ git push -u origin login'], tone: 'deliver' }),
  h({ id: 'nPush', kind: 'label', x: 480, y: 515, label: 'ไม่ push = บนเว็บไม่มีสายนี้ให้เลือก' }),

  // ฉาก 3: เปิด Pull Request
  h({ id: 'web', kind: 'cloud', x: 480, y: 90, label: 'GitHub บนเว็บ' }),
  h({ id: 'prForm', kind: 'card', x: 480, y: 290, lines: ['Pull Request ใหม่', 'ชื่อเรื่อง: ทำหน้า login', 'รวมจาก login เข้า main', '[ Create pull request ]'], tone: 'deliver' }),
  h({ id: 'nReq', kind: 'label', x: 480, y: 455, label: 'ยังไม่รวมอะไร แค่ยื่นเรื่องขอ' }),

  // ฉาก 4: เพื่อนตรวจ
  h({ id: 'hf', kind: 'pc', x: 200, y: 170, label: 'เพื่อน' }),
  h({ id: 'diff', kind: 'card', x: 640, y: 240, lines: ['login.html เปลี่ยนไป', '+ ช่องกรอกชื่อ', '+ ช่องกรอกรหัส', '💬 ช่องรหัสควรซ่อนตัวอักษรไหม'], tone: 'deliver' }),
  h({ id: 'nRev', kind: 'label', x: 480, y: 455, label: 'ไม่มี review = ไม่มีใครช่วยจับจุดผิด' }),

  // ฉาก 5: แก้ตามความเห็น (สามจุดต่อฝั่ง)
  cm('xM', 90, 300, 'main'), cm('xB1', 240, 300, 'ฟอร์ม'), cm('xB2', 390, 300, 'ซ่อนรหัส'),
  h({ id: 'kx1', kind: 'cable', x: 240, y: 300, to: 'xM' }),
  h({ id: 'kx2', kind: 'cable', x: 390, y: 300, to: 'xB1' }),
  cm('yM', 560, 300, 'main'), cm('yB1', 710, 300, 'ฟอร์ม'), cm('yB2', 860, 300, 'ซ่อนรหัส'),
  h({ id: 'ky1', kind: 'cable', x: 710, y: 300, to: 'yM' }),
  h({ id: 'ky2', kind: 'cable', x: 860, y: 300, to: 'yB1' }),
  h({ id: 'hm5', kind: 'pc', x: 240, y: 100, label: 'เครื่องเรา' }),
  h({ id: 'hh5', kind: 'cloud', x: 710, y: 100, label: 'GitHub' }),
  h({ id: 'k5', kind: 'cable', x: 240, y: 100, to: 'hh5' }),
  h({ id: 'cFix', kind: 'card', x: 480, y: 450, lines: ['$ git commit -m "ซ่อนรหัส"', '$ git push'], tone: 'deliver' }),
  h({ id: 'upd', kind: 'label', x: 710, y: 232, label: 'Pull Request เดิมอัปเดตเอง' }),
  h({ id: 'nFix', kind: 'label', x: 480, y: 515, label: 'ไม่ push = เพื่อนยังเห็นของเก่า' }),

  // ฉาก 6: กด Merge
  h({ id: 'btnM', kind: 'card', x: 230, y: 400, lines: ['[ Merge pull request ]'], tone: 'deliver' }),
  h({ id: 'nMerge', kind: 'label', x: 480, y: 505, label: 'ไม่มีใครกด = งานรออยู่ในสาย login' }),

  // ฉาก 7: pull กลับ (ซ้ายคือเครื่องเรา ขวาคือ GitHub)
  cm('sM', 130, 300, 'main'), cm('sN', 330, 300, 'รวม login'),
  h({ id: 'ks', kind: 'cable', x: 330, y: 300, to: 'sM' }),
  cm('tM', 560, 300, 'main'), cm('tN', 760, 300, 'รวม login'),
  h({ id: 'kt', kind: 'cable', x: 760, y: 300, to: 'tM' }),
  h({ id: 'cPull', kind: 'card', x: 480, y: 450, lines: ['$ git switch main', '$ git pull'], tone: 'deliver' }),
  h({ id: 'nPull', kind: 'label', x: 480, y: 515, label: 'ไม่ pull = main ในเครื่องยังเป็นของเก่า' }),

  // ฉากสรุป
  h({ id: 'sum1', kind: 'label', x: 480, y: 80, label: 'Pull Request = ขอให้เพื่อนตรวจก่อนรวม' }),
  h({ id: 'sum2', kind: 'label', x: 480, y: 180, label: 'ต้อง push สายขึ้น GitHub ก่อน' }),
  h({ id: 'sum3', kind: 'label', x: 480, y: 280, label: 'review = เพื่อนดูและเขียนความเห็น' }),
  h({ id: 'sum4', kind: 'label', x: 480, y: 380, label: 'Merge pull request = รวมเข้า main บนเว็บ' }),
  h({ id: 'sum5', kind: 'label', x: 480, y: 480, label: 'จบแล้ว git pull ลงเครื่อง' }),
]

export const lesson: Lesson = {
  id: 'g1-l2',
  part: 1,
  order: 2,
  status: 'ready',
  titleTh: 'Pull Request',
  analogyTh: 'ส่งการบ้านให้เพื่อนอ่านทวนก่อนส่งครู ไม่ใช่ส่งครูเลยแล้วค่อยรู้ว่าผิด',
  ciscoModules: [],
  requires: [
    { lesson: 'g1-l1', useTh: 'งานใหม่ทำในสาย branch ของตัวเอง บทนี้ดูว่าทำเสร็จแล้วจะเอาเข้า main ยังไงให้เพื่อนตรวจก่อน' },
    { lesson: 'g0-l5', useTh: 'ต้อง push ขึ้น GitHub และ pull ลงเครื่อง บทนี้ใช้ทั้งสองคำสั่งกับสายที่แยกออกมา' },
  ],
  precheck: [
    {
      id: 'c1',
      layer: 'th',
      reviewLesson: 'g1-l1',
      prompt: 'ทำไมทีมถึงทำงานใหม่ในสายแยก ไม่แก้บน main ตรง ๆ',
      choices: [
        { id: 'a', text: 'งานที่ยังไม่เสร็จจะได้ไม่ปนกับ main ที่คนอื่นใช้อยู่' },
        { id: 'b', text: 'Git ห้าม commit บน main' },
        { id: 'c', text: 'ทำให้ไฟล์เล็กลง' },
      ],
      correct: ['a'],
      explainTh: 'main ควรใช้ได้เสมอ งานใหม่ทำในสายแยก แล้วค่อยรวมเมื่อเสร็จ บทนี้พูดถึงขั้นตอน "รวมอย่างมีคนตรวจ"',
    },
    {
      id: 'c2',
      layer: 'th',
      reviewLesson: 'g0-l5',
      prompt: 'อยากให้เพื่อนเห็นจุดเซฟที่ commit ไว้ในเครื่องเรา ต้องทำอะไรก่อน',
      choices: [
        { id: 'a', text: 'git push ส่งขึ้น GitHub ให้เพื่อนดึงไปได้' },
        { id: 'b', text: 'git clone อีกรอบ' },
        { id: 'c', text: 'ไม่ต้องทำอะไร เพื่อนเห็นเอง' },
      ],
      correct: ['a'],
      explainTh: 'commit เซฟแค่ในเครื่องเรา ต้อง push ขึ้น GitHub เพื่อนถึงจะเห็นและดึงไปได้ บทนี้ใช้ push เป็นขั้นแรกของการขอให้เพื่อนตรวจ',
    },
  ],
  videos: [
    { youtubeId: 'gZEjfT2TsVM', titleTh: 'สอน Git & GitHub หยุดทำบาปต่อเพื่อนในทีมด้วยการ... Git The Series Part 2/3', channel: 'Superdev Academy',
      noteTh: 'คลิปนี้ยาวสามสิบกว่านาที และครอบคลุมเรื่องอื่นด้วย จากคำอธิบายคลิปมีทั้งการแยกสาย การเปิด Pull Request และการรวมงาน แต่คำอธิบายไม่บอกช่วงเวลา ต้องเลื่อนหาตอนที่เปิด Pull Request บนเว็บ ตอนนี้ไม่มีคลิปไทยสั้นที่สอนเฉพาะเรื่อง Pull Request จึงใช้คลิปนี้แทน ถ้าหาช่วงนั้นไม่เจอ ข้ามได้ บทนี้อธิบายครบแล้ว และหน้าตาเว็บในคลิปอาจต่างจากปัจจุบันเล็กน้อย' },
  ],
  terms: ['pull-request', 'review', 'merge'],
  deepDives: [
    {
      titleTh: 'ปุ่ม Merge บนเว็บมีสามแบบ',
      bodyTh: 'ข้าง ๆ ปุ่ม Merge pull request มีลูกศรให้เลือกวิธีรวมได้สามแบบ แบบแรกคือรวมแล้วสร้างจุดเซฟรวมหนึ่งจุด แบบที่สองชื่อ Squash เอาทุกจุดเซฟในสายมาย่อเป็นจุดเดียว main จะสั้นและอ่านง่าย แบบที่สามชื่อ Rebase ซึ่งเป็นเรื่องขั้นสูง ตอนเริ่มใช้แบบแรกที่เป็นค่าเริ่มต้นก็พอ ชื่อปุ่มบนเว็บ GitHub อาจเปลี่ยนไปบ้างตามเวอร์ชัน เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'ตั้งกฎให้ต้องมีคนตรวจก่อนรวมได้',
      bodyTh: 'เจ้าของ repository ตั้งค่าบน GitHub ได้ว่า ห้าม push ตรงเข้า main และต้องมีคนอนุมัติ Pull Request อย่างน้อยหนึ่งคนก่อนปุ่ม Merge จะกดได้ ทีมจริงมักตั้งแบบนี้เพื่อไม่ให้ใครลืมข้ามขั้นตรวจ ถ้าไม่ตั้ง ทุกคนที่มีสิทธิ์ก็ข้ามได้ เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
    {
      titleTh: 'ตอนเพื่อนไม่ว่าง ใครกด Merge ได้',
      bodyTh: 'ตามปกติคนที่เปิด Pull Request จะไม่กด Merge เอง แต่รอให้เพื่อนที่ตรวจเป็นคนกด ถ้าทำงานกันสองคนแล้วเพื่อนไม่ว่างนาน ตกลงกันก่อนว่าให้กดเองได้ไหม เพราะเป้าหมายคือมีคนอีกคนเห็นงานก่อนเข้า main อย่างน้อยหนึ่งคู่ตา เรื่องนี้ไม่ต้องรู้ก็เรียนต่อได้',
    },
  ],

  scenes: {
    style: 'v2',
    stage: { width: 960, height: 540 },
    actors,
    scenes: [
      {
        id: 's1', chipTh: 'ทำไมต้องขอ', lifeIcon: '🙋',
        lifeTh: 'ส่งการบ้านให้เพื่อนอ่านทวนก่อนส่งครู ไม่ใช่ส่งครูเลยแล้วค่อยรู้ว่าผิด',
        narrationTh: 'งานบนสาย login เสร็จแล้ว ถ้าเรารวมเข้า main เองเลย ไม่มีใครเห็นก่อน จุดผิดจะหลุดเข้า main Pull Request คือการขอให้เพื่อนช่วยดูก่อนรวม',
        setup: show('pA', 'pB', ...wide, 'kb', 'b1'),
        actions: [
          { type: 'say', actor: 'pA', text: 'รวมเข้า main เลยดีไหม', mood: 'yes' },
          { type: 'say', actor: 'pB', text: 'ขอดูก่อนนะ', mood: 'yes' },
          glow('b1'), ...show('noReview'),
        ],
      },
      {
        id: 's2', chipTh: 'ส่งสายขึ้นเว็บ', lifeIcon: '📤',
        lifeTh: 'ก่อนให้เพื่อนอ่านการบ้าน ต้องวางการบ้านไว้บนโต๊ะกลางก่อน เพื่อนถึงจะหยิบมาอ่านได้',
        narrationTh: 'ก่อนเปิด Pull Request ต้องส่งสาย login ขึ้น GitHub ด้วย git push -u origin login ถ้าไม่ push บนเว็บจะไม่มีสายนี้ให้เลือก ส่วน -u จำไว้ว่าสายนี้คู่กับ origin',
        setup: show(...top, 'lM', 'lB', 'klB', 'rM'),
        actions: [
          ...show('cPush'), glow('cPush'),
          { type: 'trail', path: ['hm', 'hh'], tone: 'deliver' },
          ...show('krB', 'rB'), glow('rB'),
          ...show('nPush'),
        ],
      },
      {
        id: 's3', chipTh: 'เปิด Pull Request', lifeIcon: '🌐',
        lifeTh: 'กรอกใบคำร้องบอกว่าขออะไร ยังไม่ได้ทำตามคำขอ แค่ยื่นเรื่องเข้าระบบ',
        narrationTh: 'เข้าเว็บ GitHub จะเห็นปุ่มให้เปิด Pull Request ตั้งชื่อเรื่อง เล่าว่าแก้อะไร แล้วเลือกรวมสาย login เข้า main ยังไม่รวมอะไรเลย แค่ยื่นเรื่องขอ',
        setup: show('web'),
        actions: [...show('prForm'), glow('prForm'), ...show('nReq')],
      },
      {
        id: 's4', chipTh: 'เพื่อนตรวจ review', lifeIcon: '🔍',
        lifeTh: 'เพื่อนอ่านการบ้านของเรา วงกลมตรงที่สงสัย เขียนโน้ตแปะ ก่อนที่เราจะส่งครู',
        narrationTh: 'เพื่อนเปิดดูว่าไฟล์ไหนเปลี่ยนตรงไหน แล้วเขียนความเห็นติดไว้ได้ ขั้นนี้เรียกว่า review ถ้าไม่มี review จุดผิดจะหลุดเข้า main โดยไม่มีใครเห็น',
        setup: show('hf', 'diff'),
        actions: [
          { type: 'say', actor: 'hf', text: 'มีข้อสงสัย', mood: 'no' },
          glow('diff'), ...show('nRev'),
        ],
      },
      {
        id: 's5', chipTh: 'แก้ตามความเห็น', lifeIcon: '🔧',
        lifeTh: 'เพื่อนวงจุดผิดในการบ้าน เรากลับไปแก้ในฉบับเดิม แล้วส่งให้ดูอีกรอบ ไม่ต้องเริ่มทำการบ้านใหม่',
        narrationTh: 'ถ้าเพื่อนขอให้แก้ เรากลับมา commit เพิ่มบนสาย login แล้ว push อีกครั้ง Pull Request เดิมจะอัปเดตเอง ถ้าไม่ push เพื่อนก็ยังเห็นของเก่า',
        setup: show('hm5', 'hh5', 'k5', 'xM', 'kx1', 'xB1', 'yM', 'ky1', 'yB1', 'xB2', 'kx2'),
        actions: [
          ...show('cFix'), glow('cFix'),
          { type: 'trail', path: ['hm5', 'hh5'], tone: 'deliver' },
          ...show('yB2'), glow('yB2'), ...show('upd', 'nFix'),
        ],
      },
      {
        id: 's6', chipTh: 'กด Merge', lifeIcon: '✅',
        lifeTh: 'เพื่อนอ่านแล้วพอใจ ก็เซ็นอนุมัติ การบ้านชิ้นนั้นถึงเข้าเล่มจริง',
        narrationTh: 'พอเพื่อนพอใจ ก็กดปุ่ม Merge pull request บนเว็บ GitHub งานบนสาย login จะถูกรวมเข้า main ถ้าไม่มีใครกด งานของเราก็รออยู่ในสาย login ไม่เข้า main',
        setup: show('hh', ...wide, 'kb', 'b1'),
        actions: [...show('btnM'), glow('btnM'), ...show('k4', 'k4b', 'm4'), glow('m4'), ...show('nMerge')],
      },
      {
        id: 's7', chipTh: 'pull กลับเครื่อง', lifeIcon: '📥',
        lifeTh: 'ฉบับรวมเล่มอยู่ที่โต๊ะกลางแล้ว แต่สมุดที่โต๊ะเรายังเป็นฉบับเก่า ต้องไปถ่ายสำเนามาเอง',
        narrationTh: 'หลังรวมบน GitHub เครื่องเรายังไม่รู้เรื่อง ต้องพิมพ์ git switch main แล้ว git pull ลงมา ถ้าไม่ pull เครื่องเรายังมี main เก่าอยู่',
        setup: show(...top, 'sM', 'tM', 'tN', 'kt'),
        actions: [
          ...show('cPull'), glow('cPull'),
          { type: 'trail', path: ['hh', 'hm'], tone: 'deliver' },
          ...show('ks', 'sN'), glow('sN'), ...show('nPull'),
        ],
      },
      {
        id: 's8', chipTh: 'สรุป', lifeIcon: '📝',
        lifeTh: 'ส่งการบ้านให้เพื่อนอ่านทวนก่อนส่งครู',
        narrationTh: 'สรุป Pull Request คือการขอให้เพื่อนตรวจก่อนรวม push สายขึ้นก่อน เพื่อนทำ review แล้วกด Merge บนเว็บ จากนั้น git pull ลงเครื่องเรา',
        setup: [],
        actions: show('sum1', 'sum2', 'sum3', 'sum4', 'sum5'),
      },
    ],
  },

  lab: {
    kind: 'order',
    introTh: 'Pull Request เกิดบนเว็บ GitHub ซึ่งแอปนี้ไม่ได้จำลอง จึงฝึกด้วยการเรียงขั้นตอนแทน ลองเรียงตั้งแต่เริ่มทำงานจนงานเข้า main และกลับมาที่เครื่องเรา ใช้ปุ่มลูกศรเลื่อนขึ้นลง',
    items: [
      { id: 'o1', textTh: 'ทำงานในสาย login บนเครื่องเรา แล้ว commit' },
      { id: 'o2', textTh: 'ส่งสาย login ขึ้น GitHub ด้วย git push' },
      { id: 'o3', textTh: 'เข้าเว็บ GitHub เปิด Pull Request จากสาย login ไปยัง main' },
      { id: 'o4', textTh: 'เพื่อนเปิดดูและเขียนความเห็นว่าอยากให้แก้ตรงไหน' },
      { id: 'o5', textTh: 'เรากลับมาแก้ในสาย login แล้ว commit กับ push อีกครั้ง' },
      { id: 'o6', textTh: 'เพื่อนพอใจ จึงกดปุ่ม Merge pull request บนเว็บ' },
      { id: 'o7', textTh: 'เรากลับมาที่ main ในเครื่อง แล้วดึงของใหม่ลงมาด้วย git pull' },
    ],
    answer: ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7'],
    explainTh: 'ลำดับมาจากคำถามว่าเพื่อนจะเห็นงานได้เมื่อไร งานต้องออกจากเครื่องเราไปอยู่บนเว็บก่อน ถึงจะมีอะไรให้เปิดขอตรวจ เพื่อนต้องตรวจก่อนถึงจะรวม และเครื่องเราไม่รู้เองว่าบนเว็บมีการรวมแล้ว จึงต้องไปดึงเป็นขั้นสุดท้าย',
    rightTh: 'ใช่เลย งานไหลจากเครื่องเราขึ้นเว็บ ผ่านตาเพื่อน เข้า main บนเว็บ แล้วค่อยกลับลงเครื่องเรา',
  },

  quiz: [
    {
      id: 'q1',
      layer: 'th',
      prompt: 'เราเปิด Pull Request จากสาย login ไปยัง main แล้ว ตอนนี้งานใน login เข้า main แล้วหรือยัง',
      choices: [
        { id: 'a', text: 'เข้าแล้ว เพราะเปิด Pull Request คือการรวม' },
        { id: 'b', text: 'ยัง Pull Request เป็นแค่คำขอให้ตรวจ ต้องมีคนกด Merge pull request ก่อนถึงจะเข้า main' },
        { id: 'c', text: 'เข้าแล้ว แต่ main ในเครื่องเรายังไม่เห็น' },
        { id: 'd', text: 'เข้าครึ่งหนึ่ง' },
      ],
      correct: ['b'],
      explainTh: 'Pull Request คือใบคำร้อง ยังไม่ได้ทำอะไรกับ main จนกว่าจะมีคนกด Merge ก่อนหน้านั้นมีเวลาให้เพื่อนตรวจและให้เราแก้',
    },
    {
      id: 'q2',
      layer: 'th',
      prompt: 'ถ้ายังไม่ได้ push สาย login ขึ้น GitHub แล้วเปิดเว็บไปสร้าง Pull Request จะเกิดอะไร',
      choices: [
        { id: 'a', text: 'ไม่มีสาย login ให้เลือก เพราะบนเว็บยังไม่รู้จักสายนั้น มีแต่ในเครื่องเรา' },
        { id: 'b', text: 'GitHub ดึงงานจากเครื่องเรามาเอง' },
        { id: 'c', text: 'สร้างได้ แต่เป็น Pull Request ว่าง' },
        { id: 'd', text: 'main ถูกลบ' },
      ],
      correct: ['a'],
      explainTh: 'GitHub ไม่ได้เห็นเครื่องเรา มันรู้เฉพาะสิ่งที่เรา push ขึ้นไป สายที่ยังไม่ push จึงไม่มีให้เลือก',
    },
    {
      id: 'q3',
      layer: 'th',
      prompt: 'เพื่อนเขียนความเห็นใน Pull Request ให้แก้ปุ่มหนึ่งจุด เราควรทำอะไร',
      choices: [
        { id: 'a', text: 'ปิด Pull Request แล้วเปิดใหม่ทั้งหมด' },
        { id: 'b', text: 'ลบสาย login แล้วเริ่มสายใหม่' },
        { id: 'c', text: 'แก้ในสาย login เดิม commit แล้ว push อีกครั้ง Pull Request เดิมจะอัปเดตเอง' },
        { id: 'd', text: 'แก้บน main โดยตรง' },
      ],
      correct: ['c'],
      explainTh: 'Pull Request ผูกกับสาย พอ push จุดเซฟใหม่ขึ้นสายเดิม หน้า Pull Request ก็เห็นของใหม่ทันที ไม่ต้องเปิดใหม่',
    },
    {
      id: 'q4',
      layer: 'th',
      prompt: 'เพื่อนกด Merge pull request บนเว็บเสร็จแล้ว เปิด Git Bash ในเครื่องเรา main ที่นั่นมีงานที่เพิ่งรวมไหม',
      choices: [
        { id: 'a', text: 'มี เพราะ GitHub ส่งมาให้เอง' },
        { id: 'b', text: 'ยังไม่มี การรวมเกิดบน GitHub ต้อง git switch main แล้ว git pull ลงมา' },
        { id: 'c', text: 'ไม่มีและไม่มีทางมี' },
        { id: 'd', text: 'มี แต่ต้อง git add ก่อนถึงจะเห็น' },
      ],
      correct: ['b'],
      explainTh: 'แต่ละที่จดประวัติของตัวเอง การรวมเกิดบน GitHub เครื่องเราจึงต้องไปดึงมาเอง เหมือนบทก่อนที่เพื่อน push แล้วเราต้อง pull',
    },
  ],
}
