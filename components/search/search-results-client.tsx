"use client"

import Image from "next/image"
import Link from "next/link"
import { type FormEvent, useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { api } from "@/convex/_generated/api"

const courseFamilies = [
  { key: "engineering", label: "Engineering", swahili: "Uhandisi", mark: "⚙" },
  { key: "health", label: "Afya", swahili: "Health", mark: "✚" },
  { key: "ICT", label: "Tech", swahili: "Teknolojia", mark: "</>" },
  { key: "business", label: "Biashara", swahili: "Business", mark: "$" },
  { key: "education", label: "Education", swahili: "Elimu", mark: "✎" },
  { key: "tourism_hospitality", label: "Utalii", swahili: "Tourism", mark: "✈" },
]

const awardLevels = [
  { label: "All levels", value: "all" },
  { label: "Diploma", value: "ordinary diploma", duration: "2-3 yrs" },
  { label: "Degree", value: "degree", duration: "3-5 yrs" },
  { label: "Certificate", value: "certificate", duration: "1 yr" },
]

const regions = [
  "Dar es Salaam",
  "Arusha",
  "Mwanza",
  "Dodoma",
  "Kilimanjaro",
  "Mbeya",
  "Iringa",
  "Tanga",
  "Morogoro",
  "Zanzibar Urban/West",
]

const trendingQueries = [
  "Clinical medicine",
  "Civil engineering",
  "Computer science",
  "Nataka kuwa nurse",
  "Hotel management",
]

const familyLabels = Object.fromEntries(courseFamilies.map((family) => [family.key, family.label]))

function getInitialQuery(searchParams: URLSearchParams) {
  const query = searchParams.get("q")?.trim()
  const family = searchParams.get("family")?.trim()

  if (query) {
    return query
  }

  if (family) {
    return familyLabels[family] ?? family
  }

  return "clinical medicine"
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

function familyMeta(key?: string) {
  return courseFamilies.find((family) => family.key === key) ?? {
    key: key ?? "other",
    label: key ?? "Other",
    swahili: "",
    mark: "•",
  }
}

function formFourLabel(value?: string) {
  if (value === "yes") {
    return "Form Four direct"
  }

  if (value === "no") {
    return "A-level required"
  }

  return "Verify entry route"
}

type ActiveFilter = {
  key: string
  label: string
  clear: () => void
}

function isActiveFilter(filter: ActiveFilter | false | "" | undefined): filter is ActiveFilter {
  return Boolean(filter)
}

export function SearchResultsClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryFromUrl = getInitialQuery(searchParams)
  const [query, setQuery] = useState(queryFromUrl)

  const family = searchParams.get("family") ?? undefined
  const awardLevel = searchParams.get("level") ?? "all"
  const region = searchParams.get("region") ?? ""
  const formFourOnly = searchParams.get("formFour") === "yes"

  const filters = useMemo(() => {
    return {
      ...(family ? { courseFamily: family } : {}),
      ...(awardLevel !== "all" ? { awardLevel } : {}),
      ...(region ? { region } : {}),
    }
  }, [awardLevel, family, region])

  const activeQuery = queryFromUrl
  const hasFilters = Boolean(family) || awardLevel !== "all" || Boolean(region) || formFourOnly

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
  const isResultsLoading = activeQuery && search === undefined
  const isCountLoading = activeQuery && count === undefined

  const inferredFamily = search?.interpreted.inferredCourseFamily
  const activeFilters = [
    family && {
      key: "family",
      label: familyMeta(family).label,
      clear: () => setFilter("family", null),
    },
    awardLevel !== "all" && {
      key: "level",
      label: awardLevels.find((level) => level.value === awardLevel)?.label ?? awardLevel,
      clear: () => setFilter("level", "all"),
    },
    region && {
      key: "region",
      label: region,
      clear: () => setFilter("region", null),
    },
    formFourOnly && {
      key: "formFour",
      label: "Form Four direct",
      clear: () => setFilter("formFour", "false"),
    },
  ].filter(isActiveFilter)

  function routeWith(nextParams: URLSearchParams) {
    const queryString = nextParams.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  function setFilter(key: "family" | "formFour" | "level" | "region", value: string | null) {
    routeWith(updateParams(searchParams, { [key]: value }))
  }

  function clearAllFilters() {
    routeWith(
      updateParams(searchParams, {
        family: null,
        formFour: null,
        level: null,
        region: null,
      }),
    )
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextQuery = query.trim()
    if (!nextQuery) {
      return
    }

    routeWith(updateParams(searchParams, { q: nextQuery }))
  }

  function runTrending(nextQuery: string) {
    setQuery(nextQuery)
    routeWith(updateParams(searchParams, { q: nextQuery }))
  }

  return (
    <main className="min-h-screen bg-white text-brand-ink">
      <header className="border-b border-brand-ink/8">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-6 sm:px-8">
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
          </Link>

          <nav className="hidden items-center gap-7 text-[13.5px] font-medium text-brand-ink/70 md:flex">
            <Link href="/search" className="text-brand-ink">
              Kozi
            </Link>
            <Link href="/search" className="transition hover:text-brand-blue">
              Vyuo
            </Link>
            <Link href="/search" className="transition hover:text-brand-blue">
              Career Paths
            </Link>
            <Link href="/search" className="transition hover:text-brand-blue">
              Compare
            </Link>
            <Link href="/search" className="transition hover:text-brand-blue">
              Quiz
            </Link>
          </nav>

          <button className="h-10 rounded-full bg-brand-ink px-5 text-[13px] font-semibold text-white">
            Ingia / Jiunge
          </button>
        </div>
      </header>

      <section className="border-b border-brand-ink/8 bg-[#fbfbfb]">
        <div className="mx-auto max-w-[1280px] px-6 py-7 sm:px-8">
          <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.18em] text-brand-blue">
            <span className="font-semibold">Search</span>
            <span className="h-px flex-1 bg-brand-blue/20" />
          </div>

          <h1 className="mt-3 max-w-3xl text-[34px] font-bold leading-[1.1] tracking-tight">
            Tafuta kozi inayokufaa baada ya Form Four.
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-brand-ink/65">
            Andika kozi, chuo, au career path. Tutakuonyesha programmes zinazokulingana.
          </p>

          <form
            className="mt-6 flex w-full max-w-3xl flex-col gap-2 rounded-3xl border border-brand-ink/10 bg-white p-2 shadow-[0_18px_38px_-22px_rgba(15,15,18,0.25)] sm:flex-row sm:items-center sm:rounded-full"
            onSubmit={submitSearch}
          >
            <label className="flex flex-1 items-center gap-3 px-4">
              <span className="sr-only">Tafuta kozi, chuo, career path</span>
              <SearchIcon className="size-[18px] shrink-0 text-brand-ink/55" />
              <input
                aria-label="Tafuta kozi, chuo, career path"
                className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-brand-ink/40"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tafuta kozi, chuo, career path..."
                value={query}
              />
              {query ? (
                <button
                  className="grid size-7 place-items-center rounded-full text-brand-ink/40 transition hover:bg-brand-ink/5 hover:text-brand-ink"
                  onClick={() => setQuery("")}
                  type="button"
                  aria-label="Clear search"
                >
                  <XIcon className="size-4" />
                </button>
              ) : null}
            </label>
            <button
              className="h-12 shrink-0 rounded-full bg-brand-blue px-7 text-[14px] font-semibold text-white transition hover:bg-brand-blue-deep"
              type="submit"
            >
              Tafuta
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px]">
            <span className="font-semibold text-brand-ink/60">Trending:</span>
            {trendingQueries.map((trending) => (
              <button
                className="rounded-full border border-brand-ink/15 bg-white px-3 py-1.5 text-brand-ink/70 transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
                key={trending}
                onClick={() => runTrending(trending)}
                type="button"
              >
                {trending}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[19rem_1fr]">
        <aside className="h-fit lg:sticky lg:top-6">
          <div className="rounded-2xl border border-brand-ink/10 bg-white">
            <div className="flex items-center justify-between border-b border-brand-ink/8 px-5 py-4">
              <p className="text-[13px] font-semibold tracking-tight">Filters</p>
              {activeFilters.length > 0 ? (
                <button
                  className="text-[12px] font-medium text-brand-blue hover:underline"
                  onClick={clearAllFilters}
                  type="button"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="border-b border-brand-ink/8 px-5 py-5">
              <button
                className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
                onClick={() => setFilter("formFour", formFourOnly ? "false" : "yes")}
                type="button"
              >
                <span>
                  <span className="block text-[13.5px] font-semibold">Form Four direct</span>
                  <span className="mt-0.5 block text-[12px] text-brand-ink/55">
                    Show programmes you can join straight after CSEE.
                  </span>
                </span>
                <span
                  className={`relative h-6 w-10 shrink-0 rounded-full transition ${
                    formFourOnly ? "bg-brand-blue" : "bg-brand-ink/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
                      formFourOnly ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>

            <FilterSection title="Field of study" hint="Eneo la masomo">
              <div className="grid grid-cols-2 gap-1.5">
                {courseFamilies.map((courseFamily) => (
                  <button
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[12.5px] transition ${
                      family === courseFamily.key
                        ? "border-brand-blue bg-brand-blue/5 text-brand-blue"
                        : "border-brand-ink/10 text-brand-ink/75 hover:border-brand-ink/25"
                    }`}
                    key={courseFamily.key}
                    onClick={() =>
                      setFilter("family", family === courseFamily.key ? null : courseFamily.key)
                    }
                    type="button"
                  >
                    <span className="font-mono text-[13px] opacity-70">{courseFamily.mark}</span>
                    <span className="truncate font-medium">{courseFamily.label}</span>
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Level" hint="Ngazi ya kozi">
              <div className="grid grid-cols-1 gap-1">
                {awardLevels.map((level) => (
                  <button
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition ${
                      awardLevel === level.value
                        ? "bg-brand-ink text-white"
                        : "text-brand-ink/75 hover:bg-brand-ink/5"
                    }`}
                    key={level.value}
                    onClick={() => setFilter("level", level.value)}
                    type="button"
                  >
                    <span className="font-medium">{level.label}</span>
                    {level.duration ? (
                      <span
                        className={`text-[11px] ${
                          awardLevel === level.value ? "text-white/60" : "text-brand-ink/45"
                        }`}
                      >
                        {level.duration}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Region" hint="Mkoa" last>
              <select
                className="h-10 w-full rounded-lg border border-brand-ink/15 bg-white px-3 text-[13px] outline-none transition focus:border-brand-blue"
                onChange={(event) => setFilter("region", event.target.value)}
                value={region}
              >
                <option value="">Tanzania (all)</option>
                {regions.map((regionName) => (
                  <option key={regionName} value={regionName}>
                    {regionName}
                  </option>
                ))}
              </select>
            </FilterSection>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-ink/8 pb-4">
            <div>
              <p className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-brand-blue">
                {isCountLoading
                  ? "Searching"
                  : `${count?.count ?? search?.results.length ?? 0}${count?.capped ? "+" : ""} matches`}
              </p>
              <h2 className="mt-1 text-[22px] font-bold tracking-tight">
                {activeQuery ? `Results for "${activeQuery}"` : "All programmes"}
              </h2>
            </div>
            {inferredFamily ? (
              <span className="rounded-full bg-brand-blue/10 px-3 py-1.5 text-[12px] font-medium text-brand-blue">
                {familyMeta(inferredFamily).label}
              </span>
            ) : null}
          </div>

          {activeFilters.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1.5 text-[12px] font-medium text-brand-blue hover:bg-brand-blue/15"
                  key={filter.key}
                  onClick={filter.clear}
                  type="button"
                >
                  {filter.label}
                  <XIcon className="size-3" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4">
            {!activeQuery ? (
              <EmptyState />
            ) : isResultsLoading ? (
              <LoadingState />
            ) : search?.results.length ? (
              search.results.map((programme) => (
                <ProgrammeCard key={programme._id} programme={programme} />
              ))
            ) : (
              <EmptyState message="No matching programmes. Try a broader search or remove a filter." />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function FilterSection({
  title,
  hint,
  last = false,
  children,
}: {
  title: string
  hint: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={last ? "px-5 py-5" : "border-b border-brand-ink/8 px-5 py-5"}>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[13px] font-semibold tracking-tight">{title}</p>
        <p className="text-[11px] text-brand-ink/45">{hint}</p>
      </div>
      {children}
    </div>
  )
}

function ProgrammeCard({
  programme,
}: {
  programme: NonNullable<ReturnType<typeof useQuery<typeof api.programmes.smartSearch>>>["results"][number]
}) {
  const meta = familyMeta(programme.courseFamily)

  return (
    <article className="group rounded-2xl border border-brand-ink/10 bg-white p-5 transition hover:border-brand-blue/35 hover:shadow-[0_22px_50px_-32px_rgba(29,78,216,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-blue/10 font-mono text-[14px] font-semibold text-brand-blue">
            {meta.mark}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-brand-ink/45">
              <span>{programme.awardLevel}</span>
              <span className="size-1 rounded-full bg-brand-ink/30" />
              <span>{programme.regulator}</span>
              {programme.ownershipType ? (
                <>
                  <span className="size-1 rounded-full bg-brand-ink/30" />
                  <span>{programme.ownershipType}</span>
                </>
              ) : null}
            </div>
            <h3 className="mt-1.5 truncate text-[17px] font-bold tracking-tight">
              {programme.programmeName}
            </h3>
            <p className="mt-0.5 truncate text-[13.5px] font-medium text-brand-ink/65">
              {programme.institutionName}
            </p>
          </div>
        </div>
        <button
          aria-label="Save programme"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-ink/15 text-brand-ink/45 transition hover:border-brand-ink hover:text-brand-ink"
          type="button"
        >
          <BookmarkIcon className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 text-[12px] text-brand-ink/70">
        {programme.region ? (
          <Tag>
            <PinIcon className="size-3.5" />
            {programme.region}
          </Tag>
        ) : null}
        {programme.duration ? (
          <Tag>
            <ClockIcon className="size-3.5" />
            {programme.duration} years
          </Tag>
        ) : null}
        {programme.feesIfAvailable ? <Tag>{programme.feesIfAvailable}</Tag> : null}
        <Tag tone={programme.suitableForFormFourLeaver === "yes" ? "green" : "ink"}>
          {programme.suitableForFormFourLeaver === "yes" ? (
            <CheckIcon className="size-3.5" />
          ) : null}
          {formFourLabel(programme.suitableForFormFourLeaver)}
        </Tag>
      </div>

      {programme.minimumEntryRequirements ? (
        <div className="mt-4 rounded-xl bg-[#fafafa] p-3.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brand-ink/40">
            Entry requirements
          </p>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-brand-ink/70">
            {programme.minimumEntryRequirements}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-brand-ink/45">
          Verified {programme.lastVerifiedDate}
          {programme.needsReview ? " · Needs review" : ""}
        </p>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-brand-blue">
          View details
          <ArrowRightIcon className="size-3.5" />
        </button>
      </div>
    </article>
  )
}

function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "green" | "ink"
}) {
  const tones = {
    neutral: "bg-brand-ink/[0.05] text-brand-ink/70",
    green: "bg-emerald-50 text-emerald-700",
    ink: "bg-brand-ink text-white",
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

function EmptyState({ message = "Search a course, college, or career path to see results." }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-white p-10 text-center">
      <p className="text-[15px] font-semibold">{message}</p>
      <p className="mt-1 text-[13px] text-brand-ink/55">
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
          className="h-52 animate-pulse rounded-2xl border border-brand-ink/10 bg-brand-ink/[0.03]"
          key={item}
        />
      ))}
    </div>
  )
}

function Icon({
  className = "size-4",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
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
      {children}
    </svg>
  )
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  )
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  )
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
      <circle cx={12} cy={9} r={2.5} />
    </Icon>
  )
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" />
    </Icon>
  )
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M5 12l5 5L20 7" />
    </Icon>
  )
}

function BookmarkIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </Icon>
  )
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  )
}
