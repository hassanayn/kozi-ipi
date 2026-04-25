"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const NAV = [
  { label: "Kozi", href: "#" },
  { label: "Vyuo", href: "#" },
  { label: "Career Paths", href: "#" },
  { label: "Compare", href: "#" },
  { label: "Quiz", href: "#" },
  { label: "Rasilimali", href: "#" },
]

const TRENDING = [
  "Computer Science",
  "Clinical Medicine",
  "Law",
  "Civil Engineering",
  "Accounting",
]

export function Hero() {
  return (
    <section
      className="relative min-h-svh w-full bg-brand-cream font-body text-brand-ink"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="mx-auto flex w-full max-w-[1320px] flex-col px-6 sm:px-10 lg:px-14">
        <SiteHeader />

        <div className="mt-10 grid grid-cols-1 items-center gap-12 pb-20 lg:mt-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-24">
          <HeroCopy />
          <HeroArtwork />
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────── Header ────────────────────────────── */

function SiteHeader() {
  return (
    <header className="flex h-20 items-center justify-between gap-6 lg:h-24">
      <a href="/" className="flex items-center gap-2.5" aria-label="Kozi Ipi home">
        <Image
          src="/kozi-ipi-logo.png"
          alt=""
          width={56}
          height={56}
          priority
          className="size-12 lg:size-14"
        />
        <span className="hidden flex-col leading-none sm:flex">
          <span
            className="text-[22px] font-extrabold tracking-[-0.02em] text-brand-blue"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Kozi Ipi
          </span>
          <span className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-brand-ink/60">
            KOZI YAKO, MAISHA YAKO.
          </span>
        </span>
      </a>

      <nav className="hidden items-center gap-8 lg:flex">
        {NAV.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group relative text-[14px] font-medium text-brand-ink/85 transition-colors hover:text-brand-blue"
          >
            {item.label}
            <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-brand-blue transition-[width] duration-300 group-hover:w-full" />
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button
          aria-label="Search"
          className="grid size-10 place-items-center rounded-full text-brand-ink transition-colors hover:bg-black/5"
        >
          <SearchIcon className="size-[18px]" />
        </button>
        <Button
          size="lg"
          className="h-11 rounded-full bg-brand-ink px-5 text-[13px] font-semibold text-white hover:bg-brand-ink/90"
        >
          <UserIcon className="size-4" />
          Ingia / Jiunge
        </Button>
      </div>
    </header>
  )
}

/* ───────────────────────────── Hero copy ───────────────────────────── */

function HeroCopy() {
  return (
    <div className="relative">
      <h1 className="relative">
        <span className="sr-only">Oyaaa, kozi ipi unachukua?</span>
        <Image
          src="/oyaaa-headline.png"
          alt=""
          width={1448}
          height={1086}
          priority
          aria-hidden
          className="h-auto w-full max-w-[34rem] select-none"
        />
      </h1>

      <p
        className="mt-7 max-w-[36rem] text-[15.5px] leading-[1.7] text-brand-ink/70 sm:text-base"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Jukwaa lako la kugundua kozi, vyuo, levels na career paths baada ya Form
        Four. Chagua smart, jenga kesho yako.
      </p>

      <SearchBar className="mt-9" />

      <div className="mt-7 flex flex-wrap items-center gap-2.5 text-[13px]">
        <span className="font-semibold text-brand-ink">Trending:</span>
        {TRENDING.map((t) => (
          <a
            key={t}
            href="#"
            className="rounded-full border border-brand-ink/15 bg-white/70 px-3.5 py-1.5 text-brand-ink/75 transition-colors hover:border-brand-blue hover:bg-brand-blue hover:text-white"
          >
            {t}
          </a>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────────── Search bar ──────────────────────────── */

function SearchBar({ className = "" }: { className?: string }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={`flex w-full max-w-[40rem] flex-col gap-2 rounded-3xl border border-brand-ink/10 bg-white p-2 shadow-[0_18px_38px_-22px_rgba(15,15,18,0.25)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full ${className}`}
    >
      <label className="flex flex-1 items-center gap-3 px-4">
        <SearchIcon className="size-[18px] shrink-0 text-brand-ink/55" />
        <Input
          variant="ghost"
          size="xl"
          placeholder="Tafuta kozi, chuo, career path..."
          className="h-12 border-0 bg-transparent px-0 text-[15px] shadow-none placeholder:text-brand-ink/40 focus-visible:ring-0"
        />
      </label>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden h-7 w-px bg-brand-ink/10 sm:block" />
        <button
          type="button"
          className="flex h-12 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-brand-ink/80 transition-colors hover:bg-brand-ink/5"
        >
          <PinIcon className="size-[15px]" />
          Tanzania
          <ChevronIcon className="size-[14px] text-brand-ink/55" />
        </button>
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-full bg-brand-blue px-7 text-[14px] font-semibold text-white hover:bg-brand-blue-deep"
        >
          Tafuta
        </Button>
      </div>
    </form>
  )
}

/* ─────────────────────────── Hero artwork ─────────────────────────── */

function HeroArtwork() {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src="/hero-students.png"
          alt="Three Tanzanian students looking ahead"
          fill
          priority
          sizes="(min-width: 1024px) 640px, 90vw"
          className="object-contain"
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────── Icons ─────────────────────────────── */

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={12} cy={8} r={4} />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
      <circle cx={12} cy={9} r={2.5} />
    </svg>
  )
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

