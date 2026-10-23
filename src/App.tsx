import { useCallback, useState } from 'react'
import { useRoute } from './router'
import { CourseMap } from './pages/CourseMap'
import { LessonPage } from './pages/LessonPage'
import { GlossaryPage } from './glossary/GlossaryPage'

export default function App() {
  const route = useRoute()
  const [notice, setNotice] = useState<string | null>(null)
  const onBlocked = useCallback((m: string) => setNotice(m), [])

  if (route.name === 'lesson') {
    return <LessonPage key={route.id + (route.testOut ? ':t' : '')} id={route.id} testOut={route.testOut} onBlocked={onBlocked} />
  }
  if (route.name === 'glossary') {
    return (
      <main className="glossary-wrap">
        <p><a href="#/">← กลับแผนที่</a></p>
        <GlossaryPage />
      </main>
    )
  }
  return <CourseMap notice={notice} onDismissNotice={() => setNotice(null)} />
}
