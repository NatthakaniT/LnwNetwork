import type { Lesson, Part } from './types'
import { lesson as p0l1 } from './lessons/p0-l1'
import { lesson as p0l2 } from './lessons/p0-l2'
import { lesson as p0l3 } from './lessons/p0-l3'

type Row = [title: string, analogy?: string, modules?: string[]]

/** บทที่เขียนเสร็จแล้ว แทนที่โครงบทที่ยังไม่เสร็จ (รหัสเดียวกัน) */
const readyLessons: Lesson[] = [p0l1, p0l2, p0l3]
const withReady = (l: Lesson): Lesson => readyLessons.find((r) => r.id === l.id) ?? l

const build = (part: number, rows: Row[]): Lesson[] =>
  rows.map(([titleTh, analogyTh = '', ciscoModules = []], i) => ({
    id: `p${part}-l${i + 1}`,
    part,
    order: i + 1,
    status: 'building' as const,
    titleTh,
    analogyTh,
    ciscoModules,
    videos: [],
  })).map(withReady)

export const parts: Part[] = [
  {
    part: 0, titleTh: 'เริ่มจากศูนย์', examDomain: 'Pre-CCNA',
    lessons: build(0, [
      ['Network คืออะไร', 'ถนนกับรถส่งของ', ['ITN 1']],
      ['อุปกรณ์มีอะไรบ้าง', 'คอม สาย Switch Router', ['ITN 1', 'ITN 11']],
      ['ข้อมูลเดินทางยังไง', 'กล่องพัสดุ', ['ITN 3']],
      ['ที่อยู่ 2 แบบ: MAC กับ IP', 'เลขบัตรประชาชน กับบ้านเลขที่', ['ITN 7', 'ITN 9']],
      ['การห่อของเป็นชั้น ๆ', 'OSI / TCP-IP', ['ITN 3']],
    ]),
  },
  {
    part: 1, titleTh: 'พื้นฐาน Network', examDomain: 'Network Fundamentals 20%',
    lessons: build(1, [
      ['เลขฐานสอง'], ['IPv4'], ['Subnet'], ['ฝึก Subnetting'], ['IPv6'],
      ['TCP กับ UDP'], ['สายและรูปแบบการต่อ'], ['Wi-Fi เบื้องต้น'], ['Cloud และ Virtualization'],
    ]),
  },
  {
    part: 2, titleTh: 'Switch และ VLAN', examDomain: 'Network Access 20%',
    lessons: build(2, [
      ['Switch จำเครื่องได้ยังไง'], ['VLAN'], ['Trunk'], ['คุยข้าม VLAN'],
      ['STP'], ['EtherChannel'], ['CDP/LLDP'], ['Wireless LAN'],
    ]),
  },
  {
    part: 3, titleTh: 'Router และการหาเส้นทาง', examDomain: 'IP Connectivity 25%',
    lessons: build(3, [
      ['Router เลือกทางยังไง'], ['Static Route'], ['Default Route'], ['OSPF'], ['FHRP'],
    ]),
  },
  {
    part: 4, titleTh: 'บริการในเครือข่าย', examDomain: 'IP Services 10%',
    lessons: build(4, [
      ['DHCP'], ['DNS'], ['NAT'], ['NTP'], ['SNMP/Syslog'], ['QoS'], ['SSH'],
    ]),
  },
  {
    part: 5, titleTh: 'ความปลอดภัย', examDomain: 'Security Fundamentals 15%',
    lessons: build(5, [
      ['ภัยที่พบบ่อย'], ['รหัสผ่านและสิทธิ์'], ['ACL'], ['Port Security'],
      ['DHCP Snooping/DAI'], ['VPN'], ['ความปลอดภัย Wi-Fi'],
    ]),
  },
  {
    part: 6, titleTh: 'ระบบอัตโนมัติ', examDomain: 'Automation and Programmability 10%',
    lessons: build(6, [
      ['SDN และ Controller'], ['REST API'], ['JSON'], ['Ansible/Terraform'],
    ]),
  },
]
