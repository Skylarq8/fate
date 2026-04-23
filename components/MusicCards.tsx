"use client"

import { useState, useRef, useCallback } from "react"
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"

interface Track {
  id:     string
  artist: string
  song:   string
  image:  string
  audio:  string
}

const tracks: Track[] = [
  { id: "1", artist: "Drake",       song: "CAN I",         image: "https://i.pinimg.com/736x/e2/19/c1/e219c15db31285cdac8a92f20a1b1cbb.jpg", audio: "/music/Drake.mp3"  },
  { id: "2", artist: "Carti",       song: "SKY",           image: "https://i.pinimg.com/736x/e2/ff/09/e2ff090bbadb84e9563b63b70a53acde.jpg", audio: "/music/Carti.mp3"  },
  { id: "3", artist: "ASAP Rocky",  song: "Fashion Killa", image: "https://i.pinimg.com/736x/5a/2b/bf/5a2bbf80270e06602fe950c1fbc00996.jpg", audio: "/music/Asap.mp3"   },
  { id: "4", artist: "Travis Scott",song: "FEIN",          image: "https://i.pinimg.com/736x/be/78/72/be78725c40ac25319f1d2ae5ca549810.jpg", audio: "/music/Fein.mp3"  },
]

function MusicCard({
  track, playing, progress, onPlay, onPause,
}: {
  track: Track; playing: boolean; progress: number; onPlay: () => void; onPause: () => void
}) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const applyTilt = useCallback((x: number, y: number, rect: DOMRect) => {
    const card = cardRef.current
    if (!card) return
    const cx = rect.width  / 2
    const cy = rect.height / 2
    const rotX = -((y - cy) / cy) * 18
    const rotY =  ((x - cx) / cx) * 18
    card.style.transform  = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`
    card.style.transition = "transform 0.06s linear"
    card.style.zIndex     = "10"
    if (glareRef.current) {
      glareRef.current.style.background =
        `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.18) 0%, transparent 65%)`
      glareRef.current.style.opacity = "1"
    }
  }, [])

  const resetTilt = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
    card.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1)"
    card.style.zIndex     = "1"
    if (glareRef.current) glareRef.current.style.opacity = "0"
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    applyTilt(e.clientX - rect.left, e.clientY - rect.top, rect)
  }, [applyTilt])

  const handleMouseLeave = useCallback(() => resetTilt(), [resetTilt])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const t = e.touches[0]
    applyTilt(t.clientX - rect.left, t.clientY - rect.top, rect)
  }, [applyTilt])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    resetTilt()
  }, [resetTilt])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none ring-1 ring-white/10"
      style={{ aspectRatio: "3/4", transformStyle: "preserve-3d", position: "relative", boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.5)", touchAction: "none" }}
    >
      {/* BG image */}
      <img
        src={track.image}
        alt={track.artist}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Glare */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-200"
        style={{ opacity: 0 }}
      />

      {/* Playing pulse ring */}
      {playing && (
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full border-2 border-white/60 animate-ping pointer-events-none" />
      )}

      {/* Play button */}
      <button
        onClick={e => { e.stopPropagation(); playing ? onPause() : onPlay() }}
        onTouchStart={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
        onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); playing ? onPause() : onPlay() }}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10
          ${playing
            ? "bg-white text-black"
            : "bg-black/50 backdrop-blur-sm text-white hover:bg-white hover:text-black hover:scale-110"
          }`}
      >
        {playing
          ? <Pause size={13} fill="currentColor" />
          : <Play  size={13} fill="currentColor" className="translate-x-px" />
        }
      </button>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10">
        <p className="text-white/50 text-[11px] uppercase tracking-widest mb-0.5">{track.artist}</p>
        <p className="text-white text-[15px] font-bold leading-tight mb-2">{track.song}</p>

        {/* Progress bar */}
        <div className="h-[3px] w-full bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function MusicCards() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [progress,  setProgress]  = useState<Record<string, number>>({})
  const [page,      setPage]      = useState(0)
  const [sliding,   setSliding]   = useState<"left" | "right" | null>(null)
  const audioRef       = useRef<HTMLAudioElement | null>(null)
  const currentTrackId = useRef<string | null>(null)
  const audioMapRef    = useRef<Record<string, HTMLAudioElement>>({})
  const touchX         = useRef<number>(0)

  const totalPages = Math.ceil(tracks.length / 2)

  const play = (track: Track) => {
    // Pause currently playing track (different one)
    if (audioRef.current && currentTrackId.current !== track.id) {
      audioRef.current.pause()
    }

    // Reuse existing audio element to preserve position
    if (!audioMapRef.current[track.id]) {
      const audio = new Audio(track.audio)
      audio.ontimeupdate = () => {
        if (!audio.duration) return
        setProgress(p => ({ ...p, [track.id]: (audio.currentTime / audio.duration) * 100 }))
      }
      audio.onended = () => {
        setPlayingId(null)
        setProgress(p => ({ ...p, [track.id]: 0 }))
        delete audioMapRef.current[track.id]
      }
      audioMapRef.current[track.id] = audio
    }

    audioRef.current = audioMapRef.current[track.id]
    currentTrackId.current = track.id
    audioRef.current.play()
    setPlayingId(track.id)
  }

  const pause = () => {
    audioRef.current?.pause()
    setPlayingId(null)
  }

  const goTo = (next: number, dir: "left" | "right") => {
    setSliding(dir)
    setTimeout(() => {
      setPage(next)
      setSliding(null)
    }, 300)
  }

  const prev = () => { if (page > 0) goTo(page - 1, "right") }
  const next = () => { if (page < totalPages - 1) goTo(page + 1, "left") }

  const slideClass = sliding === "left"
    ? "-translate-x-8 opacity-0"
    : sliding === "right"
    ? "translate-x-8 opacity-0"
    : "translate-x-0 opacity-100"

  const visibleTracks = tracks.slice(page * 2, page * 2 + 2)

  return (
    <div className="mt-5 lg:mt-8">
      {/* Desktop: 4 column grid — overflow visible for 3D */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4 py-6 px-1">
        {tracks.map(track => (
          <MusicCard key={track.id} track={track}
            playing={playingId === track.id}
            progress={progress[track.id] ?? 0}
            onPlay={() => play(track)} onPause={pause}
          />
        ))}
      </div>

      {/* Mobile/tablet: 2 cards + navigation */}
      <div className="lg:hidden">
        <div
          className={`grid grid-cols-2 gap-3 py-4 px-1 transition-all duration-300 ease-out ${slideClass}`}
          onTouchStart={e => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const diff = touchX.current - e.changedTouches[0].clientX
            if (diff > 50)  next()
            if (diff < -50) prev()
          }}
        >
          {visibleTracks.map(track => (
            <MusicCard key={track.id} track={track}
              playing={playingId === track.id}
              progress={progress[track.id] ?? 0}
              onPlay={() => play(track)} onPause={pause}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={prev} disabled={page === 0}
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center transition-all disabled:opacity-25 hover:border-white/40"
          >
            <ChevronLeft size={16} className="text-white/70" />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`rounded-full transition-all duration-300 ${i === page ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`}
              />
            ))}
          </div>

          <button
            onClick={next} disabled={page === totalPages - 1}
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center transition-all disabled:opacity-25 hover:border-white/40"
          >
            <ChevronRight size={16} className="text-white/70" />
          </button>
        </div>
      </div>
    </div>
  )
}
