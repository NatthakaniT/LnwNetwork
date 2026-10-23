import { useEffect, useRef, useState } from 'react'
import type { Device, DeviceKind, Link, NetworkLab, Topology } from '../content/types'
import { ActorView } from '../scenes/actors'
import { checkGoal } from './goals'
import { parseIPv4, parsePrefix } from './ip'
import { simulateSend, type SendResult } from './sim'

const STAGE_W = 800
const STAGE_H = 480
const HOP_MS = 500

const KIND_TH: Record<DeviceKind, string> = {
  pc: 'คอม', laptop: 'โน้ตบุ๊ก', switch: 'Switch', router: 'Router', server: 'เซิร์ฟเวอร์',
}

const isEnd = (k: DeviceKind) => k !== 'switch' && k !== 'router'
const linkKey = (l: Link) => `${l.a.device}-${l.b.device}`

function hex2(n: number) {
  return (n % 256).toString(16).padStart(2, '0')
}
function mac(devNo: number, ifNo: number) {
  return `02:00:00:00:${hex2(devNo)}:${hex2(ifNo)}`
}

function freeSpot(t: Topology): { x: number; y: number } {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      const x = 80 + col * 90
      const y = 400 - row * 80
      if (!t.devices.some(d => Math.hypot(d.x - x, d.y - y) < 70)) return { x, y }
    }
  }
  return { x: 40, y: 40 }
}

function addDevice(t: Topology, kind: DeviceKind): Topology {
  let n = t.devices.filter(d => d.kind === kind).length + 1
  while (t.devices.some(d => d.id === kind + n)) n++
  const devNo = t.devices.length + 1
  const ifaces = isEnd(kind) ? [{ name: 'eth0', mac: mac(devNo, 0) }] : []
  const dev: Device = { id: kind + n, kind, label: `${KIND_TH[kind]} ${n}`, ifaces, ...freeSpot(t) }
  return { ...t, devices: [...t.devices, dev] }
}

function usedIfaces(t: Topology, id: string): Set<string> {
  const s = new Set<string>()
  for (const l of t.links) {
    if (l.a.device === id) s.add(l.a.iface)
    if (l.b.device === id) s.add(l.b.iface)
  }
  return s
}

/** Pick (or create) a free interface on a device. Returns null for a full end device. */
function claimIface(t: Topology, devId: string): { t: Topology; iface: string } | null {
  const dev = t.devices.find(d => d.id === devId)
  if (!dev) return null
  const used = usedIfaces(t, devId)
  const free = dev.ifaces.find(i => !used.has(i.name))
  if (free) return { t, iface: free.name }
  if (isEnd(dev.kind)) return null
  const no = dev.ifaces.length
  const name = dev.kind === 'switch' ? `p${no + 1}` : `g0/${no}`
  const devNo = t.devices.indexOf(dev) + 1
  const nd = { ...dev, ifaces: [...dev.ifaces, { name, mac: mac(devNo, no) }] }
  return { t: { ...t, devices: t.devices.map(d => (d.id === devId ? nd : d)) }, iface: name }
}

function DevicePanel({ device, onSave }: { device: Device; onSave: (d: Device) => void }) {
  const [ips, setIps] = useState(device.ifaces.map(i => i.ip ?? ''))
  const [prefixes, setPrefixes] = useState(device.ifaces.map(i => (i.prefix === undefined ? '' : String(i.prefix))))
  const [gw, setGw] = useState(device.gateway ?? '')
  const [error, setError] = useState('')
  const hasIp = device.kind !== 'switch'

  const save = () => {
    const ifaces = []
    for (let k = 0; k < device.ifaces.length; k++) {
      const base = device.ifaces[k]
      if (!hasIp || ips[k].trim() === '') {
        ifaces.push({ name: base.name, mac: base.mac })
        continue
      }
      const ip = parseIPv4(ips[k])
      if (!ip.ok) return setError(`${base.name}: ${ip.reasonTh}`)
      const pf = parsePrefix(prefixes[k])
      if (!pf.ok) return setError(`${base.name}: ${pf.reasonTh}`)
      ifaces.push({ name: base.name, mac: base.mac, ip: ip.value, prefix: pf.value })
    }
    let gateway: string | undefined
    if (isEnd(device.kind) && gw.trim() !== '') {
      const g = parseIPv4(gw)
      if (!g.ok) return setError(`Gateway: ${g.reasonTh}`)
      gateway = g.value
    }
    setError('')
    onSave({ ...device, ifaces, gateway })
  }

  return (
    <div className="lab-device-panel">
      <h3>{device.label}</h3>
      {device.kind === 'switch' && <p>Switch ไม่ต้องตั้ง IP แค่เสียบสายก็ใช้ได้</p>}
      {hasIp && device.ifaces.map((i, k) => (
        <div key={i.name} className="lab-iface">
          <strong>{i.name}</strong>
          <label>IP <input aria-label={`IP ของ ${i.name}`} value={ips[k]} onChange={e => setIps(ips.map((v, j) => (j === k ? e.target.value : v)))} /></label>
          <label>ขนาดวง <input aria-label={`ขนาดวงของ ${i.name}`} value={prefixes[k]} placeholder="24 หรือ 255.255.255.0" onChange={e => setPrefixes(prefixes.map((v, j) => (j === k ? e.target.value : v)))} /></label>
        </div>
      ))}
      {isEnd(device.kind) && (
        <label>Gateway <input aria-label="Gateway" value={gw} onChange={e => setGw(e.target.value)} /></label>
      )}
      {hasIp && <button type="button" onClick={save}>บันทึก</button>}
      {error && <p role="alert" className="lab-result warn">{error}</p>}
    </div>
  )
}

