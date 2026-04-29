import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import type { QueryCtx } from "./_generated/server"
import { formatProgrammeSearchResults } from "./programmeSearch/display"
import {
  filtersValidator,
  type ProgrammeFilters,
} from "./programmeSearch/filters"
import { interpretProgrammeQuery } from "./programmeSearch/interpret"
import { matchesProgrammeFilters } from "./programmeSearch/matching"
import { sliceSearchPage } from "./programmeSearch/pagination"
import { isNursingIntent, rankProgrammes } from "./programmeSearch/ranking"
import { queryProgrammesBySearchText } from "./programmeSearch/search"

const INSTITUTION_PROGRAMME_SCAN_LIMIT = 1000
const DEFAULT_RESULT_LIMIT = 25
const MAX_VISIBLE_RESULT_LIMIT = 200
const MAX_CANDIDATE_SCAN_LIMIT = 1000
const NURSING_CANDIDATE_SCAN_MINIMUM = 80

export const search = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const text = args.query.trim()
    if (!text) {
      return []
    }
    const limit = clampCount(
      args.limit,
      DEFAULT_RESULT_LIMIT,
      MAX_VISIBLE_RESULT_LIMIT
    )

    const results = await queryProgrammesBySearchText(
      ctx,
      text,
      args.filters,
      limit
    )

    return formatProgrammeSearchResults(results)
  },
})

export const smartSearch = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    formFourOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    maxCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const visibleLimit = clampCount(
      args.limit,
      DEFAULT_RESULT_LIMIT,
      MAX_VISIBLE_RESULT_LIMIT
    )
    const { interpreted, rankedResults, capped } =
      await getSmartSearchCandidates(ctx, {
        query: args.query,
        filters: args.filters,
        formFourOnly: args.formFourOnly,
        limit: visibleLimit,
        maxCount: args.maxCount,
      })
    const visibleResults = rankedResults.slice(0, visibleLimit)

    return {
      interpreted,
      results: formatProgrammeSearchResults(visibleResults),
      total: rankedResults.length,
      capped,
      hasMore: rankedResults.length > visibleResults.length,
    }
  },
})

export const smartSearchSummary = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    formFourOnly: v.optional(v.boolean()),
    maxCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { interpreted, rankedResults, capped } =
      await getSmartSearchCandidates(ctx, {
        query: args.query,
        filters: args.filters,
        formFourOnly: args.formFourOnly,
        maxCount: args.maxCount,
      })

    return {
      interpreted,
      total: rankedResults.length,
      capped,
    }
  },
})

export const smartSearchPaginated = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    formFourOnly: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
    maxCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pageSize = clampCount(
      args.paginationOpts.numItems,
      DEFAULT_RESULT_LIMIT,
      MAX_VISIBLE_RESULT_LIMIT
    )
    const { rankedResults } = await getSmartSearchCandidates(ctx, {
      query: args.query,
      filters: args.filters,
      formFourOnly: args.formFourOnly,
      limit: pageSize,
      maxCount: args.maxCount,
    })
    const page = sliceSearchPage(rankedResults, {
      cursor: args.paginationOpts.cursor,
      pageSize,
    })

    return {
      page: formatProgrammeSearchResults(page.results),
      isDone: !page.hasMore,
      continueCursor: page.nextCursor ?? page.cursor ?? "",
    }
  },
})

async function getSmartSearchCandidates(
  ctx: QueryCtx,
  args: {
    query: string
    filters?: ProgrammeFilters
    formFourOnly?: boolean
    limit?: number
    maxCount?: number
  }
) {
  const interpreted = interpretProgrammeQuery(
    args.query,
    args.filters,
    args.formFourOnly
  )
  if (!interpreted.query) {
    return {
      interpreted,
      rankedResults: [] as Doc<"programmes">[],
      capped: false,
    }
  }

  const visibleLimit = clampCount(
    args.limit,
    DEFAULT_RESULT_LIMIT,
    MAX_VISIBLE_RESULT_LIMIT
  )
  const maxCount = Math.max(
    clampCount(
      args.maxCount,
      MAX_CANDIDATE_SCAN_LIMIT,
      MAX_CANDIDATE_SCAN_LIMIT
    ),
    visibleLimit
  )

  if (interpreted.appliedFilters.normalizedInstitutionName) {
    const candidateLimit = Math.min(
      Math.max(maxCount, visibleLimit),
      INSTITUTION_PROGRAMME_SCAN_LIMIT
    )
    const institutionResults = await ctx.db
      .query("programmes")
      .withIndex("by_normalizedInstitutionName", (q) =>
        q.eq(
          "normalizedInstitutionName",
          interpreted.appliedFilters.normalizedInstitutionName!
        )
      )
      .take(candidateLimit)
    const filteredResults = institutionResults.filter((programme) =>
      matchesProgrammeFilters(programme, interpreted.appliedFilters)
    )

    return {
      interpreted,
      rankedResults: rankProgrammes(filteredResults, interpreted.query),
      capped: institutionResults.length === candidateLimit,
    }
  }

  const candidateLimit = Math.min(
    Math.max(
      maxCount,
      visibleLimit,
      isNursingIntent(interpreted.query)
        ? NURSING_CANDIDATE_SCAN_MINIMUM
        : DEFAULT_RESULT_LIMIT
    ),
    MAX_CANDIDATE_SCAN_LIMIT
  )
  const searchResults = await queryProgrammesBySearchText(
    ctx,
    interpreted.query,
    interpreted.appliedFilters,
    candidateLimit
  )

  return {
    interpreted,
    rankedResults: rankProgrammes(searchResults, interpreted.query),
    capped: searchResults.length === candidateLimit,
  }
}

function clampCount(value: number | undefined, fallback: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback
  }

  return Math.min(Math.max(Math.trunc(value), 1), max)
}

export const byInstitution = query({
  args: {
    normalizedInstitutionName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("programmes")
      .withIndex("by_normalizedInstitutionName", (q) =>
        q.eq("normalizedInstitutionName", args.normalizedInstitutionName)
      )
      .paginate(args.paginationOpts)
  },
})

export const byId = query({
  args: {
    id: v.id("programmes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})
