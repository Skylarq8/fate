// 📁 components/HeroHeader.tsx
'use client'

import Link from 'next/link'
import { Heart, Search, ShoppingCart, TextAlignJustify, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/context/WishlistContext'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { fmt, getProducts, primaryImage, Product } from '@/lib/api'
import Image from 'next/image'
import { createPortal } from 'react-dom'

const menuItems = [
  { name: 'Нүүр хуудас',  href: '/' },
  { name: 'Бүх бараа',    href: '/products' },
  { name: 'Бидний талаар', href: '#about' },
]

// ── Search overlay component ──────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query,       setQuery]       = useState("")
  const [results,     setResults]     = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [show,        setShow]        = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    getProducts().then(setAllProducts)
    requestAnimationFrame(() => setShow(true))
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    setResults(allProducts.filter(p => p.title.toLowerCase().includes(q)).slice(0, 6))
  }, [query, allProducts])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 200)
  }

  const handleSelect = (id: string) => {
    handleClose()
    router.push(`/products/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center pt-20 px-4"
      style={{ transition: 'opacity 0.2s', opacity: show ? 1 : 0 }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />

      {/* search box */}
      <div
        className="relative w-full max-w-xl z-10"
        style={{
          transition: 'transform 0.2s, opacity 0.2s',
          transform: show ? 'translateY(0)' : 'translateY(-16px)',
          opacity: show ? 1 : 0,
        }}
      >
        {/* input row */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3.5">
          <Search size={18} className="text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Бараа хайх..."
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-white/40 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors ml-1">
            <kbd className="text-xs border border-white/20 rounded px-1.5 py-0.5">Esc</kbd>
          </button>
        </div>

        {/* results */}
        {results.length > 0 && (
          <div className="mt-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {results.map(p => {
              const img   = primaryImage(p)
              const price = p.discountEnabled && p.finalPrice ? p.finalPrice : p.price
              return (
                <button key={p.id} onClick={() => handleSelect(p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                    {img
                      ? <Image src={img.url} alt={p.title} fill className="object-cover" />
                      : <div className="w-full h-full bg-white/10" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-white/50 text-xs">{fmt(price)}</p>
                      {p.discountEnabled && p.finalPrice && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                          -{Math.round((1 - p.finalPrice / p.price) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-white/20 text-xs">↗</span>
                </button>
              )
            })}
            <button
              onClick={() => { router.push(`/products`); handleClose() }}
              className="w-full text-center text-xs text-white/40 hover:text-white py-3 transition-colors">
              Бүх барааг харах →
            </button>
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="mt-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-4 text-center">
            <p className="text-white/40 text-sm">"{query}" — бараа олдсонгүй</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// ── Main header ───────────────────────────────────────────────────────────────
export const HeroHeader = () => {
  const [menuState,   setMenuState]   = React.useState(false)
  const [isScrolled,  setIsScrolled]  = React.useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const { wishlist } = useWishlist()
  const { items }    = useCartStore()

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartCount     = items.reduce((s, i) => s + i.quantity, 0)
  const wishlistCount = wishlist.length

  return (
    <>
      <header>
        <nav
          data-state={menuState && 'active'}
          className={cn('fixed z-20 w-full px-2 transition-all duration-300', isScrolled && 'px-5')}
        >
          <div className={cn(
            'mx-auto mt-0 max-w-306 px-3 transition-all duration-300 lg:px-12',
            isScrolled && 'bg-background/50 max-w-4xl rounded-b-2xl md:rounded-2xl border backdrop-blur-lg lg:px-5'
          )}>
            <div className="relative flex flex-wrap items-center justify-between gap-6 py-2.5 lg:gap-0 lg:py-4">

              {/* Mobile: menu + logo */}
              <div className="flex w-full justify-between lg:w-auto">
                <button
                  onClick={() => setMenuState(!menuState)}
                  className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
                >
                  <TextAlignJustify className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>

                <Link href="/"
                  className="flex items-center space-x-2 text-white/90 font-heading font-semibold text-[22px] lg:text-[26px] lg:font-bold">
                  FATE
                </Link>

                {/* Mobile: search + cart */}
                <div className="flex items-center gap-1 lg:hidden">
                  <button onClick={() => setSearchOpen(true)}
                    className="p-2 text-white/90 hover:text-white transition-colors">
                    <Search size={20} />
                  </button>
                </div>
              </div>

              {/* Desktop: center nav */}
              <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, i) => (
                    <li key={i}>
                      <Link href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desktop: right icons */}
              <div className="bg-background/50 backdrop-blur-lg lg:backdrop-blur-none in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-0 rounded-xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-3 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">

                {/* Mobile nav links */}
                <div className="lg:hidden">
                  <ul className="space-y-6 text-base">
                    {menuItems.map((item, i) => (
                      <li key={i}>
                        <Link href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150">
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desktop icons */}
                <div className="hidden lg:flex items-center gap-2">
                  {/* Search */}
                  <button onClick={() => setSearchOpen(true)}
                    className="text-white p-2 px-2.5 rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50">
                    <Search size={17}/>
                  </button>

                  {/* Wishlist */}
                  <Link href="/wishlist" className="relative">
                    <Button variant="outline">
                      <Heart className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Cart */}
                  <Link href="/cart" className="relative">
                    <Button variant="outline">
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                      <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Search overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}