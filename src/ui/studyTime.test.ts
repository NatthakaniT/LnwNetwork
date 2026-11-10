import { describe, it, expect } from 'vitest'
import { lessonMinutes, studyTime } from './studyTime'
import { mk } from '../pages/fixture'

// บทจาก mk: ฉาก 1 ฉาก (8 ตัวอักษร), quiz 2 ข้อ, มี lab = 0.64 + 120 + 240 วินาที
const withVideo = (id: string, durationSec: number, extra = {}) =>
  mk(id, 0, 1, { videos: [{ youtubeId: 'x', titleTh: 'x', channel: 'x', durationSec }], ...extra })

describe('studyTime', () => {
  it('เวลาของบท = คลิปหลัก (หักช่วงที่ข้าม) + เสียงบรรยาย + เวลาลงมือทำ', () => {
    expect(lessonMinutes(withVideo('a', 600))).toBeCloseTo((600 + 0.64 + 120 + 240) / 60)
    const skip = mk('b', 0, 1, { videos: [{ youtubeId: 'x', titleTh: 'x', channel: 'x', durationSec: 600, startSec: 300 }] })
    expect(lessonMinutes(skip)).toBeCloseTo((300 + 0.64 + 120 + 240) / 60)
    const bare = mk('c', 0, 1, { videos: [], scenes: undefined, lab: undefined, quiz: undefined })
    expect(lessonMinutes(bare)).toBe(0)
  })
  it('รวมเฉพาะบทที่เรียนได้จริง บอกเป็นนาที (ปัดทีละ 5) หรือชั่วโมง (ปัดทีละครึ่ง)', () => {
    expect(studyTime([withVideo('a', 600)])).toBe('ประมาณ 15 นาที') // 16 นาที
    expect(studyTime([withVideo('a', 600), withVideo('b', 9999, { status: 'building' })])).toBe('ประมาณ 15 นาที')
    expect(studyTime([withVideo('a', 3600)])).toBe('ประมาณ 65 นาที') // 66 นาที
    expect(studyTime([withVideo('a', 3600), withVideo('b', 3600)])).toBe('ประมาณ 2 ชั่วโมง') // 132 นาที
    expect(studyTime([withVideo('a', 3600), withVideo('b', 5000)])).toBe('ประมาณ 2 ชั่วโมงครึ่ง') // 155 นาที
    expect(studyTime([])).toBe('ประมาณ 5 นาที')
  })
})
