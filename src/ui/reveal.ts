import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/** ใส่ class 'is-in' ให้ element เมื่อเลื่อนเข้าในจอ (ไม่มี IntersectionObserver -> ใส่ทันที) */
export function useReveal<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      el.classList.add('is-in')
      return
    }
    const io = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}
