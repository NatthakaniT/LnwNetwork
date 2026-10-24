// WCAG 2.x contrast helper + สีภาค (ต้องตรงกับ --p0..--p6 ใน styles.css; มี test ตรวจ)

function channel(v: number): number {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim())
  if (!m) throw new Error(`สีไม่ถูกต้อง: ${hex}`)
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => channel(parseInt(h, 16)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** อัตราส่วน contrast ตาม WCAG 2.x รับ '#rrggbb' */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const DARK = '#0e0f13'

// หมายเหตุ: ขาวบน p2/p3/p6 ได้ contrast แค่ 3.7/3.1/2.6 (< 4.5) จึงใช้ตัวหนังสือดำทุกภาค
export const PART_COLORS: Record<number, { bg: string; fg: string }> = {
  0: { bg: '#c8f169', fg: DARK },
  1: { bg: '#ff7ad9', fg: DARK },
  2: { bg: '#4c7dff', fg: DARK },
  3: { bg: '#ff5a1f', fg: DARK },
  4: { bg: '#ffd23f', fg: DARK },
  5: { bg: '#4cd4ff', fg: DARK },
  6: { bg: '#b58cff', fg: DARK },
}
