import type { Doc } from "../_generated/dataModel"
import type { ProgrammeFilters } from "./filters"

export function matchesProgrammeFilters(
  programme: Doc<"programmes">,
  filters: ProgrammeFilters
) {
  if (filters.region && programme.region !== filters.region) return false
  if (filters.awardLevel && programme.awardLevel !== filters.awardLevel)
    return false
  if (
    filters.fieldCategory &&
    programme.fieldCategory !== filters.fieldCategory
  )
    return false
  if (filters.courseFamily && programme.courseFamily !== filters.courseFamily)
    return false
  if (filters.regulator && programme.regulator !== filters.regulator)
    return false
  if (
    filters.institutionType &&
    programme.institutionType !== filters.institutionType
  )
    return false
  if (
    filters.ownershipType &&
    programme.ownershipType !== filters.ownershipType
  )
    return false
  if (
    filters.suitableForFormFourLeaver &&
    programme.suitableForFormFourLeaver !== filters.suitableForFormFourLeaver
  ) {
    return false
  }
  if (
    filters.confidenceLevel &&
    programme.confidenceLevel !== filters.confidenceLevel
  ) {
    return false
  }

  return true
}
