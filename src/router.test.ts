import { describe, it, expect } from 'vitest'
import { parseHash } from './router'

describe('parseHash', () => {
  it('ลิงก์เก่า test-out พาไปแผนที่', () => {
    expect(parseHash('#/lesson/p0-l4/test-out')).toEqual({ name: 'map' })
  })
  it('หน้าบทปกติ', () => {
    expect(parseHash('#/lesson/p0-l4')).toEqual({ name: 'lesson', id: 'p0-l4' })
  })
})
