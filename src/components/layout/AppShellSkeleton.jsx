import { Skeleton } from '@/components/ui/skeleton'

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[240px] shrink-0 flex-col gap-2 border-r border-border bg-surface p-4 md:flex">
        <Skeleton className="mb-4 h-10 w-10 rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-md" />
        ))}
      </div>
      <div className="flex-1 space-y-6 p-8">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}
