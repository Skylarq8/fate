"use client"

import { Heart, X } from "lucide-react"

interface Props {
  message: string
  open: boolean
  onClose: () => void
}

export default function WishlistToast({ message, open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border px-4 py-3">

        {/* Icon + Text */}
        <div className="flex items-center gap-2">
          <Heart className="text-black shrink-0" size={20} />
          <span className="text-sm font-medium text-black">
            Hello world 
            {message}
          </span>
        </div>

        {/* Close */}
        <button onClick={onClose}>
          <X size={18} className="text-gray-500"/>
        </button>

      </div>
    </div>
  )
}