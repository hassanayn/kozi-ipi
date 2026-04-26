export type InstitutionType = "University" | "College" | "TVET"
export type InstitutionOwnership = "Public" | "Private" | "Unknown"
export type InstitutionTone = "amber" | "blue" | "green" | "indigo" | "ink" | "red"

export type Institution = {
  id: string
  name: string
  short: string
  type: InstitutionType
  accredited: boolean
  region: string
  ownership: InstitutionOwnership
  blurb: string
  fields: string[]
  fieldSlugs: string[]
  programmes: number
  monogramTone: InstitutionTone
  awardLevels: string[]
  logoUrl?: string
  searchText: string
}

export type RawInstitution = {
  institutionName?: string
  normalizedInstitutionName?: string
  regulator?: string
  ownershipType?: string
  institutionType?: string
  institutionCategory?: string
  region?: string
  districtOrCouncil?: string
  physicalLocation?: string
  website?: string
  logoUrl?: string
  logoStatus?: string
  sourceType?: string
  confidenceLevel?: string
  lastVerifiedDate?: string
  notes?: string
  needsReview?: boolean
  searchText?: string
}

export type RawProgramme = {
  programmeName?: string
  normalizedInstitutionName?: string
  awardLevel?: string
  fieldCategory?: string
  courseFamily?: string
  searchText?: string
}

type ProgrammeSummary = {
  count: number
  awardLevels: Map<string, number>
  fields: Map<string, number>
  searchTerms: string[]
}

export const popularRegions = [
  "Dar es Salaam",
  "Arusha",
  "Mwanza",
  "Dodoma",
  "Kilimanjaro",
  "Zanzibar",
]

export const fieldFocus = [
  "Engineering",
  "Health",
  "ICT",
  "Business",
  "Education",
  "Agriculture",
  "Law",
  "Tourism",
]

const fieldTaxonomy: Record<string, string[]> = {
  Agriculture: ["agriculture"],
  Business: ["business", "accounting", "procurement", "commerce", "insurance", "banking"],
  Education: ["education", "teacher", "teaching", "languages"],
  Engineering: [
    "engineering",
    "technical",
    "mechanical",
    "electrical",
    "construction",
    "transport",
    "auto",
    "automotive",
  ],
  Health: ["health", "medicine", "nursing", "pharmacy", "clinical", "laboratory"],
  ICT: ["ict", "computer", "technology", "information technology", "software"],
  Law: ["law"],
  Tourism: ["tourism", "hospitality", "tour guiding", "culinary", "wildlife"],
}

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

const tones: InstitutionTone[] = ["blue", "green", "amber", "indigo", "red", "ink"]

export function buildInstitutions(
  rawInstitutions: RawInstitution[],
  rawProgrammes: RawProgramme[]
) {
  const programmesByInstitution = summarizeProgrammes(rawProgrammes)

  return rawInstitutions
    .map((item, index) => {
      const normalizedName = item.normalizedInstitutionName || normalize(item.institutionName)
      const summary = programmesByInstitution.get(normalizedName) ?? emptyProgrammeSummary()
      const type = normalizeInstitutionType(item.institutionType)
      const ownership = normalizeOwnership(item.ownershipType)
      const region = cleanLabel(item.region) || "Region not verified"
      const fields = topLabels(summary.fields, 4)
      const fieldSlugs = [...summary.fields.keys()]
      const awardLevels = topLabels(summary.awardLevels, 6)
      const name = item.institutionName || "Unknown institution"

      return {
        id: `${normalizedName || "institution"}-${index}`,
        name,
        short: abbreviation(name),
        type,
        accredited: item.sourceType === "regulator" || item.confidenceLevel === "high",
        region,
        ownership,
        blurb: institutionBlurb(type, region, summary.count, item.regulator),
        fields: fields.length > 0 ? fields : fallbackFields(item),
        fieldSlugs: fieldSlugs.length > 0 ? fieldSlugs : fallbackFieldSlugs(item),
        programmes: summary.count,
        monogramTone: tones[index % tones.length],
        awardLevels,
        logoUrl: item.logoUrl,
        searchText: [
          name,
          item.normalizedInstitutionName,
          item.regulator,
          item.institutionType,
          item.institutionCategory,
          item.ownershipType,
          item.region,
          item.districtOrCouncil,
          item.physicalLocation,
          item.searchText,
          fields.join(" "),
          fieldSlugs.join(" "),
          summary.searchTerms.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      } satisfies Institution
    })
    .sort((a, b) => b.programmes - a.programmes || a.name.localeCompare(b.name))
}

export function fieldMatches(institution: Institution, field: string) {
  const terms = fieldTaxonomy[field] ?? [field.toLowerCase()]
  const haystack = `${institution.fieldSlugs.join(" ")} ${institution.searchText}`.toLowerCase()
  return terms.some((term) => haystack.includes(term.toLowerCase()))
}

function summarizeProgrammes(programmes: RawProgramme[]) {
  const summaries = new Map<string, ProgrammeSummary>()

  for (const programme of programmes) {
    const key = programme.normalizedInstitutionName
    if (!key) continue

    const summary = summaries.get(key) ?? emptyProgrammeSummary()
    summary.count += 1
    increment(summary.awardLevels, normalizeAwardLevel(programme.awardLevel))
    increment(summary.fields, programme.fieldCategory)
    increment(summary.fields, programme.courseFamily)
    if (programme.programmeName) summary.searchTerms.push(programme.programmeName)
    summaries.set(key, summary)
  }

  return summaries
}

function emptyProgrammeSummary(): ProgrammeSummary {
  return { count: 0, awardLevels: new Map(), fields: new Map(), searchTerms: [] }
}

function increment(map: Map<string, number>, rawValue?: string) {
  const value = normalize(rawValue)
  if (!value || value === "unknown") return
  map.set(value, (map.get(value) ?? 0) + 1)
}

function topLabels(values: Map<string, number>, limit: number) {
  return [...values]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => fieldLabels[value] ?? titleCase(value))
}

function fallbackFields(item: RawInstitution) {
  return fallbackFieldSlugs(item).map((value) => fieldLabels[value] ?? titleCase(value)).slice(0, 3)
}

function fallbackFieldSlugs(item: RawInstitution) {
  const text = `${item.institutionType ?? ""} ${item.institutionCategory ?? ""}`.toLowerCase()
  return Object.values(fieldTaxonomy).flat().filter((term) => text.includes(term)).slice(0, 3)
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
  if (value.includes("degree")) return "degree"
  if (value.includes("diploma")) return "diploma"
  if (value.includes("certificate")) return "certificate"
  if (value.includes("short")) return "short course"
  return value
}

function institutionBlurb(
  type: InstitutionType,
  region: string,
  programmeCount: number,
  regulator?: string
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

function cleanLabel(value?: string) {
  return value?.trim()
}

function normalize(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? ""
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}
