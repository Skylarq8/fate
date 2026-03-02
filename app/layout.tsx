import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Galaxy from "@/components/Galaxy";
import { HeroHeader } from "@/components/header";

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
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange>
              <div className="fixed inset-0 -z-10">
                <Galaxy
                  mouseRepulsion
                  mouseInteraction
                  density={1}
                  glowIntensity={0.3}
                  saturation={0}
                  hueShift={140}
                  twinkleIntensity={0.3}
                  rotationSpeed={0.05}
                  repulsionStrength={0.5}
                  autoCenterRepulsion={0}
                  starSpeed={0.5}
                  speed={1.2}
                />
              </div>

              {/* 📦 CONTENT */}
              <HeroHeader />

              <main className="relative z-10">
                {children}
              </main>
          </ThemeProvider>
      </body>
    </html>
  );
}
