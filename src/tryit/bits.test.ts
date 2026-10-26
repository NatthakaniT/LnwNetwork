import { describe, it, expect } from 'vitest'
import { bitsOf, valueOf, BIT_VALUES } from './bits'

describe('bits', () => {
  it('bitsOf', () => {
    expect(bitsOf(192)).toEqual([1, 1, 0, 0, 0, 0, 0, 0])
    expect(bitsOf(0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    expect(bitsOf(255)).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
    expect(BIT_VALUES[0]).toBe(128)
  })
  it('valueOf round-trips 0..255', () => {
    for (let n = 0; n < 256; n++) expect(valueOf(bitsOf(n))).toBe(n)
  })
})
