import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PendingTab } from '@/components/admin/PendingTab'
import { MembersTab } from '@/components/admin/MembersTab'
import { PollsTab } from '@/components/admin/PollsTab'
import { ModerationTab } from '@/components/admin/ModerationTab'
import { supabase } from '@/lib/supabase'

export default function Admin() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Mitarbeiter konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const pending = profiles.filter((p) => p.status === 'pending')

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[28px] font-extrabold tracking-tight text-text">Admin-Panel</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Ausstehende Anfragen
            {pending.length > 0 && (
              <Badge className="border-transparent bg-primary text-white">{pending.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="members">Alle Mitarbeiter</TabsTrigger>
          <TabsTrigger value="polls">Umfragen</TabsTrigger>
          <TabsTrigger value="moderation">Beitrags-Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {!loading && <PendingTab pending={pending} onChanged={load} />}
        </TabsContent>
        <TabsContent value="members">
          {!loading && <MembersTab members={profiles} onChanged={load} />}
        </TabsContent>
        <TabsContent value="polls">
          <PollsTab />
        </TabsContent>
        <TabsContent value="moderation">
          <ModerationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
