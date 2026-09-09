import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-[7px] border border-border bg-bg px-[11px] py-2 text-[14px] text-text placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
