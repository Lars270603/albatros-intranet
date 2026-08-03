import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Plus, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactDialog } from '@/components/contacts/ContactDialog'
import { CONTACT_CATEGORIES } from '@/lib/contactCategories'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function Contacts() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  const isAdmin = profile?.role === 'admin'

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error('Kontakte konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingContact(null)
    setDialogOpen(true)
  }

  function openEdit(contact) {
    setEditingContact(contact)
    setDialogOpen(true)
  }

  async function handleSave(form) {
    if (editingContact) {
      const { error } = await supabase.from('contacts').update(form).eq('id', editingContact.id)
      if (error) throw error
      toast({ title: 'Kontakt aktualisiert' })
    } else {
      const { error } = await supabase.from('contacts').insert({ ...form, created_by: user.id })
      if (error) throw error
      toast({ title: 'Kontakt hinzugefügt' })
    }
    load()
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
      setContacts((prev) => prev.filter((c) => c.id !== id))
      toast({ title: 'Kontakt gelöscht' })
    } catch (err) {
      console.error('Kontakt konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  const filtered = useMemo(() => {
    return contacts
      .filter((c) => activeCategory === 'all' || c.category === activeCategory)
      .filter((c) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.role?.toLowerCase().includes(q)
        )
      })
  }, [contacts, activeCategory, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-[32px] font-extrabold tracking-tight text-text">Wichtige Kontakte</h1>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Kontakt hinzufügen
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
              activeCategory === 'all' ? 'bg-primary text-white' : 'bg-surface-2 text-text-sub hover:bg-surface'
            )}
          >
            Alle
          </button>
          {Object.entries(CONTACT_CATEGORIES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className="rounded-full px-3 py-1 text-[13px] font-medium transition-colors"
              style={
                activeCategory === key
                  ? { backgroundColor: config.text, color: '#fff' }
                  : { backgroundColor: config.bg, color: config.text }
              }
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
          <Input
            placeholder="Suchen…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard variant="team" />
          <SkeletonCard variant="team" />
          <SkeletonCard variant="team" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="Keine Kontakte gefunden"
          description={isAdmin ? 'Füge den ersten Kontakt hinzu.' : undefined}
          actionLabel={isAdmin ? 'Kontakt hinzufügen' : undefined}
          onAction={isAdmin ? openCreate : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={editingContact}
        onSave={handleSave}
      />
    </div>
  )
}
