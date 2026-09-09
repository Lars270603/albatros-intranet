import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

export function ForgotPasswordDialog({ open, onOpenChange }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function handleOpenChange(next) {
    if (!next) {
      // Zustand erst nach dem Schließen zurücksetzen, damit die Animation nicht springt
      setTimeout(() => {
        setEmail('')
        setError('')
        setSent(false)
      }, 150)
    }
    onOpenChange(next)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}#/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (err) {
      console.error('Passwort-Reset fehlgeschlagen:', err)
      setError('Der Reset-Link konnte nicht gesendet werden. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passwort vergessen</DialogTitle>
          <DialogDescription>
            Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4">
            <p className="rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text-sub">
              Falls ein Account mit dieser E-Mail-Adresse existiert, haben wir dir einen Reset-Link
              geschickt. Bitte prüfe dein Postfach.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Schließen
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">E-Mail</Label>
              <Input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@albatros-international.de"
              />
            </div>

            {error && (
              <p className="rounded-md border border-primary bg-primary-light px-3 py-2 text-[13px] text-primary">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Wird gesendet…' : 'Link senden'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
