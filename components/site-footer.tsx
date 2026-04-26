import Link from "next/link"

const FOOTER_LINKS = [
  { label: "Kozi", href: "/search" },
  { label: "Vyuo", href: "/vyuo" },
  { label: "GitHub", href: "https://github.com/Bulalu/kozi-ipi", external: true },
  {
    label: "Changia",
    href: "https://github.com/Bulalu/kozi-ipi/blob/master/CONTRIBUTING.md",
    external: true,
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-ink/10 bg-white">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4 px-5 py-6 text-sm text-brand-ink/55 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit text-[18px] font-black tracking-[-0.03em] text-brand-ink"
          >
            Kozi Ipi
            <span className="ml-1 text-brand-blue">↗</span>
          </Link>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="transition-colors hover:text-brand-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-brand-ink/10 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kozi Ipi.</p>
          <p>Verify admissions details with the official institution before applying.</p>
        </div>
      </div>
    </footer>
  )
}
