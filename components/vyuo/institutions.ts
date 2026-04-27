export type InstitutionType = "University" | "College" | "TVET"
export type InstitutionOwnership = "Public" | "Private" | "Unknown"
export type InstitutionTone = "amber" | "blue" | "green" | "indigo" | "ink" | "red"

export type Institution = {
  id: string
  name: string
  normalizedName: string
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

export function fieldMatches(institution: Institution, field: string) {
  const terms = fieldTaxonomy[field] ?? [field.toLowerCase()]
  const haystack = `${institution.fieldSlugs.join(" ")} ${institution.searchText}`.toLowerCase()

  return terms.some((term) => haystack.includes(term.toLowerCase()))
}
