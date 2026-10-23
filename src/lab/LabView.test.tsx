import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { LabView } from './LabView'
import type { NetworkLab, Topology } from '../content/types'

const start = (): Topology => ({
  devices: [
    { id: 'pc1', kind: 'pc', label: 'คอม 1', x: 100, y: 100, ifaces: [{ name: 'eth0', ip: '192.168.1.10', prefix: 24, mac: 'm1' }] },
    { id: 'sw1', kind: 'switch', label: 'Switch 1', x: 300, y: 100, ifaces: [{ name: 'p1', mac: 'm2' }, { name: 'p2', mac: 'm3' }] },
    { id: 'pc2', kind: 'pc', label: 'คอม 2', x: 500, y: 100, ifaces: [{ name: 'eth0', ip: '192.168.1.20', prefix: 24, mac: 'm4' }] },
  ],
  links: [
    { a: { device: 'pc1', iface: 'eth0' }, b: { device: 'sw1', iface: 'p1' } },
    { a: { device: 'pc2', iface: 'eth0' }, b: { device: 'sw1', iface: 'p2' } },
  ],
})

const lab: NetworkLab = {
  kind: 'network',
  introTh: 'ลองส่งข้อมูลดูนะ',
  start: start(),
  palette: ['pc', 'switch', 'router'],
  goals: [
    { type: 'deliver', from: 'pc1', toIp: '192.168.1.20', hintTh: 'กดส่งข้อมูลได้เลย' },
    { type: 'deliver', from: 'pc2', toIp: '192.168.1.10', hintTh: 'ส่งกลับไปหา คอม 1' },
  ],
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

const flush = () => act(() => { vi.advanceTimersByTime(5000) })

describe('LabView', () => {
  it('shows intro, the first goal and a hint on request', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    expect(screen.getByText('ลองส่งข้อมูลดูนะ')).toBeInTheDocument()
    expect(screen.getByText(/เป้าหมายที่ 1 จาก 2/)).toBeInTheDocument()
    expect(screen.queryByText('กดส่งข้อมูลได้เลย')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('ขอตัวช่วย'))
    expect(screen.getByText('กดส่งข้อมูลได้เลย')).toBeInTheDocument()
  })

  it('send shows the reason after the animation and passes the goal', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    fireEvent.click(screen.getByText('ส่งข้อมูล'))
    expect(screen.queryByText(/ส่งถึงแล้ว/)).not.toBeInTheDocument()
    flush()
    expect(screen.getByText(/ส่งถึงแล้ว/)).toBeInTheDocument()
    expect(screen.getByText(/ผ่านเป้าหมายนี้แล้ว/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('เป้าหมายต่อไป'))
    expect(screen.getByText(/เป้าหมายที่ 2 จาก 2/)).toBeInTheDocument()
  })

  it('invalid IP in the panel shows a warning and leaves topology unchanged', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    fireEvent.click(screen.getByTestId('device-pc1'))
    fireEvent.change(screen.getByLabelText('IP ของ eth0'), { target: { value: '300.1.1.1' } })
    fireEvent.click(screen.getByText('บันทึก'))
    expect(screen.getByRole('alert')).toHaveTextContent(/0 ถึง 255/)
    // topology still has the old IP: sending still works
    fireEvent.click(screen.getByText('ส่งข้อมูล'))
    flush()
    expect(screen.getByText(/ส่งถึงแล้ว/)).toBeInTheDocument()
  })

  it('valid edit is applied (prefix accepts a mask)', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    fireEvent.click(screen.getByTestId('device-pc2'))
    fireEvent.change(screen.getByLabelText('IP ของ eth0'), { target: { value: '192.168.1.30' } })
    fireEvent.change(screen.getByLabelText('ขนาดวงของ eth0'), { target: { value: '255.255.255.0' } })
    fireEvent.click(screen.getByText('บันทึก'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('บันทึกแล้ว')).toBeInTheDocument()
    // old IP is gone: sending to it now fails
    fireEvent.click(screen.getByText('ส่งข้อมูล'))
    flush()
    expect(screen.getByText(/ไม่มีเครื่องไหนใช้ IP นี้ \(192\.168\.1\.20\)/)).toBeInTheDocument()
    // new IP works
    fireEvent.change(screen.getByLabelText('ไป IP'), { target: { value: '192.168.1.30' } })
    fireEvent.click(screen.getByText('ส่งข้อมูล'))
    flush()
    expect(screen.getByText('ส่งถึงแล้ว! คอม 1 กับ คอม 2 อยู่วงเดียวกันและมีสายต่อถึงกัน')).toBeInTheDocument()
    expect(screen.getByLabelText('IP ของ eth0')).toHaveValue('192.168.1.30')
  })

  it('a router gaining a port while its panel is open does not crash', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    fireEvent.click(screen.getByText('➕ Router'))
    fireEvent.click(screen.getByTestId('device-router1'))
    fireEvent.click(screen.getByText('🔌 ต่อสาย'))
    fireEvent.click(screen.getByTestId('device-router1'))
    fireEvent.click(screen.getByTestId('device-sw1'))
    expect(screen.getByTestId('cable-router1-sw1')).toBeInTheDocument()
    expect(screen.getByLabelText('IP ของ g0/0')).toBeInTheDocument()
    fireEvent.click(screen.getByText('บันทึก'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('บันทึกแล้ว')).toBeInTheDocument()
  })

  it('invalid destination IP shows the reason and does not send', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    fireEvent.change(screen.getByLabelText('ไป IP'), { target: { value: 'abc' } })
    fireEvent.click(screen.getByText('ส่งข้อมูล'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('calls onDone once after all goals', () => {
    const onDone = vi.fn()
    render(<LabView lab={lab} onDone={onDone} />)
    fireEvent.click(screen.getByText('ส่งข้อมูล'))
    flush()
    fireEvent.click(screen.getByText('เป้าหมายต่อไป'))
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('ส่งข้อมูล'))
    flush()
    expect(onDone).toHaveBeenCalledTimes(1)
    flush()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('adds a device from the palette and links two devices', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    fireEvent.click(screen.getByText('➕ คอม'))
    expect(screen.getByTestId('device-pc3')).toBeInTheDocument()
    fireEvent.click(screen.getByText('🔌 ต่อสาย'))
    fireEvent.click(screen.getByTestId('device-pc3'))
    fireEvent.click(screen.getByTestId('device-sw1'))
    expect(screen.getByTestId('cable-pc3-sw1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('cable-pc3-sw1'))
    fireEvent.click(screen.getByText('ถอดสาย'))
    expect(screen.queryByTestId('cable-pc3-sw1')).not.toBeInTheDocument()
  })

  it('reset restores the start topology', () => {
    render(<LabView lab={lab} onDone={() => {}} />)
    fireEvent.click(screen.getByText('➕ Switch'))
    expect(screen.getByTestId('device-switch2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('เริ่มใหม่'))
    expect(screen.queryByTestId('device-switch2')).not.toBeInTheDocument()
  })
})
