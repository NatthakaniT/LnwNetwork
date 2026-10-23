import { describe, it, expect } from 'vitest'
import { parseIPv4, parsePrefix, sameSubnet } from './ip'

describe('parseIPv4', () => {
  it('accepts a normal address', () => {
    expect(parseIPv4('192.168.1.10')).toEqual({ ok: true, value: '192.168.1.10' })
  })
  it('rejects wrong number of parts', () => {
    const r = parseIPv4('192.168.1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasonTh).toContain('ต้องมี 4 ชุด')
  })
  it('rejects out-of-range numbers', () => {
    const r = parseIPv4('300.1.1.1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasonTh).toContain('เลขแต่ละชุดต้องอยู่ระหว่าง 0 ถึง 255')
  })
  it('rejects junk and empty', () => {
    expect(parseIPv4('abc').ok).toBe(false)
    expect(parseIPv4('').ok).toBe(false)
    expect(parseIPv4('1.2.3.x').ok).toBe(false)
  })
  it('rejects leading zeros', () => {
    expect(parseIPv4('192.168.01.1').ok).toBe(false)
    expect(parseIPv4('0.0.0.0').ok).toBe(true)
  })
  it('trims whitespace', () => {
    expect(parseIPv4(' 10.0.0.1 ')).toEqual({ ok: true, value: '10.0.0.1' })
  })
  it('converts Thai digits', () => {
    expect(parseIPv4('๑๙๒.๑๖๘.๑.๑')).toEqual({ ok: true, value: '192.168.1.1' })
  })
})

describe('parsePrefix', () => {
  it('accepts mask, number and slash forms', () => {
    expect(parsePrefix('255.255.255.0')).toEqual({ ok: true, value: 24 })
    expect(parsePrefix('24')).toEqual({ ok: true, value: 24 })
    expect(parsePrefix('/24')).toEqual({ ok: true, value: 24 })
    expect(parsePrefix('0')).toEqual({ ok: true, value: 0 })
    expect(parsePrefix('255.255.255.255')).toEqual({ ok: true, value: 32 })
  })
  it('rejects bad values', () => {
    expect(parsePrefix('33').ok).toBe(false)
    expect(parsePrefix('').ok).toBe(false)
    expect(parsePrefix('abc').ok).toBe(false)
    expect(parsePrefix('255.0.255.0').ok).toBe(false)
  })
})

describe('sameSubnet', () => {
  it('compares network bits', () => {
    expect(sameSubnet('192.168.1.10', '192.168.1.200', 24)).toBe(true)
    expect(sameSubnet('192.168.1.10', '192.168.2.10', 24)).toBe(false)
    expect(sameSubnet('10.1.0.1', '10.2.0.1', 8)).toBe(true)
    expect(sameSubnet('1.1.1.1', '200.2.2.2', 0)).toBe(true)
  })
})
