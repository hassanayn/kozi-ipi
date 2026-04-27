import type { ReactNode } from "react"

import type {
  InstitutionOwnership,
  InstitutionType,
} from "@/components/vyuo/institutions"
import { fieldFocus } from "@/components/vyuo/institutions"
import { CheckIcon } from "@/components/vyuo/vyuo-icons"

const institutionTypes: Array<{ key: InstitutionType; label: string }> = [
  { key: "University", label: "Vyuo Vikuu" },
  { key: "College", label: "Colleges" },
  { key: "TVET", label: "TVET" },
]

const awardLevelOptions = ["Certificate", "Diploma", "Degree", "Short Course"]
const ownershipOptions: InstitutionOwnership[] = ["Public", "Private", "Unknown"]

type VyuoFiltersProps = {
  awardLevels: Set<string>
  clearAll: () => void
  field: string
  hasFilters: boolean
  ownership: InstitutionOwnership | ""
  region: string
  regions: string[]
  setAwardLevels: (value: Set<string>) => void
  setField: (value: string) => void
  setOwnership: (value: InstitutionOwnership | "") => void
  setRegion: (value: string) => void
  setTypes: (value: Set<InstitutionType>) => void
  types: Set<InstitutionType>
  counts?: {
    typeCounts: Record<string, number>
    ownershipCounts: Record<string, number>
    awardLevelCounts: Record<string, number>
  }
}

export function VyuoFilters({
  awardLevels,
  clearAll,
  field,
  hasFilters,
  ownership,
  region,
  regions,
  setAwardLevels,
  setField,
  setOwnership,
  setRegion,
  setTypes,
  types,
  counts,
}: VyuoFiltersProps) {
  return (
    <aside className="h-fit min-w-0 max-w-full lg:sticky lg:top-6">
      <div className="w-full max-w-full overflow-hidden rounded-2xl border border-brand-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-brand-ink/8 px-5 py-4">
          <p className="text-[13.5px] font-semibold tracking-tight">Filters</p>
          {hasFilters ? (
            <button
              onClick={clearAll}
              className="text-[12px] font-semibold text-brand-blue hover:underline"
              type="button"
            >
              Futa zote
            </button>
          ) : null}
        </div>

        <FilterBlock title="Aina ya taasisi">
          <div className="grid gap-1">
            {institutionTypes.map((item) => (
              <CheckRow
                key={item.key}
                label={item.label}
                count={counts?.typeCounts[item.key] ?? 0}
                checked={types.has(item.key)}
                onChange={() => setTypes(toggleSet(types, item.key))}
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Mkoa">
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="box-border h-10 w-full rounded-lg border border-brand-ink/15 bg-white px-3 text-[13px] outline-none transition focus:border-brand-blue"
          >
            <option value="">All</option>
            {regions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FilterBlock>

        <FilterBlock title="Umiliki">
          <div className="grid gap-1">
            {ownershipOptions.map((item) => (
              <CheckRow
                key={item}
                label={item}
                count={counts?.ownershipCounts[item] ?? 0}
                checked={ownership === item}
                onChange={() => setOwnership(ownership === item ? "" : item)}
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Award levels">
          <div className="grid gap-1">
            {awardLevelOptions.map((item) => (
              <CheckRow
                key={item}
                label={item}
                count={counts?.awardLevelCounts[item] ?? 0}
                checked={awardLevels.has(item)}
                onChange={() => setAwardLevels(toggleSet(awardLevels, item))}
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Field focus" last>
          <select
            value={field}
            onChange={(event) => setField(event.target.value)}
            className="box-border h-10 w-full rounded-lg border border-brand-ink/15 bg-white px-3 text-[13px] outline-none transition focus:border-brand-blue"
          >
            <option value="">Chagua field ya masomo</option>
            {fieldFocus.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FilterBlock>
      </div>
    </aside>
  )
}

function toggleSet<T>(current: Set<T>, key: T) {
  const next = new Set(current)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

function FilterBlock({
  children,
  last = false,
  title,
}: {
  children: ReactNode
  last?: boolean
  title: string
}) {
  return (
    <div className={last ? "min-w-0 px-5 py-5" : "min-w-0 border-b border-brand-ink/8 px-5 py-5"}>
      <p className="mb-3 text-[12.5px] font-semibold tracking-tight">{title}</p>
      {children}
    </div>
  )
}

function CheckRow({
  checked,
  count,
  label,
  onChange,
}: {
  checked: boolean
  count: number
  label: string
  onChange: () => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition ${
        checked ? "bg-brand-blue/5" : "hover:bg-brand-ink/[0.03]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={`grid size-4 shrink-0 place-items-center rounded border transition ${
            checked ? "border-brand-blue bg-brand-blue" : "border-brand-ink/25 bg-white"
          }`}
        >
          {checked ? <CheckIcon className="size-3 text-white" /> : null}
        </span>
        <span
          className={`truncate text-[13px] ${
            checked ? "font-semibold text-brand-blue" : "text-brand-ink/75"
          }`}
        >
          {label}
        </span>
      </span>
      <span className="font-mono text-[11px] text-brand-ink/40">{count}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    </label>
  )
}
