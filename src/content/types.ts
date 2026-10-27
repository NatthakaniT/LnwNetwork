export type LessonId = string // 'p0-l1' … 'p6-l4'
export type LessonStatus = 'ready' | 'building'

// noteTh = คำแนะนำสั้น ๆ ก่อนดูคลิป (โชว์เหนือคลิป)
export interface VideoRef { youtubeId: string; titleTh: string; channel: string; startSec?: number; noteTh?: string }

export type ActorKind = 'house' | 'pc' | 'laptop' | 'switch' | 'router' | 'server' | 'cloud'
  | 'envelope' | 'box' | 'truck' | 'person' | 'label' | 'cable' | 'card' | 'table'
/** สีบอกชนิดการส่ง: bcast = ถามทุกเครื่อง (ส้ม), reply = ตอบเครื่องเดียว (ฟ้า), deliver = ส่งของจริง (สีภาค) */
export type Tone = 'bcast' | 'reply' | 'deliver'
// label ขึ้นบรรทัดใหม่ด้วย \n (บรรทัดที่สองตัวเล็กและจาง) / labelSide 'right' = ป้ายอยู่ข้างไอคอน ใช้กับเครื่องที่เรียงแนวตั้ง
// card: lines = ข้อความหน้าซอง (บรรทัดแรกตัวหนา), tone / table: titleTh, columns, rows
export interface Actor {
  id: string; kind: ActorKind; x: number; y: number; label?: string; hidden?: boolean; to?: string /* cable: target actor id */
  labelSide?: 'right'
  lines?: string[]; tone?: Tone
  titleTh?: string; columns?: [string, string]; rows?: [string, string][]
}
export type SceneAction =
  | { type: 'show' | 'hide' | 'highlight' | 'unhighlight'; actor: string }
  | { type: 'move'; actor: string; x: number; y: number; ms: number }
  // path = actor ids; offset ใช้กับทุกจุดในเส้นทาง เพื่อให้ซองจอดข้างอุปกรณ์
  | { type: 'moveAlong'; actor: string; path: string[]; msPerHop: number; offset?: { dx: number; dy: number } }
  | { type: 'setLabel'; actor: string; label: string }
  | { type: 'trail'; path: string[]; tone: Tone } // เส้นทางค้างบนสาย
  | { type: 'ripple'; actor: string; tone: Tone } // วงกระจายตอน broadcast (มีแค่ตอนเล่น)
  | { type: 'say'; actor: string; text: string; mood: 'yes' | 'no' }
  | { type: 'dim' | 'glow'; actor: string }
  | { type: 'setRows'; actor: string; rows: [string, string][] }
// v2: chipTh = ชื่อฉากสั้น ๆ บนปุ่มเลือกฉาก, lifeTh/lifeIcon = แถบ "ในชีวิตจริง", setup = ของที่ฉากนี้ใช้ (เวทีเริ่มใหม่ทุกฉาก)
export interface Scene { id: string; narrationTh: string; actions: SceneAction[]; chipTh?: string; lifeTh?: string; lifeIcon?: string; setup?: SceneAction[] }
export interface SceneSet { stage: { width: number; height: number }; actors: Actor[]; scenes: Scene[]; style?: 'v2' }

export interface QuizChoice { id: string; text: string; textTh?: string }
export interface QuizQuestion {
  id: string
  layer: 'th' | 'en'
  prompt: string // th: ภาษาไทย / en: ภาษาอังกฤษแบบข้อสอบ
  promptTh?: string // en เท่านั้น: คำแปลไทย
  keywords?: string[] // en เท่านั้น: คำที่ต้องไฮไลต์ เช่น 'NOT', 'two'
  choices: QuizChoice[]
  correct: string[] // ≥2 ตัว = เลือกหลายข้อ
  explainTh: string // อธิบายว่าทำไมคำตอบนี้ถูก (ภาษาง่าย)
}

// ห้องทดลอง — ประกาศที่นี่ทั้งหมด Task 7-8 import ไปใช้
export type DeviceKind = 'pc' | 'laptop' | 'switch' | 'router' | 'server'
export interface Iface { name: string; ip?: string; prefix?: number; mac: string }
export interface Device { id: string; kind: DeviceKind; label: string; ifaces: Iface[]; gateway?: string; x: number; y: number }
export interface Link { a: { device: string; iface: string }; b: { device: string; iface: string } }
export interface Topology { devices: Device[]; links: Link[] }
// taskTh = งานของเป้าหมายนี้ (โชว์ตลอด) / hintTh = ตัวช่วย (โชว์เมื่อกดขอ)
export type LabGoal =
  | { type: 'deliver'; from: string; toIp: string; taskTh: string; hintTh: string }
  | { type: 'fail'; from: string; toIp: string; reasonIncludes: string; taskTh: string; hintTh: string } // ทำให้พังแล้วดูว่าพังเพราะอะไร
  | { type: 'fix'; from: string; toIp: string; taskTh: string; hintTh: string } // เริ่มพัง ต้องซ่อม
export interface NetworkLab { kind: 'network'; introTh: string; start: Topology; palette: DeviceKind[]; goals: LabGoal[] }
export interface ActivityLab { kind: 'order' | 'match'; introTh: string; items: { id: string; textTh: string }[]; answer: string[] | Record<string, string>; explainTh: string; rightTh?: string } // explainTh = ตอบผิดแล้วโค้ช, rightTh = ตอบถูกแล้วสรุปสั้น ๆ
export type Lab = NetworkLab | ActivityLab

// requires = บทนี้ใช้อะไรจากบทก่อน (useTh) / precheck = เช็กพื้นฐานก่อนเรียน ชั้นไทยเท่านั้น / goals = เลข 0–255 ที่ต้องทำให้ได้ตามลำดับ
export interface Requirement { lesson: LessonId; useTh: string }
export interface PrecheckQuestion extends QuizQuestion { layer: 'th'; reviewLesson: LessonId }
export interface DeepDive { titleTh: string; bodyTh: string }
export type TryIt = { kind: 'bits8'; introTh: string; goals: number[] }

export interface Lesson {
  id: LessonId; part: number; order: number; status: LessonStatus
  titleTh: string; analogyTh: string; ciscoModules: string[]
  videos: VideoRef[] // ตัวแรก = คลิปหลัก
  scenes?: SceneSet; lab?: Lab; quiz?: QuizQuestion[]; terms?: string[]
  requires?: Requirement[]; precheck?: PrecheckQuestion[]; tryIt?: TryIt; deepDives?: DeepDive[]
}
export interface Part { part: number; titleTh: string; examDomain: string; lessons: Lesson[] }
export interface GlossaryTerm { id: string; en: string; th: string; explainTh: string }

export type CourseId = 'ccna' | 'git'
// requireEnglishQuiz: ต้องมีคำถามชั้น en ทุกบท (CCNA ใช่ เพราะข้อสอบจริงเป็นภาษาอังกฤษ)
export interface Course {
  id: CourseId; titleTh: string; taglineTh: string; parts: Part[]; glossary: GlossaryTerm[]; storageKey: string
  requireEnglishQuiz: boolean
}
