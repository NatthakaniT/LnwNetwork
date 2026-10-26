import { useEffect, useState } from 'react'

export type Route =
  | { name: 'map' }
  | { name: 'lesson'; id: string }
  | { name: 'glossary' }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '')
  const m = /^\/lesson\/([^/]+)$/.exec(path)
  if (m) {
    try {
      return { name: 'lesson', id: decodeURIComponent(m[1]) }
    } catch {
      return { name: 'map' } // hash เสียรูปแบบ เช่น %E0%A4%A
    }
  }
  if (path === '/glossary') return { name: 'glossary' }
  return { name: 'map' }
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
