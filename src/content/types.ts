export type LessonId = string // 'p0-l1' … 'p6-l4'
export type LessonStatus = 'ready' | 'building'

// noteTh = คำแนะนำสั้น ๆ ก่อนดูคลิป (โชว์เหนือคลิป)
export interface VideoRef { youtubeId: string; titleTh: string; channel: string; startSec?: number; noteTh?: string }

export type ActorKind = 'house' | 'pc' | 'laptop' | 'switch' | 'router' | 'server' | 'cloud'
  | 'envelope' | 'box' | 'truck' | 'person' | 'label' | 'cable'
export interface Actor { id: string; kind: ActorKind; x: number; y: number; label?: string; hidden?: boolean; to?: string /* cable: target actor id */ }
export type SceneAction =
  | { type: 'show' | 'hide' | 'highlight' | 'unhighlight'; actor: string }
  | { type: 'move'; actor: string; x: number; y: number; ms: number }
  | { type: 'moveAlong'; actor: string; path: string[]; msPerHop: number } // path = actor ids
  | { type: 'setLabel'; actor: string; label: string }
export interface Scene { id: string; narrationTh: string; actions: SceneAction[] }
export interface SceneSet { stage: { width: number; height: number }; actors: Actor[]; scenes: Scene[] }

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

export interface Lesson {
  id: LessonId; part: number; order: number; status: LessonStatus
  titleTh: string; analogyTh: string; ciscoModules: string[]
  videos: VideoRef[] // ตัวแรก = คลิปหลัก
  scenes?: SceneSet; lab?: Lab; quiz?: QuizQuestion[]; terms?: string[]
}
export interface Part { part: number; titleTh: string; examDomain: string; lessons: Lesson[] }
export interface GlossaryTerm { id: string; en: string; th: string; explainTh: string }
