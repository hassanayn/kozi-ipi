import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-transparent text-foreground placeholder:text-muted-foreground transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default: "border-border",
        ghost: "border-transparent bg-transparent",
      },
      size: {
        default: "h-7 px-2 text-xs/relaxed",
        sm: "h-6 px-2 text-xs/relaxed",
        lg: "h-9 px-3 text-sm",
        xl: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Input({
  className,
  variant,
  size,
  type = "text",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      data-slot="input"
      data-variant={variant}
      data-size={size}
      type={type}
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
