import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { query } from "./_generated/server"

const suitability = v.union(v.literal("yes"), v.literal("no"), v.literal("unknown"))
const confidenceLevel = v.union(v.literal("high"), v.literal("medium"), v.literal("low"))

const filtersValidator = v.optional(
  v.object({
    region: v.optional(v.string()),
    awardLevel: v.optional(v.string()),
    fieldCategory: v.optional(v.string()),
    courseFamily: v.optional(v.string()),
    regulator: v.optional(v.string()),
    institutionType: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    suitableForFormFourLeaver: v.optional(suitability),
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
      .query("programmes")
      .withSearchIndex("search_searchText", (q) => {
        let search = q.search("searchText", text)

        if (args.filters?.region) {
          search = search.eq("region", args.filters.region)
        }
        if (args.filters?.awardLevel) {
          search = search.eq("awardLevel", args.filters.awardLevel)
        }
        if (args.filters?.fieldCategory) {
          search = search.eq("fieldCategory", args.filters.fieldCategory)
        }
        if (args.filters?.courseFamily) {
          search = search.eq("courseFamily", args.filters.courseFamily)
        }
        if (args.filters?.regulator) {
          search = search.eq("regulator", args.filters.regulator)
        }
        if (args.filters?.institutionType) {
          search = search.eq("institutionType", args.filters.institutionType)
        }
        if (args.filters?.ownershipType) {
          search = search.eq("ownershipType", args.filters.ownershipType)
        }
        if (args.filters?.suitableForFormFourLeaver) {
          search = search.eq(
            "suitableForFormFourLeaver",
            args.filters.suitableForFormFourLeaver,
          )
        }
        if (args.filters?.confidenceLevel) {
          search = search.eq("confidenceLevel", args.filters.confidenceLevel)
        }

        return search
      })
      .take(args.limit ?? 25)
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
        q.eq("normalizedInstitutionName", args.normalizedInstitutionName),
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

