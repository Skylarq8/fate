"use client";

import { Phone, Mail } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="about" className="text-white mt-6">
      {/* Top separator */}
      <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mx-4" />

      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-sm">

            {/* Brand */}
            <div className="col-span-2 lg:col-span-1 space-y-2">
              <p className="font-black text-2xl tracking-tight text-white">FATE</p>
              <p className="text-white/35 text-[13px] leading-relaxed">
                Монголын шилдэг онлайн дэлгүүр.<br />Чанар, хурд, найдвартай байдал.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-white/80 text-xs uppercase tracking-widest mb-3">Холбоо барих</h3>
              <a
                href="tel:+97699274080"
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
              >
                <Phone size={14} className="shrink-0" />
                <span>+976 99274080</span>
              </a>
              <div className="flex items-center gap-2 text-white/50">
                <Mail size={14} className="shrink-0" />
                <span>fatestore8@gmail.com</span>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-white/80 text-xs uppercase tracking-widest mb-3">Сошиал</h3>
              <a
                href="https://www.instagram.com/the_fate8?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-pink-400 transition-colors"
              >
                <FaInstagram size={15} />
                <span>Instagram</span>
              </a>
            </div>

            {/* Links */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-white/80 text-xs uppercase tracking-widest mb-3">Бусад</h3>
              <a href="/" className="block text-white/50 hover:text-white transition-colors">FAQ</a>
              <a href="/" className="block text-white/50 hover:text-white transition-colors">Захиалга</a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-5 pt-5 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/25 text-[12px]">© 2026 FATE. Бүх эрх хуулиар хамгаалагдсан.</p>
            <a
              href="https://www.instagram.com/the_skylarq/"
              className="text-white/20 hover:text-white/50 text-[12px] transition-colors"
            >
              Built by Skylarq
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
