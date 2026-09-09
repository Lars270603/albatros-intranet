import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-[4px] border px-[6px] py-[2px] text-[11px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-surface-2 text-text',
        outline: 'border-border text-text bg-bg',
        success: 'border-transparent bg-success-light text-success',
        warning: 'border-transparent bg-warning-light text-warning',
        destructive: 'border-transparent bg-primary-light text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
