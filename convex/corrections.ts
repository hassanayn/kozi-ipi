import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

export const submit = mutation({
  args: {
    targetType: v.union(v.literal("institution"), v.literal("programme"), v.literal("general")),
    targetId: v.optional(v.string()),
    targetName: v.optional(v.string()),
    correctionType: v.string(),
    message: v.string(),
    sourceUrl: v.optional(v.string()),
    submitterName: v.optional(v.string()),
    submitterContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("correctionSubmissions", {
      ...args,
      status: "pending",
    })
  },
})

export const pending = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("correctionSubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(args.limit ?? 50)
  },
})

