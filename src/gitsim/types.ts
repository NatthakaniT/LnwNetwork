export interface Commit { id: string; message: string; parent: string | null; parent2?: string; files: Record<string, string> } // files = สภาพไฟล์ทั้งหมดตอน commit
export interface Repo { commits: Record<string, Commit>; branches: Record<string, string | null>; head: string } // head = ชื่อ branch
export interface Machine { name: string; files: Record<string, string>; staged: Record<string, string> | null; repo: Repo | null; remote?: 'origin' } // repo null = ยังไม่ได้ init/clone
// files = ไฟล์ที่ยัง conflict ทั้งหมด (file = ตัวแรก); mergeHead/mergeMessage = ใช้สร้าง merge commit ตอนแก้เสร็จ; pre = สภาพก่อน merge ไว้ให้ merge --abort
export interface World { me: Machine; friend: Machine; github: Repo | null; conflict?: { file: string; files: string[]; mergeHead?: string; mergeMessage?: string; pre?: { files: Record<string, string>; staged: Record<string, string> | null } } }
export type GitCommand = 'init' | 'status' | 'add' | 'commit' | 'log' | 'branch' | 'switch' | 'checkout' | 'merge' | 'clone' | 'push' | 'pull'
export interface RunResult { world: World; output: string; explainTh: string; ok: boolean }
