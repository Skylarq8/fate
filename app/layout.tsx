import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { HeroHeader } from "@/components/header";
import Galaxy from "@/components/Galaxy";

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "FATE",
  description: "FATE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}>
              <div className="fixed inset-0 -z-10">
                    <Galaxy 
                      mouseRepulsion
                      mouseInteraction
                      density={1}
                      glowIntensity={0.3}
                      saturation={0}
                      hueShift={140}
                      twinkleIntensity={0.3}
                      rotationSpeed={0.1}
                      repulsionStrength={1.2}
                      autoCenterRepulsion={0}
                      starSpeed={0.5}
                      speed={1}/>
              </div>

              {/* 📦 CONTENT */}
              <HeroHeader />

              {/* <main className="relative z-10">
                {children}
              </main> */}
              <main className="flex-1 w-full">
                <div className="max-w-350 mx-auto px-5 sm:px-10 lg:px-34 py-6 pt-18 sm:pt-24">
                  {children}
                </div>
              </main>
      </body>
    </html>
  );
}
