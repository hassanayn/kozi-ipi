import { fieldFocus, matchesField, popularRegions } from "@/lib/domain/taxonomy"

export { fieldFocus, popularRegions }

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

export function fieldMatches(institution: Institution, field: string) {
  const haystack = `${institution.fieldSlugs.join(" ")} ${institution.searchText}`.toLowerCase()

  return matchesField(haystack, field)
}
