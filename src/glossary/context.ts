import { createContext } from 'react'
import { glossary } from '../content/glossary'
import type { GlossaryTerm } from '../content/types'

/** ศัพท์ของวิชาที่เปิดอยู่ (ค่าเริ่มต้น = CCNA) ให้ RichText/Term ในหน้าบทหยิบใช้โดยไม่ต้องส่งต่อทุกชั้น */
export const GlossaryContext = createContext<GlossaryTerm[]>(glossary)
