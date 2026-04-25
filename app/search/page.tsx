import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"

import { SearchResultsClient } from "@/components/search/search-results-client"

export default function SearchPage() {
  return (
    <main className="min-h-svh bg-white text-brand-ink">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-6 py-6 sm:px-10 lg:px-12">
        <header className="flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label="Kozi Ipi home" className="inline-flex items-center gap-3">
            <Image
              src="/kozi-ipi-logo.png"
              alt="Kozi Ipi"
              width={44}
              height={44}
              priority
              className="size-11"
            />
            <span className="text-sm font-semibold">Kozi Ipi</span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-brand-ink/10 px-4 py-2 text-sm font-medium text-brand-ink/75 transition hover:border-brand-blue hover:text-brand-blue"
          >
            Home
          </Link>
        </header>

        <section className="rounded-[2rem] border border-brand-ink/10 bg-[#fbfbfb] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Search results
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Find programmes that match what you typed.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-brand-ink/65">
            Start with discovery. Eligibility labels will come later after the student adds grades.
          </p>
        </section>

        <Suspense
          fallback={
            <div className="rounded-[1.5rem] border border-brand-ink/10 bg-white p-8 text-brand-ink/60">
              Loading search...
            </div>
          }
        >
          <SearchResultsClient />
        </Suspense>
      </div>
    </main>
  )
}
