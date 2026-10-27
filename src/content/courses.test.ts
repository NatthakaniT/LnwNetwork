import { describe, it, expect } from 'vitest'
import { courses, courseOf, courseById, checkUniqueLessonIds } from './courses'
import { validateCourse } from './index'
import type { Course } from './types'

const count = (c: Course) => c.parts.flatMap((p) => p.lessons).length

describe('courses', () => {
  it('มี CCNA แล้วตามด้วย Git', () => {
    expect(courses.map((c) => c.id)).toEqual(['ccna', 'git'])
    expect(courseById('git')?.titleTh).toBe('Git & GitHub')
    expect(courseById('git')?.taglineTh).toBe('ทำงานเป็นทีมกับเพื่อน')
    expect(courseById('ccna')?.storageKey).toBe('lnw-ccna-progress-v1')
    expect(courseById('git')?.storageKey).toBe('lnw-git-progress-v1')
    expect(courseById('ccna')?.requireEnglishQuiz).toBe(true)
    expect(courseById('git')?.requireEnglishQuiz).toBe(false)
    expect(courseById('xyz')).toBeUndefined()
  })
  it('หาวิชาจากรหัสบท', () => {
    expect(courseOf('p0-l1')?.id).toBe('ccna')
    expect(courseOf('g0-l1')?.id).toBe('git')
    expect(courseOf('nope')).toBeUndefined()
  })
  it('รหัสบทไม่ซ้ำข้ามวิชา', () => {
    expect(checkUniqueLessonIds(courses)).toEqual([])
    const dup = [courses[0], { ...courses[1], parts: courses[0].parts }]
    expect(checkUniqueLessonIds(dup).some((e) => e.includes('รหัสบทซ้ำข้ามวิชา'))).toBe(true)
  })
  it('ทุกวิชาผ่าน validateCourse', () => {
    for (const c of courses) {
      // วิชาที่ไม่บังคับชั้นอังกฤษ (git) ตรวจด้วยค่าเริ่มต้นไม่ได้
      if (c.requireEnglishQuiz) expect(validateCourse(c.parts, c.glossary)).toEqual([])
      expect(validateCourse(c.parts, c.glossary, { requireEnglishQuiz: c.requireEnglishQuiz })).toEqual([])
    }
  })
  it('CCNA ยังมี 46 บท วิชา Git มี 10 บท ขึ้นต้นด้วย g', () => {
    expect(count(courses[0])).toBe(46)
    expect(count(courses[1])).toBe(10)
    expect(courses[1].parts.flatMap((p) => p.lessons).every((l) => l.id.startsWith('g'))).toBe(true)
    expect(courses[1].parts.map((p) => p.titleTh)).toEqual(['เริ่มจากศูนย์', 'ทำงานคู่กับเพื่อน', 'ใช้จริง'])
  })
})
