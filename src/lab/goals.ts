import type { LabGoal, Topology } from '../content/types'
import { simulateSend, type SendResult } from './sim'

export function checkGoal(goal: LabGoal, t: Topology, lastSend?: SendResult): boolean {
  if (!lastSend) return false
  const r = simulateSend(t, goal.from, goal.toIp)
  if (goal.type === 'fail') {
    return !r.ok && !lastSend.ok && r.reasonTh.includes(goal.reasonIncludes)
  }
  return r.ok && lastSend.ok
}
