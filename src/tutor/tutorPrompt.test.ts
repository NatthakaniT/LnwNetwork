import { describe, expect, it } from 'vitest'
import { tutorPrompt } from './tutorPrompt'

describe('tutorPrompt', () => {
  it('ไม่มีข้อผิด', () => {
    expect(tutorPrompt({ lessonTitle: 'บิต', stepLabel: 'ดูคลิป' })).toBe('ผมเรียนถึงบท "บิต" ขั้น "ดูคลิป" อยากถามว่า ')
  })
  it('มีข้อผิด', () => {
    expect(tutorPrompt({ lessonTitle: 'บิต', stepLabel: 'ตอบคำถาม', wrongPrompt: 'หนึ่งไบต์กี่บิต' })).toBe(
      'ผมเรียนถึงบท "บิต" ขั้น "ตอบคำถาม" ตอบข้อ "หนึ่งไบต์กี่บิต" ผิด อยากถามว่า ',
    )
  })
})
