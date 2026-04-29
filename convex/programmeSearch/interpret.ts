import { courseFamilies } from "../../lib/domain/taxonomy"

import type { ProgrammeFilters } from "./filters"

const vagueIntentPattern =
  /\b(i want|want to|study|become|nataka|kuwa|kazi ya|courses? za)\b/i

export function includesIntentTerm(query: string, term: string) {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])${escapedTerm}($|[^\\p{L}\\p{N}])`,
    "iu"
  ).test(query)
}

export function interpretProgrammeQuery(
  query: string,
  filters?: ProgrammeFilters,
  formFourOnly?: boolean
) {
  const trimmedQuery = query.trim()
  const normalizedQuery = trimmedQuery.toLowerCase()
  const matchedIntent = courseFamilies
    .map((family) => ({
      courseFamily: family.key,
      term: family.intentTerms.find((term) =>
        includesIntentTerm(normalizedQuery, term)
      ),
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
    (normalizedQuery === matchedIntent.term ||
      vagueIntentPattern.test(trimmedQuery))
  const rewrittenQuery = shouldSimplifyQuery
    ? (matchedIntent.term ?? trimmedQuery)
    : trimmedQuery

  return {
    query: rewrittenQuery,
    appliedFilters,
    inferredCourseFamily,
  }
}
