/** เวลาเรียนโดยประมาณ: บทละ 10–15 นาทีตาม spec ถ้าไม่ถึงชั่วโมงครึ่งบอกเป็นนาที นอกนั้นบอกเป็นชั่วโมง
 *  shortcut: เดาจากจำนวนบท ถ้าบทมีเวลาจริงของตัวเองเมื่อไร ให้รวมเวลาจริงแทน */
export function studyTime(lessons: number): string {
  const loMin = lessons * 10
  const hiMin = lessons * 15
  if (hiMin <= 90) return `${loMin}–${hiMin} นาที`
  const lo = Math.max(1, Math.round(loMin / 60))
  const hi = Math.max(lo, Math.round(hiMin / 60))
  return lo === hi ? `${lo} ชั่วโมง` : `${lo}–${hi} ชั่วโมง`
}
