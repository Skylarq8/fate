'use client'
import Link from 'next/link'
import { Heart, Menu, ShoppingCart, TextAlignJustify, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/context/WishlistContext'

const menuItems = [
    { name: 'Нүүр хуудас', href: '/' },
    { name: 'Онцлох бараа', href: '#link' },
    { name: 'Шинэ бараа', href: '#link' },
    { name: 'Бүх бараа', href: '/products' },
    { name: 'Бидний талаар', href: '#about'},
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const { wishlist } = useWishlist();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const [dark, setDark] = useState(false)
    const handleToggle = () => {
        setDark(!dark)
        if (!dark) {
        document.documentElement.classList.add('dark')
        } else {
        document.documentElement.classList.remove('dark')
        }
    }
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('fixed z-20 w-full px-2 transition-all duration-300', isScrolled && 'px-5')}>
                <div className={cn('mx-auto mt-0 max-w-306 px-3 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-b-2xl  md:rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-2.5 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2 text-white/90 font-heading font-semibold text-[22px] lg:text-[26px] lg:font-bold">
                                FATE
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden">
                                {/* <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" /> */}
                                <TextAlignJustify className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200"/>
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background/50 backdrop-blur-lg lg:backdrop-blur-none in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-0 rounded-xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="hidden lg:flex w-full flex-col space-y-3 lg:flex-row lg:gap-3 lg:space-y-0 lg:w-fit">
                            <Link href={`/wishlist`} className="relative">
                                <Button variant="outline">
                                <Heart className='h-[1.2rem] w-[1.2rem]'/>
                                </Button>
                                {/* {wishlist.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {wishlist.length}
                                </span>
                                )} */}
                            </Link>

                            <Link href={`/cart`} className="relative">
                                <Button variant="outline">
                                <ShoppingCart className='h-[1.2rem] w-[1.2rem]'/>
                                </Button>
                            </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
