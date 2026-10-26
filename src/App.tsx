import { useCallback, useState } from 'react'
import { useRoute } from './router'
import { CourseMap } from './pages/CourseMap'
import { LessonPage } from './pages/LessonPage'
import { GlossaryPage } from './glossary/GlossaryPage'
import { ErrorBoundary } from './ErrorBoundary'

function AppRoutes() {
  const route = useRoute()
  const [notice, setNotice] = useState<string | null>(null)
  const onBlocked = useCallback((m: string) => setNotice(m), [])

  if (route.name === 'lesson') {
    return <LessonPage key={route.id} id={route.id} onBlocked={onBlocked} />
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}
