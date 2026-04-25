import { Button } from "@/components/ui/button"
import { ProgrammeSearch } from "@/components/programme-search"
import report from "@/data/processed/data-quality-report.json"

export default function Page() {
  const stats = [
    {
      label: "Institutions",
      value: report.institutions.processedCount.toLocaleString(),
      detail: `${report.institutions.enrichedCount.toLocaleString()} enriched`,
    },
    {
      label: "Programmes",
      value: report.programmes.processedCount.toLocaleString(),
      detail: `${report.programmes.enrichedCount.toLocaleString()} enriched`,
    },
    {
      label: "Needs review",
      value: report.programmes.needsReviewCount.toLocaleString(),
      detail: "programme rows",
    },
  ]

  return (
    <main className="min-h-svh bg-background px-5 py-6 text-foreground sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Kozi Ipi</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Tanzania post-Form Four course discovery
            </h1>
          </div>
          <Button>Suggest an edit</Button>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <ProgrammeSearch />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((item) => (
              <div className="rounded-md border p-4" key={item.label}>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            "Lexical search and structured filters are the MVP search backbone.",
            "Eligibility must be decided by rules, not AI or vectors.",
            "The broad dataset is canonical; NACTVET data enriches matching rows.",
          ].map((item) => (
            <div className="rounded-md border p-4 text-sm leading-6 text-muted-foreground" key={item}>
              {item}
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
