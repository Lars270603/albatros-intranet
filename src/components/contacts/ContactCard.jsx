import { Mail, Phone, FileText, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { ContactCategoryBadge } from '@/components/contacts/ContactCategoryBadge'

export function ContactCard({ contact, isAdmin, onEdit, onDelete }) {
  const [firstName, ...rest] = contact.name.split(' ')
  const lastName = rest.join(' ')

  return (
    <Card className="relative hover:border-border-strong">
      {isAdmin && (
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(contact)}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kontakt löschen?</AlertDialogTitle>
                <AlertDialogDescription>„{contact.name}" wird endgültig entfernt.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(contact.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-red-700"
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <CardContent className="space-y-2 pt-6 text-center">
        <InitialsAvatar firstName={firstName} lastName={lastName} size={48} className="mx-auto" />
        <p className="font-display text-[16px] font-bold text-text">{contact.name}</p>
        <p className="text-[14px] font-medium text-text-sub">{contact.company}</p>
        {contact.role && <p className="text-[13px] text-text-muted">{contact.role}</p>}
        <ContactCategoryBadge category={contact.category} />

        <div className="space-y-1 pt-1">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center justify-center gap-1.5 text-[13px] text-text-sub hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center justify-center gap-1.5 text-[13px] text-text-sub hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              {contact.phone}
            </a>
          )}
        </div>

        {contact.notes && (
          <div className="flex items-start justify-center gap-1.5 pt-1 text-left">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.5} />
            <p className="line-clamp-2 text-[13px] text-text-muted">{contact.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
