import { v } from "convex/values"

import { internalMutation, internalQuery, mutation } from "./_generated/server"
import { rateLimiter } from "./rateLimits"

const correctionStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("needs_more_info"),
)

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
    await rateLimiter.limit(ctx, "correctionSubmit", { throws: true })

    const message = args.message.trim()
    if (message.length < 5) {
      throw new Error("Correction message is too short.")
    }
    if (message.length > 4000) {
      throw new Error("Correction message is too long.")
    }

    return await ctx.db.insert("correctionSubmissions", {
      ...args,
      message,
      status: "pending",
    })
  },
})

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
