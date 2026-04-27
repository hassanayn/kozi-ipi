import { SearchResultsClient } from "@/components/search/search-results-client"

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams

  return <SearchResultsClient initialSearchParams={serializeSearchParams(resolvedSearchParams)} />
}

function serializeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  return Object.entries(searchParams).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => [key, item] as const)
    }

    return value ? ([[key, value] as const]) : []
  })
}
