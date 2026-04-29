"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { usePathname, useRouter } from "next/navigation"

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

export function SearchResultsClient({
  initialSearchParams,
}: {
  initialSearchParams: readonly (readonly [string, string])[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const logSearchEvent = useMutation(api.searchEvents.log)
  const lastLoggedSearchRef = useRef("")
  const searchParams = useMemo(
    () =>
      new URLSearchParams(
        initialSearchParams.map(([key, value]) => [key, value])
      ),
    [initialSearchParams]
  )
  const submittedQuery = searchParams.get("q")?.trim() ?? ""
  const queryFromUrl = getInitialQuery(searchParams)

  const family = searchParams.get("family") ?? undefined
  const awardLevel = searchParams.get("level") ?? "all"
  const region = searchParams.get("region") ?? ""
  const institution = searchParams.get("institution") ?? undefined
  const institutionLabel = searchParams.get("institutionLabel") ?? undefined
  const selectedProgrammeId = searchParams.get("programme") ?? undefined
  const resultSetKey = `${queryFromUrl}|${family ?? ""}|${awardLevel}|${region}|${institution ?? ""}|${institutionLabel ?? ""}|${selectedProgrammeId ?? ""}`
  const defaultResultLimit = selectedProgrammeId
    ? MAX_VISIBLE_RESULTS
    : INITIAL_RESULT_LIMIT
  const [resultLimitState, setResultLimitState] = useState({
    key: resultSetKey,
    limit: defaultResultLimit,
  })
  const resultLimit =
    resultLimitState.key === resultSetKey
      ? resultLimitState.limit
      : defaultResultLimit

  const filters = useMemo(() => {
    return {
      ...(family ? { courseFamily: family } : {}),
      ...(awardLevel !== "all" ? { awardLevel } : {}),
      ...(region ? { region } : {}),
      ...(institution ? { normalizedInstitutionName: institution } : {}),
    }
  }, [awardLevel, family, institution, region])

  const activeQuery = queryFromUrl
  const hasFilters =
    Boolean(family) ||
    awardLevel !== "all" ||
    Boolean(region) ||
    Boolean(institution)
  const filtersJson = useMemo(() => {
    return hasFilters ? JSON.stringify(filters) : undefined
  }, [filters, hasFilters])

  const searchArgs = activeQuery
    ? {
        query: activeQuery,
        filters: hasFilters ? filters : undefined,
        limit: resultLimit,
      }
    : "skip"

  const search = useQuery(api.programmes.smartSearch, searchArgs)
  const isResultsLoading = Boolean(activeQuery) && search === undefined
  const totalMatches = search?.total ?? search?.results.length ?? 0
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
      label:
        awardLevels.find((level) => level.value === awardLevel)?.label ??
        awardLevel,
      clear: () => setFilter("level", "all"),
    },
    region && {
      key: "region",
      label: region,
      clear: () => setFilter("region", null),
    },
    institution && {
      key: "institution",
      label: institutionLabel ?? "Selected institution",
      clear: () => setFilter("institution", null),
    },
  ].filter(isActiveFilter)

  useEffect(() => {
    if (!submittedQuery || isResultsLoading || !search) {
      return
    }

    const resultCount = search.total ?? search.results.length
    const logKey = JSON.stringify([
      submittedQuery.toLowerCase(),
      filtersJson ?? "",
      resultCount,
      Boolean(search.capped),
    ])
    if (lastLoggedSearchRef.current === logKey) {
      return
    }

    lastLoggedSearchRef.current = logKey
    void logSearchEvent({
      query: submittedQuery,
      filtersJson,
      resultCount,
      resultCountCapped: Boolean(search.capped),
      source: "search_page",
    })
  }, [filtersJson, isResultsLoading, logSearchEvent, search, submittedQuery])

  function routeWith(nextParams: URLSearchParams) {
    const queryString = nextParams.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  function setFilter(key: SearchFilterKey, value: string | null) {
    routeWith(
      updateParams(searchParams, {
        [key]: value,
        ...(key === "institution" ? { institutionLabel: null } : {}),
        programme: null,
      })
    )
  }

  function clearAllFilters() {
    routeWith(
      updateParams(searchParams, {
        family: null,
        level: null,
        region: null,
        institution: null,
        institutionLabel: null,
        programme: null,
      })
    )
  }

  function submitSearch(nextQuery: string) {
    const normalizedQuery = nextQuery.trim()
    if (!normalizedQuery) {
      return
    }

    routeWith(
      updateParams(searchParams, {
        q: normalizedQuery,
        family: null,
        institution: null,
        institutionLabel: null,
        programme: null,
      })
    )
  }

  function runTrending(nextQuery: string) {
    routeWith(
      updateParams(searchParams, {
        q: nextQuery,
        family: null,
        institution: null,
        institutionLabel: null,
        programme: null,
      })
    )
  }

  function loadMoreResults() {
    const nextLimit = Math.min(
      resultLimit + RESULT_LIMIT_STEP,
      totalMatches,
      MAX_VISIBLE_RESULTS
    )
    setResultLimitState({ key: resultSetKey, limit: nextLimit })
  }

  return (
    <main className="min-h-screen bg-white text-brand-ink">
      <SearchHeader
        key={queryFromUrl}
        initialQuery={queryFromUrl}
        onSubmit={submitSearch}
        onTrending={runTrending}
      />

      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[19rem_1fr] lg:px-8">
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
            inferredFamily={inferredFamily}
            isResultsLoading={isResultsLoading}
            totalMatches={search?.total ?? search?.results.length}
            isCapped={Boolean(search?.capped)}
            resultCount={search?.results.length}
          />

          {activeFilters.length > 0 ? (
            <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  aria-label={`Remove ${filter.label} filter`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1.5 text-[12px] font-medium text-brand-blue hover:bg-brand-blue/15"
                  key={filter.key}
                  onClick={filter.clear}
                  type="button"
                >
                  <span className="min-w-0 truncate">{filter.label}</span>
                  <XIcon className="size-3 shrink-0" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 grid min-w-0 gap-4">
            {!activeQuery ? (
              <EmptyState />
            ) : isResultsLoading ? (
              <LoadingState />
            ) : search?.results.length ? (
              <>
                {search.results.map((programme) => (
                  <ProgrammeCard
                    isSelected={programme._id === selectedProgrammeId}
                    key={programme._id}
                    programme={programme}
                    shareUrl={buildProgrammeShareUrl(
                      searchParams,
                      programme._id
                    )}
                  />
                ))}
                <SearchResultsFooter
                  canLoadMore={canLoadMore}
                  isCapped={Boolean(search?.capped)}
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
  inferredFamily,
  isResultsLoading,
  totalMatches,
  isCapped,
  resultCount,
}: {
  activeQuery: string
  inferredFamily?: string
  isResultsLoading: boolean
  totalMatches?: number
  isCapped: boolean
  resultCount?: number
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-end justify-between gap-4 border-b border-brand-ink/8 pb-4">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium tracking-[0.16em] text-brand-blue uppercase">
          {isResultsLoading
            ? "Searching"
            : `${totalMatches ?? resultCount ?? 0}${isCapped ? "+" : ""} matches`}
        </p>
        <h2 className="mt-1 text-[22px] font-bold tracking-tight break-words">
          {activeQuery ? `Results for "${activeQuery}"` : "All programmes"}
        </h2>
      </div>
      {inferredFamily ? (
        <span className="max-w-full shrink-0 truncate rounded-full bg-brand-blue/10 px-3 py-1.5 text-[12px] font-medium text-brand-blue">
          {familyMeta(inferredFamily).label}
        </span>
      ) : null}
    </div>
  )
}

function EmptyState({
  message = "Search a course, college, or career path to see results.",
}) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-white p-10 text-center">
      <p className="text-[15px] font-semibold">{message}</p>
      <p className="mt-1 text-[13px] text-brand-ink/55">
        Try “clinical medicine”, “civil engineering”, or “computer courses after
        school”.
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

function buildProgrammeShareUrl(
  searchParams: URLSearchParams,
  programmeId: string
) {
  const nextParams = new URLSearchParams(searchParams.toString())
  nextParams.set("programme", programmeId)

  return `/search?${nextParams.toString()}`
}
