import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/** ตั้ง data-revealed ให้ element เมื่อเลื่อนเข้าในจอ หรืออยู่เหนือจอไปแล้ว
    (ใช้ data attribute ไม่ใช่ class เพื่อให้ React เปลี่ยน className แล้วไม่หาย)
    ไม่มี IntersectionObserver -> ตั้งทันที */
export function useReveal<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const show = () => { el.setAttribute('data-revealed', 'true') }
    if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      show()
      return
    }
    const io = new window.IntersectionObserver(
      (entries) => {
        // อยู่เหนือจอไปแล้ว (เช่นคืนตำแหน่งเลื่อน) ก็ถือว่าเห็นแล้ว ไม่ต้องรอเลื่อนกลับขึ้นมา
        if (entries.some((e) => e.isIntersecting || (e.boundingClientRect?.bottom ?? 0) < 0)) {
          show()
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
