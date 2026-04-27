import { v } from "convex/values"

import { internalMutation, internalQuery } from "./_generated/server"

const correctionStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("needs_more_info"),
)

export const pending = internalQuery({
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

export const byStatus = internalQuery({
  args: {
    status: correctionStatus,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("correctionSubmissions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .take(args.limit ?? 50)
  },
})

export const updateStatus = internalMutation({
  args: {
    id: v.id("correctionSubmissions"),
    status: correctionStatus,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    })

    return await ctx.db.get(args.id)
  },
})
