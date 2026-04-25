"use client"

import { type FormEvent, useMemo, useState } from "react"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"

const quickSearches = [
  "I want to study engineering",
  "computer courses after Form Four",
  "nataka kuwa nurse",
  "hotel management",
]

const awardLevels = [
  { label: "All levels", value: "all" },
  { label: "Diploma", value: "ordinary diploma" },
  { label: "Degree", value: "degree" },
]

export function ProgrammeSearch() {
  const [query, setQuery] = useState("I want to study engineering")
  const [submittedQuery, setSubmittedQuery] = useState("I want to study engineering")
  const [formFourOnly, setFormFourOnly] = useState(false)
  const [awardLevel, setAwardLevel] = useState("all")

  const filters = useMemo(() => {
    if (awardLevel === "all") {
      return undefined
    }

    return { awardLevel }
  }, [awardLevel])

  const searchArgs = submittedQuery
    ? {
        query: submittedQuery,
        filters,
        formFourOnly,
        limit: 8,
      }
    : "skip"

  const countArgs = submittedQuery
    ? {
        query: submittedQuery,
        filters,
        formFourOnly,
        maxCount: 1000,
      }
    : "skip"

  const search = useQuery(api.programmes.smartSearch, searchArgs)
  const count = useQuery(api.programmes.smartSearchCount, countArgs)
  const isLoading = submittedQuery && (search === undefined || count === undefined)

  function submitSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    setSubmittedQuery(query.trim())
  }

  function runQuickSearch(value: string) {
    setQuery(value)
    setSubmittedQuery(value)
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
      <div className="flex flex-col gap-4">
        <form className="flex flex-col gap-3" onSubmit={submitSearch}>
          <label className="text-sm font-medium" htmlFor="search">
            Search courses, colleges, careers, or requirements
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="search"
              className="min-h-12 flex-1 rounded-md border bg-background px-4 text-base outline-none transition focus:border-foreground"
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Try "nataka kuwa nurse" or "computer courses after Form Four"'
              value={query}
            />
            <Button className="min-h-12 px-5" type="submit">
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm">
            <input
              checked={formFourOnly}
              className="size-4"
              onChange={(event) => setFormFourOnly(event.target.checked)}
              type="checkbox"
            />
            Form Four direct
          </label>
          <select
            className="min-h-9 rounded-md border bg-background px-3 text-sm outline-none"
            onChange={(event) => setAwardLevel(event.target.value)}
            value={awardLevel}
          >
            {awardLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {quickSearches.map((item) => (
            <button
              className="rounded-md border px-3 py-1.5 text-muted-foreground transition hover:text-foreground"
              key={item}
              onClick={() => runQuickSearch(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="rounded-md border">
          <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                {isLoading
                  ? "Searching..."
                  : `${count?.count ?? 0}${count?.capped ? "+" : ""} programme matches`}
              </p>
              <p className="text-sm text-muted-foreground">
                Showing the first {search?.results.length ?? 0} results
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {search?.interpreted.inferredCourseFamily ? (
                <span className="rounded-sm bg-muted px-2 py-1">
                  course family: {search.interpreted.inferredCourseFamily}
                </span>
              ) : null}
              {formFourOnly ? (
                <span className="rounded-sm bg-muted px-2 py-1">Form Four direct</span>
              ) : null}
              {awardLevel !== "all" ? (
                <span className="rounded-sm bg-muted px-2 py-1">{awardLevel}</span>
              ) : null}
            </div>
          </div>

          <div className="divide-y">
            {search?.results.map((programme) => (
              <article className="grid gap-2 p-4" key={programme._id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">{programme.programmeName}</h2>
                    <p className="text-sm text-muted-foreground">{programme.institutionName}</p>
                  </div>
                  <span className="w-fit rounded-sm border px-2 py-1 text-xs text-muted-foreground">
                    {programme.awardLevel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {programme.region ? <span>{programme.region}</span> : null}
                  <span>{programme.regulator}</span>
                  <span>Form Four: {programme.suitableForFormFourLeaver}</span>
                  {programme.ownershipType ? <span>{programme.ownershipType}</span> : null}
                </div>
                {programme.minimumEntryRequirements ? (
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {programme.minimumEntryRequirements}
                  </p>
                ) : null}
              </article>
            ))}
            {search?.results.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No matching programmes yet. Try a broader query or remove a filter.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
