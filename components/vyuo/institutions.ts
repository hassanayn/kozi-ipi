import { fieldFocus, matchesField, popularRegions } from "@/lib/domain/taxonomy"

export { fieldFocus, popularRegions }

export type InstitutionType = "University" | "College" | "TVET"
export type InstitutionOwnership = "Public" | "Private" | "Unknown"

type InstitutionSearchShape = {
  fieldSlugs: string[]
  searchText: string
}

export function fieldMatches(institution: InstitutionSearchShape, field: string) {
  const haystack = `${institution.fieldSlugs.join(" ")} ${institution.searchText}`.toLowerCase()

  return matchesField(haystack, field)
}
