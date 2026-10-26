export function tutorPrompt({ lessonTitle, stepLabel, wrongPrompt }: { lessonTitle: string; stepLabel: string; wrongPrompt?: string }): string {
  const head = `ผมเรียนถึงบท "${lessonTitle}" ขั้น "${stepLabel}" `
  return head + (wrongPrompt ? `ตอบข้อ "${wrongPrompt}" ผิด อยากถามว่า ` : 'อยากถามว่า ')
}
