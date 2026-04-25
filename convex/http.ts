import { httpRouter } from "convex/server"

import { internal } from "./_generated/api"
import { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"

const http = httpRouter()

const correctionStatuses = ["pending", "approved", "rejected", "needs_more_info"] as const
type CorrectionStatus = (typeof correctionStatuses)[number]

function parseCorrectionStatus(status: string | null): CorrectionStatus | null {
  if (correctionStatuses.includes(status as CorrectionStatus)) {
    return status as CorrectionStatus
  }

  return null
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  })
}

function assertAdmin(req: Request) {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    return jsonResponse(
      { error: "ADMIN_API_KEY is not configured for this Convex deployment." },
      { status: 500 },
    )
  }

  const authorization = req.headers.get("authorization")
  if (authorization !== `Bearer ${adminKey}`) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}

http.route({
  path: "/admin/corrections",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const unauthorized = assertAdmin(req)
    if (unauthorized) {
      return unauthorized
    }

    const url = new URL(req.url)
    const status = parseCorrectionStatus(url.searchParams.get("status") ?? "pending")

    if (!status) {
      return jsonResponse({ error: "Invalid correction status." }, { status: 400 })
    }

    const limit = Number(url.searchParams.get("limit") ?? "50")
    const corrections = await ctx.runQuery(internal.corrections.byStatus, {
      status,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50,
    })

    return jsonResponse({ corrections })
  }),
})

http.route({
  path: "/admin/corrections/status",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const unauthorized = assertAdmin(req)
    if (unauthorized) {
      return unauthorized
    }

    const body = (await req.json()) as { id?: string; status?: string }
    const status = parseCorrectionStatus(body.status ?? null)

    if (!body.id || !status) {
      return jsonResponse(
        { error: "Request body must include correction id and valid status." },
        { status: 400 },
      )
    }

    const correction = await ctx.runMutation(internal.corrections.updateStatus, {
      id: body.id as Id<"correctionSubmissions">,
      status,
    })

    return jsonResponse({ correction })
  }),
})

export default http
