import type { Part } from '../types'
import { build } from '../parts'

export const gitParts: Part[] = [
  {
    part: 0, titleTh: 'เริ่มจากศูนย์', examDomain: '',
    lessons: build(0, [
      ['g0-l1', 'ทำไมต้องมี Git'],
      ['g0-l2', 'ตระกูล Git ต่างกันยังไง'],
      ['g0-l3', 'repository กับ commit'],
      ['g0-l4', 'git add'],
      ['g0-l5', 'ในเครื่องกับบนเน็ต'],
    ]),
  },
  {
    part: 1, titleTh: 'ทำงานคู่กับเพื่อน', examDomain: '',
    lessons: build(1, [
      ['g1-l1', 'branch'],
      ['g1-l2', 'Pull Request'],
      ['g1-l3', 'merge กับ conflict'],
      ['g1-l4', 'วิธีที่คนนิยมใช้'],
    ]),
  },
  {
    part: 2, titleTh: 'ใช้จริง', examDomain: '',
    lessons: build(2, [
      ['g2-l1', 'push งานจริงครั้งแรก'],
    ]),
  },
]
