type Ok<T> = { ok: true; value: T }
type Err = { ok: false; reasonTh: string }

const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙'
function toAsciiDigits(s: string): string {
  return s.replace(/[๐-๙]/g, ch => String(THAI_DIGITS.indexOf(ch)))
}

export function parseIPv4(input: string): Ok<string> | Err {
  const s = toAsciiDigits(input.trim())
  if (s === '') return { ok: false, reasonTh: 'ยังไม่ได้พิมพ์ IP เลย ลองพิมพ์ เช่น 192.168.1.10' }
  const parts = s.split('.')
  if (parts.length !== 4) {
    return { ok: false, reasonTh: 'IP ต้องมี 4 ชุด คั่นด้วยจุด เช่น 192.168.1.10 แต่ที่พิมพ์มามี ' + parts.length + ' ชุด' }
  }
  for (const p of parts) {
    if (!/^\d+$/.test(p)) {
      return { ok: false, reasonTh: 'IP ต้องเป็นตัวเลขกับจุดเท่านั้น แต่ "' + p + '" ไม่ใช่ตัวเลข' }
    }
    if (p.length > 1 && p.startsWith('0')) {
      return { ok: false, reasonTh: 'เลข "' + p + '" ไม่ควรขึ้นต้นด้วยศูนย์ ลองเขียนเป็น ' + String(Number(p)) }
    }
    if (Number(p) > 255) {
      return { ok: false, reasonTh: 'เลขแต่ละชุดต้องอยู่ระหว่าง 0 ถึง 255 แต่ ' + p + ' เกินไป' }
    }
  }
  return { ok: true, value: parts.join('.') }
}

export function parsePrefix(input: string): Ok<number> | Err {
  const bad: Err = { ok: false, reasonTh: 'ขนาดวงต้องเป็นเลข 0 ถึง 32 (เช่น 24) หรือซับเน็ตมาสก์ที่ถูกต้อง (เช่น 255.255.255.0)' }
  const s = toAsciiDigits(input.trim()).replace(/^\//, '')
  if (s === '') return bad
  if (/^\d+$/.test(s)) {
    const n = Number(s)
    return n >= 0 && n <= 32 ? { ok: true, value: n } : bad
  }
  const ip = parseIPv4(s)
  if (!ip.ok) return bad
  const bits = ip.value.split('.').map(p => Number(p).toString(2).padStart(8, '0')).join('')
  if (!/^1*0*$/.test(bits)) {
    return { ok: false, reasonTh: 'ซับเน็ตมาสก์ต้องเป็นเลข 1 ติดกันแล้วตามด้วยเลข 0 เช่น 255.255.255.0 แบบ ' + s + ' ใช้ไม่ได้' }
  }
  return { ok: true, value: bits.indexOf('0') === -1 ? 32 : bits.indexOf('0') }
}

function toInt(ip: string): number {
  return ip.split('.').reduce((acc, p) => acc * 256 + Number(p), 0)
}

export function sameSubnet(a: string, b: string, prefix: number): boolean {
  if (prefix <= 0) return true
  const shift = 2 ** (32 - prefix)
  return Math.floor(toInt(a) / shift) === Math.floor(toInt(b) / shift)
}
