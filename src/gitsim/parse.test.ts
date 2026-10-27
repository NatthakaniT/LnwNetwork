import { describe, expect, it } from 'vitest'
import { tokenize } from './parse'

describe('tokenize', () => {
  it('แยกคำปกติ', () => expect(tokenize('git  add   a.txt')).toEqual(['git', 'add', 'a.txt']))
  it('quote คู่ที่มีภาษาไทยและช่องว่างเป็นคำเดียว', () =>
    expect(tokenize('git commit -m "แก้หน้าแรก ใหม่"')).toEqual(['git', 'commit', '-m', 'แก้หน้าแรก ใหม่']))
  it('quote เดี่ยว', () => expect(tokenize("git commit -m 'a b'")).toEqual(['git', 'commit', '-m', 'a b']))
  it('quote ว่างยังนับเป็นคำ', () => expect(tokenize('git commit -m ""')).toEqual(['git', 'commit', '-m', '']))
  it('บรรทัดว่าง', () => expect(tokenize('   ')).toEqual([]))
})
