import { v } from "convex/values"

import { mutation } from "./_generated/server"
import { rateLimiter } from "./rateLimits"

const MAX_QUERY_LENGTH = 120
const MAX_FILTERS_JSON_LENGTH = 500
const MAX_RESULT_COUNT = 100_000

export const log = mutation({
  args: {
    query: v.string(),
    detectedIntent: v.optional(v.string()),
    filtersJson: v.optional(v.string()),
    resultCount: v.number(),
    resultCountCapped: v.optional(v.boolean()),
    clickedResultId: v.optional(v.string()),
    languageMode: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, "searchEventLog")
    if (!status.ok) {
      return null
    }

    const query = args.query.trim().slice(0, MAX_QUERY_LENGTH)
    if (!query) {
      return null
    }

    const filtersJson = args.filtersJson?.trim().slice(0, MAX_FILTERS_JSON_LENGTH)
    const resultCount = Math.max(0, Math.min(Math.floor(args.resultCount), MAX_RESULT_COUNT))
    const source = args.source?.trim().slice(0, 60) || "search_page"

    return await ctx.db.insert("searchEvents", {
      query,
      normalizedQuery: query.toLowerCase(),
      resultCount,
      ...(args.resultCountCapped ? { resultCountCapped: true } : {}),
      source,
      createdAt: Date.now(),
      ...(args.detectedIntent ? { detectedIntent: args.detectedIntent } : {}),
      ...(filtersJson ? { filtersJson } : {}),
      ...(args.clickedResultId ? { clickedResultId: args.clickedResultId } : {}),
      ...(args.languageMode ? { languageMode: args.languageMode } : {}),
    })
  },
})
