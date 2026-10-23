import { useEffect, useState } from 'react'
import type { VideoRef } from '../content/types'
import { RichText } from '../glossary/RichText'

export const VIDEO_TIMEOUT_MS = 15000

const embedUrl = (v: VideoRef) =>
  `https://www.youtube-nocookie.com/embed/${v.youtubeId}${v.startSec ? `?start=${v.startSec}` : ''}`

export function VideoStep({ videos, onNext, termIds = [] }: { videos: VideoRef[]; onNext: () => void; termIds?: string[] }) {
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const video = videos[idx]

  useEffect(() => {
    setLoaded(false)
    setTimedOut(false)
    if (!video) return
    const t = setTimeout(() => setTimedOut(true), VIDEO_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [video])

  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  const showFallback = !!video && (offline || (timedOut && !loaded))

  return (
    <section className="video-step">
      {video ? (
        <>
          {video.noteTh && <p className="video-note">ℹ️ <RichText text={video.noteTh} termIds={termIds} /></p>}
          <div className="video-frame">
            <iframe
              key={video.youtubeId + (video.startSec ?? '')}
              src={embedUrl(video)}
              title={video.titleTh}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
          </div>
          {showFallback && (
            <p className="video-notice" role="status">
              คลิปเปิดไม่ขึ้นหรือยังไม่มีเน็ต ลองดูที่ YouTube ได้เลย{' '}
              <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noreferrer">
                เปิดใน YouTube
              </a>
            </p>
          )}
          {videos.length > 1 && (
            <div className="video-more">
              <h3>คลิปเสริม</h3>
              <ul>
                {videos.map((v, i) =>
                  i === idx ? null : (
                    <li key={v.youtubeId + i}>
                      <button type="button" className="video-pick" onClick={() => setIdx(i)}>
                        {v.titleTh} <span className="muted">({v.channel})</span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="video-notice">บทนี้ยังไม่มีคลิป ข้ามไปขั้นต่อไปได้เลย</p>
      )}
      <p>
        <button type="button" className="btn primary" onClick={onNext}>ไปขั้นต่อไป</button>
      </p>
    </section>
  )
}
