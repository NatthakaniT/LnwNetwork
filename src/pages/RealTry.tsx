import type { RealTry as RealTryData } from '../content/types'
import { AskTutor } from '../tutor/AskTutor'

export function RealTry({ realTry }: { realTry: RealTryData }) {
  return (
    <section className="real-try">
      <h3>ลองของจริงใน Git Bash</h3>
      <p>{realTry.introTh}</p>
      <ol>
        {realTry.steps.map((s) => (
          <li key={s.cmd}>
            <code>{s.cmd}</code>
            <AskTutor text={s.cmd} label="📋 คัดลอก" ariaLabel={`คัดลอกคำสั่ง ${s.cmd}`} doneText="คัดลอกแล้ว ไปวางใน Git Bash ได้เลย" />
            <p>ผลที่ควรเห็น: <span>{s.expectTh}</span></p>
          </li>
        ))}
      </ol>
    </section>
  )
}
