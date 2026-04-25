"use client"

import { type FormEvent, useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"

const awardLevels = [
  { label: "All levels", value: "all" },
  { label: "Diploma", value: "ordinary diploma" },
  { label: "Degree", value: "degree" },
  { label: "Certificate", value: "certificate" },
]

const familyLabels: Record<string, string> = {
  engineering: "Engineering",
  health: "Afya",
  ICT: "Tech",
  business: "Biashara",
  education: "Education",
  tourism_hospitality: "Utalii",
  agriculture: "Agriculture",
}

function getInitialQuery(searchParams: URLSearchParams) {
  const query = searchParams.get("q")?.trim()
  const family = searchParams.get("family")?.trim()

  if (query) {
    return query
  }

  if (family) {
    return familyLabels[family] ?? family
  }

  return ""
}

function updateParams(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const nextParams = new URLSearchParams(searchParams.toString())

  for (const [key, value] of Object.entries(updates)) {
    if (!value || value === "all" || value === "false") {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }
  }

  return nextParams
}

function statusTone(status?: string) {
  if (status === "yes") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (status === "no") {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }

  return "border-brand-ink/10 bg-brand-ink/[0.04] text-brand-ink/60"
}

export function SearchResultsClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryFromUrl = getInitialQuery(searchParams)
  const [query, setQuery] = useState(queryFromUrl)

  const family = searchParams.get("family") ?? undefined
  const awardLevel = searchParams.get("level") ?? "all"
  const formFourOnly = searchParams.get("formFour") === "yes"

  const filters = useMemo(() => {
    return {
      ...(family ? { courseFamily: family } : {}),
      ...(awardLevel !== "all" ? { awardLevel } : {}),
    }
  }, [awardLevel, family])

  const hasFilters = Boolean(family) || awardLevel !== "all" || formFourOnly
  const activeQuery = queryFromUrl

  const searchArgs = activeQuery
    ? {
        query: activeQuery,
        filters: hasFilters ? filters : undefined,
        formFourOnly,
        limit: 20,
      }
    : "skip"

  const countArgs = activeQuery
    ? {
        query: activeQuery,
        filters: hasFilters ? filters : undefined,
        formFourOnly,
        maxCount: 1000,
      }
    : "skip"

  const search = useQuery(api.programmes.smartSearch, searchArgs)
  const count = useQuery(api.programmes.smartSearchCount, countArgs)
  const isLoading = activeQuery && (search === undefined || count === undefined)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextQuery = query.trim()
    if (!nextQuery) {
      return
    }

    const nextParams = updateParams(searchParams, { q: nextQuery })
    router.push(`${pathname}?${nextParams.toString()}`)
  }

  function setFilter(key: "formFour" | "level", value: string) {
    const nextParams = updateParams(searchParams, { [key]: value })
    router.push(`${pathname}?${nextParams.toString()}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="h-fit rounded-[1.5rem] border border-brand-ink/10 bg-white p-4 lg:sticky lg:top-6">
        <p className="text-sm font-semibold text-brand-ink">Filters</p>
        <div className="mt-4 grid gap-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-brand-ink/10 px-4 py-3 text-sm text-brand-ink/75 transition hover:border-brand-blue/40">
            <input
              checked={formFourOnly}
              className="size-4 accent-[var(--brand-blue)]"
              onChange={(event) => setFilter("formFour", event.target.checked ? "yes" : "false")}
              type="checkbox"
            />
            Form Four direct only
          </label>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink/45">
              Level
            </label>
            <select
              className="mt-2 h-11 w-full rounded-2xl border border-brand-ink/10 bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-blue"
              onChange={(event) => setFilter("level", event.target.value)}
              value={awardLevel}
            >
              {awardLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <form
          className="flex w-full flex-col gap-2 rounded-3xl border border-brand-ink/10 bg-white p-2 shadow-[0_18px_38px_-22px_rgba(15,15,18,0.25)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full"
          onSubmit={submitSearch}
        >
          <label className="flex flex-1 items-center gap-3 px-4">
            <span className="sr-only">Search programmes</span>
            <SearchIcon className="size-[18px] shrink-0 text-brand-ink/55" />
            <input
              aria-label="Search programmes"
              className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-brand-ink/40"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tafuta kozi, chuo, career path..."
              value={query}
            />
          </label>
          <Button
            type="submit"
            size="lg"
            className="h-12 shrink-0 rounded-full bg-brand-blue px-7 text-[14px] font-semibold text-white hover:bg-brand-blue-deep"
          >
            Tafuta
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 border-b border-brand-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-blue">
              {isLoading ? "Searching..." : `${count?.count ?? 0}${count?.capped ? "+" : ""} matches`}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Results for “{activeQuery || "programmes"}”
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {search?.interpreted.inferredCourseFamily ? (
              <span className="rounded-full bg-brand-blue/10 px-3 py-1.5 font-medium text-brand-blue">
                {search.interpreted.inferredCourseFamily}
              </span>
            ) : null}
            {formFourOnly ? (
              <span className="rounded-full bg-brand-yellow/25 px-3 py-1.5 font-medium text-brand-ink">
                Form Four direct
              </span>
            ) : null}
            {awardLevel !== "all" ? (
              <span className="rounded-full bg-brand-ink/[0.06] px-3 py-1.5 font-medium text-brand-ink/70">
                {awardLevel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {!activeQuery ? (
            <EmptyState />
          ) : isLoading ? (
            <LoadingState />
          ) : search?.results.length ? (
            search.results.map((programme) => (
              <article
                className="rounded-[1.5rem] border border-brand-ink/10 bg-white p-5 transition hover:border-brand-blue/30 hover:shadow-[0_20px_50px_-30px_rgba(29,78,216,0.45)]"
                key={programme._id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold tracking-tight text-brand-ink">
                      {programme.programmeName}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-brand-ink/65">
                      {programme.institutionName}
                    </p>
                  </div>
                  <span className="w-fit shrink-0 rounded-full border border-brand-ink/10 px-3 py-1.5 text-xs font-medium text-brand-ink/65">
                    {programme.awardLevel}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  {programme.region ? (
                    <span className="rounded-full bg-brand-ink/[0.04] px-3 py-1.5 text-brand-ink/65">
                      {programme.region}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-brand-ink/[0.04] px-3 py-1.5 text-brand-ink/65">
                    {programme.regulator}
                  </span>
                  {programme.ownershipType ? (
                    <span className="rounded-full bg-brand-ink/[0.04] px-3 py-1.5 text-brand-ink/65">
                      {programme.ownershipType}
                    </span>
                  ) : null}
                  {programme.duration ? (
                    <span className="rounded-full bg-brand-ink/[0.04] px-3 py-1.5 text-brand-ink/65">
                      {programme.duration} years
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full border px-3 py-1.5 ${statusTone(
                      programme.suitableForFormFourLeaver,
                    )}`}
                  >
                    Form Four: {programme.suitableForFormFourLeaver}
                  </span>
                </div>

                {programme.minimumEntryRequirements ? (
                  <div className="mt-5 rounded-2xl bg-[#fafafa] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink/40">
                      Entry
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-brand-ink/70">
                      {programme.minimumEntryRequirements}
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-brand-ink/45">
                    Verified {programme.lastVerifiedDate}
                    {programme.needsReview ? " · needs review" : ""}
                  </p>
                  <button
                    className="rounded-full bg-brand-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue"
                    type="button"
                  >
                    View
                  </button>
                </div>
              </article>
            ))
          ) : (
            <EmptyState message="No matching programmes yet. Try a broader search or remove a filter." />
          )}
        </div>
      </section>
    </div>
  )
}

function EmptyState({ message = "Search a course, college, or career path to see results." }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-brand-ink/15 bg-white p-8 text-center">
      <p className="text-base font-semibold text-brand-ink">{message}</p>
      <p className="mt-2 text-sm text-brand-ink/55">
        Try “clinical medicine”, “civil engineering”, or “computer courses after Form Four”.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((item) => (
        <div
          className="h-48 animate-pulse rounded-[1.5rem] border border-brand-ink/10 bg-brand-ink/[0.03]"
          key={item}
        />
      ))}
    </div>
  )
}

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
