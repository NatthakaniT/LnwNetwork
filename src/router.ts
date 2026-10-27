import { useEffect, useState } from 'react'
import type { CourseId } from './content/types'
import { courseById } from './content/courses'

export type Route =
  | { name: 'picker' }
  | { name: 'map'; course: CourseId }
  | { name: 'lesson'; id: string }
  | { name: 'glossary'; course: CourseId }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '')
  const m = /^\/lesson\/([^/]+)$/.exec(path)
  if (m) {
    try {
      return { name: 'lesson', id: decodeURIComponent(m[1]) }
    } catch {
      return { name: 'picker' } // hash เสียรูปแบบ เช่น %E0%A4%A
    }
  }
  if (path === '/glossary') return { name: 'glossary', course: 'ccna' } // ลิงก์เดิมก่อนมีหลายวิชา
  const c = /^\/c\/([^/]+)(\/glossary)?$/.exec(path)
  const course = c && courseById(c[1])
  if (course) return { name: c[2] ? 'glossary' : 'map', course: course.id }
  return { name: 'picker' }
}

export function navigate(hash: string): void {
  window.location.hash = hash
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    on()
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return parseHash(hash)
}
