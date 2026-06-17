import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentDash — Career & Compensation Intelligence",
  description: "Access structured, comparable, decision-ready career and salary intelligence at internet scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg font-sans">
        {/* Premium Sticky Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-white/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/salaries" className="flex items-center space-x-1.5 hover:opacity-90 transition-opacity">
              <span className="text-xl font-extrabold text-brand-black tracking-tight">
                Talent<span className="text-brand-coral bg-clip-text">Dash</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-coral"></span>
            </Link>

            {/* Navigation & Action CTAs */}
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link
                  href="/salaries"
                  className="text-sm font-semibold text-brand-dark hover:text-brand-black transition-colors"
                >
                  Salaries
                </Link>
                <Link
                  href="/compare"
                  className="text-sm font-semibold text-brand-dark hover:text-brand-black transition-colors"
                >
                  Compare
                </Link>
              </nav>
              <div className="hidden sm:flex items-center">
                <span className="h-4 w-px bg-brand-border mr-6"></span>
                <Link
                  href="/salaries"
                  className="inline-flex items-center justify-center px-4 py-2 border border-brand-border text-xs font-bold rounded-full bg-white text-brand-black hover:bg-brand-bg hover:border-brand-dark transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                >
                  Contribute Salary
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Content container */}
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}
