"use client";

import { Phone, Mail, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer id="about" className="text-white py-8 px-4 mt-3">
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left lg:mt-10">
        {/* Contact info */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">Холбоо барих</h3>
        <div className="flex items-center justify-center space-x-2">
            <Phone size={18} />
            <span>+976 55152711</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
            <Phone size={18} />
            <span>+976 90304878</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
            <Mail size={18} />
            <span>info@ecommerce.mn</span>
        </div>
        </div>

        {/* Social links */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">Social</h3>
        <div className="flex justify-center space-x-4">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
            <Facebook size={25} className="hover:text-blue-500 transition-colors" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            <Instagram size={25} className="hover:text-pink-500 transition-colors" />
            </a>
        </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">Бусад</h3>
        <a href="/" className="hover:text-gray-400 transition-colors">FAQ</a>
        <a href="/" className="hover:text-gray-400 transition-colors">Захиалга</a>
        {/* <a href="/" className="hover:text-gray-400 transition-colors">Буцаалт</a> */}
        </div>

        {/* Description */}
        <div className="flex flex-col items-center sm:items-start space-y-2">
        <h3 className="font-bold text-lg mb-2">FATE Ecommerce</h3>
        <p className="text-gray-400 text-sm">
            © 2026 E-commerce. Бүх эрх хуулиар хамгаалагдсан.
        </p>
        </div>
    </div>
    </footer>
  );
}