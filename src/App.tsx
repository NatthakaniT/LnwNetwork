import { useCallback, useState } from 'react'
import { useRoute } from './router'
import { ccna, courseById, courseOf } from './content/courses'
import { CoursePicker } from './pages/CoursePicker'
import { CourseMap } from './pages/CourseMap'
import { LessonPage } from './pages/LessonPage'
import { GlossaryPage } from './glossary/GlossaryPage'
import { ErrorBoundary } from './ErrorBoundary'

function AppRoutes() {
  const route = useRoute()
  const [notice, setNotice] = useState<string | null>(null)
  const onBlocked = useCallback((m: string) => setNotice(m), [])

  if (route.name === 'lesson') {
    return <LessonPage key={route.id} id={route.id} course={courseOf(route.id)} onBlocked={onBlocked} />
  }
  if (route.name === 'picker') return <CoursePicker notice={notice} onDismissNotice={() => setNotice(null)} />
  const course = courseById(route.course) ?? ccna
  if (route.name === 'glossary') {
    return (
      <main className="glossary-wrap">
        <p><a href={`#/c/${course.id}`}>← กลับแผนที่</a></p>
        <GlossaryPage key={course.id} course={course} />
      </main>
    )
  }
  return <CourseMap key={course.id} course={course} notice={notice} onDismissNotice={() => setNotice(null)} />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}
