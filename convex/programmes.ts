import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { query } from "./_generated/server"
import { attachInstitutionLogos } from "./programmeSearch/display"
import { filtersValidator } from "./programmeSearch/filters"
import { interpretProgrammeQuery } from "./programmeSearch/interpret"
import { matchesProgrammeFilters } from "./programmeSearch/matching"
import { isNursingIntent, rankProgrammes } from "./programmeSearch/ranking"
import { queryProgrammesBySearchText } from "./programmeSearch/search"

const INSTITUTION_PROGRAMME_SCAN_LIMIT = 1000

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

    const results = await queryProgrammesBySearchText(
      ctx,
      text,
      args.filters,
      args.limit ?? 25
    )

    return await attachInstitutionLogos(ctx, results)
  },
})

export const smartSearch = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    formFourOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const interpreted = interpretProgrammeQuery(
      args.query,
      args.filters,
      args.formFourOnly
    )
    if (!interpreted.query) {
      return {
        interpreted,
        results: [],
      }
    }

    if (interpreted.appliedFilters.normalizedInstitutionName) {
      const institutionResults = await ctx.db
        .query("programmes")
        .withIndex("by_normalizedInstitutionName", (q) =>
          q.eq(
            "normalizedInstitutionName",
            interpreted.appliedFilters.normalizedInstitutionName!
          )
        )
        .take(INSTITUTION_PROGRAMME_SCAN_LIMIT)
      const filteredResults = institutionResults.filter((programme) =>
        matchesProgrammeFilters(programme, interpreted.appliedFilters)
      )

      return {
        interpreted,
        results: await attachInstitutionLogos(
          ctx,
          rankProgrammes(filteredResults, interpreted.query).slice(
            0,
            args.limit ?? 25
          )
        ),
      }
    }

    const searchLimit = Math.max(
      args.limit ?? 25,
      isNursingIntent(interpreted.query) ? 80 : 25
    )
    const results = await queryProgrammesBySearchText(
      ctx,
      interpreted.query,
      interpreted.appliedFilters,
      searchLimit
    )

    return {
      interpreted,
      results: await attachInstitutionLogos(
        ctx,
        rankProgrammes(results, interpreted.query).slice(0, args.limit ?? 25)
      ),
    }
  },
})

export const searchCount = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    maxCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const text = args.query.trim()
    if (!text) {
      return { count: 0, capped: false }
    }

    const maxCount = args.maxCount ?? 1000
    const results = await queryProgrammesBySearchText(
      ctx,
      text,
      args.filters,
      maxCount
    )

    return { count: results.length, capped: results.length === maxCount }
  },
})

export const smartSearchCount = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    formFourOnly: v.optional(v.boolean()),
    maxCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const interpreted = interpretProgrammeQuery(
      args.query,
      args.filters,
      args.formFourOnly
    )
    if (!interpreted.query) {
      return { interpreted, count: 0, capped: false }
    }

    const maxCount = args.maxCount ?? 1000
    if (interpreted.appliedFilters.normalizedInstitutionName) {
      const results = await ctx.db
        .query("programmes")
        .withIndex("by_normalizedInstitutionName", (q) =>
          q.eq(
            "normalizedInstitutionName",
            interpreted.appliedFilters.normalizedInstitutionName!
          )
        )
        .take(maxCount)
      const filteredResults = results.filter((programme) =>
        matchesProgrammeFilters(programme, interpreted.appliedFilters)
      )

      return {
        interpreted,
        count: rankProgrammes(filteredResults, interpreted.query).length,
        capped: results.length === maxCount,
      }
    }

    const results = await queryProgrammesBySearchText(
      ctx,
      interpreted.query,
      interpreted.appliedFilters,
      maxCount
    )

    return {
      interpreted,
      count: rankProgrammes(results, interpreted.query).length,
      capped: results.length === maxCount,
    }
  },
})

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
