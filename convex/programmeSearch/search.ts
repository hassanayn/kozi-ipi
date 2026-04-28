import type { Doc } from "../_generated/dataModel"
import type { QueryCtx } from "../_generated/server"
import type { ProgrammeFilters } from "./filters"

export async function queryProgrammesBySearchText(
  ctx: QueryCtx,
  text: string,
  filters: ProgrammeFilters | undefined,
  limit: number
): Promise<Doc<"programmes">[]> {
  return await ctx.db
    .query("programmes")
    .withSearchIndex("search_searchText", (q) => {
      let search = q.search("searchText", text)

      if (filters?.region) {
        search = search.eq("region", filters.region)
      }
      if (filters?.awardLevel) {
        search = search.eq("awardLevel", filters.awardLevel)
      }
      if (filters?.fieldCategory) {
        search = search.eq("fieldCategory", filters.fieldCategory)
      }
      if (filters?.courseFamily) {
        search = search.eq("courseFamily", filters.courseFamily)
      }
      if (filters?.regulator) {
        search = search.eq("regulator", filters.regulator)
      }
      if (filters?.institutionType) {
        search = search.eq("institutionType", filters.institutionType)
      }
      if (filters?.ownershipType) {
        search = search.eq("ownershipType", filters.ownershipType)
      }
      if (filters?.suitableForFormFourLeaver) {
        search = search.eq(
          "suitableForFormFourLeaver",
          filters.suitableForFormFourLeaver
        )
      }
      if (filters?.confidenceLevel) {
        search = search.eq("confidenceLevel", filters.confidenceLevel)
      }

      return search
    })
    .take(limit)
}
