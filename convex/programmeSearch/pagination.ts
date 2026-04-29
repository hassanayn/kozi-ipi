export type SearchPage<T> = {
  cursor: string | null
  hasMore: boolean
  nextCursor: string | null
  results: T[]
  total: number
}

export function sliceSearchPage<T>(
  results: T[],
  args: {
    cursor?: string | null
    pageSize: number
  }
): SearchPage<T> {
  const offset = parseSearchCursor(args.cursor)
  const page = results.slice(offset, offset + args.pageSize)
  const nextOffset = offset + page.length
  const hasMore = nextOffset < results.length

  return {
    cursor: args.cursor ?? null,
    hasMore,
    nextCursor: hasMore ? formatSearchCursor(nextOffset) : null,
    results: page,
    total: results.length,
  }
}

function parseSearchCursor(cursor?: string | null) {
  if (!cursor) return 0

  const offset = Number.parseInt(cursor, 10)
  if (!Number.isFinite(offset) || offset < 0) return 0

  return Math.trunc(offset)
}

function formatSearchCursor(offset: number) {
  return String(offset)
}
