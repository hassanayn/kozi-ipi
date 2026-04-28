import type { Doc } from "../_generated/dataModel"
import type { QueryCtx } from "../_generated/server"

export async function attachInstitutionLogos(
  ctx: QueryCtx,
  results: Doc<"programmes">[]
) {
  return await Promise.all(
    results.map(async (programme) => {
      const institution = await ctx.db
        .query("institutions")
        .withIndex("by_normalizedInstitutionName", (q) =>
          q.eq("normalizedInstitutionName", programme.normalizedInstitutionName)
        )
        .take(1)

      const institutionLogo =
        institution[0]?.logoStatus === "verified" ? institution[0] : undefined

      return {
        ...programme,
        programmeName: cleanProgrammeName(programme.programmeName),
        institutionName: cleanDisplayText(programme.institutionName),
        minimumEntryRequirements: cleanDisplayText(
          programme.minimumEntryRequirements
        ),
        requiredSubjects: cleanDisplayText(programme.requiredSubjects),
        feesIfAvailable: cleanDisplayText(programme.feesIfAvailable),
        institutionLogoUrl: institutionLogo?.logoUrl,
        institutionLogoSourceUrl: institutionLogo?.logoSourceUrl,
        institutionWebsite: institution[0]?.website,
      }
    })
  )
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
