import { describe, it, expect } from 'vitest'
import { checkGoal } from './goals'
import { simulateSend } from './sim'
import type { Topology } from '../content/types'

const topo = (ip2 = '192.168.1.20'): Topology => ({
  devices: [
    { id: 'pc1', kind: 'pc', label: 'คอม 1', x: 0, y: 0, ifaces: [{ name: 'eth0', ip: '192.168.1.10', prefix: 24, mac: 'a' }] },
    { id: 'sw1', kind: 'switch', label: 'Switch', x: 0, y: 0, ifaces: [{ name: 'p1', mac: 'b' }, { name: 'p2', mac: 'c' }] },
    { id: 'pc2', kind: 'pc', label: 'คอม 2', x: 0, y: 0, ifaces: [{ name: 'eth0', ip: ip2, prefix: 24, mac: 'd' }] },
  ],
  links: [
    { a: { device: 'pc1', iface: 'eth0' }, b: { device: 'sw1', iface: 'p1' } },
    { a: { device: 'pc2', iface: 'eth0' }, b: { device: 'sw1', iface: 'p2' } },
  ],
})

describe('checkGoal', () => {
  const good = topo()
  const goodSend = simulateSend(good, 'pc1', '192.168.1.20')

  it('is false without a send', () => {
    expect(checkGoal({ type: 'deliver', from: 'pc1', toIp: '192.168.1.20', hintTh: '' }, good)).toBe(false)
  })
  it('deliver and fix need success', () => {
    expect(checkGoal({ type: 'deliver', from: 'pc1', toIp: '192.168.1.20', hintTh: '' }, good, goodSend)).toBe(true)
    expect(checkGoal({ type: 'fix', from: 'pc1', toIp: '192.168.1.20', hintTh: '' }, good, goodSend)).toBe(true)
    const bad = topo('192.168.5.20')
    const badSend = simulateSend(bad, 'pc1', '192.168.5.20')
    expect(checkGoal({ type: 'fix', from: 'pc1', toIp: '192.168.5.20', hintTh: '' }, bad, badSend)).toBe(false)
  })
  it('fail needs a failure containing the reason', () => {
    const dup = topo('192.168.1.10')
    const s = simulateSend(dup, 'pc1', '192.168.1.10')
    expect(checkGoal({ type: 'fail', from: 'pc1', toIp: '192.168.1.10', reasonIncludes: 'IP ซ้ำ', hintTh: '' }, dup, s)).toBe(true)
    expect(checkGoal({ type: 'fail', from: 'pc1', toIp: '192.168.1.10', reasonIncludes: 'Gateway', hintTh: '' }, dup, s)).toBe(false)
    expect(checkGoal({ type: 'fail', from: 'pc1', toIp: '192.168.1.20', reasonIncludes: 'IP ซ้ำ', hintTh: '' }, good, goodSend)).toBe(false)
  })
})
