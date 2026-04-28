import { v } from "convex/values"

const suitability = v.union(
  v.literal("yes"),
  v.literal("no"),
  v.literal("unknown")
)
const confidenceLevel = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
)

export const filtersValidator = v.optional(
  v.object({
    region: v.optional(v.string()),
    awardLevel: v.optional(v.string()),
    fieldCategory: v.optional(v.string()),
    courseFamily: v.optional(v.string()),
    regulator: v.optional(v.string()),
    institutionType: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    normalizedInstitutionName: v.optional(v.string()),
    suitableForFormFourLeaver: v.optional(suitability),
    confidenceLevel: v.optional(confidenceLevel),
  })
)

export type ProgrammeFilters = {
  region?: string
  awardLevel?: string
  fieldCategory?: string
  courseFamily?: string
  regulator?: string
  institutionType?: string
  ownershipType?: string
  normalizedInstitutionName?: string
  suitableForFormFourLeaver?: "yes" | "no" | "unknown"
  confidenceLevel?: "high" | "medium" | "low"
}
