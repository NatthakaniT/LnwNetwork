import type { Course, LessonId } from './types'
import { parts } from './parts'
import { glossary } from './glossary'
import { gitParts } from './git/parts'
import { gitGlossary } from './git/glossary'

export const courses: Course[] = [
  { id: 'ccna', titleTh: 'CCNA', taglineTh: 'แบบเข้าใจจริง', parts, glossary, storageKey: 'lnw-ccna-progress-v1', requireEnglishQuiz: true },
  { id: 'git', titleTh: 'Git & GitHub', taglineTh: 'ทำงานเป็นทีมกับเพื่อน', parts: gitParts, glossary: gitGlossary, storageKey: 'lnw-git-progress-v1', requireEnglishQuiz: false },
]
export const ccna = courses[0]

export const courseById = (id: string): Course | undefined => courses.find((c) => c.id === id)

export const courseOf = (lessonId: LessonId): Course | undefined =>
  courses.find((c) => c.parts.some((p) => p.lessons.some((l) => l.id === lessonId)))

/** รหัสบทต้องไม่ซ้ำข้ามวิชา เพราะไฟล์เสียงอยู่ที่ public/audio/<lessonId>/ */
export function checkUniqueLessonIds(list: Course[]): string[] {
  const owner = new Map<LessonId, string>()
  const errs: string[] = []
  for (const c of list) {
    for (const l of c.parts.flatMap((p) => p.lessons)) {
      const o = owner.get(l.id)
      if (o && o !== c.id) errs.push(`บท ${l.id}: รหัสบทซ้ำข้ามวิชา (${o} กับ ${c.id})`)
      owner.set(l.id, c.id)
    }
  }
  return errs
}
