import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowUpRight,
  Crown,
  Flame,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Tesla3DConfigurator } from '@/components/tesla-3d-configurator'

export const metadata = {
  title: 'Tesla 3D Studio & Configurator | Next-Gen Roadster SpaceX Package',
  description:
    'Experience the 3D interactive Next-Gen Tesla Roadster with SpaceX cold-gas thrusters. Orbit, inspect aerodynamic downforce channels, and customize multi-coat finishes.',
}

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
      {/* ── Top Navigation Bar ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-10">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/tesla-seeklogo.png"
                alt="Tesla Capital"
                width={70}
                height={14}
                className="h-3.5 w-auto brightness-0 invert"
              />
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-white">
                3D STUDIO
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/inventory"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-white transition-colors"
            >
              <span>Inventory</span>
            </Link>
            <Link
              href="/investments"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-white transition-colors"
            >
              <span>Investments</span>
            </Link>
            <Link
              href="/vip"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold text-primary uppercase tracking-wider"
            >
              <Crown size={12} />
              <span>VIP Privilege Active</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Studio Container ──────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Hero Banner */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-red-400">
            <Sparkles size={11} />
            <span>Interactive 3D Configurator • Physically Based Rendering</span>
          </div>
          <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
                Roadster <span className="text-primary">SpaceX Package</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                Interact directly with the titanium-composite spaceframe, cold-gas thruster nozzles, and multi-layer metallic automotive coats. Rotate 360°, inspect the aero downforce diffuser, and ignite the RCS thrusters.
              </p>
            </div>

            {/* VIP Discount Badge */}
            <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-gradient-to-r from-red-950/40 to-black p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-primary text-white">
                <Crown size={20} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                  Platinum Member Discount
                </p>
                <p className="text-sm font-bold text-white">15% Off Vehicle & Allocations</p>
                <p className="font-mono text-[10px] text-white/50">$212,500 vs $250,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3D Configurator Canvas ─────────────────────────────────── */}
        <Tesla3DConfigurator initialColor="ultra-red" />

        {/* ── Aerodynamics & Propulsion Deep Dive ────────────────────── */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="grid size-10 place-items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Rocket size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Cold-Gas RCS Propulsion</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Ten composite-overwrapped pressure vessels (COPV) stored at 10,000 PSI channel supersonic nitrogen through vectoring nozzles to counteract inertia and generate instantaneous acceleration.
            </p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider">
                0–60 MPH in 0.95 Seconds
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="grid size-10 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Zap size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Vacuum Downforce Fans</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Integrated underbody suction turbines evacuate air beneath the chassis, generating 4,200 lbs of negative ground pressure at standstill to enable wall-scaling cornering g-forces.
            </p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <span className="font-mono text-[10px] text-primary uppercase tracking-wider">
                4,200 LBS Constant Vacuum Downforce
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="grid size-10 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Layers size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Sub-100ms Jump Clearance</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Downward-facing high-thrust vectoring allows controlled vertical hops up to 6.5 feet, clearing roadway debris or track obstacles with automatic radar clearance sensing.
            </p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                6.5 FT Automated Hop Clearance
              </span>
            </div>
          </div>
        </div>

        {/* ── Specs Comparison Matrix ────────────────────────────────── */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Engineering Blueprint
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">Chassis & Powertrain Matrix</h2>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/inventory/d0100000-0000-4000-8000-000000000001"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-red-950/40"
              >
                <span>Reserve Chassis</span>
                <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <Flame size={14} className="text-orange-400" />
                <span>Chassis #001 Auction</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="py-3 pr-4 font-normal uppercase tracking-wider">Metric</th>
                  <th className="py-3 px-4 font-normal uppercase tracking-wider text-white/80">
                    Standard Roadster
                  </th>
                  <th className="py-3 pl-4 font-bold uppercase tracking-wider text-primary">
                    SpaceX Package (Founders)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr>
                  <td className="py-3.5 pr-4 text-white/50">0–60 MPH</td>
                  <td className="py-3.5 px-4">1.9 Seconds</td>
                  <td className="py-3.5 pl-4 font-bold text-primary">&lt; 0.95 Seconds (RCS Assist)</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-white/50">Top Speed</td>
                  <td className="py-3.5 px-4">&gt; 250 MPH</td>
                  <td className="py-3.5 pl-4 font-bold text-white">&gt; 250 MPH (Sustained Downforce)</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-white/50">Propulsion System</td>
                  <td className="py-3.5 px-4">Tri-Motor All-Wheel Drive</td>
                  <td className="py-3.5 pl-4 font-bold text-cyan-400">
                    Tri-Motor + 10 SpaceX Cold-Gas Thrusters
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-white/50">Downforce Mechanism</td>
                  <td className="py-3.5 px-4">Active Rear Spoiler</td>
                  <td className="py-3.5 pl-4 font-bold text-white">
                    4,200 LBS High-Vacuum Ground Fans
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-white/50">Vertical Hop Clearance</td>
                  <td className="py-3.5 px-4">N/A</td>
                  <td className="py-3.5 pl-4 font-bold text-amber-400">Up to 6.5 FT (Automated)</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-white/50">Retail Allocation</td>
                  <td className="py-3.5 px-4">$200,000</td>
                  <td className="py-3.5 pl-4 font-bold text-white">
                    $250,000{' '}
                    <span className="text-emerald-400">($212,500 with 15% VIP Privilege)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
