import type { Doc } from "../_generated/dataModel"

export function formatProgrammeSearchResults(results: Doc<"programmes">[]) {
  return results.map((programme) => ({
    ...programme,
    programmeName: cleanProgrammeName(programme.programmeName),
    institutionName: cleanDisplayText(programme.institutionName),
    minimumEntryRequirements: cleanDisplayText(programme.minimumEntryRequirements),
    requiredSubjects: cleanDisplayText(programme.requiredSubjects),
    feesIfAvailable: cleanDisplayText(programme.feesIfAvailable),
  }))
}

function cleanProgrammeName(value: string) {
  return cleanDisplayText(value)
    .replace(/\s+subjects?:.*$/i, "")
    .replace(/\s+\d+\s+\d+\s+duration\s*\(yrs\).*$/i, "")
    .trim()
}

function cleanDisplayText(value?: string) {
  return (value ?? "")
    .replace(/\.{5,}\s*\d*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
