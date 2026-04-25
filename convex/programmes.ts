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

type ProgrammeFilters = {
  region?: string
  awardLevel?: string
  fieldCategory?: string
  courseFamily?: string
  regulator?: string
  institutionType?: string
  ownershipType?: string
  suitableForFormFourLeaver?: "yes" | "no" | "unknown"
  confidenceLevel?: "high" | "medium" | "low"
}

const courseFamilyIntents = [
  {
    courseFamily: "engineering",
    terms: ["engineering", "engineer", "civil", "mechanical", "electrical"],
  },
  {
    courseFamily: "health",
    terms: ["health", "afya", "nurse", "nursing", "hospital", "medical", "clinical"],
  },
  {
    courseFamily: "ICT",
    terms: ["ict", "computer", "kompyuta", "software", "network", "technology"],
  },
  {
    courseFamily: "business",
    terms: ["business", "biashara", "accounting", "procurement", "office", "ofisini"],
  },
  {
    courseFamily: "education",
    terms: ["education", "teacher", "teaching", "ualimu", "mwalimu"],
  },
  {
    courseFamily: "tourism_hospitality",
    terms: ["hotel", "hospitality", "tourism", "utalii"],
  },
  {
    courseFamily: "agriculture",
    terms: ["agriculture", "kilimo"],
  },
]

const vagueIntentPattern = /\b(i want|want to|study|become|nataka|kuwa|kazi ya|courses? za)\b/i

function interpretProgrammeQuery(query: string, filters?: ProgrammeFilters, formFourOnly?: boolean) {
  const trimmedQuery = query.trim()
  const normalizedQuery = trimmedQuery.toLowerCase()
  const matchedIntent = courseFamilyIntents
    .map((intent) => ({
      courseFamily: intent.courseFamily,
      term: intent.terms.find((term) => normalizedQuery.includes(term)),
    }))
    .find((intent) => intent.term)
  const inferredCourseFamily = matchedIntent?.courseFamily

  const appliedFilters: ProgrammeFilters = {
    ...filters,
    courseFamily: filters?.courseFamily ?? inferredCourseFamily,
    suitableForFormFourLeaver: formFourOnly
      ? "yes"
      : filters?.suitableForFormFourLeaver,
  }

  const shouldSimplifyQuery =
    matchedIntent?.term &&
    (normalizedQuery === matchedIntent.term || vagueIntentPattern.test(trimmedQuery))
  const rewrittenQuery = shouldSimplifyQuery ? (matchedIntent.term ?? trimmedQuery) : trimmedQuery

  return {
    query: rewrittenQuery,
    appliedFilters,
    inferredCourseFamily,
  }
}

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

export const smartSearch = query({
  args: {
    query: v.string(),
    filters: filtersValidator,
    formFourOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const interpreted = interpretProgrammeQuery(args.query, args.filters, args.formFourOnly)
    if (!interpreted.query) {
      return {
        interpreted,
        results: [],
      }
    }

    const results = await ctx.db
      .query("programmes")
      .withSearchIndex("search_searchText", (q) => {
        let search = q.search("searchText", interpreted.query)

        if (interpreted.appliedFilters.region) {
          search = search.eq("region", interpreted.appliedFilters.region)
        }
        if (interpreted.appliedFilters.awardLevel) {
          search = search.eq("awardLevel", interpreted.appliedFilters.awardLevel)
        }
        if (interpreted.appliedFilters.fieldCategory) {
          search = search.eq("fieldCategory", interpreted.appliedFilters.fieldCategory)
        }
        if (interpreted.appliedFilters.courseFamily) {
          search = search.eq("courseFamily", interpreted.appliedFilters.courseFamily)
        }
        if (interpreted.appliedFilters.regulator) {
          search = search.eq("regulator", interpreted.appliedFilters.regulator)
        }
        if (interpreted.appliedFilters.institutionType) {
          search = search.eq("institutionType", interpreted.appliedFilters.institutionType)
        }
        if (interpreted.appliedFilters.ownershipType) {
          search = search.eq("ownershipType", interpreted.appliedFilters.ownershipType)
        }
        if (interpreted.appliedFilters.suitableForFormFourLeaver) {
          search = search.eq(
            "suitableForFormFourLeaver",
            interpreted.appliedFilters.suitableForFormFourLeaver,
          )
        }
        if (interpreted.appliedFilters.confidenceLevel) {
          search = search.eq("confidenceLevel", interpreted.appliedFilters.confidenceLevel)
        }

        return search
      })
      .take(args.limit ?? 25)

    return {
      interpreted,
      results,
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
    const results = await ctx.db
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
      .take(maxCount)

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
    const interpreted = interpretProgrammeQuery(args.query, args.filters, args.formFourOnly)
    if (!interpreted.query) {
      return { interpreted, count: 0, capped: false }
    }

    const maxCount = args.maxCount ?? 1000
    const results = await ctx.db
      .query("programmes")
      .withSearchIndex("search_searchText", (q) => {
        let search = q.search("searchText", interpreted.query)

        if (interpreted.appliedFilters.region) {
          search = search.eq("region", interpreted.appliedFilters.region)
        }
        if (interpreted.appliedFilters.awardLevel) {
          search = search.eq("awardLevel", interpreted.appliedFilters.awardLevel)
        }
        if (interpreted.appliedFilters.fieldCategory) {
          search = search.eq("fieldCategory", interpreted.appliedFilters.fieldCategory)
        }
        if (interpreted.appliedFilters.courseFamily) {
          search = search.eq("courseFamily", interpreted.appliedFilters.courseFamily)
        }
        if (interpreted.appliedFilters.regulator) {
          search = search.eq("regulator", interpreted.appliedFilters.regulator)
        }
        if (interpreted.appliedFilters.institutionType) {
          search = search.eq("institutionType", interpreted.appliedFilters.institutionType)
        }
        if (interpreted.appliedFilters.ownershipType) {
          search = search.eq("ownershipType", interpreted.appliedFilters.ownershipType)
        }
        if (interpreted.appliedFilters.suitableForFormFourLeaver) {
          search = search.eq(
            "suitableForFormFourLeaver",
            interpreted.appliedFilters.suitableForFormFourLeaver,
          )
        }
        if (interpreted.appliedFilters.confidenceLevel) {
          search = search.eq("confidenceLevel", interpreted.appliedFilters.confidenceLevel)
        }

        return search
      })
      .take(maxCount)

    return {
      interpreted,
      count: results.length,
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
