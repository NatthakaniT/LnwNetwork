export interface Commit { id: string; message: string; parent: string | null; parent2?: string; files: Record<string, string> } // files = สภาพไฟล์ทั้งหมดตอน commit
export interface Repo { commits: Record<string, Commit>; branches: Record<string, string | null>; head: string } // head = ชื่อ branch
export interface Machine { name: string; files: Record<string, string>; staged: Record<string, string> | null; repo: Repo | null; remote?: 'origin' } // repo null = ยังไม่ได้ init/clone
// mergeHead/mergeMessage: เก็บไว้ให้ commit ตอนแก้ conflict เสร็จสร้าง merge commit สองพ่อแม่ได้
export interface World { me: Machine; friend: Machine; github: Repo | null; conflict?: { file: string; mergeHead?: string; mergeMessage?: string } }
export type GitCommand = 'init' | 'status' | 'add' | 'commit' | 'log' | 'branch' | 'switch' | 'checkout' | 'merge' | 'clone' | 'push' | 'pull'
export interface RunResult { world: World; output: string; explainTh: string; ok: boolean }
