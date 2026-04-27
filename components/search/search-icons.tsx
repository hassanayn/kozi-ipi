import type { ReactNode } from "react"

function Icon({
  className = "size-4",
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  )
}

export function XIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  )
}

export function PinIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
      <circle cx={12} cy={9} r={2.5} />
    </Icon>
  )
}

export function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" />
    </Icon>
  )
}

export function BookmarkIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </Icon>
  )
}

export function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx={18} cy={5} r={3} />
      <circle cx={6} cy={12} r={3} />
      <circle cx={18} cy={19} r={3} />
      <path d="m8.6 10.5 6.8-4" />
      <path d="m8.6 13.5 6.8 4" />
    </Icon>
  )
}

export function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  )
}
