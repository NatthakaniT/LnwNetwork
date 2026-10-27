import type { Lesson, Part } from './types'
import { lesson as p0l1 } from './lessons/p0-l1'
import { lesson as p0l2 } from './lessons/p0-l2'
import { lesson as p0l3 } from './lessons/p0-l3'
import { lesson as p0bits } from './lessons/p0-bits'
import { lesson as p0l4 } from './lessons/p0-l4'
import { lesson as p0l5 } from './lessons/p0-l5'
import { withExtraVideos } from './extraVideos'

type Row = [id: string, title: string, analogy?: string, modules?: string[]]

/** บทที่เขียนเสร็จแล้ว แทนที่โครงบทที่ยังไม่เสร็จ (รหัสเดียวกัน) */
const readyLessons: Lesson[] = [p0l1, p0l2, p0l3, p0bits, p0l4, p0l5]
const withReady = (l: Lesson): Lesson => readyLessons.find((r) => r.id === l.id) ?? l

export const build = (part: number, rows: Row[]): Lesson[] =>
  rows.map(([id, titleTh, analogyTh = '', ciscoModules = []], i) => ({
    id,
    part,
    order: i + 1,
    status: 'building' as const,
    titleTh,
    analogyTh,
    ciscoModules,
    videos: [],
  })).map(withReady).map((l) => ({ ...l, videos: withExtraVideos(l) }))

export const parts: Part[] = [
  {
    part: 0, titleTh: 'เริ่มจากศูนย์', examDomain: 'Pre-CCNA',
    lessons: build(0, [
      ['p0-l1', 'Network คืออะไร', 'ถนนกับรถส่งของ', ['ITN 1']],
      ['p0-l2', 'อุปกรณ์มีอะไรบ้าง', 'คอม สาย Switch Router', ['ITN 1', 'ITN 11']],
      ['p0-l3', 'ข้อมูลเดินทางยังไง', 'กล่องพัสดุ', ['ITN 3']],
      ['p0-bits', 'คอมพูดภาษา 0 กับ 1', 'สวิตช์ไฟกับทอนเงินด้วยแบงก์', ['ITN 5']],
      ['p0-l4', 'ที่อยู่ 2 แบบ: MAC กับ IP', 'เลขบัตรประชาชน กับบ้านเลขที่', ['ITN 7', 'ITN 9']],
      ['p0-l5', 'การห่อของเป็นชั้น ๆ', 'ห่อพัสดุทีละชั้น', ['ITN 3']],
    ]),
  },
  {
    part: 1, titleTh: 'พื้นฐาน Network', examDomain: 'Network Fundamentals 20%',
    lessons: build(1, [
      ['p1-l1', 'ฝึกแปลงเลขฐานสอง'], ['p1-l2', 'IPv4'], ['p1-l3', 'Subnet'], ['p1-l4', 'ฝึก Subnetting'], ['p1-l5', 'IPv6'],
      ['p1-l6', 'TCP กับ UDP'], ['p1-l7', 'สายและรูปแบบการต่อ'], ['p1-l8', 'Wi-Fi เบื้องต้น'], ['p1-l9', 'Cloud และ Virtualization'],
    ]),
  },
  {
    part: 2, titleTh: 'Switch และ VLAN', examDomain: 'Network Access 20%',
    lessons: build(2, [
      ['p2-l1', 'Switch จำเครื่องได้ยังไง'], ['p2-l2', 'VLAN'], ['p2-l3', 'Trunk'], ['p2-l4', 'คุยข้าม VLAN'],
      ['p2-l5', 'STP'], ['p2-l6', 'EtherChannel'], ['p2-l7', 'CDP/LLDP'], ['p2-l8', 'Wireless LAN'],
    ]),
  },
  {
    part: 3, titleTh: 'Router และการหาเส้นทาง', examDomain: 'IP Connectivity 25%',
    lessons: build(3, [
      ['p3-l1', 'Router เลือกทางยังไง'], ['p3-l2', 'Static Route'], ['p3-l3', 'Default Route'], ['p3-l4', 'OSPF'], ['p3-l5', 'FHRP'],
    ]),
  },
  {
    part: 4, titleTh: 'บริการในเครือข่าย', examDomain: 'IP Services 10%',
    lessons: build(4, [
      ['p4-l1', 'DHCP'], ['p4-l2', 'DNS'], ['p4-l3', 'NAT'], ['p4-l4', 'NTP'], ['p4-l5', 'SNMP/Syslog'], ['p4-l6', 'QoS'], ['p4-l7', 'SSH'],
    ]),
  },
  {
    part: 5, titleTh: 'ความปลอดภัย', examDomain: 'Security Fundamentals 15%',
    lessons: build(5, [
      ['p5-l1', 'ภัยที่พบบ่อย'], ['p5-l2', 'รหัสผ่านและสิทธิ์'], ['p5-l3', 'ACL'], ['p5-l4', 'Port Security'],
      ['p5-l5', 'DHCP Snooping/DAI'], ['p5-l6', 'VPN'], ['p5-l7', 'ความปลอดภัย Wi-Fi'],
    ]),
  },
  {
    part: 6, titleTh: 'ระบบอัตโนมัติ', examDomain: 'Automation and Programmability 10%',
    lessons: build(6, [
      ['p6-l1', 'SDN และ Controller'], ['p6-l2', 'REST API'], ['p6-l3', 'JSON'], ['p6-l4', 'Ansible/Terraform'],
    ]),
  },
]
