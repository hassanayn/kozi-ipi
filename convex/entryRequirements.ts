import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { query } from "./_generated/server"

const suitability = v.union(v.literal("yes"), v.literal("no"), v.literal("unknown"))

export const byProgramme = query({
  args: {
    normalizedProgrammeName: v.string(),
    normalizedInstitutionName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entryRequirements")
      .withIndex("by_normalizedProgrammeName_and_normalizedInstitutionName", (q) =>
        q
          .eq("normalizedProgrammeName", args.normalizedProgrammeName)
          .eq("normalizedInstitutionName", args.normalizedInstitutionName),
      )
      .collect()
  },
})

export const byInstitution = query({
  args: {
    normalizedInstitutionName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entryRequirements")
      .withIndex("by_normalizedInstitutionName", (q) =>
        q.eq("normalizedInstitutionName", args.normalizedInstitutionName),
      )
      .paginate(args.paginationOpts)
  },
})

export const listByRoute = query({
  args: {
    route: v.union(
      v.literal("form_four"),
      v.literal("form_six"),
      v.literal("certificate"),
      v.literal("diploma"),
    ),
    value: v.optional(suitability),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const value = args.value ?? "yes"
    const limit = Math.min(args.limit ?? 50, 200)

    if (args.route === "form_four") {
      return await ctx.db
        .query("entryRequirements")
        .withIndex("by_acceptsFormFourDirect", (q) => q.eq("acceptsFormFourDirect", value))
        .take(limit)
    }

    if (args.route === "form_six") {
      return await ctx.db
        .query("entryRequirements")
        .withIndex("by_acceptsFormSix", (q) => q.eq("acceptsFormSix", value))
        .take(limit)
    }

    if (args.route === "certificate") {
      return await ctx.db
        .query("entryRequirements")
        .withIndex("by_acceptsCertificate", (q) => q.eq("acceptsCertificate", value))
        .take(limit)
    }

    return await ctx.db
      .query("entryRequirements")
      .withIndex("by_acceptsDiploma", (q) => q.eq("acceptsDiploma", value))
      .take(limit)
  },
})
