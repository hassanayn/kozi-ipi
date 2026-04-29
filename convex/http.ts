import { httpRouter } from "convex/server"

import { internal } from "./_generated/api"
import { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"
import type { ActionCtx } from "./_generated/server"
import { rateLimiter } from "./rateLimits"

const http = httpRouter()

const correctionStatuses = ["pending", "approved", "rejected", "needs_more_info"] as const
type CorrectionStatus = (typeof correctionStatuses)[number]

type AdminAuth = {
  rateLimitKey: string
}

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

function parseBearerToken(req: Request) {
  const authorization = req.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return null
  }

  return authorization.slice("Bearer ".length)
}

function authenticateAdmin(req: Request): AdminAuth | Response {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    return jsonResponse(
      { error: "ADMIN_API_KEY is not configured for this Convex deployment." },
      { status: 500 },
    )
  }

  const bearerToken = parseBearerToken(req)
  if (bearerToken !== adminKey) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 })
  }

  return { rateLimitKey: "admin" }
}

async function assertRateLimit(
  ctx: ActionCtx,
  name: "adminHttpRead" | "adminHttpWrite",
  key: string,
) {
  const status = await rateLimiter.limit(ctx, name, { key })
  if (status.ok) {
    return null
  }

  return jsonResponse(
    {
      error: "Rate limit exceeded.",
      retryAfterMs: status.retryAfter,
    },
    {
      status: 429,
      headers:
        status.retryAfter === undefined
          ? undefined
          : { "retry-after": String(Math.ceil(status.retryAfter / 1000)) },
    },
  )
}

http.route({
  path: "/admin/corrections",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const auth = authenticateAdmin(req)
    if (auth instanceof Response) {
      return auth
    }

    const rateLimited = await assertRateLimit(ctx, "adminHttpRead", auth.rateLimitKey)
    if (rateLimited) {
      return rateLimited
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
    const auth = authenticateAdmin(req)
    if (auth instanceof Response) {
      return auth
    }

    const rateLimited = await assertRateLimit(ctx, "adminHttpWrite", auth.rateLimitKey)
    if (rateLimited) {
      return rateLimited
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, { status: 400 })
    }

    if (!body || typeof body !== "object") {
      return jsonResponse(
        { error: "Request body must include correction id and valid status." },
        { status: 400 },
      )
    }

    const { id, status: rawStatus } = body as { id?: string; status?: string }
    const status = parseCorrectionStatus(rawStatus ?? null)

    if (typeof id !== "string" || !status) {
      return jsonResponse(
        { error: "Request body must include correction id and valid status." },
        { status: 400 },
      )
    }

    try {
      const correction = await ctx.runMutation(internal.corrections.updateStatus, {
        id: id as Id<"correctionSubmissions">,
        status,
      })

      return jsonResponse({ correction })
    } catch {
      return jsonResponse(
        { error: "Correction id is invalid or no longer exists." },
        { status: 400 },
      )
    }
  }),
})

export default http
