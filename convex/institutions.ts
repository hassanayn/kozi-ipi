import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"

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

const fieldLabels: Record<string, string> = {
  accounting: "Accounting",
  agriculture: "Agriculture",
  arts: "Arts",
  business: "Business",
  "beauty/fashion": "Beauty/Fashion",
  "community development": "Community Development",
  construction: "Construction",
  education: "Education",
  electrical: "Electrical",
  engineering: "Engineering",
  health: "Health",
  hospitality: "Hospitality",
  ICT: "ICT",
  ict: "ICT",
  law: "Law",
  mechanical: "Mechanical",
  media: "Media",
  other: "General",
  procurement: "Procurement",
  "religious studies": "Religious Studies",
  "social work": "Social Work",
  tourism: "Tourism",
  tourism_hospitality: "Tourism",
  transport: "Transport",
}

const tones = ["blue", "green", "amber", "indigo", "red", "ink"] as const

type InstitutionType = "University" | "College" | "TVET"
type InstitutionOwnership = "Public" | "Private" | "Unknown"

export const listForBrowse = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 1000, 1000)
    const institutions = await ctx.db
      .query("institutions")
      .withIndex("by_programmeCount")
      .order("desc")
      .take(limit)

    return institutions.map(toBrowseInstitution)
  },
})

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

function toBrowseInstitution(institution: Doc<"institutions">, index: number) {
  const fieldSlugs = [...new Set([
    ...(institution.fieldCategories ?? []),
    ...(institution.courseFamilies ?? []),
  ])]
  const fields = topLabels(fieldSlugs, 4)
  const type = normalizeInstitutionType(institution.institutionType)
  const ownership = normalizeOwnership(institution.ownershipType)
  const region = institution.region ?? "Region not verified"
  const programmeCount = institution.programmeCount ?? 0

  return {
    id: institution._id,
    name: institution.institutionName,
    short: abbreviation(institution.institutionName),
    type,
    accredited: institution.sourceType === "regulator" || institution.confidenceLevel === "high",
    region,
    ownership,
    blurb: institutionBlurb(type, region, programmeCount, institution.regulator),
    fields: fields.length > 0 ? fields : fallbackFields(institution),
    fieldSlugs: fieldSlugs.length > 0 ? fieldSlugs : fallbackFieldSlugs(institution),
    programmes: programmeCount,
    monogramTone: tones[index % tones.length],
    awardLevels: [
      ...new Set((institution.awardLevels ?? []).map(normalizeAwardLevel).filter(Boolean)),
    ],
    ...(institution.logoStatus === "verified" && institution.logoUrl
      ? { logoUrl: institution.logoUrl }
      : {}),
    searchText: [
      institution.institutionName,
      institution.normalizedInstitutionName,
      institution.regulator,
      institution.institutionType,
      institution.institutionCategory,
      institution.ownershipType,
      institution.region,
      institution.districtOrCouncil,
      institution.physicalLocation,
      institution.searchText,
      institution.browseSearchText,
      fields.join(" "),
      fieldSlugs.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }
}

function topLabels(values: string[], limit: number) {
  const labels = [...new Set(values)]
    .filter((value) => value && value.toLowerCase() !== "unknown")
    .map((value) => fieldLabels[value] ?? titleCase(value))

  return [...new Set(labels)].slice(0, limit)
}

function fallbackFields(institution: Doc<"institutions">) {
  const labels = fallbackFieldSlugs(institution)
    .map((value) => fieldLabels[value] ?? titleCase(value))

  return [...new Set(labels)].slice(0, 3)
}

function fallbackFieldSlugs(institution: Doc<"institutions">) {
  const text = `${institution.institutionType} ${institution.institutionCategory ?? ""}`.toLowerCase()
  const terms = [
    "agriculture",
    "business",
    "education",
    "engineering",
    "health",
    "ict",
    "law",
    "technical",
    "tourism",
  ]

  return terms.filter((term) => text.includes(term)).slice(0, 3)
}

function normalizeInstitutionType(rawValue?: string): InstitutionType {
  const value = normalize(rawValue)
  if (value.includes("university")) return "University"
  if (value.includes("vocational") || value.includes("technical")) return "TVET"
  return "College"
}

function normalizeOwnership(rawValue?: string): InstitutionOwnership {
  const value = normalize(rawValue)
  if (value === "public") return "Public"
  if (value === "private") return "Private"
  return "Unknown"
}

function normalizeAwardLevel(rawValue?: string) {
  const value = normalize(rawValue)
  if (!value || value === "unknown") return ""
  if (value.includes("degree")) return "Degree"
  if (value.includes("diploma")) return "Diploma"
  if (value.includes("certificate")) return "Certificate"
  if (value.includes("short")) return "Short Course"
  return titleCase(value)
}

function institutionBlurb(
  type: InstitutionType,
  region: string,
  programmeCount: number,
  regulator?: string,
) {
  const programmeText =
    programmeCount > 0 ? `${programmeCount}+ programmes` : "programmes pending verification"
  const regulatorText = regulator ? ` Source: ${regulator}.` : ""
  return `${type} in ${region} with ${programmeText}.${regulatorText}`
}

function abbreviation(name: string) {
  const parenthetical = name.match(/\(([A-Z][A-Z0-9-]{1,10})\)/)
  if (parenthetical) return parenthetical[1]

  const letters = name
    .replace(/[-–]/g, " ")
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && !["and", "of", "the", "in"].includes(word.toLowerCase()))
    .map((word) => word[0]?.toUpperCase())
    .join("")

  return letters.slice(0, 6) || "KI"
}

function normalize(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? ""
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

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
