"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function ScrollToTop() {
  const pathname = usePathname()
  const isPopNav = useRef(false)

  useEffect(() => {
    history.scrollRestoration = "manual"

    const onPopState = () => {
      isPopNav.current = true
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  // Scroll position хадгалах + явахдаа visited тэмдэглэх
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY))
    }
    window.addEventListener("scroll", save, { passive: true })
    return () => window.removeEventListener("scroll", save)
  }, [pathname])

  // Route солигдоход: back бол restore, шинэ бол top
  useEffect(() => {
    if (isPopNav.current) {
      const saved = sessionStorage.getItem(`scroll:${pathname}`)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved ? parseInt(saved) : 0, behavior: "instant" })
        })
      })
      isPopNav.current = false
    } else {
      window.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [pathname])

  return null
}
