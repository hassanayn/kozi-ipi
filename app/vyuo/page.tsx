import { preloadQuery } from "convex/nextjs"

import { VyuoPageClient } from "@/components/vyuo/vyuo-page-client"
import { api } from "@/convex/_generated/api"

export const dynamic = "force-dynamic"

export default async function VyuoPage() {
  const preloadedInstitutions = await preloadQuery(api.institutions.listForBrowse, {
    limit: 1000,
  })

  return <VyuoPageClient preloadedInstitutions={preloadedInstitutions} />
}
