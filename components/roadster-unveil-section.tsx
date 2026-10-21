'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Flame, Rocket, Zap } from 'lucide-react'

export function RoadsterUnveilSection() {
  return (
    <section
      id="roadster-unveil"
      className="relative border-b border-border bg-black text-white overflow-hidden py-20 md:py-28 scroll-mt-20"
    >
      {/* Subtle radial ambient background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-red-600/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-ping" />
            October 2026 • SpaceX Package
          </div>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Flight meets the road.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
            SpaceX-derived cold-gas thrusters and high-vacuum ground-effect fans allow short-duration hops, wall-scaling grip, and sub-1.0s acceleration.
          </p>
        </div>

        {/* Minimalist Cinematic Display */}
        <div className="mt-10 relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          <div className="relative aspect-[16/9] w-full max-h-[500px]">
            <Image
              src="/roadster-spacex-hero.jpg"
              alt="Next-Gen Tesla Roadster with SpaceX Package"
              fill
              className="object-cover object-center brightness-95 contrast-105"
              priority
            />
            {/* Subtle Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            {/* Floating Subtle Spec Pill on Image */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-white/15 bg-black/75 px-5 py-3 backdrop-blur-md">
                <div>
                  <p className="font-mono text-2xl font-bold text-white">&lt; 0.95s</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-white/50">0–60 MPH</p>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <p className="font-mono text-2xl font-bold text-white">10</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-white/50">RCS Thrusters</p>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <p className="font-mono text-2xl font-bold text-white">4,200 <span className="text-xs font-normal text-white/60">lbs</span></p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-white/50">Vacuum Downforce</p>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <p className="font-mono text-2xl font-bold text-white">6.5 <span className="text-xs font-normal text-white/60">ft</span></p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-white/50">Jump Clearance</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/investments"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-mono text-xs font-bold text-white hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-red-950/50"
                >
                  <Zap size={14} />
                  <span>Early Allocation</span>
                  <ArrowUpRight size={14} />
                </Link>
                <Link
                  href="/auctions"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/60 px-5 py-3 font-mono text-xs font-bold text-white hover:bg-white/10 active:scale-95 transition-all backdrop-blur-md"
                >
                  <Flame size={14} className="text-orange-400" />
                  <span>Chassis #001 Auction</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
