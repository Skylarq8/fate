"use client";

import { Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa"
export default function Footer() {
  return (
    <footer id="about" className="text-white mt-3">
    <div className="py-8 px-4">
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left lg:mt-10">
        {/* Contact info */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">Холбоо барих</h3>
        <a href="tel:90304878" className="flex items-center justify-center space-x-2">
            <Phone size={18} />
            <span>+976 99274080</span>
        </a>
        {/* <a href="tel:55152711" className="flex items-center justify-center space-x-2">
            <Phone size={18} />
            <span>+976 55152711</span>
        </a> */}
        <div className="flex items-center justify-center space-x-2">
            <Mail size={18} />
            <span>fatestore8@gmail.com</span>
        </div>
        </div>

        {/* Social links */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">Social</h3>
        <div className="flex justify-center space-x-4">
            {/* <a href="https://www.facebook.com/share/14b1zgNwsuF/" target="_blank" rel="noreferrer">
            <FaFacebook size={23} className="hover:text-blue-500 transition-colors" />
            </a> */}
            <a href="https://www.instagram.com/the_fate8?utm_source=ig_web_button_share_sheet" target="_blank" rel="noreferrer">
            <FaInstagram size={23} className="hover:text-pink-500 transition-colors" />
            </a>
            {/* <a href="https://www.tiktok.com/@fate.store78?_r=1&_t=ZS-95HhgpJ0hlt" target="_blank" rel="noreferrer">
            <FaTiktok size={23} className="hover:text-white transition-colors" />
            </a> */}
        </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">Бусад</h3>
        <a href="/" className="hover:text-gray-300 transition-colors">FAQ</a>
        <a href="/" className="hover:text-gray-300 transition-colors">Захиалга</a>
        {/* <a href="/" className="hover:text-gray-400 transition-colors">Буцаалт</a> */}
        </div>

        {/* Description */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">FATE Ecommerce</h3>
        <p className="text-gray-200 text-sm">
            © 2026 E-commerce. Бүх эрх хуулиар хамгаалагдсан.
        </p>
        </div>
    </div>
    <a href="https://www.instagram.com/the_skylarq/">
        <div className="pt-4 text-center text-xs text-white/50">
        © 2026 FATE. Built by Skylarq.
        </div>
    </a>
    </div>
    </footer>
  );
}