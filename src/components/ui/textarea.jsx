import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-md border border-border bg-bg px-3 py-2 text-[15px] text-text placeholder:text-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
