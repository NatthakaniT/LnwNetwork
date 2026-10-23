import type { Device, Iface, Topology } from '../content/types'
import { sameSubnet } from './ip'

export interface SendResult { ok: boolean; hops: string[]; reasonTh: string }

const fail = (reasonTh: string): SendResult => ({ ok: false, hops: [], reasonTh })

function findIface(d: Device, pred: (i: Iface) => boolean): Iface | undefined {
  return d.ifaces.find(pred)
}

/**
 * Shortest path (BFS over links). Only switches may sit in the middle of a path,
 * so a router or an end device is never crossed. Optionally pin the interface
 * used to leave the start device and to enter the goal device.
 */
function path(t: Topology, from: string, fromIface: string | undefined, to: string, toIface: string | undefined): string[] | null {
  if (from === to) return [from]
  const byId = new Map(t.devices.map(d => [d.id, d]))
  const prev = new Map<string, string>()
  const seen = new Set([from])
  const queue = [from]
  while (queue.length) {
    const cur = queue.shift()!
    for (const l of t.links) {
      let mine, other
      if (l.a.device === cur) { mine = l.a; other = l.b } else if (l.b.device === cur) { mine = l.b; other = l.a } else continue
      if (cur === from && fromIface && mine.iface !== fromIface) continue
      if (seen.has(other.device)) continue
      if (other.device === to) {
        if (toIface && other.iface !== toIface) continue
        prev.set(to, cur)
        const out = [to]
        for (let n = cur; n !== from; n = prev.get(n)!) out.unshift(n)
        out.unshift(from)
        return out
      }
      if (byId.get(other.device)?.kind !== 'switch') continue
      seen.add(other.device)
      prev.set(other.device, cur)
      queue.push(other.device)
    }
  }
  return null
}

export function simulateSend(t: Topology, fromId: string, toIp: string): SendResult {
  const src = t.devices.find(d => d.id === fromId)
  if (!src) return fail('หาเครื่องต้นทางไม่เจอ เลยส่งไม่ได้')
  const srcIf = findIface(src, i => !!i.ip && i.prefix !== undefined)
  if (!srcIf || !srcIf.ip || srcIf.prefix === undefined) {
    return fail(src.label + ' ยังไม่มี IP เลยไม่รู้ว่าตัวเองอยู่วงไหน ส่งอะไรไม่ได้ ลองตั้ง IP ให้ก่อน')
  }

  const counts = new Map<string, number>()
  for (const d of t.devices) for (const i of d.ifaces) if (i.ip) counts.set(i.ip, (counts.get(i.ip) ?? 0) + 1)
  for (const [ip, n] of counts) {
    if (n > 1) return fail('IP ซ้ำ! มี ' + n + ' เครื่องใช้ ' + ip + ' พร้อมกัน เครือข่ายเลยไม่รู้ว่าต้องส่งให้เครื่องไหน ให้เปลี่ยน IP ของเครื่องใดเครื่องหนึ่ง')
  }

  const dst = t.devices.find(d => d.ifaces.some(i => i.ip === toIp))
  const dstIf = dst && findIface(dst, i => i.ip === toIp)
  if (!dst || !dstIf || dstIf.prefix === undefined) {
    return fail('ไม่มีเครื่องไหนใช้ IP นี้ (' + toIp + ') ในเครือข่าย เลยไม่มีใครรับของ ลองเช็กว่าพิมพ์ IP ถูกไหม')
  }

  if (sameSubnet(srcIf.ip, toIp, srcIf.prefix)) {
    const p = path(t, src.id, srcIf.name, dst.id, dstIf.name)
    if (!p) {
      return fail('อยู่วงเดียวกัน แต่ไม่มีสายต่อถึงกัน (หรือต้องข้าม Router) ข้อมูลเลยไปไม่ถึง ลองเช็กสายระหว่าง ' + src.label + ' กับ ' + dst.label)
    }
    return { ok: true, hops: p, reasonTh: 'ส่งถึงแล้ว! ' + src.label + ' กับ ' + dst.label + ' อยู่วงเดียวกันและมีสายต่อถึงกัน' }
  }

  const gw = src.gateway
  if (!gw) {
    return fail(dst.label + ' อยู่คนละวงกับ ' + src.label + ' ต้องผ่าน Router แต่ยังไม่ได้ตั้ง Gateway เลยไม่รู้ว่าจะฝากของไว้ที่ไหน')
  }
  if (!sameSubnet(srcIf.ip, gw, srcIf.prefix)) {
    return fail('Gateway ' + gw + ' อยู่คนละวงกับ ' + src.label + ' เลยเอื้อมไม่ถึง Gateway ต้องเป็น IP ของ Router ที่อยู่วงเดียวกับเครื่องนี้')
  }
  const router = t.devices.find(d => d.kind === 'router' && d.ifaces.some(i => i.ip === gw))
  const gwIf = router && findIface(router, i => i.ip === gw)
  if (!router || !gwIf) {
    return fail('Gateway ' + gw + ' ไม่ใช่ IP ของ Router ตัวไหนเลย เลยไม่มีใครรับของไปส่งต่อ ลองเช็ก Gateway อีกที')
  }
  const toRouter = path(t, src.id, srcIf.name, router.id, gwIf.name)
  if (!toRouter) {
    return fail('ไม่มีสายต่อจาก ' + src.label + ' ไปถึง Gateway ' + gw + ' เลยส่งของให้ Router ไม่ได้ ลองเช็กสาย (Gateway ต้องต่อถึงได้)')
  }
  const outIf = findIface(router, i => !!i.ip && i.prefix !== undefined && sameSubnet(i.ip, toIp, i.prefix))
  if (!outIf) {
    return fail(router.label + ' ไม่มีทางไปวงของ ' + toIp + ' เพราะไม่ได้ต่ออยู่กับวงนั้นเลย ต้องต่อสายหรือตั้ง IP ที่ขาของ Router ให้ตรงวงปลายทาง')
  }
  const fromRouter = path(t, router.id, outIf.name, dst.id, dstIf.name)
  if (!fromRouter) {
    return fail(router.label + ' มีช่องสำหรับวงของ ' + toIp + ' แล้ว แต่ช่องนั้นยังไม่มีสายต่อไปถึง ' + dst.label + ' ของเลยไปต่อไม่ได้ ลองต่อสายจากช่องนั้นไปทาง ' + dst.label)
  }
  return {
    ok: true,
    hops: [...toRouter, ...fromRouter.slice(1)],
    reasonTh: 'ส่งถึงแล้ว! อยู่คนละวง เลยฝากให้ ' + router.label + ' ช่วยส่งต่อผ่าน Gateway',
  }
}
