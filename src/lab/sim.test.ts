import { describe, it, expect } from 'vitest'
import { simulateSend } from './sim'
import type { Device, Link, Topology } from '../content/types'

const end = (id: string, ip?: string, gateway?: string): Device => ({
  id, kind: 'pc', label: id, x: 0, y: 0, gateway,
  ifaces: [{ name: 'eth0', ip, prefix: ip ? 24 : undefined, mac: `mac-${id}` }],
})
const sw = (id: string, n = 4): Device => ({
  id, kind: 'switch', label: id, x: 0, y: 0,
  ifaces: Array.from({ length: n }, (_, i) => ({ name: `f${i}`, mac: `mac-${id}-${i}` })),
})
const router = (id: string, ips: string[]): Device => ({
  id, kind: 'router', label: id, x: 0, y: 0,
  ifaces: ips.map((ip, i) => ({ name: `g${i}`, ip, prefix: 24, mac: `mac-${id}-${i}` })),
})
const link = (a: string, ai: string, b: string, bi: string): Link => ({ a: { device: a, iface: ai }, b: { device: b, iface: bi } })

const lan = (): Topology => ({
  devices: [end('pc1', '192.168.1.10'), sw('sw1'), end('pc2', '192.168.1.20')],
  links: [link('pc1', 'eth0', 'sw1', 'f0'), link('pc2', 'eth0', 'sw1', 'f1')],
})

const routed = (gw = '192.168.1.1'): Topology => ({
  devices: [
    end('pc1', '192.168.1.10', gw), sw('sw1'), router('r1', ['192.168.1.1', '192.168.2.1']),
    sw('sw2'), end('pc3', '192.168.2.10', '192.168.2.1'),
  ],
  links: [
    link('pc1', 'eth0', 'sw1', 'f0'), link('sw1', 'f1', 'r1', 'g0'),
    link('r1', 'g1', 'sw2', 'f0'), link('sw2', 'f1', 'pc3', 'eth0'),
  ],
})

describe('simulateSend', () => {
  it('delivers within a LAN through a switch', () => {
    const r = simulateSend(lan(), 'pc1', '192.168.1.20')
    expect(r.ok).toBe(true)
    expect(r.hops).toEqual(['pc1', 'sw1', 'pc2'])
  })
  it('fails when destination has no cable', () => {
    const t = lan()
    t.links = t.links.filter(l => l.a.device !== 'pc2' && l.b.device !== 'pc2')
    const r = simulateSend(t, 'pc1', '192.168.1.20')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('ไม่มีสาย')
  })
  it('fails on duplicate IP', () => {
    const t = lan()
    t.devices[2] = end('pc2', '192.168.1.10')
    const r = simulateSend(t, 'pc1', '192.168.1.10')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('IP ซ้ำ')
  })
  it('fails across subnets without gateway', () => {
    const r = simulateSend(routed(''), 'pc1', '192.168.2.10')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('Gateway')
  })
  it('fails with a gateway outside own subnet', () => {
    const r = simulateSend(routed('10.9.9.9'), 'pc1', '192.168.2.10')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('Gateway')
  })
  it('delivers across a router', () => {
    const r = simulateSend(routed(), 'pc1', '192.168.2.10')
    expect(r.ok).toBe(true)
    expect(r.hops).toEqual(['pc1', 'sw1', 'r1', 'sw2', 'pc3'])
  })
  it('fails when destination IP does not exist', () => {
    const r = simulateSend(lan(), 'pc1', '192.168.1.99')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('ไม่มีเครื่องไหนใช้ IP นี้')
  })
  it('fails when source has no IP', () => {
    const t = lan()
    t.devices[0] = end('pc1')
    const r = simulateSend(t, 'pc1', '192.168.1.20')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('ยังไม่มี IP')
  })
  it('fails when router has no way to the destination network', () => {
    const t = routed()
    t.devices[2] = router('r1', ['192.168.1.1', '192.168.3.1'])
    const r = simulateSend(t, 'pc1', '192.168.2.10')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('Router')
  })
  it('does not pass through a router in the same-subnet case', () => {
    const t: Topology = {
      devices: [end('pc1', '192.168.1.10'), router('r1', ['192.168.1.1', '192.168.1.2']), end('pc2', '192.168.1.20')],
      links: [link('pc1', 'eth0', 'r1', 'g0'), link('r1', 'g1', 'pc2', 'eth0')],
    }
    const r = simulateSend(t, 'pc1', '192.168.1.20')
    expect(r.ok).toBe(false)
    expect(r.reasonTh).toContain('ไม่มีสาย')
  })
})
