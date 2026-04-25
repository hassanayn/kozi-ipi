import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { query } from "./_generated/server"

const confidenceLevel = v.union(v.literal("high"), v.literal("medium"), v.literal("low"))

const filtersValidator = v.optional(
  v.object({
    region: v.optional(v.string()),
    regulator: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    institutionType: v.optional(v.string()),
    mainlandOrZanzibar: v.optional(v.string()),
    confidenceLevel: v.optional(confidenceLevel),
  }),
)

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

    return await ctx.db
      .query("institutions")
      .withSearchIndex("search_searchText", (q) => {
        let search = q.search("searchText", text)

        if (args.filters?.region) {
          search = search.eq("region", args.filters.region)
        }
        if (args.filters?.regulator) {
          search = search.eq("regulator", args.filters.regulator)
        }
        if (args.filters?.ownershipType) {
          search = search.eq("ownershipType", args.filters.ownershipType)
        }
        if (args.filters?.institutionType) {
          search = search.eq("institutionType", args.filters.institutionType)
        }
        if (args.filters?.mainlandOrZanzibar) {
          search = search.eq("mainlandOrZanzibar", args.filters.mainlandOrZanzibar)
        }
        if (args.filters?.confidenceLevel) {
          search = search.eq("confidenceLevel", args.filters.confidenceLevel)
        }

        return search
      })
      .take(args.limit ?? 25)
  },
})

export const byNormalizedName = query({
  args: {
    normalizedInstitutionName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("institutions")
      .withIndex("by_normalizedInstitutionName", (q) =>
        q.eq("normalizedInstitutionName", args.normalizedInstitutionName),
      )
      .unique()
  },
})

export const listByRegion = query({
  args: {
    region: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("institutions")
      .withIndex("by_region", (q) => q.eq("region", args.region))
      .paginate(args.paginationOpts)
  },
})

