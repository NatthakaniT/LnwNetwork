import { useEffect, useRef, useState } from 'react'

export function AskTutor({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle')
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state === 'manual') { taRef.current?.focus(); taRef.current?.select() }
  }, [state])

  const copy = () => {
    const w = navigator.clipboard?.writeText(text)
    if (!w) return setState('manual')
    w.then(() => setState('copied'), () => setState('manual'))
  }

  return (
    <div className="ask-tutor">
      <button type="button" className="btn" onClick={copy}>📋 คัดลอกไปถามครู</button>
      <div role="status">
        {state === 'copied' && <p>คัดลอกแล้ว ไปวางใน Claude.ai ได้เลย</p>}
        {state === 'manual' && (
          <>
            <p>คัดลอกอัตโนมัติไม่ได้ กด Ctrl+C เพื่อคัดลอก</p>
            <textarea ref={taRef} readOnly aria-label="ข้อความสำหรับคัดลอก" value={text} rows={3} />
          </>
        )}
      </div>
    </div>
  )
}
