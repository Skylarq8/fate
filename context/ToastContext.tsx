"use client"

import { X } from "lucide-react"
import { createContext, useContext, useState } from "react"

type ToastType = {
  message: string
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [startY, setStartY] = useState<number | null>(null)

  const showToast = (msg: string) => {
    setMessage(msg)
    setOpen(true)

    // animation эхлэх
    setTimeout(() => setVisible(true), 10) // жижиг delay-ээр animate trigger

    // auto close
    setTimeout(() => {
      setVisible(false) // fade out
      setTimeout(() => setOpen(false), 300) // transition хугацаанд DOM-оос хасах
    }, 2000)
  }

//   Mobile touch
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    setDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || startY === null) return
    const diff = e.touches[0].clientY - startY
    if (diff < 0) setDragY(diff) // дээш swipe
  }

  const handleTouchEnd = () => {
    if (dragY < -50) { // 50px дээш swipe
      setVisible(false)
      setTimeout(() => setOpen(false), 300)
    }
    setDragY(0)
    setDragging(false)
    setStartY(null)
  }

  return (
    <ToastContext.Provider value={{ message, showToast }}>
      {children}

      {open && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
          <div
            className={`
              transform transition-all duration-300 ease-in-out
              ${visible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}
              flex items-center justify-between bg-background/90 rounded-xl shadow-lg border px-4 py-3
            `}
            style={{ transform: `translateY(${dragY}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Message */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/90">
                {message}
              </span>
            </div>

            {/* Close */}
            <X
              size={18}
              className="text-gray-500 cursor-pointer"
              onClick={() => setVisible(false)}
            />
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used inside ToastProvider")
  return context
}