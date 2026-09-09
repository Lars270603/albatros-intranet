import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import albatrosLogo from '@/assets/albatros-logo.png'

export default function ResetPassword() {
  const [checking, setChecking] = useState(true)
  const [linkValid, setLinkValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let isMounted = true

    // Der Recovery-Link von Supabase legt beim Öffnen automatisch eine
    // temporäre Session an. Wir warten auf das PASSWORD_RECOVERY-Event
    // bzw. prüfen zusätzlich, ob bereits eine Session existiert.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === 'PASSWORD_RECOVERY' && session) {
        setLinkValid(true)
        setChecking(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      if (session) {
        setLinkValid(true)
      }
      setChecking(false)
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Passwort konnte nicht gesetzt werden:', err)
      setError('Das Passwort konnte nicht gesetzt werden. Bitte fordere einen neuen Link an.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex items-center justify-center gap-2">
          <img src={albatrosLogo} alt="Albatros" className="h-8 w-8 shrink-0 rounded-md" />
          <span className="font-display text-[15px] font-bold text-text">Albatros Intranet</span>
        </div>

        {checking ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : done ? (
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-success" strokeWidth={1.5} />
            <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-text">Passwort geändert</h1>
            <p className="text-[14px] text-text-sub">
              Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt damit anmelden.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-2">
                Zur Anmeldung
              </Button>
            </Link>
          </div>
        ) : !linkValid ? (
          <div className="space-y-4 text-center">
            <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-text">Link ungültig</h1>
            <p className="text-[14px] text-text-sub">
              Dieser Reset-Link ist ungültig oder abgelaufen. Bitte fordere über die Anmeldeseite
              einen neuen Link an.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-2">
                Zur Anmeldung
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-text">Neues Passwort setzen</h1>
              <p className="text-[14px] text-text-sub">Wähle ein neues Passwort für deinen Account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">Neues Passwort</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mind. 8 Zeichen"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-md border border-primary bg-primary-light px-3 py-2 text-[13px] text-primary">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Wird gespeichert…' : 'Passwort speichern'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
