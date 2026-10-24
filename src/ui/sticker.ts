import type { Part } from '../content/types'
import type { Progress } from '../progress/progress'
import { countCompleted } from '../progress/progress'

/** ข้อความบนสติกเกอร์หน้าแผนที่: ยังไม่เริ่ม / ผ่านภาคล่าสุดแล้ว / กำลังสู้ */
export function stickerText(parts: Part[], p: Progress): string {
  if (countCompleted(parts, p) === 0) return 'เริ่มกันเลย 💪'
  // ภาคที่ "จบ" = มีบทที่พร้อมเรียนอย่างน้อยหนึ่งบท และผ่านครบทุกบทที่พร้อม
  const finished = parts.filter((pt) => {
    const ready = pt.lessons.filter((l) => l.status === 'ready')
    return ready.length > 0 && ready.every((l) => p.completed.includes(l.id))
  })
  if (finished.length > 0) {
    const n = Math.max(...finished.map((pt) => pt.part))
    return `เก่งมาก ผ่านภาค ${n} แล้ว 🎉`
  }
  return 'สู้ ๆ ทีละบท 🔥'
}
