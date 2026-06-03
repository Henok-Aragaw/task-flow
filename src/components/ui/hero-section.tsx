'use client';

import Link from 'next/link';
import { Layers} from 'lucide-react';

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

export default function HeroSection({ isAuthenticated = false }: HeroSectionProps) {
  return (
    <section className="font-poppins relative w-full bg-linear-to-b from-primary via-primary/30 to-background text-sm pb-44 text-foreground overflow-hidden min-h-[90vh] flex flex-col justify-between">
      
      {/* Header Navigation: Logo + Text on Left, Sign In/Dashboard on Right */}
      <nav className="relative z-10 flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 md:py-6 w-full">
        <Link href="/" aria-label="TaskFlow home" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-white/90">
            TaskFlow
          </span>
        </Link>

        <div>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="bg-white text-primary hover:bg-white/90 px-6 py-2.5 rounded-full font-semibold shadow-sm hover:shadow transition active:scale-[0.98] text-xs md:text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="bg-white text-primary hover:bg-white/90 px-6 py-2.5 rounded-full font-semibold shadow-sm hover:shadow transition active:scale-[0.98] text-xs md:text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Body Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <h5 className="relative z-10 text-4xl md:text-7xl font-bold max-w-[850px] text-center mx-auto mt-20 md:mt-24 tracking-tight text-black leading-tight">
          Manage Projects and <br /> Tasks with TaskFlow
        </h5>

        <p className="relative z-10 text-sm md:text-base mx-auto max-w-2xl text-center mt-6 max-md:px-6 text-foreground/80 leading-relaxed font-normal">
          Organize workflows, track progress, and collaborate with your team
        </p>

        <div className="relative z-10 mx-auto w-full flex items-center justify-center gap-3 mt-8">
          <Link
            href={isAuthenticated ? "/dashboard" : "/sign-up"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3.5 rounded-full font-semibold shadow-md hover:shadow-lg transition active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
