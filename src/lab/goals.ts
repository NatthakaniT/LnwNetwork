import type { LabGoal, Topology } from '../content/types'
import { simulateSend, type SendResult } from './sim'

export interface SentPair { from: string; toIp: string }

/** sent = คู่ต้นทาง/ปลายทางที่ผู้เรียนกดส่งจริง ต้องตรงกับเป้าหมาย ไม่งั้นไม่นับ */
export function checkGoal(goal: LabGoal, t: Topology, lastSend: SendResult | undefined, sent: SentPair): boolean {
  if (!lastSend) return false
  if (sent.from !== goal.from || sent.toIp !== goal.toIp) return false
  const r = simulateSend(t, goal.from, goal.toIp)
  if (goal.type === 'fail') {
    return !r.ok && !lastSend.ok && r.reasonTh.includes(goal.reasonIncludes)
  }
  return r.ok && lastSend.ok
}
