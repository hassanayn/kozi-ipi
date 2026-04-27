import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter"

import { components } from "./_generated/api"

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  searchEventLog: {
    kind: "token bucket",
    rate: 600,
    period: MINUTE,
    capacity: 200,
    shards: 10,
  },
  adminHttpRead: {
    kind: "token bucket",
    rate: 120,
    period: MINUTE,
    capacity: 60,
  },
  adminHttpWrite: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 10,
  },
})