interface Shown { res: SendResult; met: boolean }

export function LabView({ lab, onDone }: { lab: NetworkLab; onDone: () => void }) {
  const [topo, setTopo] = useState<Topology>(lab.start)
  const [goalIdx, setGoalIdx] = useState(0)
  const [hint, setHint] = useState(false)
  const [selDev, setSelDev] = useState<string | null>(null)
  const [selLink, setSelLink] = useState<string | null>(null)
  const [cableMode, setCableMode] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [from, setFrom] = useState(lab.goals[0]?.from ?? '')
  const [toIp, setToIp] = useState(lab.goals[0]?.toIp ?? '')
  const [envAt, setEnvAt] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shown, setShown] = useState<Shown | null>(null)
  const [sendErr, setSendErr] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const doneRef = useRef(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ id: string; moved: boolean; sx: number; sy: number } | null>(null)

  const goal = lab.goals[goalIdx]
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => clearTimers, [])

  const gotoGoal = (i: number) => {
    const g = lab.goals[i]
    setGoalIdx(i)
    setFrom(g.from)
    setToIp(g.toIp)
    setHint(false)
    setShown(null)
    setSendErr('')
  }

  const send = () => {
    if (busy) return
    const ip = parseIPv4(toIp)
    if (!ip.ok) { setSendErr(ip.reasonTh); setShown(null); return }
    setSendErr('')
    setShown(null)
    const res = simulateSend(topo, from, ip.value)
    const met = !!goal && checkGoal(goal, topo, res)
    clearTimers()
    const reveal = () => {
      setEnvAt(null)
      setBusy(false)
      setShown({ res, met })
      if (met && goalIdx === lab.goals.length - 1 && !doneRef.current) {
        doneRef.current = true
        onDone()
      }
    }
    if (res.hops.length === 0) { reveal(); return }
    setBusy(true)
    setEnvAt(res.hops[0])
    res.hops.slice(1).forEach((h, k) => timers.current.push(setTimeout(() => setEnvAt(h), (k + 1) * HOP_MS)))
    timers.current.push(setTimeout(reveal, res.hops.length * HOP_MS))
  }

  const reset = () => {
    clearTimers()
    setTopo(lab.start)
    setSelDev(null); setSelLink(null); setPending(null); setCableMode(false)
    setEnvAt(null); setBusy(false); setShown(null); setSendErr(''); setNote('')
  }

  const clickDevice = (id: string) => {
    if (cableMode) {
      if (!pending) { setPending(id); setNote('เลือกเครื่องที่สองเพื่อต่อสาย'); return }
      if (pending === id) { setPending(null); setNote(''); return }
      if (topo.links.some(l => (l.a.device === pending && l.b.device === id) || (l.a.device === id && l.b.device === pending))) {
        setNote('สองเครื่องนี้ต่อสายกันอยู่แล้ว'); setPending(null); return
      }
      const a = claimIface(topo, pending)
      const b = a && claimIface(a.t, id)
      if (!a || !b) { setNote('เครื่องนี้ต่อสายแล้ว ต่อได้แค่เส้นเดียว ถอดสายเก่าออกก่อน'); setPending(null); return }
      setTopo({ ...b.t, links: [...b.t.links, { a: { device: pending, iface: a.iface }, b: { device: id, iface: b.iface } }] })
      setPending(null)
      setNote('ต่อสายแล้ว')
      return
    }
    setSelLink(null)
    setSelDev(id)
  }

  const toStage = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r || r.width === 0) return { x: e.clientX, y: e.clientY }
    return { x: ((e.clientX - r.left) / r.width) * STAGE_W, y: ((e.clientY - r.top) / r.height) * STAGE_H }
  }
  const onDown = (e: React.PointerEvent, id: string) => {
    drag.current = { id, moved: false, sx: e.clientX, sy: e.clientY }
    try { (e.currentTarget as Element).setPointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 4) return
    d.moved = true
    const p = toStage(e)
    const x = Math.max(30, Math.min(STAGE_W - 30, p.x))
    const y = Math.max(30, Math.min(STAGE_H - 30, p.y))
    setTopo(t => ({ ...t, devices: t.devices.map(v => (v.id === d.id ? { ...v, x, y } : v)) }))
  }
  const onUp = () => { setTimeout(() => { drag.current = null }, 0) }

  const saveDevice = (nd: Device) => {
    setTopo(t => ({ ...t, devices: t.devices.map(d => (d.id === nd.id ? nd : d)) }))
    setNote('บันทึกแล้ว')
  }

  const removeLink = () => {
    setTopo(t => ({ ...t, links: t.links.filter(l => linkKey(l) !== selLink) }))
    setSelLink(null)
  }

  const byId = (id: string) => topo.devices.find(d => d.id === id)
  const selDevice = selDev ? byId(selDev) : undefined
  const sendable = topo.devices.filter(d => d.kind !== 'switch')

  return (
    <section className="lab">
      <p className="lab-intro">{lab.introTh}</p>
      {goal && (
        <div className="lab-goal">
          <strong>เป้าหมายที่ {goalIdx + 1} จาก {lab.goals.length}</strong>
          <button type="button" onClick={() => setHint(true)}>ขอตัวช่วย</button>
          {hint && <p className="lab-hint">{goal.hintTh}</p>}
        </div>
      )}
      <div className="lab-layout" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className="lab-stage" style={{ flex: '1 1 0', minWidth: 0 }}>
          <div className="lab-toolbar">
            {lab.palette.map(k => (
              <button key={k} type="button" onClick={() => setTopo(t => addDevice(t, k))}>➕ {KIND_TH[k]}</button>
            ))}
            <button
              type="button"
              aria-pressed={cableMode}
              onClick={() => { setCableMode(m => !m); setPending(null); setNote('') }}
            >🔌 ต่อสาย</button>
            {selLink && <button type="button" onClick={removeLink}>ถอดสาย</button>}
            <button type="button" onClick={reset}>เริ่มใหม่</button>
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            style={{ width: '100%', background: '#121a24', borderRadius: 12, touchAction: 'none' }}
            onPointerMove={onMove}
            onPointerUp={onUp}
          >
            {topo.links.map(l => {
              const a = byId(l.a.device)
              const b = byId(l.b.device)
              if (!a || !b) return null
              const key = linkKey(l)
              return (
                <g key={key} data-testid={`cable-${key}`} onClick={() => { setSelLink(key); setSelDev(null) }} style={{ cursor: 'pointer' }}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={16} />
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={selLink === key ? '#ffd84a' : '#9aa7b4'} strokeWidth={5} strokeLinecap="round" />
                </g>
              )
            })}
            {topo.devices.map(d => (
              <g
                key={d.id}
                data-testid={`device-${d.id}`}
                style={{ cursor: 'grab' }}
                onPointerDown={e => onDown(e, d.id)}
                onClick={() => { if (!drag.current?.moved) clickDevice(d.id) }}
              >
                <rect x={d.x - 44} y={d.y - 40} width={88} height={92} fill="transparent" />
                <ActorView
                  actor={{ id: d.id, kind: d.kind, x: d.x, y: d.y, label: d.label, highlighted: selDev === d.id || pending === d.id }}
                  moveMs={0}
                />
              </g>
            ))}
            {envAt && byId(envAt) && (
              <g style={{ pointerEvents: 'none' }}>
                <ActorView actor={{ id: 'env', kind: 'envelope', x: byId(envAt)!.x, y: byId(envAt)!.y - 50 }} moveMs={HOP_MS} />
              </g>
            )}
          </svg>
          {note && <p className="lab-note">{note}</p>}
        </div>
        <aside className="lab-side" style={{ flex: '0 0 340px' }}>
          <div className="lab-send">
            <h3>ลองส่งของ</h3>
            <label>ส่งจาก{' '}
              <select aria-label="ส่งจาก" value={from} onChange={e => setFrom(e.target.value)}>
                {sendable.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </label>{' '}
            <label>ไป IP{' '}
              <input aria-label="ไป IP" value={toIp} onChange={e => setToIp(e.target.value)} />
            </label>{' '}
            <button type="button" onClick={send} disabled={busy}>ส่งข้อมูล</button>
            {sendErr && <p role="alert" className="lab-result warn">{sendErr}</p>}
            {shown && (
              <p role="status" className={`lab-result ${shown.res.ok ? 'ok' : 'warn'}`} style={{ color: shown.res.ok ? '#7CFC9A' : '#ffc857' }}>
                {shown.res.reasonTh}
              </p>
            )}
            {shown?.met && (
              <div className="lab-pass">
                <p>ผ่านเป้าหมายนี้แล้ว 🎉</p>
                {goalIdx < lab.goals.length - 1 && (
                  <button type="button" onClick={() => gotoGoal(goalIdx + 1)}>เป้าหมายต่อไป</button>
                )}
              </div>
            )}
          </div>
          {selDevice && <DevicePanel key={`${selDevice.id}:${selDevice.ifaces.length}`} device={selDevice} onSave={saveDevice} />}
        </aside>
      </div>
    </section>
  )
}
