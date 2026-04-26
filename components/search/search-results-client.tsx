"use client"

import { type FormEvent, useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ProgrammeCard } from "@/components/search/programme-card"
import {
  awardLevels,
  familyMeta,
  getInitialQuery,
  isActiveFilter,
  type SearchFilterKey,
  updateParams,
} from "@/components/search/search-config"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchHeader } from "@/components/search/search-header"
import { XIcon } from "@/components/search/search-icons"
import { api } from "@/convex/_generated/api"

const INITIAL_RESULT_LIMIT = 20
const RESULT_LIMIT_STEP = 20
const MAX_VISIBLE_RESULTS = 200

export function SearchResultsClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryFromUrl = getInitialQuery(searchParams)
  const [query, setQuery] = useState(queryFromUrl)

  const family = searchParams.get("family") ?? undefined
  const awardLevel = searchParams.get("level") ?? "all"
  const region = searchParams.get("region") ?? ""
  const resultSetKey = `${queryFromUrl}|${family ?? ""}|${awardLevel}|${region}`
  const [resultLimitState, setResultLimitState] = useState({
    key: resultSetKey,
    limit: INITIAL_RESULT_LIMIT,
  })
  const resultLimit =
    resultLimitState.key === resultSetKey ? resultLimitState.limit : INITIAL_RESULT_LIMIT

  const filters = useMemo(() => {
    return {
      ...(family ? { courseFamily: family } : {}),
      ...(awardLevel !== "all" ? { awardLevel } : {}),
      ...(region ? { region } : {}),
    }
  }, [awardLevel, family, region])

  const activeQuery = queryFromUrl
  const hasFilters = Boolean(family) || awardLevel !== "all" || Boolean(region)

  const searchArgs = activeQuery
    ? {
        query: activeQuery,
        filters: hasFilters ? filters : undefined,
        limit: resultLimit,
      }
    : "skip"

  const countArgs = activeQuery
    ? {
        query: activeQuery,
        filters: hasFilters ? filters : undefined,
        maxCount: 1000,
      }
    : "skip"

  const search = useQuery(api.programmes.smartSearch, searchArgs)
  const count = useQuery(api.programmes.smartSearchCount, countArgs)
  const isResultsLoading = activeQuery && search === undefined
  const isCountLoading = activeQuery && count === undefined
  const totalMatches = count?.count ?? search?.results.length ?? 0
  const renderedCount = search?.results.length ?? 0
  const canLoadMore =
    Boolean(activeQuery) &&
    !isResultsLoading &&
    renderedCount > 0 &&
    renderedCount < totalMatches &&
    resultLimit < MAX_VISIBLE_RESULTS

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
  ].filter(isActiveFilter)

  function routeWith(nextParams: URLSearchParams) {
    const queryString = nextParams.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  function setFilter(key: SearchFilterKey, value: string | null) {
    routeWith(updateParams(searchParams, { [key]: value }))
  }

  function clearAllFilters() {
    routeWith(
      updateParams(searchParams, {
        family: null,
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

    routeWith(updateParams(searchParams, { q: nextQuery, family: null }))
  }

  function runTrending(nextQuery: string) {
    setQuery(nextQuery)
    routeWith(updateParams(searchParams, { q: nextQuery, family: null }))
  }

  function loadMoreResults() {
    const nextLimit = Math.min(resultLimit + RESULT_LIMIT_STEP, totalMatches, MAX_VISIBLE_RESULTS)
    setResultLimitState({ key: resultSetKey, limit: nextLimit })
  }

  return (
    <main className="min-h-screen bg-white text-brand-ink">
      <SearchHeader
        query={query}
        setQuery={setQuery}
        onSubmit={submitSearch}
        onTrending={runTrending}
      />

      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[19rem_1fr]">
        <SearchFilters
          activeFilters={activeFilters}
          awardLevel={awardLevel}
          family={family}
          region={region}
          clearAllFilters={clearAllFilters}
          setFilter={setFilter}
        />

        <section className="min-w-0">
          <SearchResultsHeader
            activeQuery={activeQuery}
            count={count}
            inferredFamily={inferredFamily}
            isCountLoading={isCountLoading}
            resultCount={search?.results.length}
          />

          {activeFilters.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  aria-label={`Remove ${filter.label} filter`}
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
              <>
                {search.results.map((programme) => (
                  <ProgrammeCard key={programme._id} programme={programme} />
                ))}
                <SearchResultsFooter
                  canLoadMore={canLoadMore}
                  isCapped={Boolean(count?.capped)}
                  onLoadMore={loadMoreResults}
                  renderedCount={renderedCount}
                  totalMatches={totalMatches}
                />
              </>
            ) : (
              <EmptyState message="No matching programmes. Try a broader search or remove a filter." />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function SearchResultsFooter({
  canLoadMore,
  isCapped,
  onLoadMore,
  renderedCount,
  totalMatches,
}: {
  canLoadMore: boolean
  isCapped: boolean
  onLoadMore: () => void
  renderedCount: number
  totalMatches: number
}) {
  return (
    <div className="flex flex-col items-center gap-3 border-t border-brand-ink/8 pt-5 text-center">
      <p className="text-[12.5px] text-brand-ink/55">
        Showing {renderedCount} of {totalMatches}
        {isCapped ? "+" : ""} matches
      </p>
      {canLoadMore ? (
        <button
          className="rounded-full border border-brand-ink/15 px-5 py-2.5 text-[13px] font-semibold text-brand-ink transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
          onClick={onLoadMore}
          type="button"
        >
          Load more
        </button>
      ) : null}
    </div>
  )
}

function SearchResultsHeader({
  activeQuery,
  count,
  inferredFamily,
  isCountLoading,
  resultCount,
}: {
  activeQuery: string
  count:
    | {
        count: number
        capped: boolean
      }
    | undefined
  inferredFamily?: string
  isCountLoading: boolean | ""
  resultCount?: number
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-ink/8 pb-4">
      <div>
        <p className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-brand-blue">
          {isCountLoading
            ? "Searching"
            : `${count?.count ?? resultCount ?? 0}${count?.capped ? "+" : ""} matches`}
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
