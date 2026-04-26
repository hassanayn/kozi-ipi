export const courseFamilies = [
  { key: "engineering", label: "Engineering", swahili: "Uhandisi", mark: "⚙" },
  { key: "health", label: "Afya", swahili: "Health", mark: "✚" },
  { key: "ICT", label: "Tech", swahili: "Teknolojia", mark: "</>" },
  { key: "business", label: "Biashara", swahili: "Business", mark: "$" },
  { key: "education", label: "Education", swahili: "Elimu", mark: "✎" },
  { key: "tourism_hospitality", label: "Utalii", swahili: "Tourism", mark: "✈" },
] as const

export const awardLevels = [
  { label: "All levels", value: "all", duration: undefined },
  { label: "Diploma", value: "ordinary diploma", duration: "2-3 yrs" },
  { label: "Degree", value: "degree", duration: "3-5 yrs" },
  { label: "Certificate", value: "certificate", duration: "1 yr" },
] as const

export const regions = [
  "Dar es Salaam",
  "Arusha",
  "Mwanza",
  "Dodoma",
  "Kilimanjaro",
  "Mbeya",
  "Iringa",
  "Tanga",
  "Morogoro",
  "Zanzibar Urban/West",
] as const

export const trendingQueries = [
  "Clinical medicine",
  "Civil engineering",
  "Computer science",
  "Nataka kuwa nurse",
  "Hotel management",
] as const

export type SearchFilterKey = "family" | "formFour" | "level" | "region"

export type ActiveFilter = {
  key: string
  label: string
  clear: () => void
}

const familyLabels = Object.fromEntries(courseFamilies.map((family) => [family.key, family.label]))

export function getInitialQuery(searchParams: URLSearchParams) {
  const query = searchParams.get("q")?.trim()
  const family = searchParams.get("family")?.trim()

  if (query) {
    return query
  }

  if (family) {
    return familyLabels[family] ?? family
  }

  return "clinical medicine"
}

export function updateParams(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const nextParams = new URLSearchParams(searchParams.toString())

  for (const [key, value] of Object.entries(updates)) {
    if (!value || value === "all" || value === "false") {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }
  }

  return nextParams
}

export function familyMeta(key?: string) {
  return courseFamilies.find((family) => family.key === key) ?? {
    key: key ?? "other",
    label: key ?? "Other",
    swahili: "",
    mark: "•",
  }
}

export function formFourLabel(value?: string) {
  if (value === "yes") {
    return "Form Four direct"
  }

  if (value === "no") {
    return "A-level required"
  }

  return "Verify entry route"
}

export function isActiveFilter(
  filter: ActiveFilter | false | "" | undefined,
): filter is ActiveFilter {
  return Boolean(filter)
}
