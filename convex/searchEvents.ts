import { v } from "convex/values"

import { mutation } from "./_generated/server"
import { rateLimiter } from "./rateLimits"

export const log = mutation({
  args: {
    query: v.string(),
    detectedIntent: v.optional(v.string()),
    filtersJson: v.optional(v.string()),
    resultCount: v.number(),
    clickedResultId: v.optional(v.string()),
    languageMode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, "searchEventLog")
    if (!status.ok) {
      return null
    }

    return await ctx.db.insert("searchEvents", {
      ...args,
      normalizedQuery: args.query.trim().toLowerCase(),
    })
  },
})
