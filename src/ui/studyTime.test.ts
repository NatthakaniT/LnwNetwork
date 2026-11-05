import { describe, it, expect } from 'vitest'
import { studyTime } from './studyTime'

describe('studyTime', () => {
  it('บทน้อยบอกเป็นนาที บทเยอะบอกเป็นชั่วโมง', () => {
    expect(studyTime(1)).toBe('10–15 นาที')
    expect(studyTime(6)).toBe('60–90 นาที')
    expect(studyTime(9)).toBe('2 ชั่วโมง')
    expect(studyTime(10)).toBe('2–3 ชั่วโมง')
    expect(studyTime(46)).toBe('8–12 ชั่วโมง')
  })
})
