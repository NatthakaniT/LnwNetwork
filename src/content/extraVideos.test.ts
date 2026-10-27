import { describe, it, expect } from 'vitest'
import { course } from './index'
import { extraVideos } from './extraVideos'

const lessons = course.flatMap((p) => p.lessons)

describe('extra videos', () => {
  it('only names lessons that exist', () => {
    const ids = new Set(lessons.map((l) => l.id))
    expect(Object.keys(extraVideos).filter((id) => !ids.has(id))).toEqual([])
  })

  it('come after the lesson’s own clips, so the main clip stays first', () => {
    for (const l of lessons) {
      const extra = extraVideos[l.id] ?? []
      if (extra.length === 0) continue
      expect(l.videos.slice(-extra.length)).toEqual(extra)
    }
  })

  it('keeps 9hua as the main clip wherever the lesson has one', () => {
    for (const l of lessons) {
      if (l.videos.some((v) => v.channel === '9hua Training')) expect(l.videos[0].channel).toBe('9hua Training')
    }
  })
})
