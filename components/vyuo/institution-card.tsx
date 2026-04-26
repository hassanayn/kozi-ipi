import Image from "next/image"
import Link from "next/link"

import {
  ArrowRightIcon,
  PinIcon,
} from "@/components/search/search-icons"
import type { Institution, InstitutionTone } from "@/components/vyuo/institutions"
import { CheckIcon } from "@/components/vyuo/vyuo-icons"

export function InstitutionCard({ institution }: { institution: Institution }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-brand-ink/10 bg-white p-5 transition hover:border-brand-blue/35 hover:shadow-[0_22px_50px_-32px_rgba(29,78,216,0.45)]">
      <div className="flex items-start gap-4">
        <Crest institution={institution} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15.5px] font-bold leading-snug tracking-tight">
            {institution.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="inline-flex items-center rounded-md bg-brand-blue/10 px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
              {institution.type}
            </span>
            {institution.accredited ? (
              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-700">
                <CheckIcon className="size-3.5" />
                Imethibitishwa
              </span>
            ) : null}
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-brand-ink/65">
            <PinIcon className="size-3.5" />
            {institution.region}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-[13px] leading-6 text-brand-ink/70">
        {institution.blurb}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {institution.fields.slice(0, 3).map((item) => (
          <span
            key={item}
            className="rounded-md bg-brand-ink/[0.05] px-2 py-1 text-[11.5px] font-medium text-brand-ink/65"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <p className="text-[12.5px] font-semibold text-brand-blue">
          Programu {institution.programmes}+
        </p>
        <Link
          href={`/search?q=${encodeURIComponent(institution.name)}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-ink/15 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand-ink transition group-hover:border-brand-ink group-hover:bg-brand-ink group-hover:text-white"
        >
          Tazama chuo
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}

function Crest({ institution }: { institution: Institution }) {
  const tones: Record<InstitutionTone, string> = {
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    ink: "bg-brand-ink/[0.06] text-brand-ink ring-brand-ink/15",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
  }

  if (institution.logoUrl) {
    return (
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-brand-ink/10 bg-white p-1.5">
        <Image
          src={institution.logoUrl}
          alt={`${institution.name} logo`}
          width={48}
          height={48}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div
      className={`grid size-12 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${tones[institution.monogramTone]}`}
    >
      <span className="font-mono text-[10.5px] font-bold tracking-tight">{institution.short}</span>
    </div>
  )
}
