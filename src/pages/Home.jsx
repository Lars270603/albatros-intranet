import { useAuth } from '@/hooks/useAuth'
import { HomeHero } from '@/components/home/HomeHero'
import { QuickAccessGrid } from '@/components/home/QuickAccessGrid'
import { NewsWidget } from '@/components/home/NewsWidget'
import { CompanyCalendar } from '@/components/home/CompanyCalendar'

export default function Home() {
  const { profile } = useAuth()

  return (
    <div className="space-y-8">
      <HomeHero firstName={profile?.first_name} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <QuickAccessGrid />
        <NewsWidget />
      </div>

      <CompanyCalendar />
    </div>
  )
}
