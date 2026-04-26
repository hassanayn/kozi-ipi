import Image from "next/image"
import Link from "next/link"

import { SearchIcon } from "@/components/search/search-icons"

export function VyuoHeader() {
  return (
    <header className="border-b border-brand-ink/8">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Kozi Ipi home">
          <Image
            src="/kozi-ipi-logo.png"
            alt="Kozi Ipi"
            width={36}
            height={36}
            priority
            className="size-9"
          />
          <span className="text-[15px] font-semibold tracking-tight">Kozi Ipi</span>
          <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
            Beta
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-[13.5px] font-medium text-brand-ink/70 md:gap-7">
          <Link href="/search" className="transition hover:text-brand-blue">
            Kozi
          </Link>
          <Link href="/vyuo" className="relative text-brand-ink">
            Vyuo
            <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-brand-blue" />
          </Link>
        </nav>
        <Link
          href="/search"
          aria-label="Search programmes"
          className="grid size-10 place-items-center rounded-full text-brand-ink transition-colors hover:bg-brand-ink/5 md:hidden"
        >
          <SearchIcon className="size-[18px]" />
        </Link>
      </div>
    </header>
  )
}
