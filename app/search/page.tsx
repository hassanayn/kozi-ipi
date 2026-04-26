import { Suspense } from "react"

import { SearchResultsClient } from "@/components/search/search-results-client"

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-svh bg-white p-8 text-brand-ink">
          <div className="mx-auto max-w-[1280px] rounded-2xl border border-brand-ink/10 bg-white p-8 text-brand-ink/60">
            Loading search...
          </div>
        </main>
      }
    >
      <SearchResultsClient />
    </Suspense>
  )
}
