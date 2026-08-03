import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function SkeletonCard({ variant = 'post' }) {
  if (variant === 'product') {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <CardContent className="pt-4 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </CardContent>
      </Card>
    )
  }

  if (variant === 'team') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardContent>
    </Card>
  )
}
