import type { ProgrammeFilters } from "./filters"

const courseFamilyIntents = [
  {
    courseFamily: "engineering",
    terms: ["engineering", "engineer", "civil", "mechanical", "electrical"],
  },
  {
    courseFamily: "health",
    terms: [
      "health",
      "afya",
      "nurse",
      "nursing",
      "nesi",
      "hospital",
      "medical",
      "clinical",
    ],
  },
  {
    courseFamily: "ICT",
    terms: ["ict", "computer", "kompyuta", "software", "network", "technology"],
  },
  {
    courseFamily: "business",
    terms: [
      "business",
      "biashara",
      "accounting",
      "procurement",
      "office",
      "ofisini",
    ],
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
  const matchedIntent = courseFamilyIntents
    .map((intent) => ({
      courseFamily: intent.courseFamily,
      term: intent.terms.find((term) =>
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
