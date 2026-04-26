"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { useState } from "react"
import type { useQuery } from "convex/react"

import { familyMeta } from "@/components/search/search-config"
import {
  ArrowRightIcon,
  BookmarkIcon,
  ClockIcon,
  PinIcon,
} from "@/components/search/search-icons"
import { api } from "@/convex/_generated/api"

type ProgrammeSearchResult = NonNullable<
  ReturnType<typeof useQuery<typeof api.programmes.smartSearch>>
>["results"][number]

export function ProgrammeCard({ programme }: { programme: ProgrammeSearchResult }) {
  const meta = familyMeta(programme.courseFamily)

  return (
    <article className="group rounded-2xl border border-brand-ink/10 bg-white p-5 transition hover:border-brand-blue/35 hover:shadow-[0_22px_50px_-32px_rgba(29,78,216,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <InstitutionLogo
            fallback={meta.mark}
            institutionName={programme.institutionName}
            logoUrl={programme.institutionLogoUrl}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-brand-ink/45">
              <span>{programme.awardLevel}</span>
              <span className="size-1 rounded-full bg-brand-ink/30" />
              <span>{programme.regulator}</span>
              {programme.ownershipType ? (
                <>
                  <span className="size-1 rounded-full bg-brand-ink/30" />
                  <span>{programme.ownershipType}</span>
                </>
              ) : null}
            </div>
            <h3 className="mt-1.5 truncate text-[17px] font-bold tracking-tight">
              {programme.programmeName}
            </h3>
            <p className="mt-0.5 truncate text-[13.5px] font-medium text-brand-ink/65">
              {programme.institutionName}
            </p>
          </div>
        </div>
        <button
          aria-label="Save programme"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-ink/15 text-brand-ink/45 transition hover:border-brand-ink hover:text-brand-ink"
          type="button"
        >
          <BookmarkIcon className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 text-[12px] text-brand-ink/70">
        {programme.region ? (
          <Tag>
            <PinIcon className="size-3.5" />
            {programme.region}
          </Tag>
        ) : null}
        {programme.duration ? (
          <Tag>
            <ClockIcon className="size-3.5" />
            {programme.duration} years
          </Tag>
        ) : null}
        {programme.feesIfAvailable ? <Tag>{programme.feesIfAvailable}</Tag> : null}
      </div>

      {programme.minimumEntryRequirements ? (
        <div className="mt-4 rounded-xl bg-[#fafafa] p-3.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brand-ink/40">
            Entry requirements
          </p>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-brand-ink/70">
            {programme.minimumEntryRequirements}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-brand-ink/45">
          Verified {programme.lastVerifiedDate}
          {programme.needsReview ? " · Needs review" : ""}
        </p>
        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-brand-blue"
          type="button"
        >
          View details
          <ArrowRightIcon className="size-3.5" />
        </button>
      </div>
    </article>
  )
}

function InstitutionLogo({
  fallback,
  institutionName,
  logoUrl,
}: {
  fallback: string
  institutionName: string
  logoUrl?: string
}) {
  const [failed, setFailed] = useState(false)

  if (logoUrl && !failed) {
    return (
      <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-brand-ink/10 bg-white p-1.5">
        <Image
          alt={`${institutionName} logo`}
          className="max-h-full max-w-full object-contain"
          height={44}
          loading="lazy"
          onError={() => setFailed(true)}
          src={logoUrl}
          unoptimized
          width={44}
        />
      </div>
    )
  }

  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-blue/10 font-mono text-[14px] font-semibold text-brand-blue">
      {fallback}
    </div>
  )
}

function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "neutral" | "green" | "ink"
}) {
  const tones = {
    neutral: "bg-brand-ink/[0.05] text-brand-ink/70",
    green: "bg-emerald-50 text-emerald-700",
    ink: "bg-brand-ink text-white",
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
