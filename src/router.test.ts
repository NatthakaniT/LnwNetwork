import { describe, it, expect } from 'vitest'
import { parseHash } from './router'

describe('parseHash', () => {
  it('ลิงก์เก่า test-out พาไปหน้าเลือกวิชา', () => {
    expect(parseHash('#/lesson/p0-l4/test-out')).toEqual({ name: 'picker' })
  })
  it('หน้าบทปกติ', () => {
    expect(parseHash('#/lesson/p0-l4')).toEqual({ name: 'lesson', id: 'p0-l4' })
    expect(parseHash('#/lesson/p0-l1')).toEqual({ name: 'lesson', id: 'p0-l1' })
  })
  it('หน้าแรกคือหน้าเลือกวิชา', () => {
    expect(parseHash('')).toEqual({ name: 'picker' })
    expect(parseHash('#/')).toEqual({ name: 'picker' })
  })
  it('แผนที่และคลังศัพท์ของแต่ละวิชา', () => {
    expect(parseHash('#/c/git')).toEqual({ name: 'map', course: 'git' })
    expect(parseHash('#/c/git/glossary')).toEqual({ name: 'glossary', course: 'git' })
    expect(parseHash('#/c/ccna')).toEqual({ name: 'map', course: 'ccna' })
  })
  it('ลิงก์คลังศัพท์เดิมพาไป CCNA', () => {
    expect(parseHash('#/glossary')).toEqual({ name: 'glossary', course: 'ccna' })
  })
  it('วิชาที่ไม่มีจริงพาไปหน้าเลือกวิชา', () => {
    expect(parseHash('#/c/xyz')).toEqual({ name: 'picker' })
    expect(parseHash('#/c/xyz/glossary')).toEqual({ name: 'picker' })
  })
})
